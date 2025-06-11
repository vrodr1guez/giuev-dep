"""
Base Forecaster Module

This module defines the base abstract class for time series forecasting
in the EV charging infrastructure.
"""
import abc
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union, Tuple
from pathlib import Path
import joblib
import matplotlib.pyplot as plt

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BaseForecaster(abc.ABC):
    """
    Abstract base class for time series forecasting models
    
    Provides a common interface for various forecasting models
    including statistical models, machine learning models, and deep learning models.
    """
    
    def __init__(
        self,
        name: str,
        forecast_horizon: int = 24,
        frequency: str = 'H',
        model_dir: str = 'app/ml/models/forecasting'
    ):
        """
        Initialize base forecaster
        
        Args:
            name: Name of the forecaster
            forecast_horizon: Number of time steps to forecast
            frequency: Time series frequency (e.g., 'H' for hourly, 'D' for daily)
            model_dir: Directory to store models
        """
        self.name = name
        self.forecast_horizon = forecast_horizon
        self.frequency = frequency
        self.model_dir = Path(model_dir)
        self.model = None
        self.is_fitted = False
        
        # Create model directory if it doesn't exist
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initialized {self.__class__.__name__} with forecast horizon {forecast_horizon}")
    
    @abc.abstractmethod
    def fit(self, data: pd.DataFrame, target_col: str, **kwargs) -> 'BaseForecaster':
        """
        Fit the forecaster to training data
        
        Args:
            data: Training data (time series)
            target_col: Target column to forecast
            **kwargs: Additional model-specific parameters
            
        Returns:
            Self for method chaining
        """
        pass
    
    @abc.abstractmethod
    def predict(
        self, 
        start_date: Optional[pd.Timestamp] = None, 
        n_periods: Optional[int] = None,
        exogenous_data: Optional[pd.DataFrame] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Generate forecasts
        
        Args:
            start_date: Start date for forecasting
            n_periods: Number of periods to forecast (defaults to forecast_horizon)
            exogenous_data: Exogenous variables for the forecast period
            **kwargs: Additional model-specific parameters
            
        Returns:
            DataFrame with forecasts
        """
        pass
    
    def save(self, filepath: Optional[str] = None) -> str:
        """
        Save the forecaster to disk
        
        Args:
            filepath: Path to save the model (if None, uses the default path)
            
        Returns:
            Path to the saved model
        """
        if filepath is None:
            filepath = self.model_dir / f"{self.name}_model.joblib"
        else:
            filepath = Path(filepath)
        
        # Create parent directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the model
        joblib.dump(self, filepath)
        logger.info(f"Saved {self.__class__.__name__} to {filepath}")
        
        return str(filepath)
    
    @classmethod
    def load(cls, filepath: str) -> 'BaseForecaster':
        """
        Load a forecaster from disk
        
        Args:
            filepath: Path to the saved model
            
        Returns:
            Loaded forecaster
        """
        model = joblib.load(filepath)
        logger.info(f"Loaded {model.__class__.__name__} from {filepath}")
        
        return model
    
    def evaluate(
        self,
        test_data: pd.DataFrame,
        target_col: str,
        metrics: List[str] = ['mse', 'mae', 'rmse', 'mape'],
        plot: bool = False,
        plot_path: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Evaluate forecaster on test data
        
        Args:
            test_data: Test data (time series)
            target_col: Target column to forecast
            metrics: List of metrics to compute
            plot: Whether to plot actual vs. predicted values
            plot_path: Path to save the plot
            
        Returns:
            Dictionary of evaluation metrics
        """
        if not self.is_fitted:
            raise ValueError("Forecaster must be fitted before evaluation")
        
        # Generate forecasts for the test period
        forecasts = self.predict(
            start_date=test_data.index[0],
            n_periods=len(test_data)
        )
        
        # Extract actual and predicted values
        y_true = test_data[target_col].values
        y_pred = forecasts['forecast'].values
        
        # Compute metrics
        results = {}
        
        for metric in metrics:
            if metric.lower() == 'mse':
                results['mse'] = np.mean((y_true - y_pred) ** 2)
            elif metric.lower() == 'mae':
                results['mae'] = np.mean(np.abs(y_true - y_pred))
            elif metric.lower() == 'rmse':
                results['rmse'] = np.sqrt(np.mean((y_true - y_pred) ** 2))
            elif metric.lower() == 'mape':
                results['mape'] = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
            elif metric.lower() == 'r2':
                ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
                ss_res = np.sum((y_true - y_pred) ** 2)
                results['r2'] = 1 - (ss_res / ss_tot)
        
        # Plot actual vs. predicted if requested
        if plot:
            plt.figure(figsize=(12, 6))
            plt.plot(test_data.index, y_true, label='Actual', color='blue')
            plt.plot(test_data.index, y_pred, label='Forecast', color='red', linestyle='--')
            plt.title(f"{self.name} Forecast Evaluation")
            plt.xlabel("Date")
            plt.ylabel(target_col)
            plt.legend()
            plt.grid(True, alpha=0.3)
            
            if plot_path:
                plt.savefig(plot_path)
                logger.info(f"Saved evaluation plot to {plot_path}")
            else:
                plt.show()
            
            plt.close()
        
        logger.info(f"Evaluation results for {self.name}: {results}")
        return results 