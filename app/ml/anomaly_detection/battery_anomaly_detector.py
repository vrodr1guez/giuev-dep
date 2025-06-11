"""
Battery Anomaly Detection Module

This module provides advanced anomaly detection for battery telemetry data
using statistical and machine learning techniques.
"""
import os
import sys
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any, Union
from datetime import datetime, timedelta
from pathlib import Path
import joblib
from scipy import stats
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.ml.preprocessing.feature_engineering import extract_time_features, detect_anomalies

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class BatteryAnomalyDetector:
    """
    Class for detecting anomalies in battery telemetry data
    
    This class provides methods for detecting anomalies in battery telemetry data
    using various statistical and machine learning techniques.
    """
    
    def __init__(
        self,
        detection_methods: List[str] = None,
        model_path: Optional[str] = None,
        contamination: float = 0.05,
        window_size: int = 24,  # Hours
        strict_mode: bool = False
    ):
        """
        Initialize the battery anomaly detector
        
        Args:
            detection_methods: List of detection methods to use
            model_path: Path to a saved anomaly detection model
            contamination: Expected proportion of anomalies in the data
            window_size: Size of the rolling window for statistical detection
            strict_mode: If True, uses more sensitive thresholds
        """
        self.detection_methods = detection_methods or [
            'statistical', 'isolation_forest', 'dbscan', 'threshold'
        ]
        self.contamination = contamination
        self.window_size = window_size
        self.strict_mode = strict_mode
        self.models = {}
        
        # Parameters that can be adjusted based on strict_mode
        self.std_threshold = 2.5 if not strict_mode else 2.0
        self.lof_n_neighbors = 20
        self.dbscan_eps = 0.5
        self.dbscan_min_samples = 5
        
        # Load model if provided
        if model_path:
            self.load_model(model_path)
        else:
            self._initialize_models()
    
    def _initialize_models(self) -> None:
        """Initialize anomaly detection models"""
        # Initialize Isolation Forest model
        if 'isolation_forest' in self.detection_methods:
            self.models['isolation_forest'] = IsolationForest(
                contamination=self.contamination,
                random_state=42,
                n_estimators=100
            )
        
        # Initialize Local Outlier Factor model
        if 'lof' in self.detection_methods:
            self.models['lof'] = LocalOutlierFactor(
                n_neighbors=self.lof_n_neighbors,
                contamination=self.contamination
            )
        
        # Initialize DBSCAN model
        if 'dbscan' in self.detection_methods:
            self.models['dbscan'] = DBSCAN(
                eps=self.dbscan_eps,
                min_samples=self.dbscan_min_samples
            )
    
    def detect_anomalies(
        self,
        telemetry_data: pd.DataFrame,
        vehicle_id: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Detect anomalies in battery telemetry data
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            vehicle_id: Optional specific vehicle ID to analyze
            
        Returns:
            DataFrame with anomaly flags
        """
        # Create a copy to avoid modifying the original
        data = telemetry_data.copy()
        
        # Filter by vehicle if specified
        if vehicle_id:
            if 'vehicle_id' not in data.columns:
                raise ValueError("DataFrame does not contain 'vehicle_id' column")
            data = data[data['vehicle_id'] == vehicle_id].copy()
        
        # Ensure timestamp is datetime
        if 'timestamp' in data.columns and not pd.api.types.is_datetime64_dtype(data['timestamp']):
            data['timestamp'] = pd.to_datetime(data['timestamp'])
        
        # Sort by timestamp
        if 'timestamp' in data.columns:
            data = data.sort_values('timestamp')
        
        # Extract features if not already present
        if 'hour_of_day' not in data.columns and 'timestamp' in data.columns:
            data = extract_time_features(data, 'timestamp')
        
        # Initialize anomaly columns
        for method in self.detection_methods:
            data[f'anomaly_{method}'] = 0
        
        # Apply different detection methods
        if 'statistical' in self.detection_methods:
            data = self._detect_statistical_anomalies(data)
        
        if 'threshold' in self.detection_methods:
            data = self._detect_threshold_anomalies(data)
        
        if 'isolation_forest' in self.detection_methods:
            data = self._detect_isolation_forest_anomalies(data)
        
        if 'dbscan' in self.detection_methods:
            data = self._detect_dbscan_anomalies(data)
        
        if 'lof' in self.detection_methods and 'lof' in self.models:
            data = self._detect_lof_anomalies(data)
        
        # Aggregate anomaly results
        data['anomaly_count'] = sum(data[f'anomaly_{method}'] for method in self.detection_methods)
        
        # Add an overall anomaly flag if detected by multiple methods
        min_methods = 2 if not self.strict_mode else 1
        data['is_anomaly'] = (data['anomaly_count'] >= min_methods).astype(int)
        
        # Add severity based on how many methods detected the anomaly
        conditions = [
            (data['anomaly_count'] >= len(self.detection_methods) - 1),
            (data['anomaly_count'] >= len(self.detection_methods) // 2),
            (data['anomaly_count'] >= min_methods)
        ]
        choices = ['high', 'medium', 'low']
        data['anomaly_severity'] = np.select(conditions, choices, default='none')
        
        return data
    
    def _detect_statistical_anomalies(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Detect anomalies using statistical methods (Z-score, IQR)
        
        Args:
            data: DataFrame with battery telemetry data
            
        Returns:
            DataFrame with statistical anomaly flags
        """
        result = data.copy()
        
        # Columns to check for anomalies
        columns_to_check = [
            'state_of_charge', 'battery_temp', 'voltage', 'current'
        ]
        columns_to_check = [col for col in columns_to_check if col in data.columns]
        
        # Process by vehicle if vehicle_id exists
        if 'vehicle_id' in data.columns:
            vehicle_groups = data.groupby('vehicle_id')
        else:
            # If no vehicle_id, treat all data as one group
            vehicle_groups = [(None, data)]
        
        for vehicle_id, vehicle_data in vehicle_groups:
            # For each numerical column
            for col in columns_to_check:
                # Calculate rolling statistics
                if len(vehicle_data) >= 3:  # Need at least 3 points for meaningful statistics
                    # Calculate rolling mean and std
                    rolling_mean = vehicle_data[col].rolling(window=min(self.window_size, len(vehicle_data)), 
                                                           min_periods=3, center=True).mean()
                    rolling_std = vehicle_data[col].rolling(window=min(self.window_size, len(vehicle_data)), 
                                                          min_periods=3, center=True).std()
                    
                    # Calculate Z-scores
                    z_scores = (vehicle_data[col] - rolling_mean) / rolling_std
                    
                    # Mark anomalies where Z-score exceeds threshold
                    anomalies = abs(z_scores) > self.std_threshold
                    
                    # Update result DataFrame
                    if vehicle_id is not None:
                        idx = vehicle_data.index
                        result.loc[idx, f'anomaly_statistical'] |= anomalies
                    else:
                        result[f'anomaly_statistical'] |= anomalies
        
        return result
    
    def _detect_threshold_anomalies(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Detect anomalies using domain-specific thresholds
        
        Args:
            data: DataFrame with battery telemetry data
            
        Returns:
            DataFrame with threshold anomaly flags
        """
        result = data.copy()
        
        # Define thresholds (these should be adjusted based on the actual battery specs)
        thresholds = {
            'battery_temp': {'min': 0, 'max': 45},  # in °C
            'voltage': {'min': 300, 'max': 420},    # in V
            'current': {'min': -150, 'max': 150},   # in A
            'state_of_charge': {'min': 5, 'max': 100}  # in %
        }
        
        # Make thresholds more strict if in strict mode
        if self.strict_mode:
            thresholds['battery_temp']['max'] = 40
            thresholds['voltage']['min'] = 350
            thresholds['current']['min'] = -100
            thresholds['current']['max'] = 100
        
        # Check each column against thresholds
        for col, limits in thresholds.items():
            if col in data.columns:
                # Mark values outside thresholds as anomalies
                below_min = data[col] < limits['min']
                above_max = data[col] > limits['max']
                
                result.loc[below_min | above_max, f'anomaly_threshold'] = 1
                
                # Additional context-dependent checks
                if col == 'current' and 'charging_status' in data.columns:
                    # Current should be positive when charging, negative when discharging
                    charging = data['charging_status'] == 1
                    discharging = data['charging_status'] == 0
                    
                    current_anomaly = (charging & (data['current'] < 0)) | (discharging & (data['current'] > 0))
                    result.loc[current_anomaly, f'anomaly_threshold'] = 1
        
        return result
    
    def _detect_isolation_forest_anomalies(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Detect anomalies using Isolation Forest
        
        Args:
            data: DataFrame with battery telemetry data
            
        Returns:
            DataFrame with Isolation Forest anomaly flags
        """
        result = data.copy()
        
        # Select features for anomaly detection
        feature_cols = [
            'state_of_charge', 'battery_temp', 'voltage', 'current'
        ]
        feature_cols = [col for col in feature_cols if col in data.columns]
        
        if not feature_cols:
            logger.warning("No usable feature columns for Isolation Forest")
            return result
        
        # Handle missing values
        features = data[feature_cols].copy()
        features = features.fillna(features.mean())
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Fit and predict
        model = self.models.get('isolation_forest')
        if model is None:
            model = IsolationForest(contamination=self.contamination, random_state=42)
            self.models['isolation_forest'] = model
            model.fit(features_scaled)
        
        # Predict anomalies
        predictions = model.predict(features_scaled)
        
        # In Isolation Forest, -1 indicates anomalies
        result['anomaly_isolation_forest'] = (predictions == -1).astype(int)
        
        return result
    
    def _detect_dbscan_anomalies(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Detect anomalies using DBSCAN clustering
        
        Args:
            data: DataFrame with battery telemetry data
            
        Returns:
            DataFrame with DBSCAN anomaly flags
        """
        result = data.copy()
        
        # Select features for anomaly detection
        feature_cols = [
            'state_of_charge', 'battery_temp', 'voltage', 'current'
        ]
        feature_cols = [col for col in feature_cols if col in data.columns]
        
        if not feature_cols:
            logger.warning("No usable feature columns for DBSCAN")
            return result
        
        # Handle missing values
        features = data[feature_cols].copy()
        features = features.fillna(features.mean())
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Fit DBSCAN
        model = self.models.get('dbscan')
        if model is None:
            model = DBSCAN(eps=self.dbscan_eps, min_samples=self.dbscan_min_samples)
            self.models['dbscan'] = model
        
        # Cluster the data
        clusters = model.fit_predict(features_scaled)
        
        # In DBSCAN, -1 indicates noise points (anomalies)
        result['anomaly_dbscan'] = (clusters == -1).astype(int)
        
        return result
    
    def _detect_lof_anomalies(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Detect anomalies using Local Outlier Factor
        
        Args:
            data: DataFrame with battery telemetry data
            
        Returns:
            DataFrame with LOF anomaly flags
        """
        result = data.copy()
        
        # Select features for anomaly detection
        feature_cols = [
            'state_of_charge', 'battery_temp', 'voltage', 'current'
        ]
        feature_cols = [col for col in feature_cols if col in data.columns]
        
        if not feature_cols or len(data) < self.lof_n_neighbors:
            logger.warning("Not enough data or feature columns for LOF")
            return result
        
        # Handle missing values
        features = data[feature_cols].copy()
        features = features.fillna(features.mean())
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Create and fit LOF
        model = LocalOutlierFactor(n_neighbors=min(self.lof_n_neighbors, len(data)-1), 
                                  contamination=self.contamination)
        
        # Predict anomalies
        predictions = model.fit_predict(features_scaled)
        
        # In LOF, -1 indicates anomalies
        result['anomaly_lof'] = (predictions == -1).astype(int)
        
        return result
    
    def analyze_anomalies(
        self,
        telemetry_data: pd.DataFrame,
        vehicle_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze anomalies in battery telemetry data
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            vehicle_id: Optional specific vehicle ID to analyze
            
        Returns:
            Dictionary with anomaly analysis results
        """
        # Detect anomalies
        data_with_anomalies = self.detect_anomalies(telemetry_data, vehicle_id)
        
        # Get rows with anomalies
        anomalies = data_with_anomalies[data_with_anomalies['is_anomaly'] == 1]
        
        # Return empty result if no anomalies
        if len(anomalies) == 0:
            return {
                'total_records': len(data_with_anomalies),
                'anomaly_count': 0,
                'anomaly_percentage': 0,
                'anomalies_by_method': {},
                'anomalies_by_severity': {},
                'anomalies': []
            }
        
        # Calculate anomaly statistics
        anomaly_percentage = len(anomalies) / len(data_with_anomalies) * 100
        
        # Count anomalies by method
        anomalies_by_method = {}
        for method in self.detection_methods:
            count = data_with_anomalies[f'anomaly_{method}'].sum()
            anomalies_by_method[method] = count
        
        # Count anomalies by severity
        anomalies_by_severity = anomalies['anomaly_severity'].value_counts().to_dict()
        
        # Create detailed list of anomalies
        anomaly_list = []
        for _, row in anomalies.iterrows():
            anomaly_detail = {
                'timestamp': row['timestamp'].isoformat() if 'timestamp' in row else None,
                'vehicle_id': row['vehicle_id'] if 'vehicle_id' in row else vehicle_id,
                'severity': row['anomaly_severity'],
                'detected_by': [method for method in self.detection_methods 
                              if row.get(f'anomaly_{method}', 0) == 1],
                'metrics': {}
            }
            
            # Add battery metrics to the anomaly detail
            for col in ['state_of_charge', 'battery_temp', 'voltage', 'current', 'charging_status']:
                if col in row:
                    anomaly_detail['metrics'][col] = row[col]
            
            anomaly_list.append(anomaly_detail)
        
        # Return analysis results
        return {
            'total_records': len(data_with_anomalies),
            'anomaly_count': len(anomalies),
            'anomaly_percentage': anomaly_percentage,
            'anomalies_by_method': anomalies_by_method,
            'anomalies_by_severity': anomalies_by_severity,
            'anomalies': anomaly_list
        }
    
    def save_model(self, model_path: str) -> None:
        """
        Save the anomaly detection models
        
        Args:
            model_path: Path to save the model
        """
        model_data = {
            'models': self.models,
            'detection_methods': self.detection_methods,
            'contamination': self.contamination,
            'window_size': self.window_size,
            'strict_mode': self.strict_mode,
            'std_threshold': self.std_threshold,
            'lof_n_neighbors': self.lof_n_neighbors,
            'dbscan_eps': self.dbscan_eps,
            'dbscan_min_samples': self.dbscan_min_samples
        }
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save model
        joblib.dump(model_data, model_path)
        logger.info(f"Anomaly detection model saved to {model_path}")
    
    def load_model(self, model_path: str) -> None:
        """
        Load anomaly detection models
        
        Args:
            model_path: Path to load the model from
        """
        model_data = joblib.load(model_path)
        
        # Load model parameters
        self.models = model_data.get('models', {})
        self.detection_methods = model_data.get('detection_methods', self.detection_methods)
        self.contamination = model_data.get('contamination', self.contamination)
        self.window_size = model_data.get('window_size', self.window_size)
        self.strict_mode = model_data.get('strict_mode', self.strict_mode)
        self.std_threshold = model_data.get('std_threshold', self.std_threshold)
        self.lof_n_neighbors = model_data.get('lof_n_neighbors', self.lof_n_neighbors)
        self.dbscan_eps = model_data.get('dbscan_eps', self.dbscan_eps)
        self.dbscan_min_samples = model_data.get('dbscan_min_samples', self.dbscan_min_samples)
        
        logger.info(f"Anomaly detection model loaded from {model_path}")


# Example usage
if __name__ == "__main__":
    # Create sample telemetry data
    data = pd.DataFrame({
        'vehicle_id': ['v1'] * 100 + ['v2'] * 100,
        'timestamp': pd.date_range(start='2023-01-01', periods=200, freq='H'),
        'state_of_charge': np.concatenate([
            np.linspace(90, 30, 100),  # Normal discharge
            np.linspace(90, 30, 100)   # Normal discharge
        ]),
        'battery_temp': np.concatenate([
            25 + 5 * np.sin(np.linspace(0, 4*np.pi, 100)),  # Normal temperature
            25 + 5 * np.sin(np.linspace(0, 4*np.pi, 100))   # Normal temperature
        ]),
        'voltage': np.concatenate([
            400 - np.linspace(0, 100, 100),  # Normal voltage drop
            400 - np.linspace(0, 100, 100)   # Normal voltage drop
        ]),
        'current': np.concatenate([
            -10 * np.ones(100),  # Normal discharge current
            -10 * np.ones(100)   # Normal discharge current
        ]),
        'charging_status': np.concatenate([
            np.zeros(100),  # Not charging
            np.zeros(100)   # Not charging
        ])
    })
    
    # Inject anomalies
    # 1. High temperature spike for v1
    data.loc[50, 'battery_temp'] = 60  # Anomaly
    
    # 2. Sudden voltage drop for v2
    data.loc[150, 'voltage'] = 200  # Anomaly
    
    # 3. Charging status mismatch for v1
    data.loc[75, 'charging_status'] = 1  # Charging
    data.loc[75, 'current'] = -15  # But current still negative
    
    # Create anomaly detector
    detector = BatteryAnomalyDetector(
        detection_methods=['statistical', 'threshold', 'isolation_forest', 'dbscan'],
        strict_mode=True
    )
    
    # Detect anomalies
    result = detector.detect_anomalies(data)
    
    # Print anomalies
    anomalies = result[result['is_anomaly'] == 1]
    print(f"Found {len(anomalies)} anomalies in {len(data)} records")
    
    # Analyze anomalies
    analysis = detector.analyze_anomalies(data)
    
    # Print analysis results
    print(f"Anomaly percentage: {analysis['anomaly_percentage']:.2f}%")
    print(f"Anomalies by method: {analysis['anomalies_by_method']}")
    print(f"Anomalies by severity: {analysis['anomalies_by_severity']}")
    
    # Print first anomaly details
    if analysis['anomalies']:
        print("\nFirst anomaly details:")
        print(analysis['anomalies'][0]) 