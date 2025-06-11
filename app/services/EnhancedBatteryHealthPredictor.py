"""
Enhanced Battery Health Prediction Service

Uses machine learning models for more accurate battery health prediction,
advanced anomaly detection, and support for different battery chemistries.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import logging
import json
import os
import pickle
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib

from app.services.TelemetryDataService import get_telemetry_processor
from app.services.BatteryHealthPrediction import BatteryHealthMetrics

logger = logging.getLogger(__name__)

# Constants for different battery chemistries
BATTERY_CHEMISTRY = {
    "NMC": {
        "cycle_life": 1500,
        "typical_degradation_rate": 0.2,  # % per month
        "temperature_sensitivity": 1.2,   # Relative factor
        "fast_charging_impact": 1.3       # Relative factor
    },
    "LFP": {
        "cycle_life": 3000,
        "typical_degradation_rate": 0.15,  # % per month
        "temperature_sensitivity": 0.8,    # Lower sensitivity
        "fast_charging_impact": 0.9        # Lower impact
    },
    "NCA": {
        "cycle_life": 1200,
        "typical_degradation_rate": 0.25,  # % per month
        "temperature_sensitivity": 1.3,    # Higher sensitivity
        "fast_charging_impact": 1.4        # Higher impact
    }
}

class EnhancedBatteryHealthPredictor:
    """
    Enhanced battery health prediction using machine learning models 
    with support for different battery chemistries and charging patterns.
    """
    
    def __init__(self, model_dir: str = "app/ml_models"):
        self.model_dir = model_dir
        
        # Ensure model directory exists
        os.makedirs(model_dir, exist_ok=True)
        
        # Initialize telemetry processor
        self.telemetry_processor = get_telemetry_processor()
        
        # Load ML models if they exist, otherwise they'll be created when needed
        self.degradation_models = self._load_degradation_models()
        self.anomaly_detection_models = self._load_anomaly_detection_models()
        self.chemistry_specific_models = self._load_chemistry_specific_models()
        
        # Scalers for data normalization
        self.scalers = self._load_scalers()
    
    def _load_degradation_models(self) -> Dict[str, Any]:
        """Load pre-trained degradation models for different battery types"""
        models = {}
        try:
            model_path = os.path.join(self.model_dir, "degradation_models.pkl")
            if os.path.exists(model_path):
                models = joblib.load(model_path)
                logger.info(f"Loaded degradation models: {list(models.keys())}")
            else:
                logger.info("No pre-trained degradation models found. Will create when needed.")
                
                # Create default models with minimal training
                models = self._create_default_models()
                
        except Exception as e:
            logger.exception(f"Error loading degradation models: {str(e)}")
        
        return models
    
    def _create_default_models(self) -> Dict[str, Any]:
        """Create default models for different battery chemistries"""
        models = {}
        
        # Create a simple model for each battery chemistry
        for chemistry in BATTERY_CHEMISTRY.keys():
            # Use RandomForestRegressor as default model
            models[chemistry] = RandomForestRegressor(
                n_estimators=50, 
                max_depth=5, 
                random_state=42
            )
            
            # Create synthetic training data based on chemistry properties
            X_train, y_train = self._generate_synthetic_training_data(chemistry)
            
            # Train the model on synthetic data
            if X_train.shape[0] > 0:
                models[chemistry].fit(X_train, y_train)
                logger.info(f"Created default model for {chemistry} chemistry")
            
        return models
    
    def _generate_synthetic_training_data(self, chemistry: str) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic training data for a specific battery chemistry"""
        # Chemistry properties
        props = BATTERY_CHEMISTRY.get(chemistry, BATTERY_CHEMISTRY["NMC"])
        
        # Number of samples
        n_samples = 1000
        
        # Generate features: [cycle_count, avg_temp, avg_discharge_rate, time_months]
        np.random.seed(42)
        
        # Generate cycle counts from 0 to max cycles
        cycle_counts = np.random.uniform(0, props["cycle_life"], n_samples)
        
        # Generate temperature values (normal distribution around 25°C)
        temperatures = np.random.normal(25, 10, n_samples)
        
        # Generate discharge rates (C-rates between 0.1 and 3)
        discharge_rates = np.random.uniform(0.1, 3.0, n_samples)
        
        # Generate time in months
        time_months = np.random.uniform(0, 60, n_samples)
        
        # Calculate SoH based on simplified model
        # More cycles, higher temp, higher discharge rate, more time = lower SoH
        soh = 100 - (
            (cycle_counts / props["cycle_life"]) * 30 +
            (np.clip(temperatures - 25, 0, float('inf')) / 10) * props["temperature_sensitivity"] * 5 +
            (discharge_rates * props["fast_charging_impact"]) * 3 +
            (time_months * props["typical_degradation_rate"])
        )
        
        # Add random noise
        soh = soh + np.random.normal(0, 2, n_samples)
        
        # Clip SoH to valid range [0, 100]
        soh = np.clip(soh, 0, 100)
        
        # Create feature matrix
        X = np.column_stack([cycle_counts, temperatures, discharge_rates, time_months])
        y = soh
        
        return X, y
    
    def _load_anomaly_detection_models(self) -> Dict[str, Any]:
        """Load pre-trained anomaly detection models"""
        models = {}
        try:
            model_path = os.path.join(self.model_dir, "anomaly_detection_models.pkl")
            if os.path.exists(model_path):
                models = joblib.load(model_path)
                logger.info(f"Loaded anomaly detection models: {list(models.keys())}")
            else:
                logger.info("No pre-trained anomaly detection models found. Will create when needed.")
                
                # Create default anomaly detection model
                models["default"] = IsolationForest(
                    n_estimators=100, 
                    contamination=0.05,
                    random_state=42
                )
                
        except Exception as e:
            logger.exception(f"Error loading anomaly detection models: {str(e)}")
        
        return models
    
    def _load_chemistry_specific_models(self) -> Dict[str, Dict[str, Any]]:
        """Load chemistry-specific prediction models"""
        models = {}
        try:
            model_path = os.path.join(self.model_dir, "chemistry_models.pkl")
            if os.path.exists(model_path):
                models = joblib.load(model_path)
                logger.info(f"Loaded chemistry-specific models: {list(models.keys())}")
            else:
                logger.info("No chemistry-specific models found. Will create when needed.")
                
                # Initialize empty dictionary for each chemistry
                for chemistry in BATTERY_CHEMISTRY.keys():
                    models[chemistry] = {}
                
        except Exception as e:
            logger.exception(f"Error loading chemistry-specific models: {str(e)}")
        
        return models
    
    def _load_scalers(self) -> Dict[str, StandardScaler]:
        """Load data scalers for each model type"""
        scalers = {}
        try:
            scaler_path = os.path.join(self.model_dir, "scalers.pkl")
            if os.path.exists(scaler_path):
                scalers = joblib.load(scaler_path)
                logger.info(f"Loaded scalers: {list(scalers.keys())}")
            else:
                logger.info("No scalers found. Will create when needed.")
                
                # Create default scalers
                for chemistry in BATTERY_CHEMISTRY.keys():
                    scalers[f"degradation_{chemistry}"] = StandardScaler()
                    scalers[f"anomaly_{chemistry}"] = StandardScaler()
                
        except Exception as e:
            logger.exception(f"Error loading scalers: {str(e)}")
        
        return scalers
    
    def get_battery_health(self, vehicle_id: str, db) -> BatteryHealthMetrics:
        """
        Get enhanced battery health metrics using ML predictions
        
        Args:
            vehicle_id: The vehicle ID
            db: Database session
            
        Returns:
            BatteryHealthMetrics object with health data
        """
        try:
            # Get vehicle data from database to determine battery type
            # In a real implementation, this would query the actual vehicle model
            # For this demo, we'll simulate with battery data
            vehicle_data = {
                "v1": {"chemistry": "NMC", "nominal_capacity": 75.0},
                "v2": {"chemistry": "LFP", "nominal_capacity": 131.0},
                "v3": {"chemistry": "NMC", "nominal_capacity": 65.0},
                "v4": {"chemistry": "NCA", "nominal_capacity": 135.0},
                "v5": {"chemistry": "NMC", "nominal_capacity": 77.0}
            }.get(vehicle_id, {"chemistry": "NMC", "nominal_capacity": 75.0})
            
            # Get historical telemetry data (last 90 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)
            telemetry_df = self.telemetry_processor.get_historical_telemetry(
                vehicle_id, start_date, end_date, db
            )
            
            if telemetry_df.empty:
                logger.warning(f"No telemetry data available for vehicle {vehicle_id}")
                # Return basic metrics with low confidence
                return BatteryHealthMetrics(
                    vehicle_id=vehicle_id,
                    state_of_health=85.0,  # Assumed average
                    estimated_capacity=vehicle_data["nominal_capacity"] * 0.85,
                    nominal_capacity=vehicle_data["nominal_capacity"],
                    cycle_count=50,  # Assumed
                    predicted_degradation_rate=BATTERY_CHEMISTRY[vehicle_data["chemistry"]]["typical_degradation_rate"],
                    confidence=0.5  # Low confidence due to lack of data
                )
            
            # Process telemetry data
            battery_health = self._predict_health_from_telemetry(
                telemetry_df, 
                vehicle_data["chemistry"],
                vehicle_data["nominal_capacity"]
            )
            
            # Detect anomalies
            anomalies = self._detect_anomalies(telemetry_df, vehicle_data["chemistry"])
            
            # Calculate replacement date
            replacement_date = self._calculate_replacement_date(
                battery_health["state_of_health"],
                battery_health["degradation_rate"],
                vehicle_data["chemistry"]
            )
            
            # Create health metrics object
            metrics = BatteryHealthMetrics(
                vehicle_id=vehicle_id,
                state_of_health=battery_health["state_of_health"],
                estimated_capacity=battery_health["capacity"],
                nominal_capacity=vehicle_data["nominal_capacity"],
                cycle_count=battery_health["cycle_count"],
                predicted_degradation_rate=battery_health["degradation_rate"],
                estimated_replacement_date=replacement_date,
                anomalies=anomalies,
                confidence=battery_health["confidence"]
            )
            
            return metrics
            
        except Exception as e:
            logger.exception(f"Error predicting battery health: {str(e)}")
            # Return basic health metrics as fallback
            return BatteryHealthMetrics(
                vehicle_id=vehicle_id,
                state_of_health=80.0,
                estimated_capacity=60.0,
                nominal_capacity=75.0,
                cycle_count=100,
                predicted_degradation_rate=0.2,
                confidence=0.3  # Low confidence due to error
            )
    
    def _predict_health_from_telemetry(
        self, telemetry_df: pd.DataFrame, chemistry: str, nominal_capacity: float
    ) -> Dict[str, Any]:
        """
        Predict battery health using telemetry data and ML models
        
        Args:
            telemetry_df: DataFrame with telemetry data
            chemistry: Battery chemistry type
            nominal_capacity: Original battery capacity
            
        Returns:
            Dictionary with health metrics
        """
        # If we don't have a model for this chemistry, use a similar one or create a new one
        if chemistry not in self.degradation_models:
            fallback_chemistry = "NMC"  # Default fallback
            logger.warning(f"No model for {chemistry}, using {fallback_chemistry} model")
            chemistry = fallback_chemistry
        
        # Extract features for prediction
        features = self._extract_prediction_features(telemetry_df)
        
        # Calculate total cycle count (can be estimated from charge/discharge cycles)
        # For this demo, we'll use a simple approximation
        cycle_count = len(telemetry_df)  # Each telemetry point represents roughly 1 cycle
        
        # Calculate current capacity from the most recent state of health
        if 'health' in telemetry_df.columns:
            recent_health = telemetry_df['health'].iloc[-1]
        else:
            # If no health data, predict it using the model
            if features is not None and len(features) > 0:
                # Scale features
                scaler_key = f"degradation_{chemistry}"
                if scaler_key not in self.scalers:
                    self.scalers[scaler_key] = StandardScaler()
                    self.scalers[scaler_key].fit(features)
                
                scaled_features = self.scalers[scaler_key].transform(features)
                
                # Predict health
                recent_health = self.degradation_models[chemistry].predict(scaled_features).mean()
            else:
                # Fallback
                recent_health = 85.0
        
        # Calculate estimated capacity
        estimated_capacity = (nominal_capacity * recent_health) / 100.0
        
        # Calculate degradation rate (% per month)
        # For more accurate results, we'd use time-series analysis
        # For this demo, we'll use a chemistry-based approximation with randomization
        base_rate = BATTERY_CHEMISTRY[chemistry]["typical_degradation_rate"]
        # Add some variation based on temperature and usage patterns
        if 'temperature' in telemetry_df.columns:
            avg_temp = telemetry_df['temperature'].mean()
            # Higher temps accelerate degradation
            temp_factor = 1.0 + max(0, (avg_temp - 25) / 40)
        else:
            temp_factor = 1.0
            
        # Final degradation rate
        degradation_rate = base_rate * temp_factor * (1 + np.random.normal(0, 0.1))
        
        # Calculate confidence based on data quality and quantity
        confidence = min(0.95, 0.5 + (len(telemetry_df) / 1000))
        
        return {
            "state_of_health": float(recent_health),
            "capacity": float(estimated_capacity),
            "cycle_count": int(cycle_count),
            "degradation_rate": float(degradation_rate),
            "confidence": float(confidence)
        }
    
    def _extract_prediction_features(self, telemetry_df: pd.DataFrame) -> np.ndarray:
        """Extract features from telemetry data for prediction models"""
        if telemetry_df.empty:
            return None
        
        # For a real model, we'd extract meaningful features like:
        # - Average temperature
        # - Temperature variance
        # - Depth of discharge patterns
        # - Charge rates
        # - Usage patterns
        
        # For this demo, we'll use simplified features
        features = []
        
        for _, row in telemetry_df.iterrows():
            feature_row = []
            
            # Age in days (from first record)
            if 'timestamp' in row:
                days = (datetime.now() - row['timestamp']).days
                feature_row.append(days)
            else:
                feature_row.append(0)
            
            # Temperature (if available)
            if 'temperature' in row:
                feature_row.append(row['temperature'])
            else:
                feature_row.append(25.0)  # Default assumption
            
            # Voltage (if available)
            if 'voltage' in row:
                feature_row.append(row['voltage'])
            else:
                feature_row.append(350.0)  # Default assumption
            
            # State of charge (if available)
            if 'soc' in row:
                feature_row.append(row['soc'])
            else:
                feature_row.append(50.0)  # Default assumption
            
            features.append(feature_row)
        
        return np.array(features)
    
    def _detect_anomalies(self, telemetry_df: pd.DataFrame, chemistry: str) -> List[Dict[str, Any]]:
        """
        Detect anomalies in battery telemetry data
        
        Uses ML models to detect unusual patterns that might indicate
        battery issues or degradation.
        
        Args:
            telemetry_df: DataFrame with telemetry data
            chemistry: Battery chemistry type
            
        Returns:
            List of detected anomalies with details
        """
        anomalies = []
        
        if telemetry_df.empty or len(telemetry_df) < 10:
            logger.warning("Insufficient data for anomaly detection")
            return anomalies
        
        try:
            # Get anomaly detection model
            anomaly_model = self.anomaly_detection_models.get("default", IsolationForest(
                n_estimators=100, 
                contamination=0.05
            ))
            
            # Extract features for anomaly detection
            features = self._extract_anomaly_features(telemetry_df)
            
            if features is None or len(features) < 10:
                return anomalies
            
            # Scale features
            scaler_key = f"anomaly_{chemistry}"
            if scaler_key not in self.scalers:
                self.scalers[scaler_key] = StandardScaler()
                self.scalers[scaler_key].fit(features)
            
            scaled_features = self.scalers[scaler_key].transform(features)
            
            # Predict anomalies
            anomaly_scores = anomaly_model.decision_function(scaled_features)
            anomaly_predictions = anomaly_model.predict(scaled_features)
            
            # Process anomalies
            anomaly_indices = np.where(anomaly_predictions == -1)[0]
            for idx in anomaly_indices:
                if idx >= len(telemetry_df):
                    continue
                
                row = telemetry_df.iloc[idx]
                timestamp = row.get('timestamp', datetime.now() - timedelta(days=idx))
                score = abs(anomaly_scores[idx])
                
                # Determine anomaly type based on features
                anomaly_type = self._determine_anomaly_type(row)
                
                # Determine severity based on score
                if score > 0.8:
                    severity = "high"
                elif score > 0.5:
                    severity = "medium"
                else:
                    severity = "low"
                
                # Create anomaly record
                anomaly = {
                    "type": anomaly_type,
                    "severity": severity,
                    "date": timestamp.isoformat() if isinstance(timestamp, datetime) else timestamp,
                    "description": self._get_anomaly_description(anomaly_type, row),
                    "recommended_action": self._get_recommended_action(anomaly_type, severity)
                }
                
                anomalies.append(anomaly)
            
            # Sort by severity and date
            anomalies.sort(key=lambda x: (
                0 if x["severity"] == "high" else 1 if x["severity"] == "medium" else 2,
                x["date"]
            ))
            
            # Limit to top 5 most significant anomalies
            return anomalies[:5]
            
        except Exception as e:
            logger.exception(f"Error detecting anomalies: {str(e)}")
            return []
    
    def _extract_anomaly_features(self, telemetry_df: pd.DataFrame) -> np.ndarray:
        """Extract features from telemetry data for anomaly detection"""
        if telemetry_df.empty:
            return None
        
        # For anomaly detection, we're interested in:
        # - Unusual voltage levels
        # - Temperature spikes
        # - Unusual charge/discharge patterns
        # - Sudden capacity drops
        
        features = []
        
        # Compute rolling statistics
        window_size = min(10, len(telemetry_df))
        if 'voltage' in telemetry_df.columns:
            voltage_rolling = telemetry_df['voltage'].rolling(window=window_size).std().fillna(0)
        else:
            voltage_rolling = pd.Series([0] * len(telemetry_df))
            
        if 'temperature' in telemetry_df.columns:
            temp_rolling = telemetry_df['temperature'].rolling(window=window_size).std().fillna(0)
        else:
            temp_rolling = pd.Series([0] * len(telemetry_df))
        
        for i, row in telemetry_df.iterrows():
            feature_row = []
            
            # Add direct measurements
            if 'voltage' in row:
                feature_row.append(row['voltage'])
            else:
                feature_row.append(350.0)  # Default
                
            if 'temperature' in row:
                feature_row.append(row['temperature'])
            else:
                feature_row.append(25.0)  # Default
                
            if 'soc' in row:
                feature_row.append(row['soc'])
            else:
                feature_row.append(50.0)  # Default
            
            # Add rolling statistics
            feature_row.append(voltage_rolling.iloc[i % len(voltage_rolling)])
            feature_row.append(temp_rolling.iloc[i % len(temp_rolling)])
            
            # If health is available, add it
            if 'health' in row:
                feature_row.append(row['health'])
            else:
                feature_row.append(85.0)  # Default
            
            features.append(feature_row)
        
        return np.array(features)
    
    def _determine_anomaly_type(self, telemetry_row: pd.Series) -> str:
        """Determine the type of anomaly based on telemetry data"""
        # Check for temperature anomalies
        if 'temperature' in telemetry_row and telemetry_row['temperature'] > 45:
            return "high_temperature"
            
        if 'temperature' in telemetry_row and telemetry_row['temperature'] < 0:
            return "low_temperature"
            
        # Check for voltage anomalies
        if 'voltage' in telemetry_row and telemetry_row['voltage'] < 300:
            return "low_voltage"
            
        if 'voltage' in telemetry_row and telemetry_row['voltage'] > 430:
            return "high_voltage"
            
        # Check for health anomalies
        if 'health' in telemetry_row and telemetry_row['health'] < 70:
            return "accelerated_degradation"
            
        # Default
        return "unusual_pattern"
    
    def _get_anomaly_description(self, anomaly_type: str, telemetry_row: pd.Series) -> str:
        """Get human-readable description for an anomaly"""
        if anomaly_type == "high_temperature":
            temp = telemetry_row.get('temperature', 'unknown')
            return f"Battery temperature spike detected ({temp}°C)"
            
        elif anomaly_type == "low_temperature":
            temp = telemetry_row.get('temperature', 'unknown')
            return f"Battery temperature too low ({temp}°C)"
            
        elif anomaly_type == "low_voltage":
            voltage = telemetry_row.get('voltage', 'unknown')
            return f"Unusually low battery voltage ({voltage}V)"
            
        elif anomaly_type == "high_voltage":
            voltage = telemetry_row.get('voltage', 'unknown')
            return f"Unusually high battery voltage ({voltage}V)"
            
        elif anomaly_type == "accelerated_degradation":
            health = telemetry_row.get('health', 'unknown')
            return f"Accelerated battery degradation detected (SoH: {health}%)"
            
        else:
            return "Unusual battery behavior pattern detected"
    
    def _get_recommended_action(self, anomaly_type: str, severity: str) -> str:
        """Get recommended action for an anomaly"""
        if severity == "high":
            if anomaly_type == "high_temperature":
                return "Schedule immediate inspection of cooling system and battery pack"
                
            elif anomaly_type == "low_temperature":
                return "Check battery heating system and thermal insulation"
                
            elif anomaly_type == "low_voltage" or anomaly_type == "high_voltage":
                return "Perform full diagnostic of battery management system (BMS)"
                
            elif anomaly_type == "accelerated_degradation":
                return "Schedule comprehensive battery diagnostic and capacity test"
                
            else:
                return "Schedule diagnostic inspection"
                
        elif severity == "medium":
            if anomaly_type == "high_temperature":
                return "Monitor temperature patterns and check cooling system"
                
            elif anomaly_type == "low_temperature":
                return "Monitor temperature patterns in cold conditions"
                
            elif anomaly_type == "low_voltage" or anomaly_type == "high_voltage":
                return "Monitor voltage patterns and perform BMS check at next service"
                
            elif anomaly_type == "accelerated_degradation":
                return "Monitor battery performance and schedule capacity test"
                
            else:
                return "Monitor battery performance patterns"
                
        else:  # low severity
            return "Continue regular monitoring of battery parameters"
    
    def _calculate_replacement_date(
        self, state_of_health: float, degradation_rate: float, chemistry: str
    ) -> datetime:
        """
        Calculate estimated battery replacement date
        
        Args:
            state_of_health: Current state of health (%)
            degradation_rate: Monthly degradation rate (%)
            chemistry: Battery chemistry type
            
        Returns:
            Estimated replacement date
        """
        # Assume replacement threshold is 70% SoH
        replacement_threshold = 70.0
        
        if state_of_health <= replacement_threshold:
            # Immediate replacement needed
            return datetime.now()
        
        # Calculate months until replacement
        remaining_health = state_of_health - replacement_threshold
        months_to_replacement = remaining_health / max(0.1, degradation_rate)
        
        # Add some uncertainty based on chemistry
        chemistry_props = BATTERY_CHEMISTRY.get(chemistry, BATTERY_CHEMISTRY["NMC"])
        uncertainty_factor = 1.0 + np.random.normal(0, 0.2)  # +/- 20% uncertainty
        
        # Adjust based on chemistry properties
        adjusted_months = months_to_replacement * uncertainty_factor
        
        # Calculate date
        replacement_date = datetime.now() + timedelta(days=int(adjusted_months * 30.5))
        
        return replacement_date
    
    def train_models(self, training_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
        """
        Train ML models using historical data
        
        Args:
            training_data: Dictionary mapping battery chemistry to training DataFrame
            
        Returns:
            Dictionary with training results
        """
        results = {}
        
        for chemistry, data in training_data.items():
            if data.empty:
                results[chemistry] = {"status": "error", "message": "No training data provided"}
                continue
            
            try:
                # Extract features and target
                X = self._extract_prediction_features(data)
                y = data['health'].values if 'health' in data.columns else None
                
                if X is None or y is None or len(X) < 10:
                    results[chemistry] = {"status": "error", "message": "Insufficient training data"}
                    continue
                
                # Create and train model
                model = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                
                model.fit(X, y)
                
                # Save model
                self.degradation_models[chemistry] = model
                
                # Train anomaly detection model
                anomaly_features = self._extract_anomaly_features(data)
                if anomaly_features is not None and len(anomaly_features) >= 10:
                    anomaly_model = IsolationForest(
                        n_estimators=100,
                        contamination=0.05,
                        random_state=42
                    )
                    anomaly_model.fit(anomaly_features)
                    self.anomaly_detection_models[chemistry] = anomaly_model
                
                # Save models to disk
                self._save_models()
                
                results[chemistry] = {
                    "status": "success",
                    "message": f"Model trained successfully with {len(X)} samples",
                    "feature_importance": dict(zip(
                        ["age", "temperature", "voltage", "soc"],
                        model.feature_importances_
                    ))
                }
                
            except Exception as e:
                logger.exception(f"Error training model for {chemistry}: {str(e)}")
                results[chemistry] = {"status": "error", "message": str(e)}
        
        return results
    
    def _save_models(self):
        """Save all models to disk"""
        try:
            # Save degradation models
            joblib.dump(self.degradation_models, os.path.join(self.model_dir, "degradation_models.pkl"))
            
            # Save anomaly detection models
            joblib.dump(self.anomaly_detection_models, os.path.join(self.model_dir, "anomaly_detection_models.pkl"))
            
            # Save chemistry-specific models
            joblib.dump(self.chemistry_specific_models, os.path.join(self.model_dir, "chemistry_models.pkl"))
            
            # Save scalers
            joblib.dump(self.scalers, os.path.join(self.model_dir, "scalers.pkl"))
            
            logger.info("Models saved successfully")
            
        except Exception as e:
            logger.exception(f"Error saving models: {str(e)}")

# Singleton instance
_enhanced_predictor = None

def get_enhanced_battery_predictor() -> EnhancedBatteryHealthPredictor:
    """Get the enhanced battery health predictor instance"""
    global _enhanced_predictor
    if _enhanced_predictor is None:
        _enhanced_predictor = EnhancedBatteryHealthPredictor()
    return _enhanced_predictor 