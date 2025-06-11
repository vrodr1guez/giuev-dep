"""
Online Learning Module

This module extends forecasting models with online learning capabilities
and implements drift detection to trigger retraining when patterns change.
"""
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Optional, Any, Union, Tuple, Callable
from pathlib import Path
import joblib
from datetime import datetime, timedelta

from .base_forecaster import BaseForecaster

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OnlineForecaster:
    """
    Wrapper that adds online learning capabilities to any BaseForecaster
    
    Key features:
    - Incremental model updates with new data
    - Concept drift detection
    - Automatic model retraining when drift is detected
    - Performance monitoring over time
    """
    
    def __init__(
        self,
        base_forecaster: BaseForecaster,
        update_frequency: str = 'D',
        retraining_window: int = 30,
        drift_detection_method: str = 'threshold',
        drift_threshold: float = 0.3,
        performance_metric: str = 'rmse',
        max_online_window: int = 90
    ):
        """
        Initialize online forecaster
        
        Args:
            base_forecaster: Base forecaster to enhance with online learning
            update_frequency: How often to update the model ('H', 'D', 'W')
            retraining_window: Number of periods to use for retraining
            drift_detection_method: Method for detecting concept drift
                                   ('threshold', 'page_hinkley', 'adwin')
            drift_threshold: Threshold for drift detection
            performance_metric: Metric to track for performance ('rmse', 'mse', 'mae')
            max_online_window: Maximum number of periods to store for online learning
        """
        self.base_forecaster = base_forecaster
        self.update_frequency = update_frequency
        self.retraining_window = retraining_window
        self.drift_detection_method = drift_detection_method
        self.drift_threshold = drift_threshold
        self.performance_metric = performance_metric
        self.max_online_window = max_online_window
        
        # Initialize state
        self.is_fitted = False
        self.last_update_time = None
        self.last_retrain_time = None
        self.historical_data = None
        self.recent_data = None
        self.target_col = None
        
        # Performance tracking
        self.error_history = []
        self.drift_detected_times = []
        self.performance_history = []
        
        # Drift detection state
        if drift_detection_method == 'page_hinkley':
            self.ph_sum = 0
            self.ph_threshold = drift_threshold
            self.ph_lambda = 0.01
            self.ph_alpha = 0.005
            self.ph_min = float('inf')
        elif drift_detection_method == 'adwin':
            try:
                from skmultiflow.drift_detection import ADWIN
                self.adwin = ADWIN(delta=drift_threshold)
            except ImportError:
                logger.warning("scikit-multiflow not installed. Falling back to threshold drift detection.")
                self.drift_detection_method = 'threshold'
        
        logger.info(f"Initialized OnlineForecaster with {base_forecaster.__class__.__name__} "
                   f"and {drift_detection_method} drift detection")
    
    def fit(self, data: pd.DataFrame, target_col: str, **kwargs) -> 'OnlineForecaster':
        """
        Fit the online forecaster to initial data
        
        Args:
            data: Training data (time series)
            target_col: Target column to forecast
            **kwargs: Additional parameters for the base forecaster
            
        Returns:
            Self for method chaining
        """
        self.target_col = target_col
        self.historical_data = data.copy()
        
        # Fit the base forecaster
        self.base_forecaster.fit(data, target_col, **kwargs)
        
        # Initialize state
        self.is_fitted = True
        self.last_update_time = datetime.now()
        self.last_retrain_time = datetime.now()
        
        # Initialize recent data buffer with the last portion of training data
        window_size = min(self.max_online_window, len(data))
        self.recent_data = data.iloc[-window_size:].copy()
        
        logger.info(f"Fitted OnlineForecaster with {len(data)} initial data points")
        
        return self
    
    def predict(
        self, 
        start_date: Optional[pd.Timestamp] = None, 
        n_periods: Optional[int] = None,
        exogenous_data: Optional[pd.DataFrame] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Generate forecasts using the base forecaster
        
        Args:
            start_date: Start date for forecasting
            n_periods: Number of periods to forecast
            exogenous_data: Exogenous variables for the forecast period
            **kwargs: Additional parameters
            
        Returns:
            DataFrame with forecasts
        """
        if not self.is_fitted:
            raise ValueError("OnlineForecaster must be fitted before prediction")
        
        return self.base_forecaster.predict(
            start_date=start_date,
            n_periods=n_periods,
            exogenous_data=exogenous_data,
            **kwargs
        )
    
    def update(
        self,
        new_data: pd.DataFrame,
        evaluate: bool = True,
        force_retrain: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Update the model with new data
        
        Args:
            new_data: New data points
            evaluate: Whether to evaluate performance before updating
            force_retrain: Whether to force retraining regardless of drift
            **kwargs: Additional parameters for retraining
            
        Returns:
            Dictionary with update metrics
        """
        if not self.is_fitted:
            raise ValueError("OnlineForecaster must be fitted before updating")
        
        if self.target_col not in new_data.columns:
            raise ValueError(f"Target column '{self.target_col}' not found in new data")
        
        update_metrics = {}
        
        # Check if new data is empty
        if len(new_data) == 0:
            return {"status": "No new data to process"}
        
        # Ensure data is sorted by time index
        new_data = new_data.sort_index()
        
        # Evaluate performance if requested
        if evaluate:
            performance = self._evaluate_on_new_data(new_data)
            update_metrics["performance"] = performance
            
            # Check for drift
            drift_detected = self._detect_drift(performance)
            update_metrics["drift_detected"] = drift_detected
            
            if drift_detected:
                logger.info(f"Concept drift detected with {self.performance_metric}={performance}")
                self.drift_detected_times.append(datetime.now())
                
                # Retrain the model
                self._retrain_model(new_data, **kwargs)
                update_metrics["retrained"] = True
            else:
                # Check if it's time for a regular update
                time_for_update = self._is_time_for_update()
                update_metrics["time_for_update"] = time_for_update
                
                if time_for_update or force_retrain:
                    self._update_model(new_data, **kwargs)
                    update_metrics["updated"] = True
        else:
            # If no evaluation, just update the model based on schedule
            time_for_update = self._is_time_for_update()
            update_metrics["time_for_update"] = time_for_update
            
            if time_for_update or force_retrain:
                self._update_model(new_data, **kwargs)
                update_metrics["updated"] = True
        
        # Update the recent data buffer
        self._update_recent_data(new_data)
        
        update_metrics["status"] = "success"
        update_metrics["timestamp"] = datetime.now().isoformat()
        
        return update_metrics
    
    def _evaluate_on_new_data(self, new_data: pd.DataFrame) -> float:
        """
        Evaluate model performance on new data
        
        Args:
            new_data: New data points
            
        Returns:
            Performance metric value
        """
        # Generate predictions for the new data period
        predictions = self.base_forecaster.predict(
            start_date=new_data.index[0],
            n_periods=len(new_data)
        )
        
        # Extract actual and predicted values
        y_true = new_data[self.target_col].values
        y_pred = predictions['forecast'].values[:len(y_true)]
        
        # Calculate performance metric
        if self.performance_metric == 'rmse':
            performance = np.sqrt(np.mean((y_true - y_pred) ** 2))
        elif self.performance_metric == 'mse':
            performance = np.mean((y_true - y_pred) ** 2)
        elif self.performance_metric == 'mae':
            performance = np.mean(np.abs(y_true - y_pred))
        elif self.performance_metric == 'mape':
            # Avoid division by zero
            idx = y_true != 0
            performance = np.mean(np.abs((y_true[idx] - y_pred[idx]) / y_true[idx])) * 100
        else:
            performance = np.mean((y_true - y_pred) ** 2)  # Default to MSE
        
        # Add to performance history
        self.performance_history.append({
            'timestamp': datetime.now(),
            'metric': self.performance_metric,
            'value': performance,
            'data_points': len(new_data)
        })
        
        return performance
    
    def _detect_drift(self, performance: float) -> bool:
        """
        Detect concept drift based on performance
        
        Args:
            performance: Current performance metric
            
        Returns:
            Whether drift was detected
        """
        if len(self.performance_history) < 2:
            return False
        
        if self.drift_detection_method == 'threshold':
            # Simple threshold-based drift detection
            # Compare current performance to average of previous performances
            previous_performances = [p['value'] for p in self.performance_history[:-1]]
            avg_performance = np.mean(previous_performances)
            
            # Calculate relative change
            relative_change = abs(performance - avg_performance) / avg_performance
            
            return relative_change > self.drift_threshold
            
        elif self.drift_detection_method == 'page_hinkley':
            # Page-Hinkley test for change detection
            if len(self.error_history) == 0:
                self.error_history.append(performance)
                self.ph_min = performance
                return False
            
            # Update mean estimate
            mean_estimate = np.mean(self.error_history)
            
            # Update cumulative sum
            self.ph_sum += (performance - mean_estimate - self.ph_lambda)
            
            # Update minimum
            self.ph_min = min(self.ph_min, self.ph_sum)
            
            # Check for change
            drift_detected = (self.ph_sum - self.ph_min) > self.ph_threshold
            
            # Add current error to history
            self.error_history.append(performance)
            
            # Limit error history size
            if len(self.error_history) > self.max_online_window:
                self.error_history = self.error_history[-self.max_online_window:]
            
            return drift_detected
            
        elif self.drift_detection_method == 'adwin':
            # ADWIN change detector
            try:
                self.adwin.add_element(performance)
                return self.adwin.detected_change()
            except:
                # Fall back to threshold if ADWIN fails
                previous_performances = [p['value'] for p in self.performance_history[:-1]]
                avg_performance = np.mean(previous_performances)
                relative_change = abs(performance - avg_performance) / avg_performance
                return relative_change > self.drift_threshold
        
        return False
    
    def _is_time_for_update(self) -> bool:
        """
        Check if it's time for a regular model update
        
        Returns:
            Whether it's time to update
        """
        if self.last_update_time is None:
            return True
        
        now = datetime.now()
        time_diff = now - self.last_update_time
        
        if self.update_frequency == 'H':
            return time_diff > timedelta(hours=1)
        elif self.update_frequency == 'D':
            return time_diff > timedelta(days=1)
        elif self.update_frequency == 'W':
            return time_diff > timedelta(weeks=1)
        else:
            # Default to daily
            return time_diff > timedelta(days=1)
    
    def _update_model(self, new_data: pd.DataFrame, **kwargs) -> None:
        """
        Incrementally update the model with new data
        
        Args:
            new_data: New data points
            **kwargs: Additional parameters for updating
        """
        # Update the model incrementally if supported
        if hasattr(self.base_forecaster, 'update'):
            # If the base model supports incremental updates
            self.base_forecaster.update(new_data, **kwargs)
        else:
            # Otherwise, refit with recent data
            self._retrain_model(new_data, **kwargs)
        
        self.last_update_time = datetime.now()
        logger.info(f"Updated model with {len(new_data)} new data points")
    
    def _retrain_model(self, new_data: pd.DataFrame, **kwargs) -> None:
        """
        Retrain the model from scratch with recent data
        
        Args:
            new_data: New data points
            **kwargs: Additional parameters for retraining
        """
        # Combine recent data with new data
        training_data = pd.concat([self.recent_data, new_data])
        
        # Limit to retraining window if specified
        if self.retraining_window and len(training_data) > self.retraining_window:
            training_data = training_data.iloc[-self.retraining_window:]
        
        # Retrain the base forecaster
        self.base_forecaster.fit(training_data, self.target_col, **kwargs)
        
        self.last_update_time = datetime.now()
        self.last_retrain_time = datetime.now()
        
        logger.info(f"Retrained model with {len(training_data)} data points")
    
    def _update_recent_data(self, new_data: pd.DataFrame) -> None:
        """
        Update the buffer of recent data
        
        Args:
            new_data: New data points
        """
        # Append new data to recent data
        self.recent_data = pd.concat([self.recent_data, new_data])
        
        # Trim to max window size
        if len(self.recent_data) > self.max_online_window:
            self.recent_data = self.recent_data.iloc[-self.max_online_window:]
    
    def get_performance_history(self) -> pd.DataFrame:
        """
        Get the history of model performance
        
        Returns:
            DataFrame with performance history
        """
        if not self.performance_history:
            return pd.DataFrame(columns=['timestamp', 'metric', 'value', 'data_points'])
        
        return pd.DataFrame(self.performance_history)
    
    def get_drift_events(self) -> pd.DataFrame:
        """
        Get the history of detected drift events
        
        Returns:
            DataFrame with drift events
        """
        if not self.drift_detected_times:
            return pd.DataFrame(columns=['timestamp'])
        
        return pd.DataFrame({'timestamp': self.drift_detected_times})
    
    def plot_performance_history(
        self, 
        figsize: Tuple[int, int] = (12, 6),
        include_drift_events: bool = True,
        save_path: Optional[str] = None
    ) -> None:
        """
        Plot the history of model performance
        
        Args:
            figsize: Figure size
            include_drift_events: Whether to include drift events on the plot
            save_path: Path to save the plot
        """
        if not self.performance_history:
            logger.warning("No performance history available to plot")
            return
        
        # Create DataFrame from performance history
        performance_df = self.get_performance_history()
        
        plt.figure(figsize=figsize)
        
        # Plot performance metric
        plt.plot(
            performance_df['timestamp'], 
            performance_df['value'], 
            marker='o', 
            linestyle='-',
            label=self.performance_metric.upper()
        )
        
        # Add drift events if requested
        if include_drift_events and self.drift_detected_times:
            for drift_time in self.drift_detected_times:
                plt.axvline(x=drift_time, color='r', linestyle='--', alpha=0.7)
            
            # Add single line for legend
            plt.axvline(x=self.drift_detected_times[0], color='r', linestyle='--', alpha=0.7, label='Drift Detected')
        
        plt.title(f"{self.base_forecaster.__class__.__name__} Online Performance")
        plt.xlabel("Time")
        plt.ylabel(self.performance_metric.upper())
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path)
            logger.info(f"Saved performance plot to {save_path}")
        else:
            plt.show()
        
        plt.close()
    
    def save(self, filepath: Optional[str] = None) -> str:
        """
        Save the online forecaster to disk
        
        Args:
            filepath: Path to save the model (if None, uses the default path)
            
        Returns:
            Path to the saved model
        """
        if filepath is None:
            base_dir = self.base_forecaster.model_dir
            filepath = Path(base_dir) / f"online_{self.base_forecaster.name}_model.joblib"
        else:
            filepath = Path(filepath)
        
        # Create parent directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the model
        joblib.dump(self, filepath)
        logger.info(f"Saved OnlineForecaster to {filepath}")
        
        return str(filepath)
    
    @classmethod
    def load(cls, filepath: str) -> 'OnlineForecaster':
        """
        Load an online forecaster from disk
        
        Args:
            filepath: Path to the saved model
            
        Returns:
            Loaded online forecaster
        """
        model = joblib.load(filepath)
        logger.info(f"Loaded OnlineForecaster from {filepath}")
        
        return model


class DriftDetector:
    """
    Standalone drift detector for time series data
    
    Can be used to monitor data streams and detect when patterns change.
    """
    
    def __init__(
        self,
        method: str = 'threshold',
        window_size: int = 30,
        threshold: float = 0.3,
        statistic: str = 'mean',
        feature_extractors: Optional[List[Callable]] = None
    ):
        """
        Initialize drift detector
        
        Args:
            method: Drift detection method ('threshold', 'page_hinkley', 'adwin', 'kstest')
            window_size: Size of the reference window
            threshold: Threshold for drift detection
            statistic: Statistic to monitor ('mean', 'std', 'distribution')
            feature_extractors: Functions to extract features from time series
        """
        self.method = method
        self.window_size = window_size
        self.threshold = threshold
        self.statistic = statistic
        self.reference_window = None
        self.feature_extractors = feature_extractors or []
        
        # State for different methods
        if method == 'page_hinkley':
            self.ph_sum = 0
            self.ph_min = float('inf')
            self.ph_lambda = 0.01
        elif method == 'adwin':
            try:
                from skmultiflow.drift_detection import ADWIN
                self.adwin = ADWIN(delta=threshold)
            except ImportError:
                logger.warning("scikit-multiflow not installed. Falling back to threshold.")
                self.method = 'threshold'
        
        self.drift_history = []
        
        logger.info(f"Initialized DriftDetector with method={method}, window_size={window_size}")
    
    def initialize_reference(self, data: pd.DataFrame, target_col: str) -> None:
        """
        Initialize reference window from data
        
        Args:
            data: Initial data
            target_col: Target column to monitor
        """
        if len(data) < self.window_size:
            logger.warning(f"Data size {len(data)} is smaller than window size {self.window_size}")
            self.reference_window = data[target_col].values
        else:
            self.reference_window = data[target_col].values[-self.window_size:]
        
        logger.info(f"Initialized reference window with {len(self.reference_window)} points")
    
    def add_points(self, new_points: Union[pd.DataFrame, np.ndarray, List], target_col: Optional[str] = None) -> bool:
        """
        Add new data points and check for drift
        
        Args:
            new_points: New data points
            target_col: Target column (if new_points is DataFrame)
            
        Returns:
            Whether drift was detected
        """
        if self.reference_window is None:
            raise ValueError("Reference window not initialized. Call initialize_reference first.")
        
        # Extract values if DataFrame
        if isinstance(new_points, pd.DataFrame):
            if target_col is None:
                raise ValueError("target_col must be provided when new_points is a DataFrame")
            values = new_points[target_col].values
        else:
            values = np.array(new_points)
        
        # Check for drift based on the method
        if self.method == 'threshold':
            return self._detect_threshold_drift(values)
        elif self.method == 'page_hinkley':
            return self._detect_page_hinkley_drift(values)
        elif self.method == 'adwin':
            return self._detect_adwin_drift(values)
        elif self.method == 'kstest':
            return self._detect_kstest_drift(values)
        else:
            return self._detect_threshold_drift(values)
    
    def _detect_threshold_drift(self, values: np.ndarray) -> bool:
        """
        Detect drift using threshold method
        
        Args:
            values: New data points
            
        Returns:
            Whether drift was detected
        """
        if self.statistic == 'mean':
            reference_stat = np.mean(self.reference_window)
            current_stat = np.mean(values)
        elif self.statistic == 'std':
            reference_stat = np.std(self.reference_window)
            current_stat = np.std(values)
        else:  # distribution
            from scipy.stats import ks_2samp
            ks_result = ks_2samp(self.reference_window, values)
            drift_detected = ks_result.pvalue < 0.05
            
            if drift_detected:
                self._update_reference(values)
                self.drift_history.append({
                    'timestamp': datetime.now(),
                    'method': 'kstest',
                    'p_value': ks_result.pvalue
                })
            
            return drift_detected
        
        # Calculate relative change
        if reference_stat != 0:
            relative_change = abs(current_stat - reference_stat) / abs(reference_stat)
        else:
            relative_change = abs(current_stat - reference_stat)
        
        drift_detected = relative_change > self.threshold
        
        if drift_detected:
            self._update_reference(values)
            self.drift_history.append({
                'timestamp': datetime.now(),
                'method': 'threshold',
                'statistic': self.statistic,
                'reference': reference_stat,
                'current': current_stat,
                'change': relative_change
            })
        
        return drift_detected
    
    def _detect_page_hinkley_drift(self, values: np.ndarray) -> bool:
        """
        Detect drift using Page-Hinkley test
        
        Args:
            values: New data points
            
        Returns:
            Whether drift was detected
        """
        if self.statistic == 'mean':
            stat = np.mean(values)
        elif self.statistic == 'std':
            stat = np.std(values)
        else:
            stat = np.mean(values)  # Default to mean
        
        reference_mean = np.mean(self.reference_window)
        
        # Update cumulative sum
        self.ph_sum += (stat - reference_mean - self.ph_lambda)
        
        # Update minimum
        self.ph_min = min(self.ph_min, self.ph_sum)
        
        # Check for change
        drift_detected = (self.ph_sum - self.ph_min) > self.threshold
        
        if drift_detected:
            self._update_reference(values)
            self.ph_sum = 0
            self.ph_min = float('inf')
            
            self.drift_history.append({
                'timestamp': datetime.now(),
                'method': 'page_hinkley',
                'statistic': self.statistic
            })
        
        return drift_detected
    
    def _detect_adwin_drift(self, values: np.ndarray) -> bool:
        """
        Detect drift using ADWIN
        
        Args:
            values: New data points
            
        Returns:
            Whether drift was detected
        """
        try:
            if self.statistic == 'mean':
                stat = np.mean(values)
            elif self.statistic == 'std':
                stat = np.std(values)
            else:
                stat = np.mean(values)  # Default to mean
            
            self.adwin.add_element(stat)
            drift_detected = self.adwin.detected_change()
            
            if drift_detected:
                self._update_reference(values)
                self.drift_history.append({
                    'timestamp': datetime.now(),
                    'method': 'adwin',
                    'statistic': self.statistic
                })
            
            return drift_detected
        except:
            # Fall back to threshold if ADWIN fails
            return self._detect_threshold_drift(values)
    
    def _detect_kstest_drift(self, values: np.ndarray) -> bool:
        """
        Detect drift using Kolmogorov-Smirnov test
        
        Args:
            values: New data points
            
        Returns:
            Whether drift was detected
        """
        from scipy.stats import ks_2samp
        
        # Apply feature extractors if available
        if self.feature_extractors:
            reference_features = np.array([f(self.reference_window) for f in self.feature_extractors]).T
            current_features = np.array([f(values) for f in self.feature_extractors]).T
            
            # Check each feature
            for i in range(reference_features.shape[1]):
                ks_result = ks_2samp(reference_features[:, i], current_features[:, i])
                if ks_result.pvalue < 0.05:
                    self._update_reference(values)
                    self.drift_history.append({
                        'timestamp': datetime.now(),
                        'method': 'kstest',
                        'feature_index': i,
                        'p_value': ks_result.pvalue
                    })
                    return True
            
            return False
        else:
            # Direct comparison
            ks_result = ks_2samp(self.reference_window, values)
            drift_detected = ks_result.pvalue < 0.05
            
            if drift_detected:
                self._update_reference(values)
                self.drift_history.append({
                    'timestamp': datetime.now(),
                    'method': 'kstest',
                    'p_value': ks_result.pvalue
                })
            
            return drift_detected
    
    def _update_reference(self, values: np.ndarray) -> None:
        """
        Update the reference window
        
        Args:
            values: New data points
        """
        self.reference_window = values[-self.window_size:]
        logger.info("Updated reference window after drift detection")
    
    def get_drift_history(self) -> pd.DataFrame:
        """
        Get the history of detected drift events
        
        Returns:
            DataFrame with drift events
        """
        if not self.drift_history:
            return pd.DataFrame(columns=['timestamp', 'method'])
        
        return pd.DataFrame(self.drift_history)
    
    def plot_drift_history(
        self,
        data: pd.DataFrame,
        target_col: str,
        figsize: Tuple[int, int] = (12, 6),
        save_path: Optional[str] = None
    ) -> None:
        """
        Plot the time series with drift events
        
        Args:
            data: Time series data
            target_col: Target column
            figsize: Figure size
            save_path: Path to save the plot
        """
        if not self.drift_history:
            logger.warning("No drift events to plot")
            return
        
        plt.figure(figsize=figsize)
        
        # Plot time series
        plt.plot(data.index, data[target_col], label=target_col)
        
        # Add drift events
        drift_times = [event['timestamp'] for event in self.drift_history]
        for drift_time in drift_times:
            plt.axvline(x=drift_time, color='r', linestyle='--', alpha=0.7)
        
        # Add single line for legend
        plt.axvline(x=drift_times[0], color='r', linestyle='--', alpha=0.7, label='Drift Detected')
        
        plt.title(f"Time Series with Drift Detection ({self.method})")
        plt.xlabel("Time")
        plt.ylabel(target_col)
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path)
            logger.info(f"Saved drift history plot to {save_path}")
        else:
            plt.show()
        
        plt.close()


# Example usage
def main():
    """Example of using the online learning capabilities"""
    # Create sample data
    from .base_forecaster import BaseForecaster
    from .statistical_forecaster import ARIMAForecaster
    import numpy as np
    
    # Generate daily data with hourly frequency for 30 days
    date_rng = pd.date_range(start='2023-01-01', end='2023-01-15', freq='H')
    
    # Create data with seasonal and trend patterns
    hourly_pattern = np.sin(np.linspace(0, 2*np.pi, 24)) * 10 + 30
    
    data = []
    for i, date in enumerate(date_rng):
        # Base value with hourly pattern
        value = hourly_pattern[date.hour]
        
        # Add trend
        value += i * 0.01
        
        # Add noise
        value += np.random.normal(0, 3)
        
        data.append({"timestamp": date, "value": value})
    
    df = pd.DataFrame(data)
    df.set_index("timestamp", inplace=True)
    
    # Create an ARIMA forecaster
    arima = ARIMAForecaster(
        name="arima_online_test",
        forecast_horizon=24,
        frequency='H',
        auto_order=True
    )
    
    # Wrap it with online learning
    online_arima = OnlineForecaster(
        base_forecaster=arima,
        update_frequency='D',
        retraining_window=5*24,  # 5 days of hourly data
        drift_detection_method='threshold',
        drift_threshold=0.3
    )
    
    # Fit the model on initial data
    online_arima.fit(df, "value")
    
    # Generate some new data with drift
    new_date_rng = pd.date_range(start='2023-01-16', end='2023-01-20', freq='H')
    
    new_data = []
    for i, date in enumerate(new_date_rng):
        # Base value with hourly pattern (shifted)
        value = hourly_pattern[(date.hour + 6) % 24]  # Shift by 6 hours to introduce drift
        
        # Add stronger trend to introduce drift
        value += i * 0.05
        
        # Add noise
        value += np.random.normal(0, 5)  # Higher variance
        
        new_data.append({"timestamp": date, "value": value})
    
    new_df = pd.DataFrame(new_data)
    new_df.set_index("timestamp", inplace=True)
    
    # Update the model with new data
    update_result = online_arima.update(new_df)
    
    print(f"Update result: {update_result}")
    
    # Generate forecasts
    forecasts = online_arima.predict(n_periods=48)
    print(forecasts.head())
    
    # Check performance history
    perf_history = online_arima.get_performance_history()
    print(f"Performance history: {perf_history}")
    
    # Plot performance history
    online_arima.plot_performance_history(include_drift_events=True)
    
    # Standalone drift detector example
    detector = DriftDetector(
        method='threshold',
        window_size=24,
        threshold=0.2,
        statistic='mean'
    )
    
    detector.initialize_reference(df, "value")
    drift_detected = detector.add_points(new_df, "value")
    
    print(f"Drift detected: {drift_detected}")
    drift_history = detector.get_drift_history()
    print(f"Drift history: {drift_history}")


if __name__ == "__main__":
    main() 