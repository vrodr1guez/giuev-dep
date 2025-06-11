"""
Energy Price Prediction Model Training Script

This script trains machine learning models to predict energy prices
for optimal charging decisions.
"""
import os
import sys
import logging
import argparse
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.ml.preprocessing.feature_engineering import extract_time_features, create_grid_integration_features
from app.ml.preprocessing.data_normalization import DataNormalizer, handle_outliers, impute_missing_values

import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, HistGradientBoostingRegressor
from sklearn.linear_model import ElasticNet, LinearRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, TimeSeriesSplit, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
import xgboost as xgb

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class EnergyPricePredictionModel:
    """Class for predicting energy prices at different time horizons"""
    
    def __init__(
        self,
        model_type: str = 'gradient_boosting',
        prediction_horizon: int = 24,  # hours
        model_version: str = 'v1',
        region: Optional[str] = None
    ):
        """
        Initialize the energy price prediction model
        
        Args:
            model_type: Type of model to use ('random_forest', 'gradient_boosting', 'elastic_net', 'xgboost')
            prediction_horizon: Hours ahead to predict prices for
            model_version: Version identifier for the model
            region: Region/market for which this model is trained
        """
        self.model_type = model_type
        self.prediction_horizon = prediction_horizon
        self.model_version = model_version
        self.region = region
        self.model = None
        self.feature_importance = None
        self.preprocessing_pipeline = None
        self.metadata = {
            'created_at': datetime.now().isoformat(),
            'model_type': model_type,
            'prediction_horizon': prediction_horizon,
            'model_version': model_version,
            'region': region,
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
        elif self.model_type == 'xgboost':
            self.model = xgb.XGBRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                colsample_bytree=0.8,
                subsample=0.8,
                random_state=42
            )
        elif self.model_type == 'elastic_net':
            self.model = ElasticNet(
                alpha=0.1,
                l1_ratio=0.5,
                max_iter=1000,
                random_state=42
            )
        elif self.model_type == 'hist_gradient_boosting':
            self.model = HistGradientBoostingRegressor(
                max_iter=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def prepare_features(
        self,
        price_data: pd.DataFrame,
        weather_data: Optional[pd.DataFrame] = None,
        grid_data: Optional[pd.DataFrame] = None,
        target_col: str = 'energy_price'
    ) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """
        Prepare features for energy price prediction
        
        Args:
            price_data: DataFrame with historical price data
            weather_data: Optional DataFrame with weather data
            grid_data: Optional DataFrame with grid data
            target_col: Name of the target column (energy price)
            
        Returns:
            Tuple of (features DataFrame, target Series if available)
        """
        # Ensure price_data has required columns
        required_cols = ['timestamp', target_col]
        if not all(col in price_data.columns for col in required_cols):
            raise ValueError(f"Missing required columns in price_data. Required: {required_cols}")
        
        # Create a copy to avoid modifying the input
        data = price_data.copy()
        
        # Convert timestamp to datetime if needed
        if not pd.api.types.is_datetime64_dtype(data['timestamp']):
            data['timestamp'] = pd.to_datetime(data['timestamp'])
        
        # Sort by timestamp
        data = data.sort_values('timestamp')
        
        # Extract time features
        data = extract_time_features(data, 'timestamp')
        
        # Create lagged price features (previous hours)
        for lag in [1, 2, 3, 6, 12, 24]:
            if lag < len(data):
                data[f'{target_col}_lag_{lag}h'] = data[target_col].shift(lag)
        
        # Create rolling statistics
        for window in [6, 12, 24, 168]:  # hours (last one is 1 week)
            if window < len(data):
                data[f'{target_col}_rolling_mean_{window}h'] = data[target_col].rolling(window=window).mean()
                data[f'{target_col}_rolling_std_{window}h'] = data[target_col].rolling(window=window).std()
                data[f'{target_col}_rolling_min_{window}h'] = data[target_col].rolling(window=window).min()
                data[f'{target_col}_rolling_max_{window}h'] = data[target_col].rolling(window=window).max()
        
        # Add day of week and hour features using one-hot encoding
        day_dummies = pd.get_dummies(data['day_of_week'], prefix='day')
        hour_dummies = pd.get_dummies(data['hour_of_day'], prefix='hour')
        data = pd.concat([data, day_dummies, hour_dummies], axis=1)
        
        # Add weather data if available
        if weather_data is not None:
            if 'timestamp' not in weather_data.columns:
                raise ValueError("Weather data must contain 'timestamp' column")
            
            # Ensure timestamp is datetime
            if not pd.api.types.is_datetime64_dtype(weather_data['timestamp']):
                weather_data['timestamp'] = pd.to_datetime(weather_data['timestamp'])
            
            # Merge weather data with price data
            weather_data = weather_data.sort_values('timestamp')
            data = pd.merge_asof(
                data,
                weather_data,
                on='timestamp',
                direction='nearest',
                tolerance=pd.Timedelta('1h')
            )
        
        # Add grid data if available
        if grid_data is not None:
            if 'timestamp' not in grid_data.columns:
                raise ValueError("Grid data must contain 'timestamp' column")
            
            # Ensure timestamp is datetime
            if not pd.api.types.is_datetime64_dtype(grid_data['timestamp']):
                grid_data['timestamp'] = pd.to_datetime(grid_data['timestamp'])
            
            # Merge grid data with price data
            grid_data = grid_data.sort_values('timestamp')
            data = pd.merge_asof(
                data,
                grid_data,
                on='timestamp',
                direction='nearest',
                tolerance=pd.Timedelta('1h')
            )
            
            # Create lagged grid features
            grid_cols = [col for col in grid_data.columns if col != 'timestamp']
            for col in grid_cols:
                if col in data.columns:
                    for lag in [1, 2, 3, 6]:
                        data[f'{col}_lag_{lag}h'] = data[col].shift(lag)
        
        # Create future target for prediction
        if self.prediction_horizon > 0:
            data[f'future_{target_col}_{self.prediction_horizon}h'] = data[target_col].shift(-self.prediction_horizon)
            y = data[f'future_{target_col}_{self.prediction_horizon}h']
        else:
            y = data[target_col] if target_col in data.columns else None
        
        # Drop rows with NaN in target
        if y is not None:
            data = data.dropna(subset=[y.name])
            y = y[~y.isna()]
        
        # Select features
        features = []
        
        # Time features
        features.extend(['hour_of_day', 'day_of_week', 'month', 'is_weekend',
                        'hour_sin', 'hour_cos', 'day_sin', 'day_cos', 'month_sin', 'month_cos'])
        
        # Lagged price features
        features.extend([f'{target_col}_lag_{lag}h' for lag in [1, 2, 3, 6, 12, 24]
                        if f'{target_col}_lag_{lag}h' in data.columns])
        
        # Rolling statistics
        for window in [6, 12, 24, 168]:
            for stat in ['mean', 'std', 'min', 'max']:
                feature = f'{target_col}_rolling_{stat}_{window}h'
                if feature in data.columns:
                    features.append(feature)
        
        # Add one-hot features
        features.extend([col for col in day_dummies.columns if col in data.columns])
        features.extend([col for col in hour_dummies.columns if col in data.columns])
        
        # Add weather features if available
        if weather_data is not None:
            weather_cols = [col for col in weather_data.columns if col != 'timestamp']
            features.extend([col for col in weather_cols if col in data.columns])
        
        # Add grid features if available
        if grid_data is not None:
            grid_cols = [col for col in grid_data.columns if col != 'timestamp']
            features.extend([col for col in grid_cols if col in data.columns])
            
            # Add lagged grid features
            for col in grid_cols:
                if col in data.columns:
                    features.extend([f'{col}_lag_{lag}h' for lag in [1, 2, 3, 6]
                                    if f'{col}_lag_{lag}h' in data.columns])
        
        # Filter to include only available features and drop NAs
        features = [f for f in features if f in data.columns]
        data = data[features].copy()
        
        # Handle missing values
        data = impute_missing_values(data, numeric_strategy='mean', categorical_strategy='mode')
        
        # Update metadata with features
        self.metadata['features'] = features
        
        return data, y
    
    def train(
        self,
        price_data: pd.DataFrame,
        weather_data: Optional[pd.DataFrame] = None,
        grid_data: Optional[pd.DataFrame] = None,
        target_col: str = 'energy_price',
        test_size: float = 0.2,
        perform_grid_search: bool = False
    ) -> Dict[str, Any]:
        """
        Train the energy price prediction model
        
        Args:
            price_data: DataFrame with historical price data
            weather_data: Optional DataFrame with weather data
            grid_data: Optional DataFrame with grid data
            target_col: Name of the target column (energy price)
            test_size: Fraction of data to use for testing
            perform_grid_search: Whether to perform grid search for hyperparameter tuning
            
        Returns:
            Dictionary with training results and metrics
        """
        logger.info(f"Training {self.model_type} model for energy price prediction "
                    f"with {self.prediction_horizon}h horizon")
        
        # Prepare features
        X, y = self.prepare_features(price_data, weather_data, grid_data, target_col)
        
        if X.empty or y.empty:
            raise ValueError("Empty feature set or target after preprocessing")
        
        # Create preprocessor
        self.preprocessing_pipeline = Pipeline([
            ('scaler', StandardScaler())
        ])
        
        # Define train/test split - use time series split for temporal data
        if test_size < 1:
            # Calculate the test set size in number of samples
            n_test = int(len(X) * test_size)
            
            # Regular train/test split - use this mainly for model validation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, shuffle=False
            )
        else:
            # Test size is a number of days
            n_days_test = test_size
            n_samples_per_day = 24  # Assuming hourly data
            n_test = int(n_days_test * n_samples_per_day)
            n_test = min(n_test, len(X) - 1)  # Ensure we have at least 1 training sample
            
            # Take the last n_test samples as test set
            X_train, X_test = X.iloc[:-n_test], X.iloc[-n_test:]
            y_train, y_test = y.iloc[:-n_test], y.iloc[-n_test:]
        
        logger.info(f"Training set size: {len(X_train)}, Test set size: {len(X_test)}")
        
        # Scale training data
        X_train_scaled = self.preprocessing_pipeline.fit_transform(X_train)
        
        # Perform grid search if requested
        if perform_grid_search:
            logger.info("Performing grid search for hyperparameter tuning")
            
            if self.model_type == 'random_forest':
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [10, 20, 30],
                    'min_samples_split': [2, 5, 10]
                }
            elif self.model_type == 'gradient_boosting':
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7]
                }
            elif self.model_type == 'xgboost':
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7],
                    'colsample_bytree': [0.6, 0.8, 1.0]
                }
            elif self.model_type == 'elastic_net':
                param_grid = {
                    'alpha': [0.01, 0.1, 0.5, 1.0],
                    'l1_ratio': [0.1, 0.5, 0.7, 0.9]
                }
            elif self.model_type == 'hist_gradient_boosting':
                param_grid = {
                    'max_iter': [50, 100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7]
                }
            
            # Use time series cross-validation
            tscv = TimeSeriesSplit(n_splits=5)
            
            grid_search = GridSearchCV(
                self.model,
                param_grid,
                cv=tscv,
                scoring='neg_mean_squared_error',
                n_jobs=-1
            )
            
            grid_search.fit(X_train_scaled, y_train)
            self.model = grid_search.best_estimator_
            
            # Update metadata with best parameters
            self.metadata['hyperparameters'] = grid_search.best_params_
            logger.info(f"Best hyperparameters: {grid_search.best_params_}")
        else:
            # Train with default hyperparameters
            self.model.fit(X_train_scaled, y_train)
            
            # Update metadata with model parameters
            self.metadata['hyperparameters'] = self.model.get_params()
        
        # Scale test data
        X_test_scaled = self.preprocessing_pipeline.transform(X_test)
        
        # Make predictions
        y_pred = self.model.predict(X_test_scaled)
        
        # Calculate metrics
        metrics = {
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred),
            'mape': mean_absolute_percentage_error(y_test, y_pred) * 100,  # in percent
            'test_size': len(y_test),
            'train_size': len(y_train)
        }
        
        # Log metrics
        logger.info(f"Model training complete. "
                    f"Test RMSE: {metrics['rmse']:.4f}, "
                    f"MAE: {metrics['mae']:.4f}, "
                    f"MAPE: {metrics['mape']:.2f}%, "
                    f"R²: {metrics['r2']:.4f}")
        
        # Update metadata
        self.metadata['performance_metrics'] = metrics
        
        # Extract feature importance
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = dict(zip(X.columns, self.model.feature_importances_))
            self.metadata['feature_importance'] = dict(sorted(
                self.feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            ))
        
        return {
            'model': self.model,
            'metrics': metrics,
            'feature_importance': self.feature_importance
        }
    
    def predict(
        self,
        price_data: pd.DataFrame,
        weather_data: Optional[pd.DataFrame] = None,
        grid_data: Optional[pd.DataFrame] = None,
        target_col: str = 'energy_price'
    ) -> pd.DataFrame:
        """
        Predict future energy prices
        
        Args:
            price_data: DataFrame with recent price data
            weather_data: Optional DataFrame with weather forecast data
            grid_data: Optional DataFrame with grid forecast data
            target_col: Name of the energy price column
            
        Returns:
            DataFrame with predicted prices
        """
        if self.model is None or self.preprocessing_pipeline is None:
            raise ValueError("Model has not been trained yet")
        
        # Prepare features (without target)
        X, _ = self.prepare_features(price_data, weather_data, grid_data, target_col)
        
        # Scale features
        X_scaled = self.preprocessing_pipeline.transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        
        # Create result DataFrame
        result = price_data[['timestamp']].copy()
        result['predicted_price'] = predictions
        
        # Add future timestamps based on prediction horizon
        if self.prediction_horizon > 0:
            result['forecast_timestamp'] = result['timestamp'] + pd.Timedelta(hours=self.prediction_horizon)
        
        return result
    
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
        
        # Save model, preprocessing pipeline, and metadata
        joblib.dump({
            'model': self.model,
            'preprocessing_pipeline': self.preprocessing_pipeline,
            'metadata': self.metadata,
            'feature_importance': self.feature_importance
        }, filepath)
        
        logger.info(f"Model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str) -> 'EnergyPricePredictionModel':
        """
        Load a trained model from file
        
        Args:
            filepath: Path to load the model from
            
        Returns:
            Loaded EnergyPricePredictionModel instance
        """
        # Load model data
        data = joblib.load(filepath)
        
        # Extract metadata
        metadata = data['metadata']
        
        # Create instance with same parameters
        instance = cls(
            model_type=metadata['model_type'],
            prediction_horizon=metadata['prediction_horizon'],
            model_version=metadata['model_version'],
            region=metadata.get('region')
        )
        
        # Set model, preprocessing pipeline, and metadata
        instance.model = data['model']
        instance.preprocessing_pipeline = data['preprocessing_pipeline']
        instance.metadata = metadata
        instance.feature_importance = data.get('feature_importance')
        
        logger.info(f"Model loaded from {filepath}")
        return instance


def load_data(
    price_data_path: str,
    weather_data_path: Optional[str] = None,
    grid_data_path: Optional[str] = None
) -> Tuple[pd.DataFrame, Optional[pd.DataFrame], Optional[pd.DataFrame]]:
    """
    Load energy price, weather, and grid data
    
    Args:
        price_data_path: Path to price data file
        weather_data_path: Optional path to weather data file
        grid_data_path: Optional path to grid data file
        
    Returns:
        Tuple of (price_data, weather_data, grid_data)
    """
    # Helper function to load data based on file extension
    def load_file(file_path):
        if file_path is None:
            return None
            
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.csv':
            return pd.read_csv(file_path, parse_dates=['timestamp'])
        elif ext in ['.parquet', '.pq']:
            return pd.read_parquet(file_path)
        elif ext == '.json':
            return pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    # Load each dataset
    price_data = load_file(price_data_path)
    weather_data = load_file(weather_data_path)
    grid_data = load_file(grid_data_path)
    
    return price_data, weather_data, grid_data


def main():
    """Main function to train energy price prediction models"""
    parser = argparse.ArgumentParser(description='Train energy price prediction model')
    parser.add_argument('--price-data', type=str, required=True,
                        help='Path to the energy price data file')
    parser.add_argument('--weather-data', type=str, default=None,
                        help='Path to the weather forecast data file')
    parser.add_argument('--grid-data', type=str, default=None,
                        help='Path to the grid data file')
    parser.add_argument('--model-type', type=str, default='gradient_boosting',
                        choices=['random_forest', 'gradient_boosting', 'xgboost', 'elastic_net', 'hist_gradient_boosting'],
                        help='Type of model to train')
    parser.add_argument('--prediction-horizon', type=int, default=24,
                        help='Hours ahead to predict prices for')
    parser.add_argument('--output-dir', type=str, default='app/ml/models/energy_price',
                        help='Directory to save the trained model')
    parser.add_argument('--model-version', type=str, default=None,
                        help='Version identifier for the model (default: auto-generated)')
    parser.add_argument('--region', type=str, default=None,
                        help='Region/market for which to train the model')
    parser.add_argument('--grid-search', action='store_true',
                        help='Perform grid search for hyperparameter tuning')
    parser.add_argument('--test-size', type=float, default=0.2,
                        help='Fraction of data to use for testing')
    parser.add_argument('--target-col', type=str, default='energy_price',
                        help='Name of the energy price column in the data')
    
    args = parser.parse_args()
    
    # Generate model version if not provided
    if args.model_version is None:
        args.model_version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Load data
    logger.info(f"Loading price data from {args.price_data}")
    price_data, weather_data, grid_data = load_data(
        args.price_data, args.weather_data, args.grid_data
    )
    
    logger.info(f"Loaded {len(price_data)} price records")
    if weather_data is not None:
        logger.info(f"Loaded {len(weather_data)} weather records")
    if grid_data is not None:
        logger.info(f"Loaded {len(grid_data)} grid records")
    
    # Create model
    model = EnergyPricePredictionModel(
        model_type=args.model_type,
        prediction_horizon=args.prediction_horizon,
        model_version=args.model_version,
        region=args.region
    )
    
    # Train model
    training_results = model.train(
        price_data=price_data,
        weather_data=weather_data,
        grid_data=grid_data,
        target_col=args.target_col,
        test_size=args.test_size,
        perform_grid_search=args.grid_search
    )
    
    # Save model
    os.makedirs(args.output_dir, exist_ok=True)
    model_path = os.path.join(
        args.output_dir,
        f"price_prediction_{args.prediction_horizon}h_{args.model_type}_{args.model_version}.joblib"
    )
    model.save(model_path)
    
    logger.info(f"Model saved to {model_path}")
    logger.info(f"Training metrics: RMSE={training_results['metrics']['rmse']:.4f}, "
                f"MAE={training_results['metrics']['mae']:.4f}, "
                f"MAPE={training_results['metrics']['mape']:.2f}%, "
                f"R²={training_results['metrics']['r2']:.4f}")
    
    # Print feature importance if available
    if training_results['feature_importance']:
        logger.info("Top 10 important features:")
        sorted_features = sorted(
            training_results['feature_importance'].items(),
            key=lambda x: x[1],
            reverse=True
        )
        for feature, importance in sorted_features[:10]:
            logger.info(f"  {feature}: {importance:.4f}")


if __name__ == "__main__":
    main() 