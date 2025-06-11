"""
Model Monitoring and Observability System

This module provides tools for monitoring ML model performance in production,
detecting data drift, and triggering model retraining when necessary.
"""
import os
import sys
import json
import logging
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from pathlib import Path
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ModelMonitor:
    """
    Class for monitoring ML model performance in production
    
    This class provides methods for tracking model predictions, actual outcomes,
    calculating performance metrics, detecting data drift, and triggering
    retraining when necessary.
    """
    
    def __init__(
        self,
        model_id: str,
        model_type: str,
        metrics: List[str] = None,
        storage_path: str = 'data/monitoring',
        drift_detection_window: int = 1000,
        alert_callbacks: List[Callable] = None,
        acceptable_drift_threshold: float = 0.1,
        retraining_frequency_days: int = 30
    ):
        """
        Initialize the model monitor
        
        Args:
            model_id: Unique identifier for the model
            model_type: Type of model (e.g., 'battery_health', 'usage_prediction')
            metrics: List of metrics to track
            storage_path: Path to store monitoring data
            drift_detection_window: Number of predictions to use for drift detection
            alert_callbacks: Functions to call when alerts are triggered
            acceptable_drift_threshold: Threshold for acceptable drift
            retraining_frequency_days: Minimum days between retrainings
        """
        self.model_id = model_id
        self.model_type = model_type
        self.storage_path = storage_path
        self.drift_detection_window = drift_detection_window
        self.alert_callbacks = alert_callbacks or []
        self.acceptable_drift_threshold = acceptable_drift_threshold
        self.retraining_frequency_days = retraining_frequency_days
        
        # Default metrics based on model type
        if metrics is None:
            if 'regression' in model_type or 'prediction' in model_type:
                metrics = ['rmse', 'mae', 'r2']
            elif 'classification' in model_type:
                metrics = ['accuracy', 'precision', 'recall', 'f1']
            else:
                metrics = ['rmse', 'mae']
        
        self.metrics = metrics
        
        # Initialize data structures
        self.predictions = []
        self.actuals = []
        self.features = []
        self.timestamps = []
        
        # Performance history
        self.performance_history = {metric: [] for metric in self.metrics}
        self.performance_timestamps = []
        
        # Drift detection
        self.baseline_feature_stats = {}
        self.baseline_set = False
        
        # Create monitoring directory
        self.model_dir = os.path.join(storage_path, model_id)
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Retraining
        self.last_retrain_date = None
        self.last_performance_check = datetime.now()
        self.retrain_requested = False
        
        # Load existing data if available
        self._load_monitoring_data()
        
        logger.info(f"Model monitor initialized for model {model_id}")
    
    def _load_monitoring_data(self) -> None:
        """Load existing monitoring data if available"""
        try:
            # Check for predictions file
            predictions_file = os.path.join(self.model_dir, 'predictions.json')
            if os.path.exists(predictions_file):
                with open(predictions_file, 'r') as f:
                    data = json.load(f)
                    self.predictions = data.get('predictions', [])
                    self.actuals = data.get('actuals', [])
                    self.timestamps = data.get('timestamps', [])
                    
                    # Convert timestamps to datetime
                    self.timestamps = [datetime.fromisoformat(ts) if ts else None for ts in self.timestamps]
            
            # Check for features file
            features_file = os.path.join(self.model_dir, 'features.joblib')
            if os.path.exists(features_file):
                self.features = joblib.load(features_file)
            
            # Check for performance history
            perf_file = os.path.join(self.model_dir, 'performance.json')
            if os.path.exists(perf_file):
                with open(perf_file, 'r') as f:
                    data = json.load(f)
                    self.performance_history = data.get('metrics', {})
                    self.performance_timestamps = data.get('timestamps', [])
                    
                    # Convert timestamps to datetime
                    self.performance_timestamps = [datetime.fromisoformat(ts) for ts in self.performance_timestamps]
            
            # Check for baseline feature stats
            baseline_file = os.path.join(self.model_dir, 'baseline.json')
            if os.path.exists(baseline_file):
                with open(baseline_file, 'r') as f:
                    self.baseline_feature_stats = json.load(f)
                    self.baseline_set = True
            
            # Check for retraining info
            retrain_file = os.path.join(self.model_dir, 'retraining.json')
            if os.path.exists(retrain_file):
                with open(retrain_file, 'r') as f:
                    data = json.load(f)
                    if data.get('last_retrain_date'):
                        self.last_retrain_date = datetime.fromisoformat(data['last_retrain_date'])
            
            logger.info(f"Loaded existing monitoring data for model {self.model_id}")
            
        except Exception as e:
            logger.error(f"Error loading monitoring data: {str(e)}")
    
    def _save_monitoring_data(self) -> None:
        """Save monitoring data to files"""
        try:
            # Save predictions and actuals
            predictions_file = os.path.join(self.model_dir, 'predictions.json')
            with open(predictions_file, 'w') as f:
                json.dump({
                    'predictions': self.predictions[-self.drift_detection_window:] if self.predictions else [],
                    'actuals': self.actuals[-self.drift_detection_window:] if self.actuals else [],
                    'timestamps': [ts.isoformat() if ts else None for ts in self.timestamps[-self.drift_detection_window:]] if self.timestamps else []
                }, f)
            
            # Save features (using joblib for efficient storage of numpy arrays)
            features_file = os.path.join(self.model_dir, 'features.joblib')
            joblib.dump(self.features[-self.drift_detection_window:] if self.features else [], features_file)
            
            # Save performance history
            perf_file = os.path.join(self.model_dir, 'performance.json')
            with open(perf_file, 'w') as f:
                json.dump({
                    'metrics': self.performance_history,
                    'timestamps': [ts.isoformat() for ts in self.performance_timestamps]
                }, f)
            
            # Save baseline feature stats
            if self.baseline_set:
                baseline_file = os.path.join(self.model_dir, 'baseline.json')
                with open(baseline_file, 'w') as f:
                    json.dump(self.baseline_feature_stats, f)
            
            # Save retraining info
            retrain_file = os.path.join(self.model_dir, 'retraining.json')
            with open(retrain_file, 'w') as f:
                json.dump({
                    'last_retrain_date': self.last_retrain_date.isoformat() if self.last_retrain_date else None,
                    'retrain_requested': self.retrain_requested
                }, f)
                
        except Exception as e:
            logger.error(f"Error saving monitoring data: {str(e)}")
    
    def record_prediction(
        self,
        prediction: Any,
        features: Dict[str, Any],
        actual: Any = None,
        timestamp: Optional[datetime] = None
    ) -> None:
        """
        Record a prediction and its features
        
        Args:
            prediction: The model's prediction
            features: Features used for the prediction
            actual: The actual value (if available)
            timestamp: Timestamp of the prediction
        """
        # Set default timestamp if not provided
        if timestamp is None:
            timestamp = datetime.now()
        
        # Store prediction
        self.predictions.append(prediction)
        self.actuals.append(actual)
        self.features.append(features)
        self.timestamps.append(timestamp)
        
        # Check for baseline initialization
        if not self.baseline_set and len(self.features) >= min(100, self.drift_detection_window):
            self._establish_baseline()
        
        # Check for data drift periodically
        if len(self.predictions) % (self.drift_detection_window // 10) == 0:
            self._check_for_drift()
        
        # Check if it's time to evaluate performance
        time_since_check = (datetime.now() - self.last_performance_check).total_seconds() / 3600  # hours
        if time_since_check >= 24:  # Check once per day
            self._calculate_performance_metrics()
            self.last_performance_check = datetime.now()
        
        # Save monitoring data periodically
        if len(self.predictions) % 500 == 0:
            self._save_monitoring_data()
    
    def record_actual(self, actual: Any, prediction_index: int = -1) -> None:
        """
        Record the actual value for a previous prediction
        
        Args:
            actual: The actual value
            prediction_index: Index of the prediction (default is latest)
        """
        if not self.predictions:
            logger.warning("No predictions to update")
            return
        
        if prediction_index < -len(self.predictions) or prediction_index >= len(self.predictions):
            logger.warning(f"Invalid prediction index: {prediction_index}")
            return
        
        # Update actual value
        self.actuals[prediction_index] = actual
        
        # Calculate performance metrics if we have sufficient data
        recent_actuals = [a for a in self.actuals if a is not None]
        if len(recent_actuals) >= 100:
            self._calculate_performance_metrics()
    
    def _establish_baseline(self) -> None:
        """Establish baseline feature statistics for drift detection"""
        # Collect numerical features
        feature_data = {}
        for f in self.features:
            for key, value in f.items():
                if isinstance(value, (int, float)) and not pd.isna(value):
                    if key not in feature_data:
                        feature_data[key] = []
                    feature_data[key].append(value)
        
        # Calculate statistics for each feature
        self.baseline_feature_stats = {}
        for feature_name, values in feature_data.items():
            if len(values) >= 30:  # Need enough data for reliable statistics
                values_array = np.array(values)
                self.baseline_feature_stats[feature_name] = {
                    'mean': float(np.mean(values_array)),
                    'std': float(np.std(values_array)),
                    'min': float(np.min(values_array)),
                    'max': float(np.max(values_array)),
                    'q25': float(np.percentile(values_array, 25)),
                    'median': float(np.median(values_array)),
                    'q75': float(np.percentile(values_array, 75)),
                    'histogram': np.histogram(values_array, bins=10)[0].tolist()
                }
        
        self.baseline_set = True
        logger.info(f"Baseline established for {len(self.baseline_feature_stats)} features")
    
    def _check_for_drift(self) -> Dict[str, Any]:
        """
        Check for drift in feature distributions
        
        Returns:
            Dictionary with drift detection results
        """
        if not self.baseline_set:
            return {'status': 'no_baseline', 'message': 'Baseline not yet established'}
        
        # Get recent features
        recent_features = self.features[-min(len(self.features), self.drift_detection_window):]
        
        # Collect feature values
        current_feature_data = {}
        for f in recent_features:
            for key, value in f.items():
                if isinstance(value, (int, float)) and not pd.isna(value):
                    if key not in current_feature_data:
                        current_feature_data[key] = []
                    current_feature_data[key].append(value)
        
        # Calculate drift for each feature
        drift_results = {}
        for feature_name, baseline in self.baseline_feature_stats.items():
            if feature_name in current_feature_data and len(current_feature_data[feature_name]) >= 30:
                current_values = np.array(current_feature_data[feature_name])
                
                # Calculate KS test (distribution comparison)
                try:
                    ks_statistic, ks_pvalue = stats.ks_2samp(
                        np.random.choice(current_values, size=1000, replace=True),
                        np.random.normal(
                            loc=baseline['mean'],
                            scale=baseline['std'],
                            size=1000
                        )
                    )
                except:
                    ks_statistic, ks_pvalue = np.nan, np.nan
                
                # Calculate differences in basic statistics
                current_stats = {
                    'mean': float(np.mean(current_values)),
                    'std': float(np.std(current_values)),
                    'min': float(np.min(current_values)),
                    'max': float(np.max(current_values)),
                    'median': float(np.median(current_values))
                }
                
                # Calculate normalized difference as drift measure
                mean_diff = abs(current_stats['mean'] - baseline['mean'])
                if baseline['mean'] != 0:
                    mean_diff_rel = mean_diff / abs(baseline['mean'])
                else:
                    mean_diff_rel = mean_diff
                
                std_diff = abs(current_stats['std'] - baseline['std'])
                if baseline['std'] != 0:
                    std_diff_rel = std_diff / baseline['std']
                else:
                    std_diff_rel = std_diff
                
                # Overall drift score (0-1)
                drift_score = max(
                    min(mean_diff_rel, 1.0),
                    min(std_diff_rel, 1.0),
                    min(ks_statistic, 1.0)
                )
                
                drift_results[feature_name] = {
                    'drift_score': float(drift_score),
                    'mean_diff': float(mean_diff),
                    'mean_diff_rel': float(mean_diff_rel),
                    'std_diff': float(std_diff),
                    'std_diff_rel': float(std_diff_rel),
                    'ks_statistic': float(ks_statistic) if not np.isnan(ks_statistic) else None,
                    'ks_pvalue': float(ks_pvalue) if not np.isnan(ks_pvalue) else None,
                    'baseline': baseline,
                    'current': current_stats
                }
        
        # Calculate overall drift
        if drift_results:
            overall_drift = np.mean([r['drift_score'] for r in drift_results.values()])
            max_drift_feature = max(drift_results.items(), key=lambda x: x[1]['drift_score'])
            
            drift_status = {
                'status': 'drift_detected' if overall_drift > self.acceptable_drift_threshold else 'normal',
                'overall_drift': float(overall_drift),
                'max_drift_feature': max_drift_feature[0],
                'max_drift_score': float(max_drift_feature[1]['drift_score']),
                'feature_drift': drift_results,
                'timestamp': datetime.now().isoformat()
            }
            
            # Save drift results
            drift_file = os.path.join(self.model_dir, 'latest_drift.json')
            with open(drift_file, 'w') as f:
                json.dump(drift_status, f, indent=2)
            
            # If significant drift detected, trigger alert and possible retraining
            if overall_drift > self.acceptable_drift_threshold:
                logger.warning(f"Data drift detected for model {self.model_id}: {overall_drift:.4f}")
                
                # Check if retraining is needed
                retrain_needed = self._check_retraining_needed(drift_status)
                
                # Send alerts to callbacks
                for callback in self.alert_callbacks:
                    try:
                        callback({
                            'type': 'data_drift',
                            'model_id': self.model_id,
                            'model_type': self.model_type,
                            'drift_score': overall_drift,
                            'retrain_needed': retrain_needed,
                            'timestamp': datetime.now().isoformat(),
                            'details': {
                                'max_drift_feature': max_drift_feature[0],
                                'max_drift_score': max_drift_feature[1]['drift_score']
                            }
                        })
                    except Exception as e:
                        logger.error(f"Error in drift alert callback: {str(e)}")
            
            return drift_status
        else:
            return {'status': 'insufficient_data', 'message': 'Not enough data for drift detection'}
    
    def _calculate_performance_metrics(self) -> Dict[str, Any]:
        """
        Calculate performance metrics based on predictions and actuals
        
        Returns:
            Dictionary with performance metrics
        """
        # Get prediction-actual pairs (excluding None values)
        valid_pairs = [(p, a) for p, a in zip(self.predictions, self.actuals) if a is not None]
        
        if len(valid_pairs) < 30:
            return {'status': 'insufficient_data', 'message': 'Not enough data for performance calculation'}
        
        # Split into lists
        y_pred, y_true = zip(*valid_pairs[-min(len(valid_pairs), self.drift_detection_window):])
        
        # Convert to numpy arrays for calculation
        y_pred = np.array(y_pred)
        y_true = np.array(y_true)
        
        # Calculate metrics
        metrics_result = {}
        
        try:
            if 'rmse' in self.metrics:
                metrics_result['rmse'] = float(np.sqrt(mean_squared_error(y_true, y_pred)))
            
            if 'mae' in self.metrics:
                metrics_result['mae'] = float(mean_absolute_error(y_true, y_pred))
            
            if 'r2' in self.metrics:
                metrics_result['r2'] = float(r2_score(y_true, y_pred))
            
            if 'mape' in self.metrics:
                # Avoid division by zero
                mask = y_true != 0
                if mask.sum() > 0:
                    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
                    metrics_result['mape'] = float(mape)
                else:
                    metrics_result['mape'] = None
            
            if 'accuracy' in self.metrics:
                metrics_result['accuracy'] = float(np.mean(y_pred == y_true))
        
        except Exception as e:
            logger.error(f"Error calculating metrics: {str(e)}")
            return {'status': 'error', 'message': str(e)}
        
        # Store in performance history
        timestamp = datetime.now()
        self.performance_timestamps.append(timestamp)
        
        for metric, value in metrics_result.items():
            if metric in self.performance_history:
                self.performance_history[metric].append(value)
        
        # Prune history if it gets too long
        max_history = 1000
        if len(self.performance_timestamps) > max_history:
            self.performance_timestamps = self.performance_timestamps[-max_history:]
            for metric in self.performance_history:
                self.performance_history[metric] = self.performance_history[metric][-max_history:]
        
        # Create performance summary
        performance_summary = {
            'timestamp': timestamp.isoformat(),
            'metrics': metrics_result,
            'sample_size': len(valid_pairs)
        }
        
        # Save latest performance
        perf_file = os.path.join(self.model_dir, 'latest_performance.json')
        with open(perf_file, 'w') as f:
            json.dump(performance_summary, f, indent=2)
        
        # Check if performance degradation requires retraining
        self._check_performance_degradation(metrics_result)
        
        return performance_summary
    
    def _check_performance_degradation(self, current_metrics: Dict[str, float]) -> bool:
        """
        Check if there's significant performance degradation
        
        Args:
            current_metrics: Current performance metrics
            
        Returns:
            True if significant degradation detected
        """
        if not self.performance_history or not current_metrics:
            return False
        
        degradation_detected = False
        
        # Check each metric for degradation
        for metric, value in current_metrics.items():
            if metric not in self.performance_history or not self.performance_history[metric]:
                continue
            
            # Get historical values and baseline
            history = self.performance_history[metric]
            baseline = np.mean(history[:min(10, len(history))])  # Use first few values as baseline
            
            # Calculate degradation amount
            if metric in ['rmse', 'mae', 'mape']:  # Lower is better
                if baseline > 0:
                    degradation = (value - baseline) / baseline
                    threshold = 0.2  # 20% degradation
                else:
                    degradation = value - baseline
                    threshold = 0.1
                
                if degradation > threshold:
                    degradation_detected = True
                    logger.warning(f"Performance degradation detected for {metric}: {degradation:.2%}")
            
            elif metric in ['r2', 'accuracy']:  # Higher is better
                if baseline > 0:
                    degradation = (baseline - value) / baseline
                    threshold = 0.15  # 15% degradation
                else:
                    degradation = baseline - value
                    threshold = 0.1
                
                if degradation > threshold:
                    degradation_detected = True
                    logger.warning(f"Performance degradation detected for {metric}: {degradation:.2%}")
        
        # If degradation detected, check if retraining is needed
        if degradation_detected:
            retrain_needed = self._check_retraining_needed({
                'cause': 'performance_degradation',
                'metrics': current_metrics
            })
            
            # Send alerts
            for callback in self.alert_callbacks:
                try:
                    callback({
                        'type': 'performance_degradation',
                        'model_id': self.model_id,
                        'model_type': self.model_type,
                        'metrics': current_metrics,
                        'retrain_needed': retrain_needed,
                        'timestamp': datetime.now().isoformat()
                    })
                except Exception as e:
                    logger.error(f"Error in performance alert callback: {str(e)}")
        
        return degradation_detected
    
    def _check_retraining_needed(self, trigger_info: Dict[str, Any]) -> bool:
        """
        Check if retraining is needed and not too recent
        
        Args:
            trigger_info: Information about what triggered the check
            
        Returns:
            True if retraining is needed
        """
        # If no previous training or it's been long enough since last training
        if self.last_retrain_date is None:
            self.retrain_requested = True
            
            # Save retraining request
            retrain_file = os.path.join(self.model_dir, 'retrain_request.json')
            with open(retrain_file, 'w') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'trigger': trigger_info,
                    'model_id': self.model_id,
                    'model_type': self.model_type
                }, f, indent=2)
            
            return True
            
        # Check if it's been long enough since last retraining
        days_since_retrain = (datetime.now() - self.last_retrain_date).days
        
        if days_since_retrain >= self.retraining_frequency_days:
            self.retrain_requested = True
            
            # Save retraining request
            retrain_file = os.path.join(self.model_dir, 'retrain_request.json')
            with open(retrain_file, 'w') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'trigger': trigger_info,
                    'model_id': self.model_id,
                    'model_type': self.model_type,
                    'days_since_retrain': days_since_retrain
                }, f, indent=2)
            
            return True
        
        return False
    
    def confirm_retrained(self, training_info: Optional[Dict[str, Any]] = None) -> None:
        """
        Confirm that a model has been retrained
        
        Args:
            training_info: Optional information about the training
        """
        self.last_retrain_date = datetime.now()
        self.retrain_requested = False
        
        # Save confirmation
        retrain_file = os.path.join(self.model_dir, 'last_retraining.json')
        with open(retrain_file, 'w') as f:
            data = {
                'timestamp': self.last_retrain_date.isoformat(),
                'model_id': self.model_id,
                'model_type': self.model_type
            }
            
            if training_info:
                data['training_info'] = training_info
                
            json.dump(data, f, indent=2)
        
        # Reset baseline
        self.baseline_set = False
        
        logger.info(f"Retraining confirmed for model {self.model_id}")
    
    def generate_performance_report(self, output_dir: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a comprehensive performance report
        
        Args:
            output_dir: Directory to save report artifacts
            
        Returns:
            Dictionary with report information
        """
        if output_dir is None:
            output_dir = os.path.join(self.model_dir, 'reports')
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Calculate current performance
        current_performance = self._calculate_performance_metrics()
        
        # Get drift status
        drift_status = self._check_for_drift()
        
        # Generate report data
        report = {
            'model_id': self.model_id,
            'model_type': self.model_type,
            'generated_at': datetime.now().isoformat(),
            'performance': current_performance,
            'drift_status': drift_status,
            'data_volume': {
                'total_predictions': len(self.predictions),
                'predictions_with_actuals': sum(1 for a in self.actuals if a is not None)
            },
            'retraining_status': {
                'last_retrain_date': self.last_retrain_date.isoformat() if self.last_retrain_date else None,
                'retrain_requested': self.retrain_requested,
                'days_since_retrain': (datetime.now() - self.last_retrain_date).days if self.last_retrain_date else None
            }
        }
        
        # Generate performance trend graphs if enough data
        if len(self.performance_timestamps) >= 5:
            try:
                for metric in self.metrics:
                    if metric in self.performance_history and len(self.performance_history[metric]) >= 5:
                        # Create plot
                        plt.figure(figsize=(10, 6))
                        plt.plot(self.performance_timestamps, self.performance_history[metric])
                        plt.title(f"{metric.upper()} Trend for {self.model_id}")
                        plt.xlabel('Time')
                        plt.ylabel(metric.upper())
                        plt.grid(True)
                        
                        # Save plot
                        plot_file = os.path.join(output_dir, f"{metric}_trend.png")
                        plt.savefig(plot_file)
                        plt.close()
                
                report['plots'] = {
                    'performance_trends': [f"{metric}_trend.png" for metric in self.metrics 
                                         if metric in self.performance_history 
                                         and len(self.performance_history[metric]) >= 5]
                }
            except Exception as e:
                logger.error(f"Error generating performance plots: {str(e)}")
        
        # Save report
        report_file = os.path.join(output_dir, 'performance_report.json')
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def get_monitoring_summary(self) -> Dict[str, Any]:
        """
        Get a summary of monitoring status
        
        Returns:
            Dictionary with monitoring summary
        """
        # Current performance (if we have actuals)
        performance = None
        if any(a is not None for a in self.actuals):
            performance = self._calculate_performance_metrics()
        
        # Drift status if we have baseline
        drift = None
        if self.baseline_set:
            drift = self._check_for_drift()
        
        return {
            'model_id': self.model_id,
            'model_type': self.model_type,
            'monitoring_since': self.performance_timestamps[0].isoformat() if self.performance_timestamps else None,
            'predictions_tracked': len(self.predictions),
            'actuals_tracked': sum(1 for a in self.actuals if a is not None),
            'current_performance': performance,
            'drift_status': drift,
            'retrain_status': {
                'last_retrain_date': self.last_retrain_date.isoformat() if self.last_retrain_date else None,
                'retrain_requested': self.retrain_requested
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def register_alert_callback(self, callback: Callable[[Dict], None]) -> None:
        """
        Register a callback for alerts
        
        Args:
            callback: Function that takes an alert dict as parameter
        """
        self.alert_callbacks.append(callback)
    
    def save(self) -> None:
        """Save all monitoring data"""
        self._save_monitoring_data()


class ModelMonitorRegistry:
    """
    Registry for managing multiple model monitors
    
    This class provides centralized management of monitoring for multiple models,
    making it easier to track overall system performance.
    """
    
    def __init__(self, storage_path: str = 'data/monitoring'):
        """
        Initialize the model monitor registry
        
        Args:
            storage_path: Root path for storing monitoring data
        """
        self.storage_path = storage_path
        self.monitors = {}  # model_id -> ModelMonitor
        self.global_callbacks = []
        
        # Create registry directory
        os.makedirs(storage_path, exist_ok=True)
        
        # Load existing registry if available
        self._load_registry()
    
    def _load_registry(self) -> None:
        """Load existing monitor registry information"""
        registry_file = os.path.join(self.storage_path, 'registry.json')
        
        if os.path.exists(registry_file):
            try:
                with open(registry_file, 'r') as f:
                    data = json.load(f)
                
                # For each model in the registry, create a monitor
                for model_info in data.get('models', []):
                    model_id = model_info.get('model_id')
                    model_type = model_info.get('model_type')
                    
                    if model_id and model_type:
                        # Create monitor (will load its own data)
                        self.get_monitor(model_id, model_type)
                
                logger.info(f"Loaded monitor registry with {len(self.monitors)} models")
                
            except Exception as e:
                logger.error(f"Error loading monitor registry: {str(e)}")
    
    def _save_registry(self) -> None:
        """Save monitor registry information"""
        try:
            registry_file = os.path.join(self.storage_path, 'registry.json')
            
            with open(registry_file, 'w') as f:
                json.dump({
                    'models': [
                        {
                            'model_id': model_id,
                            'model_type': monitor.model_type,
                            'last_updated': datetime.now().isoformat()
                        }
                        for model_id, monitor in self.monitors.items()
                    ],
                    'last_updated': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving monitor registry: {str(e)}")
    
    def register_global_callback(self, callback: Callable[[Dict], None]) -> None:
        """
        Register a global callback for all alerts from any model
        
        Args:
            callback: Function that takes an alert dict as parameter
        """
        self.global_callbacks.append(callback)
    
    def _global_alert_handler(self, alert: Dict[str, Any]) -> None:
        """
        Handle alerts from any model
        
        Args:
            alert: Alert information
        """
        # Forward to all global callbacks
        for callback in self.global_callbacks:
            try:
                callback(alert)
            except Exception as e:
                logger.error(f"Error in global alert callback: {str(e)}")
    
    def get_monitor(self, model_id: str, model_type: str = None) -> ModelMonitor:
        """
        Get or create a model monitor for a specific model
        
        Args:
            model_id: ID of the model
            model_type: Type of the model (required when creating new monitor)
            
        Returns:
            ModelMonitor instance
        """
        if model_id in self.monitors:
            return self.monitors[model_id]
        
        if model_type is None:
            raise ValueError(f"model_type is required when creating a new monitor for {model_id}")
        
        # Create new monitor
        monitor = ModelMonitor(
            model_id=model_id,
            model_type=model_type,
            storage_path=self.storage_path
        )
        
        # Register global alert handler
        monitor.register_alert_callback(self._global_alert_handler)
        
        # Store in registry
        self.monitors[model_id] = monitor
        
        # Save registry
        self._save_registry()
        
        return monitor
    
    def record_prediction(
        self,
        model_id: str,
        prediction: Any,
        features: Dict[str, Any],
        model_type: Optional[str] = None,
        actual: Any = None,
        timestamp: Optional[datetime] = None
    ) -> None:
        """
        Record a prediction for a specific model
        
        Args:
            model_id: ID of the model
            prediction: The model's prediction
            features: Features used for the prediction
            model_type: Type of the model (required for new monitors)
            actual: The actual value (if available)
            timestamp: Timestamp of the prediction
        """
        monitor = self.get_monitor(model_id, model_type)
        monitor.record_prediction(prediction, features, actual, timestamp)
    
    def record_actual(
        self,
        model_id: str,
        actual: Any,
        prediction_index: int = -1,
        model_type: Optional[str] = None
    ) -> None:
        """
        Record an actual value for a previous prediction
        
        Args:
            model_id: ID of the model
            actual: The actual value
            prediction_index: Index of the prediction
            model_type: Type of the model (required for new monitors)
        """
        monitor = self.get_monitor(model_id, model_type)
        monitor.record_actual(actual, prediction_index)
    
    def confirm_retrained(
        self,
        model_id: str,
        training_info: Optional[Dict[str, Any]] = None,
        model_type: Optional[str] = None
    ) -> None:
        """
        Confirm that a model has been retrained
        
        Args:
            model_id: ID of the model
            training_info: Optional information about the training
            model_type: Type of the model (required for new monitors)
        """
        monitor = self.get_monitor(model_id, model_type)
        monitor.confirm_retrained(training_info)
    
    def get_retraining_candidates(self) -> List[Dict[str, Any]]:
        """
        Get a list of models that need retraining
        
        Returns:
            List of model information dictionaries
        """
        candidates = []
        
        for model_id, monitor in self.monitors.items():
            if monitor.retrain_requested:
                candidates.append({
                    'model_id': model_id,
                    'model_type': monitor.model_type,
                    'last_retrain_date': monitor.last_retrain_date.isoformat() if monitor.last_retrain_date else None
                })
        
        return candidates
    
    def get_all_models_status(self) -> Dict[str, Any]:
        """
        Get status summary for all monitored models
        
        Returns:
            Dictionary with status for all models
        """
        return {
            'timestamp': datetime.now().isoformat(),
            'models': {
                model_id: monitor.get_monitoring_summary()
                for model_id, monitor in self.monitors.items()
            },
            'total_models': len(self.monitors),
            'retraining_candidates': len(self.get_retraining_candidates())
        }
    
    def generate_all_reports(self, output_dir: Optional[str] = None) -> Dict[str, str]:
        """
        Generate performance reports for all models
        
        Args:
            output_dir: Base directory for reports
            
        Returns:
            Dictionary mapping model_id to report path
        """
        if output_dir is None:
            output_dir = os.path.join(self.storage_path, 'reports')
        
        os.makedirs(output_dir, exist_ok=True)
        
        reports = {}
        
        for model_id, monitor in self.monitors.items():
            model_report_dir = os.path.join(output_dir, model_id)
            report = monitor.generate_performance_report(model_report_dir)
            reports[model_id] = os.path.join(model_report_dir, 'performance_report.json')
        
        # Generate overall summary
        summary = self.get_all_models_status()
        summary_file = os.path.join(output_dir, 'summary.json')
        
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return reports
    
    def save_all(self) -> None:
        """Save all monitor data"""
        for monitor in self.monitors.values():
            monitor.save()
        
        self._save_registry()


# Example usage
def main():
    """Example usage of the model monitoring system"""
    
    # Create registry
    registry = ModelMonitorRegistry(storage_path='data/monitoring')
    
    # Register global callback
    def alert_handler(alert):
        print(f"ALERT: {alert['type']} for model {alert['model_id']}")
        print(f"Details: {alert}")
        print("---")
    
    registry.register_global_callback(alert_handler)
    
    # Create a monitor for a battery health model
    monitor = registry.get_monitor(
        model_id='battery_health_v1',
        model_type='battery_health'
    )
    
    # Simulate predictions and actuals
    print("Simulating predictions...")
    import time
    from datetime import datetime, timedelta
    
    # Generate some normal predictions
    for i in range(50):
        # Simulate features
        features = {
            'battery_temp': 25 + np.random.normal(0, 3),
            'charge_cycles': 100 + i,
            'age_days': 200,
            'state_of_charge': 70 + np.random.normal(0, 10)
        }
        
        # Simulate prediction (SOH between 0-100)
        prediction = 95 - (i / 10) + np.random.normal(0, 1)
        
        # Record prediction
        timestamp = datetime.now() - timedelta(days=50-i)
        registry.record_prediction(
            model_id='battery_health_v1',
            prediction=prediction,
            features=features,
            timestamp=timestamp
        )
        
        # Simulate actual (slightly different from prediction)
        if i % 5 == 0:  # Only record some actuals
            actual = prediction + np.random.normal(0, 2)
            registry.record_actual(
                model_id='battery_health_v1',
                actual=actual,
                prediction_index=-1
            )
        
        if i % 20 == 0:
            time.sleep(0.1)  # Slow down a bit
    
    # Generate some drift
    print("Simulating drift...")
    for i in range(50):
        # Gradually change feature distribution
        features = {
            'battery_temp': 30 + i/5 + np.random.normal(0, 3),  # Increasing temp
            'charge_cycles': 150 + i,
            'age_days': 250 + i,
            'state_of_charge': 65 + np.random.normal(0, 15)  # More variance
        }
        
        # Prediction that doesn't account for higher temp
        prediction = 90 - (i / 8) + np.random.normal(0, 1)
        
        # Record prediction
        registry.record_prediction(
            model_id='battery_health_v1',
            prediction=prediction,
            features=features
        )
        
        # Actual shows faster degradation due to higher temp
        if i % 5 == 0:
            actual = prediction - 2 - (i / 10) + np.random.normal(0, 1.5)
            registry.record_actual(
                model_id='battery_health_v1',
                actual=actual,
                prediction_index=-1
            )
        
        if i % 20 == 0:
            time.sleep(0.1)  # Slow down a bit
    
    # Generate performance report
    print("Generating report...")
    reports = registry.generate_all_reports()
    
    # Save all monitoring data
    registry.save_all()
    
    print(f"Model monitoring example complete. Reports saved to: {reports}")


if __name__ == "__main__":
    main() 