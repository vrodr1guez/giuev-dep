"""
Usage Prediction Model Training Script

This script trains machine learning models to predict vehicle usage patterns
based on historical data.
"""
import os
import sys
import logging
import argparse
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.ml.preprocessing.feature_engineering import extract_time_features, create_sequence_features
from app.ml.preprocessing.data_normalization import DataNormalizer, handle_outliers, impute_missing_values

import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class UsagePredictionModel:
    """Class for predicting vehicle usage patterns"""
    
    def __init__(
        self,
        model_type: str = 'gradient_boosting',
        prediction_target: str = 'next_usage_time',
        model_version: str = 'v1'
    ):
        """
        Initialize the usage prediction model
        
        Args:
            model_type: Type of model to use ('random_forest', 'gradient_boosting')
            prediction_target: Target to predict ('next_usage_time', 'trip_duration', 'trip_distance')
            model_version: Version identifier for the model
        """
        self.model_type = model_type
        self.prediction_target = prediction_target
        self.model_version = model_version
        self.model = None
        self.feature_importance = None
        self.metadata = {
            'created_at': datetime.now().isoformat(),
            'model_type': model_type,
            'prediction_target': prediction_target,
            'model_version': model_version,
            'performance_metrics': {},
            'features': []
        }
        
        # Initialize model based on type
        self._initialize_model()
    
    def _initialize_model(self) -> None:
        """Initialize the underlying model based on model_type"""
        if self.model_type == 'random_forest':
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
        elif self.model_type == 'gradient_boosting':
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def preprocess_data(self, usage_data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Preprocess vehicle usage data
        
        Args:
            usage_data: DataFrame with vehicle usage data
            
        Returns:
            Tuple of (X features DataFrame, y target Series)
        """
        # Ensure data has required columns
        required_cols = ['vehicle_id', 'start_time', 'end_time']
        if not all(col in usage_data.columns for col in required_cols):
            raise ValueError(f"Missing required columns. Data must have: {required_cols}")
        
        # Create a copy to avoid modifying the input
        data = usage_data.copy()
        
        # Convert timestamps to datetime if needed
        for col in ['start_time', 'end_time']:
            if not pd.api.types.is_datetime64_dtype(data[col]):
                data[col] = pd.to_datetime(data[col])
        
        # Calculate trip duration in minutes
        if 'trip_duration' not in data.columns:
            data['trip_duration'] = (data['end_time'] - data['start_time']).dt.total_seconds() / 60
        
        # Extract time features
        data = extract_time_features(data, 'start_time')
        
        # Add day type (weekday/weekend)
        data['is_weekend'] = data['day_of_week'].isin([5, 6]).astype(int)
        
        # Add time of day categories
        data['time_of_day'] = pd.cut(
            data['hour_of_day'],
            bins=[0, 6, 12, 18, 24],
            labels=['night', 'morning', 'afternoon', 'evening'],
            include_lowest=True
        )
        
        # Create time since last trip feature
        data = data.sort_values(['vehicle_id', 'start_time'])
        data['prev_end_time'] = data.groupby('vehicle_id')['end_time'].shift(1)
        data['time_since_last_trip'] = (
            (data['start_time'] - data['prev_end_time']).dt.total_seconds() / 3600
        ).fillna(0)  # hours
        
        # Create target variable based on prediction_target
        if self.prediction_target == 'next_usage_time':
            # Time until next usage (in hours) - target for prediction
            data['next_start_time'] = data.groupby('vehicle_id')['start_time'].shift(-1)
            data['time_to_next_usage'] = (
                (data['next_start_time'] - data['end_time']).dt.total_seconds() / 3600
            )
            # Filter out rows without next usage
            data = data.dropna(subset=['time_to_next_usage'])
            target = 'time_to_next_usage'
            
        elif self.prediction_target == 'trip_duration':
            target = 'trip_duration'
            
        elif self.prediction_target == 'trip_distance':
            if 'trip_distance' not in data.columns:
                raise ValueError("Data must contain 'trip_distance' column for this target")
            target = 'trip_distance'
            
        else:
            raise ValueError(f"Unsupported prediction target: {self.prediction_target}")
        
        # Create features for day of week patterns
        day_dummies = pd.get_dummies(data['day_of_week'], prefix='day')
        data = pd.concat([data, day_dummies], axis=1)
        
        # Create features for time of day patterns
        time_dummies = pd.get_dummies(data['time_of_day'], prefix='time')
        data = pd.concat([data, time_dummies], axis=1)
        
        # Calculate rolling averages for the target by vehicle
        data[f'{target}_rolling_mean_7d'] = (
            data.groupby('vehicle_id')[target]
            .rolling(7, min_periods=1)
            .mean()
            .reset_index(level=0, drop=True)
        )
        
        # Create features for usage patterns
        data['trips_per_day'] = (
            data.groupby(['vehicle_id', data['start_time'].dt.date])
            .transform('count')['vehicle_id']
        )
        
        # Select features and target
        if self.prediction_target == 'next_usage_time':
            features = [
                'hour_of_day', 'day_of_week', 'is_weekend', 'hour_sin', 'hour_cos',
                'day_sin', 'day_cos', 'month_sin', 'month_cos', 'time_since_last_trip',
                'trips_per_day', f'{target}_rolling_mean_7d'
            ] + list(day_dummies.columns) + list(time_dummies.columns)
        else:
            features = [
                'hour_of_day', 'day_of_week', 'is_weekend', 'hour_sin', 'hour_cos',
                'day_sin', 'day_cos', 'month_sin', 'month_cos',
                'trips_per_day', f'{target}_rolling_mean_7d'
            ] + list(day_dummies.columns) + list(time_dummies.columns)
        
        # Ensure all features exist in the DataFrame
        features = [f for f in features if f in data.columns]
        
        # Update metadata
        self.metadata['features'] = features
        
        # Handle missing values
        for feature in features:
            if data[feature].isna().any():
                if pd.api.types.is_numeric_dtype(data[feature]):
                    data[feature] = data[feature].fillna(data[feature].mean())
                else:
                    data[feature] = data[feature].fillna(data[feature].mode()[0])
        
        # Return features and target
        return data[features], data[target]
    
    def train(
        self,
        usage_data: pd.DataFrame,
        test_size: float = 0.2,
        perform_grid_search: bool = False
    ) -> Dict:
        """
        Train the usage prediction model
        
        Args:
            usage_data: DataFrame with vehicle usage data
            test_size: Fraction of data to use for testing
            perform_grid_search: Whether to perform grid search for hyperparameter tuning
            
        Returns:
            Dictionary with training results and metrics
        """
        logger.info(f"Training {self.model_type} model for {self.prediction_target} prediction")
        
        # Preprocess data
        X, y = self.preprocess_data(usage_data)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Create pipeline with preprocessing and model
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', self.model)
        ])
        
        # Perform grid search if requested
        if perform_grid_search:
            logger.info("Performing grid search for hyperparameter tuning")
            
            if self.model_type == 'random_forest':
                param_grid = {
                    'model__n_estimators': [50, 100, 200],
                    'model__max_depth': [10, 20, 30],
                    'model__min_samples_split': [2, 5, 10]
                }
            elif self.model_type == 'gradient_boosting':
                param_grid = {
                    'model__n_estimators': [50, 100, 200],
                    'model__learning_rate': [0.01, 0.1, 0.2],
                    'model__max_depth': [3, 5, 7]
                }
            
            grid_search = GridSearchCV(
                pipeline,
                param_grid,
                cv=5,
                scoring='neg_mean_squared_error',
                n_jobs=-1
            )
            
            grid_search.fit(X_train, y_train)
            self.model = grid_search.best_estimator_.named_steps['model']
            
            # Update metadata with best parameters
            self.metadata['hyperparameters'] = grid_search.best_params_
            logger.info(f"Best hyperparameters: {grid_search.best_params_}")
            
            # Make predictions
            y_pred = grid_search.predict(X_test)
        else:
            # Train pipeline
            pipeline.fit(X_train, y_train)
            self.model = pipeline.named_steps['model']
            
            # Update metadata with model parameters
            self.metadata['hyperparameters'] = self.model.get_params()
            
            # Make predictions
            y_pred = pipeline.predict(X_test)
        
        # Calculate metrics
        metrics = {
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred),
            'test_size': len(y_test),
            'train_size': len(y_train)
        }
        
        # Add target-specific metrics
        if self.prediction_target == 'next_usage_time':
            # Calculate within-hour accuracy
            within_1h = np.mean(np.abs(y_test - y_pred) < 1) * 100
            within_3h = np.mean(np.abs(y_test - y_pred) < 3) * 100
            metrics['within_1h_pct'] = within_1h
            metrics['within_3h_pct'] = within_3h
        
        # Update metadata
        self.metadata['performance_metrics'] = metrics
        logger.info(f"Model training complete. Test RMSE: {metrics['rmse']:.4f}, R²: {metrics['r2']:.4f}")
        
        # Extract feature importance
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = dict(zip(X.columns, self.model.feature_importances_))
            self.metadata['feature_importance'] = self.feature_importance
        
        return {
            'model': self.model,
            'metrics': metrics,
            'feature_importance': self.feature_importance
        }
    
    def predict(self, usage_data: pd.DataFrame) -> np.ndarray:
        """
        Predict usage patterns for new data
        
        Args:
            usage_data: DataFrame with vehicle usage data
            
        Returns:
            Array of predictions
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet")
        
        # Preprocess data (only get features, ignore target)
        X, _ = self.preprocess_data(usage_data)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        
        return predictions
    
    def save(self, filepath: str) -> None:
        """
        Save the trained model and metadata
        
        Args:
            filepath: Path to save the model to
        """
        if self.model is None:
            raise ValueError("Cannot save untrained model")
        
        # Update metadata before saving
        self.metadata['saved_at'] = datetime.now().isoformat()
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save model and metadata
        joblib.dump({
            'model': self.model,
            'metadata': self.metadata,
            'feature_importance': self.feature_importance
        }, filepath)
        
        logger.info(f"Model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str) -> 'UsagePredictionModel':
        """
        Load a trained model from file
        
        Args:
            filepath: Path to load the model from
            
        Returns:
            Loaded UsagePredictionModel instance
        """
        # Load model data
        data = joblib.load(filepath)
        
        # Extract metadata
        metadata = data['metadata']
        
        # Create instance with same parameters
        instance = cls(
            model_type=metadata['model_type'],
            prediction_target=metadata['prediction_target'],
            model_version=metadata['model_version']
        )
        
        # Set model and metadata
        instance.model = data['model']
        instance.metadata = metadata
        instance.feature_importance = data.get('feature_importance')
        
        logger.info(f"Model loaded from {filepath}")
        return instance


def load_data(data_path: str) -> pd.DataFrame:
    """
    Load usage data from file
    
    Args:
        data_path: Path to the data file
        
    Returns:
        DataFrame with vehicle usage data
    """
    # Determine file type from extension
    ext = os.path.splitext(data_path)[1].lower()
    
    if ext == '.csv':
        return pd.read_csv(data_path, parse_dates=['start_time', 'end_time'])
    elif ext in ['.parquet', '.pq']:
        return pd.read_parquet(data_path)
    elif ext == '.json':
        return pd.read_json(data_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def main():
    """Main function to train usage prediction models"""
    parser = argparse.ArgumentParser(description='Train vehicle usage prediction model')
    parser.add_argument('--data-path', type=str, required=True,
                        help='Path to the vehicle usage data file')
    parser.add_argument('--model-type', type=str, default='gradient_boosting',
                        choices=['random_forest', 'gradient_boosting'],
                        help='Type of model to train')
    parser.add_argument('--prediction-target', type=str, default='next_usage_time',
                        choices=['next_usage_time', 'trip_duration', 'trip_distance'],
                        help='Target to predict')
    parser.add_argument('--output-dir', type=str, default='app/ml/models/usage_prediction',
                        help='Directory to save the trained model')
    parser.add_argument('--model-version', type=str, default=None,
                        help='Version identifier for the model (default: auto-generated)')
    parser.add_argument('--grid-search', action='store_true',
                        help='Perform grid search for hyperparameter tuning')
    parser.add_argument('--test-size', type=float, default=0.2,
                        help='Fraction of data to use for testing')
    
    args = parser.parse_args()
    
    # Generate model version if not provided
    if args.model_version is None:
        args.model_version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Load data
    logger.info(f"Loading data from {args.data_path}")
    usage_data = load_data(args.data_path)
    logger.info(f"Loaded {len(usage_data)} usage records")
    
    # Create model
    model = UsagePredictionModel(
        model_type=args.model_type,
        prediction_target=args.prediction_target,
        model_version=args.model_version
    )
    
    # Train model
    training_results = model.train(
        usage_data=usage_data,
        test_size=args.test_size,
        perform_grid_search=args.grid_search
    )
    
    # Save model
    os.makedirs(args.output_dir, exist_ok=True)
    model_path = os.path.join(
        args.output_dir,
        f"{args.prediction_target}_{args.model_type}_{args.model_version}.joblib"
    )
    model.save(model_path)
    
    logger.info(f"Model saved to {model_path}")
    logger.info(f"Training metrics: RMSE={training_results['metrics']['rmse']:.4f}, "
                f"R²={training_results['metrics']['r2']:.4f}")
    
    # Print feature importance if available
    if training_results['feature_importance']:
        logger.info("Top 5 important features:")
        sorted_features = sorted(
            training_results['feature_importance'].items(),
            key=lambda x: x[1],
            reverse=True
        )
        for feature, importance in sorted_features[:5]:
            logger.info(f"  {feature}: {importance:.4f}")


if __name__ == "__main__":
    main() 