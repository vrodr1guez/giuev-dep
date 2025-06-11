"""
Ensemble Forecaster Module

This module implements ensemble methods combining statistical and deep learning
forecasters for improved prediction accuracy in the EV charging infrastructure.
"""
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Optional, Any, Union, Tuple
from pathlib import Path
import joblib

from .base_forecaster import BaseForecaster
from .statistical_forecaster import ARIMAForecaster, ExponentialSmoothingForecaster
from .deep_forecaster import LSTMForecaster

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnsembleForecaster(BaseForecaster):
    """
    Ensemble forecasting model that combines multiple forecasters
    
    Supports multiple ensemble methods:
    - Simple averaging
    - Weighted averaging based on historical performance
    - Stacked ensemble (meta-learner)
    """
    
    def __init__(
        self,
        name: str = "ensemble",
        forecast_horizon: int = 24,
        frequency: str = 'H',
        forecasters: Optional[List[BaseForecaster]] = None,
        ensemble_method: str = "weighted",
        model_dir: str = 'app/ml/models/forecasting'
    ):
        """
        Initialize ensemble forecaster
        
        Args:
            name: Name of the forecaster
            forecast_horizon: Number of time steps to forecast
            frequency: Time series frequency (e.g., 'H' for hourly, 'D' for daily)
            forecasters: List of forecaster instances to ensemble
            ensemble_method: Method for combining forecasts ('simple', 'weighted', 'stacked')
            model_dir: Directory to store models
        """
        super().__init__(name=name, forecast_horizon=forecast_horizon, 
                         frequency=frequency, model_dir=model_dir)
        
        self.forecasters = forecasters or []
        self.ensemble_method = ensemble_method
        self.weights = None
        self.meta_model = None
        self.target_col = None
        self.training_data = None
        
        logger.info(f"Initialized EnsembleForecaster with {len(self.forecasters)} forecasters "
                    f"using {ensemble_method} ensemble method")
    
    def add_forecaster(self, forecaster: BaseForecaster) -> 'EnsembleForecaster':
        """
        Add a forecaster to the ensemble
        
        Args:
            forecaster: Forecaster instance to add
            
        Returns:
            Self for method chaining
        """
        self.forecasters.append(forecaster)
        logger.info(f"Added {forecaster.__class__.__name__} to ensemble")
        return self
    
    def create_default_ensemble(self) -> 'EnsembleForecaster':
        """
        Create a default ensemble with standard forecasters
        
        Returns:
            Self for method chaining
        """
        # Add ARIMA forecaster
        self.add_forecaster(ARIMAForecaster(
            name="arima_component",
            forecast_horizon=self.forecast_horizon,
            frequency=self.frequency,
            auto_order=True
        ))
        
        # Add Exponential Smoothing forecaster
        self.add_forecaster(ExponentialSmoothingForecaster(
            name="expsm_component",
            forecast_horizon=self.forecast_horizon,
            frequency=self.frequency,
            trend='add',
            seasonal='add',
            seasonal_periods=24 if self.frequency == 'H' else 7
        ))
        
        # Try to add LSTM forecaster if TensorFlow is available
        try:
            import tensorflow as tf
            self.add_forecaster(LSTMForecaster(
                name="lstm_component",
                forecast_horizon=self.forecast_horizon,
                frequency=self.frequency,
                sequence_length=48,
                hidden_units=[64, 32],
                epochs=50
            ))
        except ImportError:
            logger.warning("TensorFlow not available, LSTM forecaster not added to ensemble")
        
        return self
    
    def fit(self, data: pd.DataFrame, target_col: str, **kwargs) -> 'EnsembleForecaster':
        """
        Fit the ensemble forecaster to training data
        
        Args:
            data: Training data (time series)
            target_col: Target column to forecast
            **kwargs: Additional parameters
                - validation_ratio: Ratio of data to use for validation (default: 0.2)
                
        Returns:
            Self for method chaining
        """
        if not self.forecasters:
            logger.warning("No forecasters in ensemble. Creating default ensemble.")
            self.create_default_ensemble()
        
        self.target_col = target_col
        self.training_data = data.copy()
        
        # Split data into training and validation
        validation_ratio = kwargs.get('validation_ratio', 0.2)
        train_size = int(len(data) * (1 - validation_ratio))
        
        train_data = data.iloc[:train_size]
        val_data = data.iloc[train_size:]
        
        # Fit each forecaster on the training data
        for forecaster in self.forecasters:
            logger.info(f"Fitting {forecaster.__class__.__name__} in ensemble")
            forecaster.fit(train_data, target_col, **kwargs)
        
        # Calculate weights based on validation performance if using weighted ensemble
        if self.ensemble_method == "weighted" and len(val_data) > 0:
            self._calculate_weights(val_data, target_col)
        elif self.ensemble_method == "stacked" and len(val_data) > 0:
            self._fit_stacking_model(val_data, target_col)
        else:
            # Use equal weights for simple ensemble
            self.weights = np.ones(len(self.forecasters)) / len(self.forecasters)
        
        self.is_fitted = True
        logger.info(f"Fitted ensemble with {len(self.forecasters)} forecasters")
        
        return self
    
    def _calculate_weights(self, val_data: pd.DataFrame, target_col: str) -> None:
        """
        Calculate weights for each forecaster based on validation performance
        
        Args:
            val_data: Validation data
            target_col: Target column
        """
        forecaster_errors = []
        
        # Generate forecasts for validation period with each forecaster
        for forecaster in self.forecasters:
            forecasts = forecaster.predict(
                start_date=val_data.index[0],
                n_periods=len(val_data)
            )
            
            # Calculate MSE
            y_true = val_data[target_col].values
            y_pred = forecasts['forecast'].values
            mse = np.mean((y_true - y_pred) ** 2)
            forecaster_errors.append(mse)
        
        # Convert errors to weights (smaller error -> larger weight)
        # Add small epsilon to avoid division by zero
        inverse_errors = 1.0 / (np.array(forecaster_errors) + 1e-10)
        self.weights = inverse_errors / np.sum(inverse_errors)
        
        # Log the weights
        for i, (forecaster, weight) in enumerate(zip(self.forecasters, self.weights)):
            logger.info(f"Assigned weight {weight:.4f} to {forecaster.__class__.__name__}")
    
    def _fit_stacking_model(self, val_data: pd.DataFrame, target_col: str) -> None:
        """
        Fit a meta-model for stacked ensemble
        
        Args:
            val_data: Validation data
            target_col: Target column
        """
        from sklearn.linear_model import Ridge
        
        # Generate forecasts for validation period with each forecaster
        forecaster_preds = []
        
        for forecaster in self.forecasters:
            forecasts = forecaster.predict(
                start_date=val_data.index[0],
                n_periods=len(val_data)
            )
            
            forecaster_preds.append(forecasts['forecast'].values)
        
        # Create feature matrix for stacking
        X_stack = np.column_stack(forecaster_preds)
        y_stack = val_data[target_col].values
        
        # Fit meta-model
        self.meta_model = Ridge(alpha=1.0)
        self.meta_model.fit(X_stack, y_stack)
        
        # Get meta-model coefficients as weights
        self.weights = self.meta_model.coef_
        self.weights = self.weights / np.sum(np.abs(self.weights))  # Normalize weights
        
        logger.info(f"Fitted stacking meta-model with coefficients: {self.weights}")
    
    def predict(
        self, 
        start_date: Optional[pd.Timestamp] = None, 
        n_periods: Optional[int] = None,
        exogenous_data: Optional[pd.DataFrame] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Generate forecasts using the ensemble of forecasters
        
        Args:
            start_date: Start date for forecasting
            n_periods: Number of periods to forecast (defaults to forecast_horizon)
            exogenous_data: Exogenous variables for the forecast period
            **kwargs: Additional parameters
            
        Returns:
            DataFrame with forecasts
        """
        if not self.is_fitted:
            raise ValueError("Ensemble must be fitted before prediction")
        
        # Determine forecast periods
        if n_periods is None:
            n_periods = self.forecast_horizon
        
        # Generate date range for the forecast
        if start_date is None:
            start_date = self.training_data.index[-1] + pd.Timedelta(1, unit=self.frequency)
        
        forecast_dates = pd.date_range(start=start_date, periods=n_periods, freq=self.frequency)
        
        # Generate forecasts from each forecaster
        forecaster_preds = []
        lower_bounds = []
        upper_bounds = []
        
        for forecaster in self.forecasters:
            forecasts = forecaster.predict(
                start_date=start_date,
                n_periods=n_periods,
                exogenous_data=exogenous_data,
                **kwargs
            )
            
            forecaster_preds.append(forecasts['forecast'].values)
            
            if 'lower_bound' in forecasts.columns:
                lower_bounds.append(forecasts['lower_bound'].values)
            
            if 'upper_bound' in forecasts.columns:
                upper_bounds.append(forecasts['upper_bound'].values)
        
        # Combine forecasts based on ensemble method
        if self.ensemble_method == "stacked" and self.meta_model is not None:
            # Use meta-model for prediction
            X_stack = np.column_stack([pred[:min(n_periods, len(pred))] for pred in forecaster_preds])
            ensemble_forecast = self.meta_model.predict(X_stack)
        else:
            # Use weighted average
            forecaster_preds = np.array(forecaster_preds)
            ensemble_forecast = np.sum(forecaster_preds * self.weights.reshape(-1, 1), axis=0)
        
        # Create forecast DataFrame
        forecast_df = pd.DataFrame({'forecast': ensemble_forecast}, index=forecast_dates)
        
        # Add confidence intervals if available from all forecasters
        if lower_bounds and len(lower_bounds) == len(self.forecasters):
            lower_bounds = np.array(lower_bounds)
            weighted_lower = np.sum(lower_bounds * self.weights.reshape(-1, 1), axis=0)
            forecast_df['lower_bound'] = weighted_lower
        
        if upper_bounds and len(upper_bounds) == len(self.forecasters):
            upper_bounds = np.array(upper_bounds)
            weighted_upper = np.sum(upper_bounds * self.weights.reshape(-1, 1), axis=0)
            forecast_df['upper_bound'] = weighted_upper
        
        logger.info(f"Generated ensemble forecast for {n_periods} periods starting from {start_date}")
        
        return forecast_df
    
    def get_diagnostics(self, plot: bool = False, plot_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Get ensemble diagnostics
        
        Args:
            plot: Whether to plot diagnostic charts
            plot_path: Path to save the diagnostic plots
            
        Returns:
            Dictionary with diagnostic information
        """
        if not self.is_fitted:
            raise ValueError("Ensemble must be fitted before diagnostics")
        
        # Extract diagnostic information
        diagnostics = {
            'ensemble_method': self.ensemble_method,
            'forecasters': [f.__class__.__name__ for f in self.forecasters],
            'weights': self.weights.tolist() if self.weights is not None else None,
        }
        
        # Plot diagnostics if requested
        if plot:
            fig, ax = plt.subplots(figsize=(10, 6))
            
            # Plot weights
            forecaster_names = [f.__class__.__name__ for f in self.forecasters]
            ax.bar(forecaster_names, self.weights)
            ax.set_ylabel("Weight")
            ax.set_title("Ensemble Weights by Forecaster")
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            if plot_path:
                plt.savefig(plot_path)
                logger.info(f"Saved diagnostic plot to {plot_path}")
            else:
                plt.show()
            
            plt.close()
        
        return diagnostics


class ModelSelector:
    """
    Automatic model selector that chooses the best forecaster 
    based on data characteristics
    """
    
    def __init__(
        self,
        models_to_try: Optional[List[str]] = None,
        evaluation_metric: str = 'rmse',
        cross_validation: bool = True,
        cv_folds: int = 3
    ):
        """
        Initialize model selector
        
        Args:
            models_to_try: List of model types to try ('arima', 'expsm', 'lstm', 'ensemble')
            evaluation_metric: Metric for model selection ('rmse', 'mse', 'mae', 'mape')
            cross_validation: Whether to use cross-validation
            cv_folds: Number of cross-validation folds
        """
        self.models_to_try = models_to_try or ['arima', 'expsm', 'lstm', 'ensemble']
        self.evaluation_metric = evaluation_metric
        self.cross_validation = cross_validation
        self.cv_folds = cv_folds
        self.best_model = None
        self.model_performances = {}
        
        logger.info(f"Initialized ModelSelector with models: {self.models_to_try}")
    
    def analyze_data(self, data: pd.DataFrame, target_col: str) -> Dict[str, Any]:
        """
        Analyze time series data to determine its characteristics
        
        Args:
            data: Time series data
            target_col: Target column
            
        Returns:
            Dictionary of data characteristics
        """
        from statsmodels.tsa.stattools import adfuller, acf, pacf
        
        characteristics = {}
        
        # Check for stationarity
        try:
            adf_result = adfuller(data[target_col].dropna())
            characteristics['is_stationary'] = adf_result[1] < 0.05
            characteristics['adf_pvalue'] = adf_result[1]
        except:
            characteristics['is_stationary'] = False
        
        # Check for seasonality
        try:
            # Calculate autocorrelation
            acf_values = acf(data[target_col].dropna(), nlags=48, fft=True)
            
            # Look for peaks in ACF
            from scipy.signal import find_peaks
            peaks, _ = find_peaks(acf_values[1:], height=0.2)
            
            if len(peaks) > 0:
                characteristics['has_seasonality'] = True
                characteristics['seasonal_periods'] = [p+1 for p in peaks]
            else:
                characteristics['has_seasonality'] = False
        except:
            characteristics['has_seasonality'] = False
        
        # Check for trend
        try:
            # Simple trend detection
            from scipy.stats import linregress
            x = np.arange(len(data))
            slope, _, _, p_value, _ = linregress(x, data[target_col].values)
            
            characteristics['has_trend'] = p_value < 0.05
            characteristics['trend_direction'] = 'positive' if slope > 0 else 'negative'
        except:
            characteristics['has_trend'] = False
        
        # Data size characteristics
        characteristics['data_size'] = len(data)
        characteristics['has_missing_values'] = data[target_col].isnull().any()
        
        # Check for complex patterns (volatility, non-linearity)
        characteristics['volatility'] = data[target_col].std() / data[target_col].mean()
        
        logger.info(f"Data characteristics: {characteristics}")
        return characteristics
    
    def select_best_model(
        self, 
        data: pd.DataFrame, 
        target_col: str,
        forecast_horizon: int = 24,
        frequency: str = 'H',
        validation_ratio: float = 0.2
    ) -> BaseForecaster:
        """
        Select the best forecasting model based on data characteristics
        
        Args:
            data: Time series data
            target_col: Target column
            forecast_horizon: Forecast horizon
            frequency: Time series frequency
            validation_ratio: Ratio of data to use for validation
            
        Returns:
            Best forecasting model
        """
        # Analyze data
        characteristics = self.analyze_data(data, target_col)
        
        # Create candidate models
        candidate_models = []
        
        if 'arima' in self.models_to_try:
            arima = ARIMAForecaster(
                name="arima",
                forecast_horizon=forecast_horizon,
                frequency=frequency,
                auto_order=True
            )
            candidate_models.append(arima)
        
        if 'expsm' in self.models_to_try:
            # Determine seasonal periods
            if characteristics.get('has_seasonality', False) and characteristics.get('seasonal_periods'):
                seasonal_periods = characteristics['seasonal_periods'][0]
            else:
                seasonal_periods = 24 if frequency == 'H' else 7  # Default seasonality
            
            # Use multiplicative seasonality for high volatility
            seasonal_type = 'mul' if characteristics.get('volatility', 0) > 0.3 else 'add'
            
            expsm = ExponentialSmoothingForecaster(
                name="expsm",
                forecast_horizon=forecast_horizon,
                frequency=frequency,
                trend='add' if characteristics.get('has_trend', False) else None,
                seasonal=seasonal_type if characteristics.get('has_seasonality', False) else None,
                seasonal_periods=seasonal_periods
            )
            candidate_models.append(expsm)
        
        if 'lstm' in self.models_to_try:
            try:
                import tensorflow as tf
                # LSTM works well for complex patterns and non-linear relationships
                # Use deeper network for more complex data
                hidden_units = [64, 32, 16] if characteristics.get('volatility', 0) > 0.3 else [64, 32]
                
                lstm = LSTMForecaster(
                    name="lstm",
                    forecast_horizon=forecast_horizon,
                    frequency=frequency,
                    sequence_length=48,
                    hidden_units=hidden_units,
                    epochs=100 if characteristics.get('data_size', 0) > 1000 else 50
                )
                candidate_models.append(lstm)
            except ImportError:
                logger.warning("TensorFlow not available, LSTM model not included")
        
        if 'ensemble' in self.models_to_try:
            # Always include ensemble model with appropriate forecasters
            ensemble_forecasters = []
            
            # Add ARIMA if appropriate
            if characteristics.get('is_stationary', False) or not characteristics.get('has_seasonality', False):
                ensemble_forecasters.append(ARIMAForecaster(
                    name="arima_component",
                    forecast_horizon=forecast_horizon,
                    frequency=frequency,
                    auto_order=True
                ))
            
            # Add ExpSm if appropriate
            if characteristics.get('has_seasonality', False) or characteristics.get('has_trend', False):
                ensemble_forecasters.append(ExponentialSmoothingForecaster(
                    name="expsm_component",
                    forecast_horizon=forecast_horizon,
                    frequency=frequency,
                    trend='add' if characteristics.get('has_trend', False) else None,
                    seasonal='add' if characteristics.get('has_seasonality', False) else None,
                    seasonal_periods=characteristics.get('seasonal_periods', [24])[0] if characteristics.get('has_seasonality', False) else 24
                ))
            
            # Add LSTM if appropriate
            if characteristics.get('volatility', 0) > 0.2 and characteristics.get('data_size', 0) > 500:
                try:
                    import tensorflow as tf
                    ensemble_forecasters.append(LSTMForecaster(
                        name="lstm_component",
                        forecast_horizon=forecast_horizon,
                        frequency=frequency,
                        sequence_length=48,
                        hidden_units=[64, 32],
                        epochs=50
                    ))
                except ImportError:
                    pass
            
            # Only create ensemble if we have at least 2 forecasters
            if len(ensemble_forecasters) >= 2:
                ensemble = EnsembleForecaster(
                    name="ensemble",
                    forecast_horizon=forecast_horizon,
                    frequency=frequency,
                    forecasters=ensemble_forecasters,
                    ensemble_method="weighted"
                )
                candidate_models.append(ensemble)
        
        # Evaluate candidate models
        if self.cross_validation:
            self._evaluate_with_cv(candidate_models, data, target_col, forecast_horizon, self.cv_folds)
        else:
            self._evaluate_with_validation(candidate_models, data, target_col, validation_ratio)
        
        # Select best model
        best_model_name = min(self.model_performances.items(), key=lambda x: x[1])[0]
        self.best_model = next(model for model in candidate_models if model.name == best_model_name)
        
        # Fit the best model on the entire dataset
        self.best_model.fit(data, target_col)
        
        logger.info(f"Selected {self.best_model.__class__.__name__} as best model with "
                   f"{self.evaluation_metric}={self.model_performances[best_model_name]:.4f}")
        
        return self.best_model
    
    def _evaluate_with_validation(
        self, 
        models: List[BaseForecaster], 
        data: pd.DataFrame, 
        target_col: str,
        validation_ratio: float
    ) -> None:
        """
        Evaluate models using validation split
        
        Args:
            models: List of forecasting models
            data: Time series data
            target_col: Target column
            validation_ratio: Ratio of data to use for validation
        """
        # Split data into training and validation
        train_size = int(len(data) * (1 - validation_ratio))
        train_data = data.iloc[:train_size]
        val_data = data.iloc[train_size:]
        
        for model in models:
            # Fit model on training data
            model.fit(train_data, target_col)
            
            # Evaluate on validation data
            metrics = model.evaluate(val_data, target_col, metrics=[self.evaluation_metric])
            self.model_performances[model.name] = metrics.get(self.evaluation_metric, float('inf'))
    
    def _evaluate_with_cv(
        self, 
        models: List[BaseForecaster], 
        data: pd.DataFrame, 
        target_col: str,
        forecast_horizon: int,
        cv_folds: int
    ) -> None:
        """
        Evaluate models using time series cross-validation
        
        Args:
            models: List of forecasting models
            data: Time series data
            target_col: Target column
            forecast_horizon: Forecast horizon
            cv_folds: Number of CV folds
        """
        # Time series cross-validation
        fold_size = min(len(data) // cv_folds, forecast_horizon * 3)
        
        for model in models:
            model_metrics = []
            
            # Iterate through CV folds
            for i in range(cv_folds):
                # Define train/test splits
                test_end = len(data) - i * fold_size
                test_start = test_end - fold_size
                
                if test_start <= forecast_horizon:
                    continue  # Skip fold if there's not enough training data
                
                train_data = data.iloc[:test_start]
                test_data = data.iloc[test_start:test_end]
                
                # Fit and evaluate
                model_copy = type(model)(
                    name=model.name,
                    forecast_horizon=model.forecast_horizon,
                    frequency=model.frequency
                )
                
                # Handle special case for ensemble
                if isinstance(model, EnsembleForecaster) and hasattr(model, 'forecasters'):
                    model_copy.forecasters = [
                        type(f)(
                            name=f.name,
                            forecast_horizon=f.forecast_horizon,
                            frequency=f.frequency
                        )
                        for f in model.forecasters
                    ]
                    model_copy.ensemble_method = model.ensemble_method
                
                model_copy.fit(train_data, target_col)
                metrics = model_copy.evaluate(test_data, target_col, metrics=[self.evaluation_metric])
                model_metrics.append(metrics.get(self.evaluation_metric, float('inf')))
            
            # Calculate average metric across folds
            if model_metrics:
                self.model_performances[model.name] = np.mean(model_metrics)
            else:
                self.model_performances[model.name] = float('inf')


# Example usage
def main():
    """Example of using the ensemble forecaster and model selector"""
    # Create sample data
    import numpy as np
    
    # Generate daily data with hourly frequency for 30 days
    date_rng = pd.date_range(start='2023-01-01', end='2023-01-31', freq='H')
    
    # Create data with seasonal and trend patterns
    hourly_pattern = np.sin(np.linspace(0, 2*np.pi, 24)) * 10 + 30
    daily_pattern = np.sin(np.linspace(0, 2*np.pi, 7)) * 5 + 10
    
    data = []
    for i, date in enumerate(date_rng):
        # Base value with hourly pattern
        value = hourly_pattern[date.hour]
        
        # Add daily pattern
        value += daily_pattern[date.dayofweek]
        
        # Add trend
        value += i * 0.01
        
        # Add noise
        value += np.random.normal(0, 3)
        
        data.append({"timestamp": date, "value": value, "hour": date.hour, "day": date.dayofweek})
    
    df = pd.DataFrame(data)
    df.set_index("timestamp", inplace=True)
    
    # Create model selector
    selector = ModelSelector(
        models_to_try=['arima', 'expsm', 'lstm', 'ensemble'],
        evaluation_metric='rmse',
        cross_validation=True,
        cv_folds=3
    )
    
    # Select best model
    best_model = selector.select_best_model(
        data=df,
        target_col="value",
        forecast_horizon=24,
        frequency='H'
    )
    
    print(f"Selected model: {best_model.__class__.__name__}")
    print(f"Model performances: {selector.model_performances}")
    
    # Generate forecasts with the best model
    forecasts = best_model.predict(n_periods=48)
    print(forecasts.head())
    
    # Alternatively, create an ensemble manually
    ensemble = EnsembleForecaster(
        name="custom_ensemble",
        forecast_horizon=24,
        frequency='H',
        ensemble_method="weighted"
    )
    
    # Add forecasters
    ensemble.add_forecaster(ARIMAForecaster(name="arima_component"))
    ensemble.add_forecaster(ExponentialSmoothingForecaster(name="expsm_component"))
    
    # Fit and predict
    ensemble.fit(df, "value")
    ensemble_forecasts = ensemble.predict(n_periods=24)
    print(ensemble_forecasts.head())


if __name__ == "__main__":
    main() 