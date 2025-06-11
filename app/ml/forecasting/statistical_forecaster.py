"""
Statistical Forecaster Module

This module implements statistical time series forecasting models
for the EV charging infrastructure.
"""
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union, Tuple
from pathlib import Path
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.stattools import adfuller, acf, pacf
import pmdarima as pm

from .base_forecaster import BaseForecaster

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ARIMAForecaster(BaseForecaster):
    """
    ARIMA/SARIMA forecasting model
    
    Implements time series forecasting using Auto-Regressive Integrated
    Moving Average models, with optional seasonal components.
    """
    
    def __init__(
        self,
        name: str = "arima",
        forecast_horizon: int = 24,
        frequency: str = 'H',
        order: Optional[Tuple[int, int, int]] = None,
        seasonal_order: Optional[Tuple[int, int, int, int]] = None,
        auto_order: bool = True,
        model_dir: str = 'app/ml/models/forecasting'
    ):
        """
        Initialize ARIMA forecaster
        
        Args:
            name: Name of the forecaster
            forecast_horizon: Number of time steps to forecast
            frequency: Time series frequency (e.g., 'H' for hourly, 'D' for daily)
            order: ARIMA order (p, d, q)
            seasonal_order: Seasonal order (P, D, Q, s)
            auto_order: Whether to automatically determine the order
            model_dir: Directory to store models
        """
        super().__init__(name=name, forecast_horizon=forecast_horizon, 
                         frequency=frequency, model_dir=model_dir)
        
        self.order = order
        self.seasonal_order = seasonal_order
        self.auto_order = auto_order
        self.model = None
        self.target_col = None
        self.training_data = None
        
        logger.info(f"Initialized ARIMAForecaster with order={order}, seasonal_order={seasonal_order}")
    
    def _determine_order(self, data: pd.Series) -> Tuple[Tuple[int, int, int], Optional[Tuple[int, int, int, int]]]:
        """
        Automatically determine the optimal ARIMA order
        
        Args:
            data: Time series data
            
        Returns:
            Tuple of (order, seasonal_order)
        """
        logger.info("Automatically determining ARIMA order")
        
        # Use pmdarima (pyramid-arima) to automatically find the best order
        autoarima = pm.auto_arima(
            data,
            start_p=0, start_q=0,
            max_p=5, max_q=5, max_d=2,
            seasonal=True,
            m=24 if self.frequency == 'H' else (7 if self.frequency == 'D' else 12),
            information_criterion='aic',
            trace=True,
            error_action='ignore',
            suppress_warnings=True,
            stepwise=True
        )
        
        order = autoarima.order
        seasonal_order = autoarima.seasonal_order
        
        logger.info(f"Auto-determined ARIMA order: {order}, seasonal_order: {seasonal_order}")
        
        return order, seasonal_order
    
    def fit(self, data: pd.DataFrame, target_col: str, **kwargs) -> 'ARIMAForecaster':
        """
        Fit the ARIMA model to training data
        
        Args:
            data: Training data (time series)
            target_col: Target column to forecast
            **kwargs: Additional parameters
                - exog: Exogenous variables
                
        Returns:
            Self for method chaining
        """
        self.target_col = target_col
        self.training_data = data.copy()
        
        # Extract target series
        y = data[target_col]
        
        # Get exogenous variables if provided
        exog = kwargs.get('exog', None)
        
        # Determine order if automatic
        if self.auto_order or self.order is None:
            self.order, self.seasonal_order = self._determine_order(y)
        
        # Fit the model
        if self.seasonal_order is not None:
            # Use SARIMAX for seasonal models
            self.model = SARIMAX(
                y,
                order=self.order,
                seasonal_order=self.seasonal_order,
                exog=exog,
                enforce_stationarity=False,
                enforce_invertibility=False
            ).fit(disp=False)
        else:
            # Use ARIMA for non-seasonal models
            self.model = ARIMA(
                y,
                order=self.order,
                exog=exog
            ).fit()
        
        self.is_fitted = True
        logger.info(f"Fitted ARIMA model with order={self.order}, seasonal_order={self.seasonal_order}")
        
        return self
    
    def predict(
        self, 
        start_date: Optional[pd.Timestamp] = None, 
        n_periods: Optional[int] = None,
        exogenous_data: Optional[pd.DataFrame] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Generate forecasts using the fitted ARIMA model
        
        Args:
            start_date: Start date for forecasting
            n_periods: Number of periods to forecast (defaults to forecast_horizon)
            exogenous_data: Exogenous variables for the forecast period
            **kwargs: Additional parameters
            
        Returns:
            DataFrame with forecasts
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        # Determine forecast periods
        if n_periods is None:
            n_periods = self.forecast_horizon
        
        # Generate date range for the forecast
        if start_date is None:
            start_date = self.training_data.index[-1] + pd.Timedelta(1, unit=self.frequency)
        
        forecast_dates = pd.date_range(start=start_date, periods=n_periods, freq=self.frequency)
        
        # Get exogenous data for forecast period if needed
        exog = None
        if exogenous_data is not None:
            exog = exogenous_data
        
        # Generate forecasts
        if exog is not None:
            forecast = self.model.get_forecast(steps=n_periods, exog=exog)
        else:
            forecast = self.model.get_forecast(steps=n_periods)
        
        # Extract prediction intervals
        pred_mean = forecast.predicted_mean
        pred_ci = forecast.conf_int(alpha=0.05)
        
        # Create forecast DataFrame
        forecast_df = pd.DataFrame({
            'forecast': pred_mean,
            'lower_bound': pred_ci.iloc[:, 0],
            'upper_bound': pred_ci.iloc[:, 1]
        }, index=forecast_dates)
        
        logger.info(f"Generated {n_periods} forecasts starting from {start_date}")
        
        return forecast_df
    
    def get_diagnostics(self, plot: bool = False, plot_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Get model diagnostics
        
        Args:
            plot: Whether to plot diagnostic charts
            plot_path: Path to save the diagnostic plots
            
        Returns:
            Dictionary with diagnostic information
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before diagnostics")
        
        # Get model summary
        summary = self.model.summary()
        
        # Extract diagnostic information
        diagnostics = {
            'aic': self.model.aic,
            'bic': self.model.bic,
            'order': self.order,
            'seasonal_order': self.seasonal_order
        }
        
        # Get residuals
        residuals = self.model.resid
        
        # Add residual statistics
        diagnostics['residual_mean'] = residuals.mean()
        diagnostics['residual_std'] = residuals.std()
        
        # Plot diagnostics if requested
        if plot:
            fig, axes = plt.subplots(3, 1, figsize=(12, 12))
            
            # Plot residuals
            axes[0].plot(residuals)
            axes[0].set_title('Residuals')
            axes[0].grid(True, alpha=0.3)
            
            # Plot ACF of residuals
            acf_values = acf(residuals, nlags=40)
            axes[1].stem(range(len(acf_values)), acf_values)
            axes[1].set_title('ACF of Residuals')
            axes[1].axhline(y=0, color='black', linestyle='-')
            axes[1].axhline(y=-1.96/np.sqrt(len(residuals)), color='red', linestyle='--')
            axes[1].axhline(y=1.96/np.sqrt(len(residuals)), color='red', linestyle='--')
            axes[1].grid(True, alpha=0.3)
            
            # Plot PACF of residuals
            pacf_values = pacf(residuals, nlags=40)
            axes[2].stem(range(len(pacf_values)), pacf_values)
            axes[2].set_title('PACF of Residuals')
            axes[2].axhline(y=0, color='black', linestyle='-')
            axes[2].axhline(y=-1.96/np.sqrt(len(residuals)), color='red', linestyle='--')
            axes[2].axhline(y=1.96/np.sqrt(len(residuals)), color='red', linestyle='--')
            axes[2].grid(True, alpha=0.3)
            
            plt.tight_layout()
            
            if plot_path:
                plt.savefig(plot_path)
                logger.info(f"Saved diagnostic plots to {plot_path}")
            else:
                plt.show()
            
            plt.close()
        
        return diagnostics


class ExponentialSmoothingForecaster(BaseForecaster):
    """
    Exponential Smoothing forecasting model
    
    Implements Holt-Winters Exponential Smoothing with trend and 
    seasonal components for time series forecasting.
    """
    
    def __init__(
        self,
        name: str = "exp_smoothing",
        forecast_horizon: int = 24,
        frequency: str = 'H',
        trend: Optional[str] = None,
        seasonal: Optional[str] = None,
        seasonal_periods: Optional[int] = None,
        model_dir: str = 'app/ml/models/forecasting'
    ):
        """
        Initialize Exponential Smoothing forecaster
        
        Args:
            name: Name of the forecaster
            forecast_horizon: Number of time steps to forecast
            frequency: Time series frequency (e.g., 'H' for hourly, 'D' for daily)
            trend: Type of trend ('add', 'mul', None)
            seasonal: Type of seasonality ('add', 'mul', None)
            seasonal_periods: Number of periods in a seasonal cycle
            model_dir: Directory to store models
        """
        super().__init__(name=name, forecast_horizon=forecast_horizon, 
                         frequency=frequency, model_dir=model_dir)
        
        self.trend = trend
        self.seasonal = seasonal
        
        # Set default seasonal periods based on frequency if not provided
        if seasonal_periods is None:
            if frequency == 'H':
                self.seasonal_periods = 24  # Daily seasonality for hourly data
            elif frequency == 'D':
                self.seasonal_periods = 7   # Weekly seasonality for daily data
            elif frequency == 'M':
                self.seasonal_periods = 12  # Yearly seasonality for monthly data
            else:
                self.seasonal_periods = 1
        else:
            self.seasonal_periods = seasonal_periods
        
        self.model = None
        self.target_col = None
        self.training_data = None
        
        logger.info(f"Initialized ExponentialSmoothingForecaster with trend={trend}, "
                    f"seasonal={seasonal}, seasonal_periods={self.seasonal_periods}")
    
    def fit(self, data: pd.DataFrame, target_col: str, **kwargs) -> 'ExponentialSmoothingForecaster':
        """
        Fit the Exponential Smoothing model to training data
        
        Args:
            data: Training data (time series)
            target_col: Target column to forecast
            **kwargs: Additional parameters
            
        Returns:
            Self for method chaining
        """
        self.target_col = target_col
        self.training_data = data.copy()
        
        # Extract target series
        y = data[target_col]
        
        # Fit the model
        self.model = ExponentialSmoothing(
            y,
            trend=self.trend,
            seasonal=self.seasonal,
            seasonal_periods=self.seasonal_periods,
            use_boxcox=kwargs.get('use_boxcox', False),
            initialization_method=kwargs.get('initialization_method', 'estimated')
        ).fit(
            smoothing_level=kwargs.get('smoothing_level', None),
            smoothing_trend=kwargs.get('smoothing_trend', None),
            smoothing_seasonal=kwargs.get('smoothing_seasonal', None),
            damping_trend=kwargs.get('damping_trend', None)
        )
        
        self.is_fitted = True
        logger.info(f"Fitted Exponential Smoothing model with trend={self.trend}, "
                    f"seasonal={self.seasonal}, seasonal_periods={self.seasonal_periods}")
        
        return self
    
    def predict(
        self, 
        start_date: Optional[pd.Timestamp] = None, 
        n_periods: Optional[int] = None,
        exogenous_data: Optional[pd.DataFrame] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Generate forecasts using the fitted Exponential Smoothing model
        
        Args:
            start_date: Start date for forecasting
            n_periods: Number of periods to forecast (defaults to forecast_horizon)
            exogenous_data: Not used for Exponential Smoothing
            **kwargs: Additional parameters
            
        Returns:
            DataFrame with forecasts
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        # Determine forecast periods
        if n_periods is None:
            n_periods = self.forecast_horizon
        
        # Generate date range for the forecast
        if start_date is None:
            start_date = self.training_data.index[-1] + pd.Timedelta(1, unit=self.frequency)
        
        forecast_dates = pd.date_range(start=start_date, periods=n_periods, freq=self.frequency)
        
        # Generate forecasts
        forecast = self.model.forecast(steps=n_periods)
        
        # Create forecast DataFrame with confidence intervals if available
        forecast_df = pd.DataFrame({'forecast': forecast}, index=forecast_dates)
        
        try:
            # Try to get prediction intervals using the forecast method with confidence intervals
            pred_ci = self.model.get_prediction(start=len(self.training_data), 
                                               end=len(self.training_data) + n_periods - 1)
            forecast_df['lower_bound'] = pred_ci.conf_int(alpha=0.05).iloc[:, 0]
            forecast_df['upper_bound'] = pred_ci.conf_int(alpha=0.05).iloc[:, 1]
        except:
            # If confidence intervals are not available, estimate them
            residuals_std = np.std(self.model.resid)
            forecast_df['lower_bound'] = forecast - 1.96 * residuals_std
            forecast_df['upper_bound'] = forecast + 1.96 * residuals_std
        
        logger.info(f"Generated {n_periods} forecasts starting from {start_date}")
        
        return forecast_df
    
    def get_diagnostics(self, plot: bool = False, plot_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Get model diagnostics
        
        Args:
            plot: Whether to plot diagnostic charts
            plot_path: Path to save the diagnostic plots
            
        Returns:
            Dictionary with diagnostic information
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before diagnostics")
        
        # Extract diagnostic information
        diagnostics = {
            'aic': self.model.aic if hasattr(self.model, 'aic') else None,
            'bic': self.model.bic if hasattr(self.model, 'bic') else None,
            'trend': self.trend,
            'seasonal': self.seasonal,
            'seasonal_periods': self.seasonal_periods
        }
        
        # Get model parameters
        if hasattr(self.model, 'params'):
            diagnostics['params'] = self.model.params.to_dict()
        
        # Get residuals
        residuals = self.model.resid
        
        # Add residual statistics
        diagnostics['residual_mean'] = residuals.mean()
        diagnostics['residual_std'] = residuals.std()
        
        # Plot diagnostics if requested
        if plot:
            fig, axes = plt.subplots(3, 1, figsize=(12, 12))
            
            # Plot residuals
            axes[0].plot(residuals)
            axes[0].set_title('Residuals')
            axes[0].grid(True, alpha=0.3)
            
            # Plot ACF of residuals
            acf_values = acf(residuals, nlags=40)
            axes[1].stem(range(len(acf_values)), acf_values)
            axes[1].set_title('ACF of Residuals')
            axes[1].axhline(y=0, color='black', linestyle='-')
            axes[1].axhline(y=-1.96/np.sqrt(len(residuals)), color='red', linestyle='--')
            axes[1].axhline(y=1.96/np.sqrt(len(residuals)), color='red', linestyle='--')
            axes[1].grid(True, alpha=0.3)
            
            # Plot original data vs. fitted values
            axes[2].plot(self.training_data.index, self.training_data[self.target_col], label='Actual', color='blue')
            axes[2].plot(self.training_data.index, self.model.fittedvalues, label='Fitted', color='red')
            axes[2].set_title('Actual vs. Fitted Values')
            axes[2].legend()
            axes[2].grid(True, alpha=0.3)
            
            plt.tight_layout()
            
            if plot_path:
                plt.savefig(plot_path)
                logger.info(f"Saved diagnostic plots to {plot_path}")
            else:
                plt.show()
            
            plt.close()
        
        return diagnostics 