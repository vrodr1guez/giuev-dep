"""
Vehicle Usage Predictor

This module provides utilities for making predictions about vehicle usage patterns
using trained machine learning models.
"""
import os
import sys
import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timedelta
from pathlib import Path
import joblib

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class VehicleUsagePredictor:
    """
    Class for predicting vehicle usage patterns
    
    This class loads and manages trained usage prediction models and provides
    an interface for making predictions about when vehicles will be used next,
    how long trips will be, and other usage-related predictions.
    """
    
    def __init__(
        self,
        models_dir: str = 'app/ml/models/usage_prediction',
        next_usage_model_path: Optional[str] = None,
        trip_duration_model_path: Optional[str] = None,
        trip_distance_model_path: Optional[str] = None
    ):
        """
        Initialize the vehicle usage predictor
        
        Args:
            models_dir: Directory containing trained models
            next_usage_model_path: Path to specific next usage time model (if None, use latest)
            trip_duration_model_path: Path to specific trip duration model (if None, use latest)
            trip_distance_model_path: Path to specific trip distance model (if None, use latest)
        """
        self.models_dir = models_dir
        self.models = {}
        self.model_metadata = {}
        
        # Load models
        try:
            # Next usage time model
            if next_usage_model_path:
                self._load_model('next_usage_time', next_usage_model_path)
            else:
                self._load_latest_model('next_usage_time')
                
            # Trip duration model
            if trip_duration_model_path:
                self._load_model('trip_duration', trip_duration_model_path)
            else:
                self._load_latest_model('trip_duration')
                
            # Trip distance model
            if trip_distance_model_path:
                self._load_model('trip_distance', trip_distance_model_path)
            else:
                self._load_latest_model('trip_distance')
                
        except Exception as e:
            logger.warning(f"Could not load all models: {str(e)}")
    
    def _load_model(self, prediction_target: str, model_path: str) -> None:
        """
        Load a specific model from a file
        
        Args:
            prediction_target: Target the model predicts ('next_usage_time', 'trip_duration', 'trip_distance')
            model_path: Path to the model file
        """
        try:
            logger.info(f"Loading {prediction_target} model from {model_path}")
            
            model_data = joblib.load(model_path)
            
            # Extract data
            model = model_data.get('model')
            metadata = model_data.get('metadata', {})
            
            # Validate model
            if not model:
                raise ValueError(f"Invalid model file, missing 'model' key: {model_path}")
            
            # Store model and metadata
            self.models[prediction_target] = model
            self.model_metadata[prediction_target] = metadata
            
            logger.info(f"Successfully loaded {prediction_target} model, "
                       f"version: {metadata.get('model_version', 'unknown')}")
            
        except Exception as e:
            logger.error(f"Error loading {prediction_target} model from {model_path}: {str(e)}")
            raise
    
    def _load_latest_model(self, prediction_target: str) -> None:
        """
        Load the latest model for a given prediction target
        
        Args:
            prediction_target: Target the model predicts ('next_usage_time', 'trip_duration', 'trip_distance')
        """
        # Find model files for the target
        pattern = f"{prediction_target}_*"
        model_files = list(Path(self.models_dir).glob(pattern))
        
        if not model_files:
            logger.warning(f"No models found for {prediction_target} in {self.models_dir}")
            return
        
        # Find the latest model based on file modification time
        latest_model = max(model_files, key=lambda f: f.stat().st_mtime)
        
        # Load the model
        self._load_model(prediction_target, str(latest_model))
    
    def predict_next_usage(
        self,
        vehicle_id: str,
        usage_history: pd.DataFrame,
        current_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Predict when a vehicle will be used next
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            usage_history: DataFrame containing vehicle usage history
            current_time: Current time (defaults to now)
            
        Returns:
            Dictionary with prediction details
        """
        if 'next_usage_time' not in self.models:
            raise ValueError("Next usage time model not loaded")
        
        if current_time is None:
            current_time = datetime.now()
        
        # Filter history for the specific vehicle
        vehicle_history = usage_history[usage_history['vehicle_id'] == vehicle_id].copy()
        
        if len(vehicle_history) == 0:
            return {
                'vehicle_id': vehicle_id,
                'error': f"No usage history for vehicle {vehicle_id}"
            }
        
        # Prepare the data
        # Ensure the last record has the current time as end_time
        last_record = vehicle_history.sort_values('end_time').iloc[-1].to_dict()
        
        # Create a record for the current time
        current_record = last_record.copy()
        current_record['end_time'] = current_time
        
        # Create features for prediction
        features = self._prepare_features(pd.DataFrame([current_record]), 'next_usage_time')
        
        if features.empty:
            return {
                'vehicle_id': vehicle_id,
                'error': "Failed to prepare features for prediction"
            }
        
        # Make prediction
        hours_until_next_usage = self.models['next_usage_time'].predict(features)[0]
        
        # Calculate next usage time
        next_usage_time = current_time + timedelta(hours=float(hours_until_next_usage))
        
        # Get confidence if available
        confidence = 0.8  # Default confidence
        if hasattr(self.models['next_usage_time'], 'predict_proba'):
            confidence = self.models['next_usage_time'].predict_proba(features)[0][1]
        
        return {
            'vehicle_id': vehicle_id,
            'current_time': current_time.strftime('%Y-%m-%d %H:%M:%S'),
            'next_usage_time': next_usage_time.strftime('%Y-%m-%d %H:%M:%S'),
            'hours_until_next_usage': float(hours_until_next_usage),
            'confidence': float(confidence)
        }
    
    def predict_trip_duration(
        self,
        vehicle_id: str,
        trip_start_time: datetime,
        usage_history: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Predict the duration of a trip
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            trip_start_time: Start time of the trip
            usage_history: DataFrame containing vehicle usage history
            
        Returns:
            Dictionary with prediction details
        """
        if 'trip_duration' not in self.models:
            raise ValueError("Trip duration model not loaded")
        
        # Filter history for the specific vehicle
        vehicle_history = usage_history[usage_history['vehicle_id'] == vehicle_id].copy()
        
        if len(vehicle_history) == 0:
            return {
                'vehicle_id': vehicle_id,
                'error': f"No usage history for vehicle {vehicle_id}"
            }
        
        # Create a record for the current trip
        trip_record = {
            'vehicle_id': vehicle_id,
            'start_time': trip_start_time,
            'end_time': trip_start_time + timedelta(minutes=1)  # Placeholder
        }
        
        # Create features for prediction
        features = self._prepare_features(pd.DataFrame([trip_record]), 'trip_duration')
        
        if features.empty:
            return {
                'vehicle_id': vehicle_id,
                'error': "Failed to prepare features for prediction"
            }
        
        # Make prediction
        duration_minutes = self.models['trip_duration'].predict(features)[0]
        
        return {
            'vehicle_id': vehicle_id,
            'trip_start_time': trip_start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'predicted_duration_minutes': float(duration_minutes),
            'predicted_end_time': (trip_start_time + timedelta(minutes=float(duration_minutes))).strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def predict_trip_distance(
        self,
        vehicle_id: str,
        trip_start_time: datetime,
        usage_history: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Predict the distance of a trip
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            trip_start_time: Start time of the trip
            usage_history: DataFrame containing vehicle usage history
            
        Returns:
            Dictionary with prediction details
        """
        if 'trip_distance' not in self.models:
            raise ValueError("Trip distance model not loaded")
        
        # Filter history for the specific vehicle
        vehicle_history = usage_history[usage_history['vehicle_id'] == vehicle_id].copy()
        
        if len(vehicle_history) == 0:
            return {
                'vehicle_id': vehicle_id,
                'error': f"No usage history for vehicle {vehicle_id}"
            }
        
        # Create a record for the current trip
        trip_record = {
            'vehicle_id': vehicle_id,
            'start_time': trip_start_time,
            'end_time': trip_start_time + timedelta(minutes=1)  # Placeholder
        }
        
        # Create features for prediction
        features = self._prepare_features(pd.DataFrame([trip_record]), 'trip_distance')
        
        if features.empty:
            return {
                'vehicle_id': vehicle_id,
                'error': "Failed to prepare features for prediction"
            }
        
        # Make prediction
        distance = self.models['trip_distance'].predict(features)[0]
        
        return {
            'vehicle_id': vehicle_id,
            'trip_start_time': trip_start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'predicted_distance': float(distance)
        }
    
    def predict_vehicle_availability(
        self,
        vehicle_id: str,
        start_time: datetime,
        end_time: datetime,
        usage_history: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Predict if a vehicle will be available during a specific time window
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            start_time: Start of the time window
            end_time: End of the time window
            usage_history: DataFrame containing vehicle usage history
            
        Returns:
            Dictionary with availability prediction
        """
        # Predict next usage
        next_usage = self.predict_next_usage(
            vehicle_id=vehicle_id,
            usage_history=usage_history,
            current_time=start_time
        )
        
        # Check for errors
        if 'error' in next_usage:
            return next_usage
        
        # Parse next usage time
        next_usage_time = datetime.strptime(
            next_usage['next_usage_time'], 
            '%Y-%m-%d %H:%M:%S'
        )
        
        # Predict trip duration
        if next_usage_time < end_time:
            trip_duration = self.predict_trip_duration(
                vehicle_id=vehicle_id,
                trip_start_time=next_usage_time,
                usage_history=usage_history
            )
            
            # Check for errors
            if 'error' in trip_duration:
                trip_duration_minutes = 60  # Default to 1 hour if prediction fails
            else:
                trip_duration_minutes = trip_duration['predicted_duration_minutes']
                
            trip_end_time = next_usage_time + timedelta(minutes=trip_duration_minutes)
            
            # Check if the trip overlaps with the time window
            time_window_available = trip_end_time <= start_time or next_usage_time >= end_time
        else:
            time_window_available = True
        
        return {
            'vehicle_id': vehicle_id,
            'start_time': start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'end_time': end_time.strftime('%Y-%m-%d %H:%M:%S'),
            'is_available': time_window_available,
            'next_usage_time': next_usage['next_usage_time'],
            'confidence': next_usage['confidence']
        }
    
    def _prepare_features(
        self, 
        data: pd.DataFrame, 
        prediction_target: str
    ) -> pd.DataFrame:
        """
        Prepare features for prediction
        
        Args:
            data: DataFrame containing raw usage data
            prediction_target: Type of prediction to make
            
        Returns:
            DataFrame with features for prediction
        """
        try:
            # Ensure timestamps are datetime
            for col in ['start_time', 'end_time']:
                if col in data.columns and not pd.api.types.is_datetime64_dtype(data[col]):
                    data[col] = pd.to_datetime(data[col])
            
            # Extract basic features
            features = data.copy()
            
            # Add hour of day
            if 'start_time' in features.columns:
                features['hour_of_day'] = features['start_time'].dt.hour
                features['day_of_week'] = features['start_time'].dt.dayofweek
                features['month'] = features['start_time'].dt.month
                features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
                
                # Add cyclical encoding
                features['hour_sin'] = np.sin(2 * np.pi * features['hour_of_day'] / 24)
                features['hour_cos'] = np.cos(2 * np.pi * features['hour_of_day'] / 24)
                features['day_sin'] = np.sin(2 * np.pi * features['day_of_week'] / 7)
                features['day_cos'] = np.cos(2 * np.pi * features['day_of_week'] / 7)
                features['month_sin'] = np.sin(2 * np.pi * features['month'] / 12)
                features['month_cos'] = np.cos(2 * np.pi * features['month'] / 12)
            
            # Add time of day category
            if 'hour_of_day' in features.columns:
                features['time_of_day'] = pd.cut(
                    features['hour_of_day'],
                    bins=[0, 6, 12, 18, 24],
                    labels=['night', 'morning', 'afternoon', 'evening'],
                    include_lowest=True
                )
                
                # One-hot encode time of day
                time_dummies = pd.get_dummies(features['time_of_day'], prefix='time')
                features = pd.concat([features, time_dummies], axis=1)
            
            # Add trip duration if applicable
            if 'start_time' in features.columns and 'end_time' in features.columns:
                features['trip_duration'] = (
                    features['end_time'] - features['start_time']
                ).dt.total_seconds() / 60  # in minutes
            
            # Select relevant features based on the model metadata
            model_features = self.model_metadata.get(prediction_target, {}).get('features', [])
            
            if not model_features:
                # Use a default set of features if metadata doesn't have them
                if prediction_target == 'next_usage_time':
                    model_features = [
                        'hour_of_day', 'day_of_week', 'is_weekend', 'hour_sin', 'hour_cos',
                        'day_sin', 'day_cos', 'month_sin', 'month_cos',
                        'time_night', 'time_morning', 'time_afternoon', 'time_evening'
                    ]
                elif prediction_target in ['trip_duration', 'trip_distance']:
                    model_features = [
                        'hour_of_day', 'day_of_week', 'is_weekend', 'hour_sin', 'hour_cos',
                        'day_sin', 'day_cos', 'month_sin', 'month_cos',
                        'time_night', 'time_morning', 'time_afternoon', 'time_evening'
                    ]
            
            # Filter to include only available features
            available_features = [f for f in model_features if f in features.columns]
            
            # Handle missing features by adding them with zeros
            missing_features = [f for f in model_features if f not in features.columns]
            for feature in missing_features:
                features[feature] = 0
            
            return features[model_features]
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            return pd.DataFrame()  # Return empty DataFrame on error


# Example usage
if __name__ == "__main__":
    # This is just for illustration; in production, load actual models and data
    predictor = VehicleUsagePredictor()
    
    # Sample usage history data
    usage_history = pd.DataFrame([
        {
            'vehicle_id': 'v123',
            'start_time': '2023-01-01 08:00:00',
            'end_time': '2023-01-01 09:30:00',
            'trip_distance': 15.2
        },
        {
            'vehicle_id': 'v123',
            'start_time': '2023-01-02 17:15:00',
            'end_time': '2023-01-02 18:45:00',
            'trip_distance': 22.8
        }
    ])
    
    # Parse timestamps
    for col in ['start_time', 'end_time']:
        usage_history[col] = pd.to_datetime(usage_history[col])
    
    # Make predictions
    next_usage = predictor.predict_next_usage(
        vehicle_id='v123',
        usage_history=usage_history,
        current_time=datetime(2023, 1, 3, 12, 0, 0)
    )
    
    print(f"Next usage prediction: {next_usage}") 