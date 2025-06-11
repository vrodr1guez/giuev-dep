"""
Battery Degradation Model

This module implements machine learning models for battery health prediction
and degradation forecasting for electric vehicles.
"""
import os
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union, Any
import joblib
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import ElasticNet
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class BatteryDegradationModel:
    """Class for predicting battery degradation and health over time"""
    
    def __init__(
        self,
        model_type: str = 'gradient_boosting',
        chemistry_type: Optional[str] = None,
        model_version: str = 'v1'
    ):
        """
        Initialize the battery degradation model
        
        Args:
            model_type: Type of model to use ('random_forest', 'gradient_boosting', or 'elastic_net')
            chemistry_type: Battery chemistry type ('NMC', 'LFP', 'NCA', or None for generic)
            model_version: Version identifier for the model
        """
        self.model_type = model_type
        self.chemistry_type = chemistry_type
        self.model_version = model_version
        self.model = None
        self.feature_importance = None
        self.metadata = {
            'created_at': datetime.now().isoformat(),
            'model_type': model_type,
            'chemistry_type': chemistry_type,
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
        elif self.model_type == 'elastic_net':
            self.model = ElasticNet(
                alpha=0.5,
                l1_ratio=0.5,
                max_iter=1000,
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def preprocess_data(
        self,
        telemetry_data: pd.DataFrame,
        target_col: str = 'state_of_health',
        categorical_cols: Optional[List[str]] = None,
        numerical_cols: Optional[List[str]] = None
    ) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Preprocess telemetry data for model training/prediction
        
        Args:
            telemetry_data: DataFrame with telemetry data
            target_col: Name of the target column (State of Health)
            categorical_cols: List of categorical columns to one-hot encode
            numerical_cols: List of numerical columns to scale
            
        Returns:
            Tuple of (X features array, y target array, feature names list)
        """
        if categorical_cols is None:
            categorical_cols = ['vehicle_type', 'battery_chemistry', 'charging_level']
            # Filter to include only columns that exist in the dataframe
            categorical_cols = [col for col in categorical_cols if col in telemetry_data.columns]
        
        if numerical_cols is None:
            # Use all numeric columns except the target as features
            numerical_cols = telemetry_data.select_dtypes(include=np.number).columns.tolist()
            if target_col in numerical_cols:
                numerical_cols.remove(target_col)
        
        # Feature engineering specific to battery health
        for col in telemetry_data.columns:
            # Create charge cycle features if available
            if 'state_of_charge' in telemetry_data.columns:
                telemetry_data['soc_variance'] = telemetry_data.groupby('vehicle_id')['state_of_charge'].transform('var')
                telemetry_data['min_soc'] = telemetry_data.groupby('vehicle_id')['state_of_charge'].transform('min')
            
            # Create temperature features if available
            if 'battery_temp' in telemetry_data.columns:
                telemetry_data['temp_variance'] = telemetry_data.groupby('vehicle_id')['battery_temp'].transform('var')
                telemetry_data['max_temp'] = telemetry_data.groupby('vehicle_id')['battery_temp'].transform('max')
                
                # Flag extreme temperatures
                telemetry_data['extreme_temp'] = ((telemetry_data['battery_temp'] > 40) | 
                                                (telemetry_data['battery_temp'] < 0)).astype(int)
        
        # Define preprocessing pipelines
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_cols),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
            ],
            remainder='drop'  # Drop columns not specified
        )
        
        # Get feature names
        onehot_features = []
        if categorical_cols:
            # Get one-hot encoded feature names (depends on the data)
            encoder = OneHotEncoder(handle_unknown='ignore')
            encoder.fit(telemetry_data[categorical_cols])
            onehot_features = [
                f"{col}_{val}" for col, values in zip(categorical_cols, encoder.categories_)
                for val in values
            ]
        
        feature_names = numerical_cols + onehot_features
        
        # Prepare X and y
        X = telemetry_data[numerical_cols + categorical_cols].copy()
        y = telemetry_data[target_col].values if target_col in telemetry_data.columns else None
        
        # Apply preprocessing
        X_processed = preprocessor.fit_transform(X)
        
        return X_processed, y, feature_names
    
    def train(
        self,
        telemetry_data: pd.DataFrame,
        target_col: str = 'state_of_health',
        categorical_cols: Optional[List[str]] = None,
        numerical_cols: Optional[List[str]] = None,
        test_size: float = 0.2,
        perform_grid_search: bool = False
    ) -> Dict[str, Any]:
        """
        Train the battery degradation model
        
        Args:
            telemetry_data: DataFrame with telemetry data
            target_col: Name of the target column (State of Health)
            categorical_cols: List of categorical columns to one-hot encode
            numerical_cols: List of numerical columns to scale
            test_size: Fraction of data to use for testing
            perform_grid_search: Whether to perform grid search for hyperparameter tuning
            
        Returns:
            Dictionary with training results and metrics
        """
        logger.info(f"Training {self.model_type} model for battery degradation prediction")
        
        # Preprocess data
        X, y, feature_names = self.preprocess_data(
            telemetry_data,
            target_col,
            categorical_cols,
            numerical_cols
        )
        
        # Update metadata
        self.metadata['features'] = feature_names
        
        # Split data into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Perform grid search if requested
        if perform_grid_search:
            logger.info("Performing grid search for hyperparameter tuning")
            
            if self.model_type == 'random_forest':
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [10, 20, 30],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            elif self.model_type == 'gradient_boosting':
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7],
                    'min_samples_split': [2, 5, 10]
                }
            elif self.model_type == 'elastic_net':
                param_grid = {
                    'alpha': [0.1, 0.5, 1.0],
                    'l1_ratio': [0.1, 0.5, 0.9],
                    'max_iter': [500, 1000, 2000]
                }
            
            grid_search = GridSearchCV(
                self.model,
                param_grid,
                cv=5,
                scoring='neg_mean_squared_error',
                n_jobs=-1
            )
            
            grid_search.fit(X_train, y_train)
            self.model = grid_search.best_estimator_
            
            # Update metadata with best parameters
            self.metadata['hyperparameters'] = grid_search.best_params_
            logger.info(f"Best hyperparameters: {grid_search.best_params_}")
        else:
            # Train with default hyperparameters
            self.model.fit(X_train, y_train)
            
            # Update metadata with model parameters
            self.metadata['hyperparameters'] = self.model.get_params()
        
        # Make predictions on test set
        y_pred = self.model.predict(X_test)
        
        # Calculate and store metrics
        metrics = {
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred),
            'test_size': len(y_test),
            'train_size': len(y_train)
        }
        
        self.metadata['performance_metrics'] = metrics
        logger.info(f"Model training complete. Test RMSE: {metrics['rmse']:.4f}, R²: {metrics['r2']:.4f}")
        
        # Extract feature importance
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = dict(zip(feature_names, self.model.feature_importances_))
            self.metadata['feature_importance'] = self.feature_importance
        
        return {
            'model': self.model,
            'metrics': metrics,
            'feature_importance': self.feature_importance
        }
    
    def predict(
        self,
        telemetry_data: pd.DataFrame,
        categorical_cols: Optional[List[str]] = None,
        numerical_cols: Optional[List[str]] = None
    ) -> np.ndarray:
        """
        Predict battery health based on telemetry data
        
        Args:
            telemetry_data: DataFrame with telemetry data
            categorical_cols: List of categorical columns to one-hot encode
            numerical_cols: List of numerical columns to scale
            
        Returns:
            Array of predicted state of health values
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet")
        
        # Preprocess data (without target)
        X, _, _ = self.preprocess_data(
            telemetry_data,
            target_col=None,  # No target for prediction
            categorical_cols=categorical_cols,
            numerical_cols=numerical_cols
        )
        
        # Make predictions
        predictions = self.model.predict(X)
        
        return predictions
    
    def predict_future_health(
        self,
        vehicle_id: str,
        current_telemetry: pd.DataFrame,
        prediction_days: int = 365,
        categorical_cols: Optional[List[str]] = None,
        numerical_cols: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Predict future battery health over time
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            current_telemetry: Current telemetry data for the vehicle
            prediction_days: Number of days to predict into the future
            categorical_cols: List of categorical columns to one-hot encode
            numerical_cols: List of numerical columns to scale
            
        Returns:
            DataFrame with predicted state of health values over time
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet")
        
        # Filter telemetry data for the specific vehicle
        vehicle_data = current_telemetry[current_telemetry['vehicle_id'] == vehicle_id].copy()
        
        if len(vehicle_data) == 0:
            raise ValueError(f"No data found for vehicle ID: {vehicle_id}")
        
        # Get the most recent telemetry data
        latest_data = vehicle_data.sort_values('timestamp').iloc[-1].to_dict()
        
        # Create future dataframe with simulated usage
        future_dates = pd.date_range(
            start=pd.to_datetime(latest_data['timestamp']),
            periods=prediction_days + 1,  # Include today
            freq='D'
        )
        
        # Create a dataframe with projected future usage
        future_df = pd.DataFrame({
            'timestamp': future_dates,
            'vehicle_id': vehicle_id
        })
        
        # Add static vehicle properties
        for col in current_telemetry.columns:
            if col not in ['timestamp', 'vehicle_id', 'state_of_health', 'state_of_charge', 'odometer']:
                if col in latest_data:
                    future_df[col] = latest_data[col]
        
        # Simulate aging factors
        # - Increase in cycle count
        if 'charge_cycles' in latest_data:
            # Assume average cycles per day based on historical data
            avg_cycles_per_day = vehicle_data['charge_cycles'].diff().mean() or 0.5  # Default if not available
            future_df['charge_cycles'] = latest_data['charge_cycles'] + \
                                         np.arange(len(future_df)) * avg_cycles_per_day
        
        # - Odometer progression
        if 'odometer' in latest_data:
            # Assume average miles per day based on historical data
            avg_miles_per_day = vehicle_data['odometer'].diff().mean() or 30  # Default if not available
            future_df['odometer'] = latest_data['odometer'] + \
                                   np.arange(len(future_df)) * avg_miles_per_day
        
        # Make predictions for future timepoints
        future_health = self.predict(future_df, categorical_cols, numerical_cols)
        
        # Add predictions to the future dataframe
        future_df['predicted_soh'] = future_health
        
        # Include confidence intervals (if supported by model)
        if hasattr(self.model, 'predict_interval'):
            lower, upper = self.model.predict_interval(future_df[self.metadata['features']], alpha=0.95)
            future_df['soh_lower_bound'] = lower
            future_df['soh_upper_bound'] = upper
        
        return future_df[['timestamp', 'predicted_soh', 'odometer']].copy()
    
    def get_replacement_date(
        self,
        vehicle_id: str,
        current_telemetry: pd.DataFrame,
        soh_threshold: float = 0.7,
        max_prediction_days: int = 1825,  # 5 years
        categorical_cols: Optional[List[str]] = None,
        numerical_cols: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Predict when battery will need replacement
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            current_telemetry: Current telemetry data for the vehicle
            soh_threshold: State of Health threshold for replacement
            max_prediction_days: Maximum number of days to predict
            categorical_cols: List of categorical columns to one-hot encode
            numerical_cols: List of numerical columns to scale
            
        Returns:
            Dictionary with replacement date information
        """
        # Get future health predictions
        future_health = self.predict_future_health(
            vehicle_id,
            current_telemetry,
            prediction_days=max_prediction_days,
            categorical_cols=categorical_cols,
            numerical_cols=numerical_cols
        )
        
        # Find when SoH drops below threshold
        below_threshold = future_health[future_health['predicted_soh'] < soh_threshold]
        
        if len(below_threshold) > 0:
            # Get the first date below threshold
            replacement_date = below_threshold.iloc[0]['timestamp']
            days_until_replacement = (replacement_date - pd.Timestamp.now()).days
            
            return {
                'vehicle_id': vehicle_id,
                'current_soh': future_health.iloc[0]['predicted_soh'],
                'replacement_date': replacement_date.strftime('%Y-%m-%d'),
                'days_until_replacement': days_until_replacement,
                'predicted_odometer_at_replacement': below_threshold.iloc[0]['odometer'],
                'soh_at_replacement': below_threshold.iloc[0]['predicted_soh']
            }
        else:
            # Battery will not reach threshold within prediction window
            return {
                'vehicle_id': vehicle_id,
                'current_soh': future_health.iloc[0]['predicted_soh'],
                'replacement_date': None,
                'days_until_replacement': None,
                'message': f"Battery SoH will not reach {soh_threshold} within the next {max_prediction_days} days"
            }
    
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
    def load(cls, filepath: str) -> 'BatteryDegradationModel':
        """
        Load a trained model from file
        
        Args:
            filepath: Path to load the model from
            
        Returns:
            Loaded BatteryDegradationModel instance
        """
        # Load model data
        data = joblib.load(filepath)
        
        # Extract metadata
        metadata = data['metadata']
        
        # Create instance with same parameters
        instance = cls(
            model_type=metadata['model_type'],
            chemistry_type=metadata['chemistry_type'],
            model_version=metadata['model_version']
        )
        
        # Set model and metadata
        instance.model = data['model']
        instance.metadata = metadata
        instance.feature_importance = data.get('feature_importance')
        
        logger.info(f"Model loaded from {filepath}")
        return instance 