"""
Multi-Task Learning Models

This module implements models that can simultaneously predict multiple related metrics
related to EV charging stations, sharing representations across tasks.
"""
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Optional, Any, Union, Tuple
from pathlib import Path
import joblib
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MultiTaskModel:
    """
    Base class for multi-task learning models
    
    Supports simultaneous prediction of multiple related metrics for EV charging stations.
    """
    
    def __init__(
        self,
        name: str,
        tasks: List[str],
        model_dir: str = 'app/ml/models/multitask'
    ):
        """
        Initialize multi-task model
        
        Args:
            name: Model name
            tasks: List of tasks to predict (e.g., ['demand', 'price', 'degradation'])
            model_dir: Directory to store models
        """
        self.name = name
        self.tasks = tasks
        self.model_dir = Path(model_dir)
        self.models = {}
        self.is_fitted = False
        self.feature_columns = None
        
        # Create model directory
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initialized MultiTaskModel with tasks: {tasks}")
    
    def fit(
        self, 
        data: pd.DataFrame,
        task_columns: Dict[str, str],
        feature_columns: List[str],
        **kwargs
    ) -> 'MultiTaskModel':
        """
        Fit separate models for each task
        
        Args:
            data: Training data
            task_columns: Dict mapping task names to column names in data
            feature_columns: List of feature column names
            **kwargs: Additional parameters
                
        Returns:
            Self for method chaining
        """
        from sklearn.ensemble import RandomForestRegressor
        
        # Validate task columns
        for task in self.tasks:
            if task not in task_columns:
                raise ValueError(f"Task '{task}' not found in task_columns")
            if task_columns[task] not in data.columns:
                raise ValueError(f"Column '{task_columns[task]}' for task '{task}' not found in data")
        
        self.feature_columns = feature_columns
        self.task_columns = task_columns
        
        # Fit a model for each task
        for task in self.tasks:
            logger.info(f"Fitting model for task: {task}")
            
            # Get task target
            target_col = task_columns[task]
            y = data[target_col].values
            
            # Get features
            X = data[feature_columns].values
            
            # Create and fit model
            model = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X, y)
            
            # Store model
            self.models[task] = model
        
        self.is_fitted = True
        logger.info(f"Fitted {len(self.tasks)} models")
        
        return self
    
    def predict(
        self,
        data: pd.DataFrame,
        tasks: Optional[List[str]] = None
    ) -> Dict[str, np.ndarray]:
        """
        Generate predictions for multiple tasks
        
        Args:
            data: Input data with feature columns
            tasks: Specific tasks to predict (if None, predict all tasks)
            
        Returns:
            Dictionary mapping task names to predictions
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        # Validate features
        missing_features = [f for f in self.feature_columns if f not in data.columns]
        if missing_features:
            raise ValueError(f"Missing features in input data: {missing_features}")
        
        # Get features
        X = data[self.feature_columns].values
        
        # Determine tasks to predict
        predict_tasks = tasks if tasks is not None else self.tasks
        
        # Generate predictions
        predictions = {}
        for task in predict_tasks:
            if task not in self.models:
                logger.warning(f"No model available for task: {task}")
                continue
            
            # Generate predictions
            predictions[task] = self.models[task].predict(X)
        
        return predictions
    
    def evaluate(
        self,
        data: pd.DataFrame,
        metrics: List[str] = ['mse', 'mae', 'rmse'],
        tasks: Optional[List[str]] = None
    ) -> Dict[str, Dict[str, float]]:
        """
        Evaluate model performance on test data
        
        Args:
            data: Test data
            metrics: List of metrics to compute
            tasks: Specific tasks to evaluate (if None, evaluate all tasks)
            
        Returns:
            Dictionary mapping tasks to metric values
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before evaluation")
        
        # Determine tasks to evaluate
        evaluate_tasks = tasks if tasks is not None else self.tasks
        
        # Get predictions
        predictions = self.predict(data, tasks=evaluate_tasks)
        
        # Calculate metrics
        results = {}
        for task in evaluate_tasks:
            if task not in predictions:
                continue
            
            target_col = self.task_columns[task]
            if target_col not in data.columns:
                logger.warning(f"Target column '{target_col}' for task '{task}' not found in data")
                continue
            
            y_true = data[target_col].values
            y_pred = predictions[task]
            
            # Calculate metrics
            task_metrics = {}
            
            for metric in metrics:
                if metric.lower() == 'mse':
                    task_metrics['mse'] = np.mean((y_true - y_pred) ** 2)
                elif metric.lower() == 'mae':
                    task_metrics['mae'] = np.mean(np.abs(y_true - y_pred))
                elif metric.lower() == 'rmse':
                    task_metrics['rmse'] = np.sqrt(np.mean((y_true - y_pred) ** 2))
                elif metric.lower() == 'mape':
                    # Avoid division by zero
                    idx = y_true != 0
                    if np.any(idx):
                        task_metrics['mape'] = np.mean(np.abs((y_true[idx] - y_pred[idx]) / y_true[idx])) * 100
                    else:
                        task_metrics['mape'] = np.nan
                elif metric.lower() == 'r2':
                    from sklearn.metrics import r2_score
                    task_metrics['r2'] = r2_score(y_true, y_pred)
            
            results[task] = task_metrics
        
        return results
    
    def feature_importance(self, task: str) -> Dict[str, float]:
        """
        Get feature importance for a specific task
        
        Args:
            task: Task name
            
        Returns:
            Dictionary mapping feature names to importance values
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before getting feature importance")
        
        if task not in self.models:
            raise ValueError(f"No model available for task: {task}")
        
        model = self.models[task]
        
        # Check if model has feature_importances_ attribute
        if not hasattr(model, 'feature_importances_'):
            logger.warning(f"Model for task '{task}' does not have feature importance")
            return {}
        
        # Create dictionary of feature importances
        importance = {}
        for i, feature in enumerate(self.feature_columns):
            importance[feature] = model.feature_importances_[i]
        
        return importance
    
    def plot_feature_importance(
        self,
        task: str,
        top_n: int = 10,
        figsize: Tuple[int, int] = (10, 6),
        save_path: Optional[str] = None
    ) -> None:
        """
        Plot feature importance for a specific task
        
        Args:
            task: Task name
            top_n: Number of top features to show
            figsize: Figure size
            save_path: Path to save the plot
        """
        importance = self.feature_importance(task)
        if not importance:
            return
        
        # Sort features by importance
        sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)
        
        # Take top N features
        top_features = sorted_features[:top_n]
        
        # Create plot
        plt.figure(figsize=figsize)
        
        # Plot feature importance
        features, values = zip(*top_features)
        plt.barh(features, values)
        
        plt.title(f"Feature Importance for {task}")
        plt.xlabel("Importance")
        plt.ylabel("Feature")
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
            logger.info(f"Saved feature importance plot to {save_path}")
        else:
            plt.show()
        
        plt.close()
    
    def save(self, filepath: Optional[str] = None) -> str:
        """
        Save the model to disk
        
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
        logger.info(f"Saved MultiTaskModel to {filepath}")
        
        return str(filepath)
    
    @classmethod
    def load(cls, filepath: str) -> 'MultiTaskModel':
        """
        Load a model from disk
        
        Args:
            filepath: Path to the saved model
            
        Returns:
            Loaded model
        """
        model = joblib.load(filepath)
        logger.info(f"Loaded MultiTaskModel from {filepath}")
        
        return model


class SharedRepresentationModel:
    """
    Multi-task model with shared representation across tasks
    
    Uses a neural network with shared layers for multiple prediction tasks.
    """
    
    def __init__(
        self,
        name: str,
        tasks: List[str],
        shared_layers: List[int] = [64, 32],
        task_specific_layers: List[int] = [16],
        model_dir: str = 'app/ml/models/multitask'
    ):
        """
        Initialize shared representation model
        
        Args:
            name: Model name
            tasks: List of tasks to predict
            shared_layers: List of hidden units in shared layers
            task_specific_layers: List of hidden units in task-specific layers
            model_dir: Directory to store models
        """
        self.name = name
        self.tasks = tasks
        self.shared_layers = shared_layers
        self.task_specific_layers = task_specific_layers
        self.model_dir = Path(model_dir)
        self.model = None
        self.is_fitted = False
        self.feature_columns = None
        self.task_columns = None
        self.scalers = {}
        
        # Create model directory
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initialized SharedRepresentationModel with tasks: {tasks}")
    
    def _build_model(self, input_shape: int) -> None:
        """
        Build neural network architecture
        
        Args:
            input_shape: Number of input features
        """
        try:
            import tensorflow as tf
            from tensorflow.keras.models import Model
            from tensorflow.keras.layers import Input, Dense, BatchNormalization, Dropout
            from tensorflow.keras.optimizers import Adam
        except ImportError:
            logger.error("TensorFlow is required for SharedRepresentationModel")
            raise ImportError("TensorFlow is required for SharedRepresentationModel")
        
        # Input layer
        inputs = Input(shape=(input_shape,), name="input")
        
        # Shared layers
        x = inputs
        for i, units in enumerate(self.shared_layers):
            x = Dense(units, activation='relu', name=f"shared_{i}")(x)
            x = BatchNormalization(name=f"batchnorm_{i}")(x)
            x = Dropout(0.2, name=f"dropout_{i}")(x)
        
        # Task-specific layers and outputs
        outputs = {}
        for task in self.tasks:
            task_x = x
            for i, units in enumerate(self.task_specific_layers):
                task_x = Dense(units, activation='relu', name=f"{task}_dense_{i}")(task_x)
            
            # Output layer for each task
            outputs[task] = Dense(1, name=f"{task}_output")(task_x)
        
        # Create model
        self.model = Model(inputs=inputs, outputs=outputs)
        
        # Compile model with appropriate loss functions
        losses = {task: 'mse' for task in self.tasks}
        
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss=losses
        )
        
        logger.info(f"Built neural network model with {len(self.shared_layers)} shared layers")
    
    def fit(
        self, 
        data: pd.DataFrame,
        task_columns: Dict[str, str],
        feature_columns: List[str],
        validation_split: float = 0.2,
        epochs: int = 100,
        batch_size: int = 32,
        **kwargs
    ) -> 'SharedRepresentationModel':
        """
        Fit shared representation model
        
        Args:
            data: Training data
            task_columns: Dict mapping task names to column names in data
            feature_columns: List of feature column names
            validation_split: Fraction of data to use for validation
            epochs: Number of training epochs
            batch_size: Batch size
            **kwargs: Additional parameters
                
        Returns:
            Self for method chaining
        """
        from sklearn.preprocessing import StandardScaler
        
        # Validate task columns
        for task in self.tasks:
            if task not in task_columns:
                raise ValueError(f"Task '{task}' not found in task_columns")
            if task_columns[task] not in data.columns:
                raise ValueError(f"Column '{task_columns[task]}' for task '{task}' not found in data")
        
        self.feature_columns = feature_columns
        self.task_columns = task_columns
        
        # Scale features
        X = data[feature_columns].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        self.scalers['features'] = scaler
        
        # Scale targets
        y_dict = {}
        for task in self.tasks:
            target_col = task_columns[task]
            y = data[target_col].values.reshape(-1, 1)
            
            # Scale target
            target_scaler = StandardScaler()
            y_scaled = target_scaler.fit_transform(y)
            self.scalers[task] = target_scaler
            
            y_dict[task] = y_scaled
        
        # Build model
        self._build_model(input_shape=len(feature_columns))
        
        # Set up early stopping
        from tensorflow.keras.callbacks import EarlyStopping
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train model
        history = self.model.fit(
            X_scaled,
            y_dict,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stopping],
            verbose=kwargs.get('verbose', 1)
        )
        
        self.is_fitted = True
        self.history = history
        
        logger.info(f"Fitted SharedRepresentationModel with {len(self.history.epoch)} epochs")
        
        return self
    
    def predict(
        self,
        data: pd.DataFrame,
        tasks: Optional[List[str]] = None,
        return_dataframe: bool = False
    ) -> Union[Dict[str, np.ndarray], pd.DataFrame]:
        """
        Generate predictions for multiple tasks
        
        Args:
            data: Input data with feature columns
            tasks: Specific tasks to predict (if None, predict all tasks)
            return_dataframe: Whether to return predictions as a DataFrame
            
        Returns:
            Dictionary mapping task names to predictions or DataFrame
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        # Validate features
        missing_features = [f for f in self.feature_columns if f not in data.columns]
        if missing_features:
            raise ValueError(f"Missing features in input data: {missing_features}")
        
        # Get features
        X = data[self.feature_columns].values
        
        # Scale features
        X_scaled = self.scalers['features'].transform(X)
        
        # Determine tasks to predict
        predict_tasks = tasks if tasks is not None else self.tasks
        
        # Generate predictions
        raw_predictions = self.model.predict(X_scaled)
        
        # Inverse transform predictions
        predictions = {}
        for task in predict_tasks:
            if task not in raw_predictions:
                logger.warning(f"No predictions available for task: {task}")
                continue
            
            # Inverse transform
            predictions[task] = self.scalers[task].inverse_transform(raw_predictions[task])
        
        # Return as DataFrame if requested
        if return_dataframe:
            pred_df = pd.DataFrame(index=data.index)
            for task, pred in predictions.items():
                pred_df[task] = pred.flatten()
            return pred_df
        
        # Otherwise, return dictionary with flattened arrays
        return {task: pred.flatten() for task, pred in predictions.items()}
    
    def evaluate(
        self,
        data: pd.DataFrame,
        metrics: List[str] = ['mse', 'mae', 'rmse'],
        tasks: Optional[List[str]] = None
    ) -> Dict[str, Dict[str, float]]:
        """
        Evaluate model performance on test data
        
        Args:
            data: Test data
            metrics: List of metrics to compute
            tasks: Specific tasks to evaluate (if None, evaluate all tasks)
            
        Returns:
            Dictionary mapping tasks to metric values
        """
        if not self.is_fitted:
            raise ValueError("Model must be fitted before evaluation")
        
        # Determine tasks to evaluate
        evaluate_tasks = tasks if tasks is not None else self.tasks
        
        # Get predictions
        predictions = self.predict(data, tasks=evaluate_tasks)
        
        # Calculate metrics
        results = {}
        for task in evaluate_tasks:
            if task not in predictions:
                continue
            
            target_col = self.task_columns[task]
            if target_col not in data.columns:
                logger.warning(f"Target column '{target_col}' for task '{task}' not found in data")
                continue
            
            y_true = data[target_col].values
            y_pred = predictions[task]
            
            # Calculate metrics
            task_metrics = {}
            
            for metric in metrics:
                if metric.lower() == 'mse':
                    task_metrics['mse'] = np.mean((y_true - y_pred) ** 2)
                elif metric.lower() == 'mae':
                    task_metrics['mae'] = np.mean(np.abs(y_true - y_pred))
                elif metric.lower() == 'rmse':
                    task_metrics['rmse'] = np.sqrt(np.mean((y_true - y_pred) ** 2))
                elif metric.lower() == 'mape':
                    # Avoid division by zero
                    idx = y_true != 0
                    if np.any(idx):
                        task_metrics['mape'] = np.mean(np.abs((y_true[idx] - y_pred[idx]) / y_true[idx])) * 100
                    else:
                        task_metrics['mape'] = np.nan
                elif metric.lower() == 'r2':
                    from sklearn.metrics import r2_score
                    task_metrics['r2'] = r2_score(y_true, y_pred)
            
            results[task] = task_metrics
        
        return results
    
    def plot_training_history(
        self,
        figsize: Tuple[int, int] = (12, 6),
        save_path: Optional[str] = None
    ) -> None:
        """
        Plot training history
        
        Args:
            figsize: Figure size
            save_path: Path to save the plot
        """
        if not hasattr(self, 'history'):
            logger.warning("No training history available")
            return
        
        # Create plot
        plt.figure(figsize=figsize)
        
        # Plot task losses
        for task in self.tasks:
            plt.plot(self.history.history[f"{task}_output_loss"], label=f"{task} Train")
            plt.plot(self.history.history[f"val_{task}_output_loss"], label=f"{task} Val", linestyle='--')
        
        plt.title("Training History")
        plt.xlabel("Epoch")
        plt.ylabel("Loss")
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        if save_path:
            plt.savefig(save_path)
            logger.info(f"Saved training history plot to {save_path}")
        else:
            plt.show()
        
        plt.close()
    
    def save(self, filepath: Optional[str] = None) -> str:
        """
        Save the model to disk
        
        Args:
            filepath: Path to save the model (if None, uses the default path)
            
        Returns:
            Path to the saved model directory
        """
        if filepath is None:
            filepath = self.model_dir / self.name
        else:
            filepath = Path(filepath)
        
        # Create directory if it doesn't exist
        filepath.mkdir(parents=True, exist_ok=True)
        
        # Save TensorFlow model
        self.model.save(filepath / "tf_model")
        
        # Save other attributes
        config = {
            'name': self.name,
            'tasks': self.tasks,
            'shared_layers': self.shared_layers,
            'task_specific_layers': self.task_specific_layers,
            'feature_columns': self.feature_columns,
            'task_columns': self.task_columns,
            'is_fitted': self.is_fitted
        }
        
        # Save config
        joblib.dump(config, filepath / "config.joblib")
        
        # Save scalers
        joblib.dump(self.scalers, filepath / "scalers.joblib")
        
        logger.info(f"Saved SharedRepresentationModel to {filepath}")
        
        return str(filepath)
    
    @classmethod
    def load(cls, filepath: str) -> 'SharedRepresentationModel':
        """
        Load a model from disk
        
        Args:
            filepath: Path to the saved model directory
            
        Returns:
            Loaded model
        """
        filepath = Path(filepath)
        
        # Load config
        config = joblib.load(filepath / "config.joblib")
        
        # Create model instance
        model = cls(
            name=config['name'],
            tasks=config['tasks'],
            shared_layers=config['shared_layers'],
            task_specific_layers=config['task_specific_layers']
        )
        
        # Load TensorFlow model
        from tensorflow.keras.models import load_model
        model.model = load_model(filepath / "tf_model")
        
        # Load other attributes
        model.feature_columns = config['feature_columns']
        model.task_columns = config['task_columns']
        model.is_fitted = config['is_fitted']
        
        # Load scalers
        model.scalers = joblib.load(filepath / "scalers.joblib")
        
        logger.info(f"Loaded SharedRepresentationModel from {filepath}")
        
        return model 