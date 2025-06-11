"""
Battery Health Ensemble Model

This module implements ensemble methods for battery health prediction,
combining multiple models to achieve higher accuracy and robustness.
"""
import os
import sys
import logging
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union, Any
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.ml.models.battery_health.battery_degradation_model import BatteryDegradationModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class BatteryEnsembleModel:
    """
    Ensemble model that combines predictions from multiple battery health models
    
    This class implements various ensemble strategies such as averaging, weighted averaging,
    stacking, and boosting to improve prediction accuracy and robustness.
    """
    
    def __init__(
        self,
        model_paths: Optional[List[str]] = None,
        ensemble_method: str = "weighted_average",
        weights: Optional[List[float]] = None,
        model_version: str = "ensemble_v1"
    ):
        """
        Initialize the battery ensemble model
        
        Args:
            model_paths: List of paths to trained model files
            ensemble_method: Ensemble method to use ('average', 'weighted_average', 'stacking', 'boosting')
            weights: Weights for weighted averaging (must match length of model_paths)
            model_version: Version identifier for the ensemble model
        """
        self.ensemble_method = ensemble_method
        self.model_version = model_version
        self.models = []
        self.weights = weights
        self.meta_model = None
        
        # Load models from paths if provided
        if model_paths:
            self.load_models(model_paths)
            
            # Initialize weights if not provided
            if self.weights is None and self.ensemble_method == "weighted_average":
                self.weights = [1.0 / len(self.models)] * len(self.models)
        
        # Metadata for the ensemble model
        self.metadata = {
            "created_at": datetime.now().isoformat(),
            "ensemble_method": ensemble_method,
            "model_version": model_version,
            "base_models_count": len(self.models),
            "weights": self.weights,
            "performance_metrics": {}
        }
    
    def load_models(self, model_paths: List[str]) -> None:
        """
        Load base models from file paths
        
        Args:
            model_paths: List of paths to trained model files
        """
        self.models = []
        
        for path in model_paths:
            try:
                model = BatteryDegradationModel.load(path)
                self.models.append(model)
                logger.info(f"Loaded model from {path}")
            except Exception as e:
                logger.error(f"Error loading model from {path}: {str(e)}")
        
        # Update metadata
        self.metadata["base_models_count"] = len(self.models)
        
        if len(self.models) == 0:
            logger.warning("No models were loaded successfully")
    
    def predict(self, telemetry_data: pd.DataFrame) -> np.ndarray:
        """
        Make ensemble predictions
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            
        Returns:
            Array of ensemble predictions
        """
        if not self.models:
            raise ValueError("No base models available for prediction")
        
        # Get predictions from all base models
        predictions = []
        for model in self.models:
            model_pred = model.predict(telemetry_data)
            predictions.append(model_pred)
        
        # Stack predictions
        stacked_preds = np.column_stack(predictions)
        
        # Apply ensemble method
        if self.ensemble_method == "average":
            return np.mean(stacked_preds, axis=1)
            
        elif self.ensemble_method == "weighted_average":
            if not self.weights or len(self.weights) != len(self.models):
                self.weights = [1.0 / len(self.models)] * len(self.models)
            
            return np.average(stacked_preds, axis=1, weights=self.weights)
            
        elif self.ensemble_method == "stacking":
            if self.meta_model is None:
                raise ValueError("Meta-model not trained. Call train_stacking() first")
            
            return self.meta_model.predict(stacked_preds)
            
        elif self.ensemble_method == "boosting":
            # For now, just return weighted average as boosting requires training
            return np.average(stacked_preds, axis=1, weights=self.weights or [1.0 / len(self.models)] * len(self.models))
        
        else:
            raise ValueError(f"Unsupported ensemble method: {self.ensemble_method}")
    
    def train_stacking(self, telemetry_data: pd.DataFrame, actual_values: np.ndarray) -> None:
        """
        Train a meta-model for stacking ensemble
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            actual_values: Array of actual SOH values
        """
        if not self.models:
            raise ValueError("No base models available for training stacking")
        
        from sklearn.linear_model import Ridge
        
        # Get predictions from all base models
        predictions = []
        for model in self.models:
            model_pred = model.predict(telemetry_data)
            predictions.append(model_pred)
        
        # Stack predictions as features for meta-model
        X_meta = np.column_stack(predictions)
        
        # Create and train meta-model
        self.meta_model = Ridge(alpha=1.0)
        self.meta_model.fit(X_meta, actual_values)
        
        logger.info("Trained stacking meta-model")
        
        # Update metadata
        self.metadata["stacking_meta_model"] = "Ridge"
        self.metadata["ensemble_method"] = "stacking"
    
    def optimize_weights(self, telemetry_data: pd.DataFrame, actual_values: np.ndarray) -> None:
        """
        Optimize weights for weighted averaging
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            actual_values: Array of actual SOH values
        """
        if not self.models:
            raise ValueError("No base models available for weight optimization")
        
        from scipy.optimize import minimize
        
        # Get predictions from all base models
        predictions = []
        for model in self.models:
            model_pred = model.predict(telemetry_data)
            predictions.append(model_pred)
        
        # Stack predictions
        stacked_preds = np.column_stack(predictions)
        
        # Define objective function to minimize (MSE)
        def objective(weights):
            # Normalize weights to sum to 1
            weights = weights / np.sum(weights)
            
            # Get weighted predictions
            weighted_pred = np.sum(stacked_preds * weights.reshape(1, -1), axis=1)
            
            # Calculate MSE
            mse = np.mean((weighted_pred - actual_values) ** 2)
            return mse
        
        # Initial weights (equal weighting)
        initial_weights = np.ones(len(self.models)) / len(self.models)
        
        # Constraint: weights sum to 1
        constraint = {'type': 'eq', 'fun': lambda w: np.sum(w) - 1}
        
        # Bounds: weights between 0 and 1
        bounds = [(0, 1) for _ in range(len(self.models))]
        
        # Optimize
        result = minimize(
            objective,
            initial_weights,
            method='SLSQP',
            bounds=bounds,
            constraints=constraint
        )
        
        # Normalize weights
        optimized_weights = result.x / np.sum(result.x)
        
        logger.info(f"Optimized weights: {optimized_weights}")
        
        # Update weights
        self.weights = optimized_weights.tolist()
        self.ensemble_method = "weighted_average"
        
        # Update metadata
        self.metadata["ensemble_method"] = "weighted_average"
        self.metadata["weights"] = self.weights
    
    def evaluate(
        self,
        telemetry_data: pd.DataFrame,
        actual_values: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate the ensemble model performance
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            actual_values: Array of actual SOH values
            
        Returns:
            Dictionary with performance metrics
        """
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        
        predictions = self.predict(telemetry_data)
        
        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(actual_values, predictions))
        mae = mean_absolute_error(actual_values, predictions)
        r2 = r2_score(actual_values, predictions)
        
        # Store metrics in metadata
        self.metadata["performance_metrics"] = {
            "rmse": float(rmse),
            "mae": float(mae),
            "r2": float(r2)
        }
        
        return self.metadata["performance_metrics"]
    
    def compare_with_base_models(
        self,
        telemetry_data: pd.DataFrame,
        actual_values: np.ndarray
    ) -> Dict[str, Dict[str, float]]:
        """
        Compare ensemble performance with base models
        
        Args:
            telemetry_data: DataFrame with battery telemetry data
            actual_values: Array of actual SOH values
            
        Returns:
            Dictionary with performance metrics for all models
        """
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        
        results = {}
        
        # Evaluate base models
        for i, model in enumerate(self.models):
            model_pred = model.predict(telemetry_data)
            
            rmse = np.sqrt(mean_squared_error(actual_values, model_pred))
            mae = mean_absolute_error(actual_values, model_pred)
            r2 = r2_score(actual_values, model_pred)
            
            results[f"base_model_{i+1}"] = {
                "rmse": float(rmse),
                "mae": float(mae),
                "r2": float(r2)
            }
        
        # Evaluate ensemble
        ensemble_metrics = self.evaluate(telemetry_data, actual_values)
        results["ensemble"] = ensemble_metrics
        
        return results
    
    def predict_future_health(
        self,
        vehicle_id: str,
        current_telemetry: pd.DataFrame,
        prediction_days: int = 365
    ) -> pd.DataFrame:
        """
        Predict future battery health over time
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            current_telemetry: Current telemetry data for the vehicle
            prediction_days: Number of days to predict into the future
            
        Returns:
            DataFrame with predicted state of health values over time
        """
        if not self.models:
            raise ValueError("No base models available for prediction")
        
        # Get future predictions from all base models
        future_dfs = []
        for model in self.models:
            future_df = model.predict_future_health(
                vehicle_id=vehicle_id,
                current_telemetry=current_telemetry,
                prediction_days=prediction_days
            )
            future_dfs.append(future_df)
        
        # Combine predictions based on ensemble method
        if self.ensemble_method in ["average", "weighted_average"]:
            # Create a template DataFrame with timestamps
            result_df = pd.DataFrame({
                "timestamp": future_dfs[0]["timestamp"],
                "odometer": future_dfs[0]["odometer"]
            })
            
            # Get SOH predictions
            soh_predictions = []
            for i, df in enumerate(future_dfs):
                soh_predictions.append(df["predicted_soh"].values)
            
            # Stack predictions
            stacked_preds = np.column_stack(soh_predictions)
            
            # Apply ensemble method
            if self.ensemble_method == "average":
                result_df["predicted_soh"] = np.mean(stacked_preds, axis=1)
            else:  # weighted_average
                if not self.weights or len(self.weights) != len(self.models):
                    self.weights = [1.0 / len(self.models)] * len(self.models)
                
                result_df["predicted_soh"] = np.average(stacked_preds, axis=1, weights=self.weights)
            
            return result_df
        
        elif self.ensemble_method == "stacking":
            # Not supported for time series - use first model as fallback
            logger.warning("Stacking not supported for future predictions. Using first base model.")
            return future_dfs[0]
        
        elif self.ensemble_method == "boosting":
            # Not supported for time series - use weighted average
            logger.warning("Boosting not supported for future predictions. Using weighted average.")
            
            # Create a template DataFrame with timestamps
            result_df = pd.DataFrame({
                "timestamp": future_dfs[0]["timestamp"],
                "odometer": future_dfs[0]["odometer"]
            })
            
            # Get SOH predictions
            soh_predictions = []
            for i, df in enumerate(future_dfs):
                soh_predictions.append(df["predicted_soh"].values)
            
            # Stack predictions
            stacked_preds = np.column_stack(soh_predictions)
            
            # Use weighted average
            weights = self.weights or [1.0 / len(self.models)] * len(self.models)
            result_df["predicted_soh"] = np.average(stacked_preds, axis=1, weights=weights)
            
            return result_df
    
    def get_replacement_date(
        self,
        vehicle_id: str,
        current_telemetry: pd.DataFrame,
        soh_threshold: float = 0.7,
        max_prediction_days: int = 1825
    ) -> Dict[str, Any]:
        """
        Predict when battery will need replacement
        
        Args:
            vehicle_id: ID of the vehicle to predict for
            current_telemetry: Current telemetry data for the vehicle
            soh_threshold: State of Health threshold for replacement
            max_prediction_days: Maximum number of days to predict
            
        Returns:
            Dictionary with replacement date information
        """
        # Get future health predictions
        future_health = self.predict_future_health(
            vehicle_id=vehicle_id,
            current_telemetry=current_telemetry,
            prediction_days=max_prediction_days
        )
        
        # Find when SOH drops below threshold
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
        Save the ensemble model to file
        
        Args:
            filepath: Path to save the model to
        """
        if not self.models:
            raise ValueError("No base models available to save")
        
        # Update metadata
        self.metadata["saved_at"] = datetime.now().isoformat()
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # For Meta-model in stacking
        meta_model_path = None
        if self.meta_model is not None:
            meta_model_path = filepath.replace(".joblib", "_meta_model.joblib")
            joblib.dump(self.meta_model, meta_model_path)
        
        # Save ensemble metadata and parameters
        ensemble_data = {
            "ensemble_method": self.ensemble_method,
            "weights": self.weights,
            "metadata": self.metadata,
            "meta_model_path": meta_model_path
        }
        
        joblib.dump(ensemble_data, filepath)
        
        logger.info(f"Ensemble model saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str, model_paths: List[str] = None) -> 'BatteryEnsembleModel':
        """
        Load an ensemble model from file
        
        Args:
            filepath: Path to load the ensemble model from
            model_paths: Optional list of paths to base models
            
        Returns:
            Loaded BatteryEnsembleModel instance
        """
        # Load ensemble data
        ensemble_data = joblib.load(filepath)
        
        # Create instance
        instance = cls(
            model_paths=model_paths,  # Load the models fresh if paths are provided
            ensemble_method=ensemble_data["ensemble_method"],
            weights=ensemble_data["weights"],
            model_version=ensemble_data["metadata"].get("model_version", "ensemble_v1")
        )
        
        # Load meta-model if exists
        if ensemble_data.get("meta_model_path") and os.path.exists(ensemble_data["meta_model_path"]):
            instance.meta_model = joblib.load(ensemble_data["meta_model_path"])
        
        # Update metadata
        instance.metadata = ensemble_data["metadata"]
        
        logger.info(f"Ensemble model loaded from {filepath}")
        return instance


# Example usage
def main():
    """Example usage of the battery ensemble model"""
    from sklearn.datasets import make_regression
    
    # Create sample model paths (would be real paths in practice)
    model_dir = "app/ml/models/battery_health"
    model_paths = [
        os.path.join(model_dir, "model1.joblib"),
        os.path.join(model_dir, "model2.joblib"),
        os.path.join(model_dir, "model3.joblib")
    ]
    
    # For demonstration, create dummy models
    os.makedirs(model_dir, exist_ok=True)
    
    # Create synthetic data for demonstration
    X, y = make_regression(n_samples=100, n_features=5, noise=0.1, random_state=42)
    df = pd.DataFrame(X, columns=[f"feature_{i}" for i in range(5)])
    df["vehicle_id"] = "test_vehicle"
    df["state_of_health"] = y + 85  # Center around 85% SOH
    
    # Create and save dummy models with different parameters
    for i, path in enumerate(model_paths):
        if not os.path.exists(path):
            model = BatteryDegradationModel(
                model_type=["random_forest", "gradient_boosting", "elastic_net"][i % 3],
                model_version=f"test_v{i+1}"
            )
            
            # Train with different subsets
            model.train(df.sample(frac=0.8, random_state=i))
            model.save(path)
            print(f"Created dummy model at {path}")
    
    # Create ensemble model
    ensemble = BatteryEnsembleModel(
        model_paths=model_paths,
        ensemble_method="weighted_average"
    )
    
    # Optimize weights
    ensemble.optimize_weights(df, df["state_of_health"].values)
    
    # Compare performance
    comparison = ensemble.compare_with_base_models(df, df["state_of_health"].values)
    print("\nPerformance comparison:")
    for model_name, metrics in comparison.items():
        print(f"{model_name}: RMSE={metrics['rmse']:.4f}, MAE={metrics['mae']:.4f}, R²={metrics['r2']:.4f}")
    
    # Save ensemble model
    ensemble_path = os.path.join(model_dir, "ensemble_model.joblib")
    ensemble.save(ensemble_path)
    print(f"\nEnsemble model saved to {ensemble_path}")
    
    # Load and use ensemble model
    loaded_ensemble = BatteryEnsembleModel.load(ensemble_path, model_paths)
    predictions = loaded_ensemble.predict(df)
    print(f"\nLoaded ensemble predictions: {predictions[:5]}")


if __name__ == "__main__":
    main() 