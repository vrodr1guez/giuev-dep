"""
Deep Learning Forecaster Module

This module provides deep learning-based forecasting for the EV charging infrastructure.
It includes fallback mechanisms for environments where TensorFlow isn't available.
"""
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Optional, Any, Union, Tuple, Type
from pathlib import Path
import joblib
import os
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Check TensorFlow availability
TENSORFLOW_AVAILABLE = False
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
    from tensorflow.keras.callbacks import EarlyStopping
    from tensorflow.keras.optimizers import Adam
    TENSORFLOW_AVAILABLE = True
    logger.info("TensorFlow is available. Deep learning forecasters will be enabled.")
except ImportError:
    logger.warning("TensorFlow is not available. Deep learning forecasters will fall back to statistical methods.")

# Import base forecaster
from .base_forecaster import BaseForecaster

# Import fallback forecaster
from .statistical_forecaster import ExponentialSmoothingForecaster

class DeepLearningUnavailableError(Exception):
    """Exception raised when TensorFlow is not available"""
    pass

class LSTMForecaster(BaseForecaster):
    """
    Long Short-Term Memory (LSTM) neural network for time series forecasting
    
    If TensorFlow is not available, this will raise an exception during initialization
    unless fallback_on_import_error is set to True, in which case it will return a
    fallback forecaster.
    """
    
    @classmethod
    def get_fallback_forecaster(cls, **kwargs) -> BaseForecaster:
        """
        Get a fallback forecaster when TensorFlow is not available
        
        Args:
            **kwargs: Parameters to pass to the fallback forecaster
            
        Returns:
            A fallback forecaster instance
        """
        logger.info("Creating fallback ExponentialSmoothingForecaster instead of LSTMForecaster")
        
        # Remove LSTM-specific parameters
        kwargs.pop('sequence_length', None)
        kwargs.pop('hidden_units', None)
        kwargs.pop('dropout_rate', None)
        kwargs.pop('learning_rate', None)
        kwargs.pop('epochs', None)
        kwargs.pop('batch_size', None)
        
        # Rename to indicate it's a fallback
        name = kwargs.get('name', 'lstm')
        kwargs['name'] = f"{name}_fallback"
        
        # Create fallback forecaster
        return ExponentialSmoothingForecaster(**kwargs)
    
    def __new__(cls, fallback_on_import_error: bool = True, **kwargs):
        """
        Custom instance creation to support fallback mechanism
        
        Args:
            fallback_on_import_error: Whether to fall back to a statistical forecaster
                                      if TensorFlow is not available
            **kwargs: Parameters for the forecaster
            
        Returns:
            LSTMForecaster instance or fallback forecaster
        """
        if not TENSORFLOW_AVAILABLE:
            if fallback_on_import_error:
                return cls.get_fallback_forecaster(**kwargs)
            else:
                raise DeepLearningUnavailableError(
                    "TensorFlow is not available. "
                    "Install TensorFlow or use fallback_on_import_error=True."
                )
        
        return super(LSTMForecaster, cls).__new__(cls)
    
    def __init__(
        self,
        name: str = "lstm",
        forecast_horizon: int = 24,
        frequency: str = 'H',
        sequence_length: int = 48,
        hidden_units: List[int] = [64, 32],
        dropout_rate: float = 0.2,
        learning_rate: float = 0.001,
        epochs: int = 100,
        batch_size: int = 32,
        model_dir: str = 'app/ml/models/forecasting',
        fallback_on_import_error: bool = True
    ):
        """
        Initialize LSTM forecaster
        
        Args:
            name: Name of the forecaster
            forecast_horizon: Number of time steps to forecast
            frequency: Time series frequency (e.g., 'H' for hourly, 'D' for daily)
            sequence_length: Number of past time steps to use as input
            hidden_units: List of hidden units in each LSTM layer
            dropout_rate: Dropout rate for regularization
            learning_rate: Learning rate for optimizer
            epochs: Number of training epochs
            batch_size: Batch size for training
            model_dir: Directory to store models
            fallback_on_import_error: Whether to fall back to a statistical forecaster
                                      if TensorFlow is not available (ignored here, used in __new__)
        """
        # Skip initialization if TensorFlow is not available
        # (this should not happen due to __new__, but just to be safe)
        if not TENSORFLOW_AVAILABLE:
            return
        
        super().__init__(name=name, forecast_horizon=forecast_horizon, 
                         frequency=frequency, model_dir=model_dir)
        
        self.sequence_length = sequence_length
        self.hidden_units = hidden_units
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        
        self.model = None
        self.scaler = None
        self.history = None
        
        logger.info(f"Initialized LSTM forecaster with {len(hidden_units)} layers")
    
    def _build_model(self, n_features: int) -> None:
        """
        Build LSTM model architecture
        
        Args:
            n_features: Number of input features
        """
        # Clear previous TensorFlow session
        tf.keras.backend.clear_session()
        
        # Create sequential model
        model = Sequential(name=f"lstm_{self.name}")
        
        # Add LSTM layers
        for i, units in enumerate(self.hidden_units):
            # First layer needs input shape
            if i == 0:
                model.add(LSTM(
                    units=units,
                    return_sequences=(i < len(self.hidden_units) - 1),
                    input_shape=(self.sequence_length, n_features),
                    name=f"lstm_{i}"
                ))
            else:
                model.add(LSTM(
                    units=units,
                    return_sequences=(i < len(self.hidden_units) - 1),
                    name=f"lstm_{i}"
                ))
            
            # Add regularization
            model.add(BatchNormalization(name=f"batchnorm_{i}"))
            model.add(Dropout(self.dropout_rate, name=f"dropout_{i}"))
        
        # Output layer
        model.add(Dense(self.forecast_horizon, name="output"))
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=self.learning_rate),
            loss="mse"
        )
        
        self.model = model
        logger.info(f"Built LSTM model with {len(self.hidden_units)} layers")
    
    def fit(self, data: pd.DataFrame, target_col: str, **kwargs) -> 'LSTMForecaster':
        """
        Fit LSTM model to training data
        
        Args:
            data: Training data (time series)
            target_col: Target column to forecast
            **kwargs: Additional parameters
                - val_split: Validation split ratio (default: 0.2)
                - verbose: Verbosity level for training (default: 1)
                
        Returns:
            Self for method chaining
        """
        from sklearn.preprocessing import StandardScaler
        
        # Extract parameters
        val_split = kwargs.get('val_split', 0.2)
        verbose = kwargs.get('verbose', 1)
        
        # Prepare data
        X, y = self._prepare_data(data, target_col)
        
        # Build model
        self._build_model(n_features=X.shape[2])
        
        # Set up early stopping
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train model
        self.history = self.model.fit(
            X, y,
            validation_split=val_split,
            epochs=self.epochs,
            batch_size=self.batch_size,
            callbacks=[early_stopping],
            verbose=verbose
        )
        
        self.is_fitted = True
        logger.info(f"Fitted LSTM model with {len(self.history.epoch)} epochs")
        
        return self
    
    def _prepare_data(self, data: pd.DataFrame, target_col: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for LSTM model
        
        Args:
            data: Input data
            target_col: Target column
            
        Returns:
            Tuple of (X, y) for model training
        """
        from sklearn.preprocessing import StandardScaler
        
        # Extract target series
        series = data[target_col].values
        
        # Scale data
        self.scaler = StandardScaler()
        scaled_series = self.scaler.fit_transform(series.reshape(-1, 1)).flatten()
        
        # Create sequences
        X, y = [], []
        for i in range(len(scaled_series) - self.sequence_length - self.forecast_horizon + 1):
            X.append(scaled_series[i:i+self.sequence_length])
            y.append(scaled_series[i+self.sequence_length:i+self.sequence_length+self.forecast_horizon])
        
        # Convert to numpy arrays
        X = np.array(X)
        y = np.array(y)
        
        # Reshape X to [samples, time steps, features]
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        return X, y
    
    def predict(
        self, 
        start_date: Optional[pd.Timestamp] = None, 
        n_periods: Optional[int] = None,
        exogenous_data: Optional[pd.DataFrame] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Generate forecasts using the LSTM model
        
        Args:
            start_date: Start date for forecasting
            n_periods: Number of periods to forecast (defaults to forecast_horizon)
            exogenous_data: Exogenous variables for the forecast period (ignored for LSTM)
            **kwargs: Additional parameters
            
        Returns:
            DataFrame with forecasts
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        from sklearn.preprocessing import StandardScaler
        
        # Determine forecast periods
        if n_periods is None:
            n_periods = self.forecast_horizon
        
        # Generate date range for the forecast
        if start_date is None:
            if hasattr(self, 'training_data') and self.training_data is not None:
                start_date = self.training_data.index[-1] + pd.Timedelta(1, unit=self.frequency)
            else:
                raise ValueError("start_date must be provided if no training data is available")
        
        forecast_dates = pd.date_range(start=start_date, periods=n_periods, freq=self.frequency)
        
        # Get the most recent data for input sequence
        if hasattr(self, 'training_data') and self.training_data is not None:
            recent_data = self.training_data.iloc[-self.sequence_length:][self.target_col].values
        else:
            raise ValueError("No training data available for prediction")
        
        # Scale input data
        scaled_input = self.scaler.transform(recent_data.reshape(-1, 1)).flatten()
        
        # Reshape for model input [1, sequence_length, 1]
        model_input = scaled_input.reshape(1, self.sequence_length, 1)
        
        # Generate prediction
        scaled_forecast = self.model.predict(model_input)[0]
        
        # Inverse transform the forecast
        forecast = self.scaler.inverse_transform(scaled_forecast.reshape(-1, 1)).flatten()
        
        # Create forecast DataFrame
        forecast_df = pd.DataFrame({
            'forecast': forecast[:n_periods]
        }, index=forecast_dates)
        
        logger.info(f"Generated LSTM forecast for {n_periods} periods")
        
        return forecast_df
    
    def evaluate(
        self, 
        data: pd.DataFrame, 
        target_col: str,
        metrics: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """
        Evaluate model on test data
        
        Args:
            data: Test data
            target_col: Target column
            metrics: List of metrics to compute (default: ['mse', 'rmse', 'mae'])
            
        Returns:
            Dictionary of metric values
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before evaluation")
        
        if metrics is None:
            metrics = ['mse', 'rmse', 'mae']
        
        # Prepare evaluation data
        X_eval, y_eval = self._prepare_data(data, target_col)
        
        # Get predictions
        y_pred = self.model.predict(X_eval)
        
        # Inverse transform for metric calculation
        y_true_inv = self.scaler.inverse_transform(y_eval.reshape(-1, self.forecast_horizon))
        y_pred_inv = self.scaler.inverse_transform(y_pred)
        
        # Calculate metrics
        results = {}
        
        for metric in metrics:
            if metric.lower() == 'mse':
                results['mse'] = np.mean((y_true_inv - y_pred_inv) ** 2)
            elif metric.lower() == 'rmse':
                results['rmse'] = np.sqrt(np.mean((y_true_inv - y_pred_inv) ** 2))
            elif metric.lower() == 'mae':
                results['mae'] = np.mean(np.abs(y_true_inv - y_pred_inv))
        
        return results
    
    def save(self, filepath: Optional[str] = None) -> str:
        """
        Save the model to disk
        
        Args:
            filepath: Path to save the model (if None, uses default path)
            
        Returns:
            Path to the saved model directory
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before saving")
        
        if filepath is None:
            filepath = os.path.join(self.model_dir, f"{self.name}_lstm")
        
        # Create directory if it doesn't exist
        os.makedirs(filepath, exist_ok=True)
        
        # Save Keras model
        self.model.save(os.path.join(filepath, "model"))
        
        # Save scaler and other attributes
        joblib.dump(self.scaler, os.path.join(filepath, "scaler.joblib"))
        
        # Save hyperparameters
        params = {
            "name": self.name,
            "forecast_horizon": self.forecast_horizon,
            "frequency": self.frequency,
            "sequence_length": self.sequence_length,
            "hidden_units": self.hidden_units,
            "dropout_rate": self.dropout_rate,
            "learning_rate": self.learning_rate
        }
        
        with open(os.path.join(filepath, "params.json"), "w") as f:
            json.dump(params, f)
        
        logger.info(f"Saved LSTM model to {filepath}")
        
        return filepath
    
    @classmethod
    def load(cls, filepath: str) -> 'LSTMForecaster':
        """
        Load the model from disk
        
        Args:
            filepath: Path to the saved model directory
            
        Returns:
            Loaded LSTM forecaster
        """
        if not TENSORFLOW_AVAILABLE:
            logger.warning("TensorFlow not available. Cannot load LSTM model.")
            
            # Try loading fallback model if available
            fallback_path = os.path.join(filepath, "fallback_model.joblib")
            if os.path.exists(fallback_path):
                logger.info(f"Loading fallback model from {fallback_path}")
                return joblib.load(fallback_path)
            else:
                raise DeepLearningUnavailableError(
                    "TensorFlow is not available and no fallback model found."
                )
        
        # Load parameters
        with open(os.path.join(filepath, "params.json"), "r") as f:
            params = json.load(f)
        
        # Create instance
        forecaster = cls(
            name=params["name"],
            forecast_horizon=params["forecast_horizon"],
            frequency=params["frequency"],
            sequence_length=params["sequence_length"],
            hidden_units=params["hidden_units"],
            dropout_rate=params["dropout_rate"],
            learning_rate=params["learning_rate"]
        )
        
        # Load model
        forecaster.model = load_model(os.path.join(filepath, "model"))
        
        # Load scaler
        forecaster.scaler = joblib.load(os.path.join(filepath, "scaler.joblib"))
        
        forecaster.is_fitted = True
        
        logger.info(f"Loaded LSTM model from {filepath}")
        
        return forecaster

# Additional deep learning forecaster implementations could go here 