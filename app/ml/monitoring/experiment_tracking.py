"""
Experiment Tracking System

This module provides utilities for tracking machine learning experiments
using MLflow, including metrics, parameters, artifacts, and models.
"""
import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import mlflow
from mlflow.tracking import MlflowClient
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ExperimentTracker:
    """
    Tracks machine learning experiments using MLflow
    
    This class provides utilities for:
    1. Tracking model training runs
    2. Logging metrics, parameters, and artifacts
    3. Registering models in the model registry
    4. Comparing experiment runs
    5. Managing model deployment stages
    """
    
    def __init__(
        self,
        experiment_name: str,
        tracking_uri: Optional[str] = None,
        artifact_location: Optional[str] = None
    ):
        """
        Initialize the experiment tracker
        
        Args:
            experiment_name: Name of the experiment
            tracking_uri: URI for MLflow tracking server
            artifact_location: Location to store artifacts
        """
        self.experiment_name = experiment_name
        
        # Set tracking URI if provided
        if tracking_uri:
            mlflow.set_tracking_uri(tracking_uri)
        
        self.client = MlflowClient()
        
        # Get or create experiment
        experiment = mlflow.get_experiment_by_name(experiment_name)
        if experiment:
            self.experiment_id = experiment.experiment_id
        else:
            self.experiment_id = mlflow.create_experiment(
                experiment_name,
                artifact_location=artifact_location
            )
        
        logger.info(f"Initialized experiment tracker for: {experiment_name} (ID: {self.experiment_id})")
    
    def start_run(
        self,
        run_name: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Start a new tracking run
        
        Args:
            run_name: Optional name for the run
            tags: Optional dictionary of tags for the run
            
        Returns:
            Run ID of the created run
        """
        run = mlflow.start_run(
            experiment_id=self.experiment_id,
            run_name=run_name
        )
        
        # Log tags if provided
        if tags:
            for key, value in tags.items():
                mlflow.set_tag(key, value)
        
        logger.info(f"Started run: {run.info.run_id} ({run_name if run_name else 'unnamed'})")
        return run.info.run_id
    
    def end_run(self) -> None:
        """End the current tracking run"""
        mlflow.end_run()
        logger.info("Ended current run")
    
    def log_params(self, params: Dict[str, Any]) -> None:
        """
        Log parameters for the current run
        
        Args:
            params: Dictionary of parameter names and values
        """
        for key, value in params.items():
            # Convert non-string values to strings
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            mlflow.log_param(key, value)
    
    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None) -> None:
        """
        Log metrics for the current run
        
        Args:
            metrics: Dictionary of metric names and values
            step: Optional step value for the metrics
        """
        for key, value in metrics.items():
            mlflow.log_metric(key, value, step=step)
    
    def log_model(
        self,
        model: Any,
        artifact_path: str,
        conda_env: Optional[Dict[str, Any]] = None,
        registered_model_name: Optional[str] = None
    ) -> Optional[str]:
        """
        Log a model to the current run
        
        Args:
            model: Model object to log
            artifact_path: Path to save the model under
            conda_env: Optional conda environment for the model
            registered_model_name: Optional name to register the model with
            
        Returns:
            Model URI if registered, None otherwise
        """
        try:
            # Check model type and use appropriate mlflow flavor
            import sklearn
            if isinstance(model, sklearn.base.BaseEstimator):
                mlflow.sklearn.log_model(
                    model,
                    artifact_path,
                    conda_env=conda_env,
                    registered_model_name=registered_model_name
                )
                return f"runs:/{mlflow.active_run().info.run_id}/{artifact_path}"
            else:
                # Use generic pickle format
                mlflow.pyfunc.log_model(
                    artifact_path=artifact_path,
                    python_model=model,
                    conda_env=conda_env,
                    registered_model_name=registered_model_name
                )
                return f"runs:/{mlflow.active_run().info.run_id}/{artifact_path}"
        except Exception as e:
            logger.error(f"Error logging model: {str(e)}")
            # Try to log as a generic artifact
            model_path = f"/tmp/{artifact_path}"
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            import joblib
            joblib.dump(model, model_path)
            mlflow.log_artifact(model_path, artifact_path)
            return None
    
    def log_dataframe(self, df: pd.DataFrame, artifact_path: str) -> None:
        """
        Log a pandas DataFrame as an artifact
        
        Args:
            df: DataFrame to log
            artifact_path: Path to save the DataFrame under
        """
        # Save DataFrame to a temporary CSV file
        temp_path = f"/tmp/{artifact_path}"
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        df.to_csv(temp_path, index=False)
        
        # Log the file as an artifact
        mlflow.log_artifact(temp_path, os.path.dirname(artifact_path))
        
        # Clean up temporary file
        os.remove(temp_path)
    
    def register_model(
        self,
        model_uri: str,
        name: str,
        description: Optional[str] = None
    ) -> str:
        """
        Register a model in the model registry
        
        Args:
            model_uri: URI of the model to register
            name: Name to register the model with
            description: Optional description of the model
            
        Returns:
            Version of the registered model
        """
        result = mlflow.register_model(model_uri, name)
        version = result.version
        
        # Add description if provided
        if description:
            self.client.update_registered_model(
                name=name,
                description=description
            )
        
        logger.info(f"Registered model '{name}' as version {version}")
        return version
    
    def transition_model_stage(
        self,
        name: str,
        version: str,
        stage: str,
        archive_existing_versions: bool = False
    ) -> None:
        """
        Transition a model to a different stage
        
        Args:
            name: Name of the registered model
            version: Version of the model
            stage: Target stage (Staging, Production, Archived)
            archive_existing_versions: Whether to archive existing versions in the stage
        """
        self.client.transition_model_version_stage(
            name=name,
            version=version,
            stage=stage,
            archive_existing_versions=archive_existing_versions
        )
        
        logger.info(f"Transitioned model '{name}' version {version} to {stage}")
    
    def load_model(self, model_uri: str) -> Any:
        """
        Load a model from MLflow
        
        Args:
            model_uri: URI of the model to load
            
        Returns:
            Loaded model
        """
        return mlflow.pyfunc.load_model(model_uri)
    
    def get_best_run(self, metric_name: str, ascending: bool = False) -> Dict[str, Any]:
        """
        Get the best run for a specific metric
        
        Args:
            metric_name: Name of the metric to compare
            ascending: Whether smaller values are better
            
        Returns:
            Dictionary with the best run information
        """
        order = "ASC" if ascending else "DESC"
        runs = self.client.search_runs(
            experiment_ids=[self.experiment_id],
            filter_string="",
            order_by=[f"metrics.{metric_name} {order}"]
        )
        
        if not runs:
            return None
        
        best_run = runs[0]
        run_data = {
            "run_id": best_run.info.run_id,
            "metrics": best_run.data.metrics,
            "params": best_run.data.params,
            "start_time": best_run.info.start_time,
            "artifact_uri": best_run.info.artifact_uri
        }
        
        return run_data
    
    def compare_runs(
        self,
        run_ids: List[str],
        metric_names: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Compare multiple runs
        
        Args:
            run_ids: List of run IDs to compare
            metric_names: Optional list of metrics to compare
            
        Returns:
            DataFrame with run comparisons
        """
        runs_data = []
        
        for run_id in run_ids:
            run = self.client.get_run(run_id)
            
            # Extract metrics
            metrics = run.data.metrics
            if metric_names:
                metrics = {k: metrics[k] for k in metric_names if k in metrics}
            
            # Extract key parameters
            params = run.data.params
            
            runs_data.append({
                "run_id": run_id,
                "run_name": run.data.tags.get("mlflow.runName", "unnamed"),
                **{f"metric.{k}": v for k, v in metrics.items()},
                **{f"param.{k}": v for k, v in params.items()}
            })
        
        return pd.DataFrame(runs_data)
    
    def get_model_versions(self, model_name: str) -> List[Dict[str, Any]]:
        """
        Get all versions of a registered model
        
        Args:
            model_name: Name of the registered model
            
        Returns:
            List of dictionaries with version information
        """
        try:
            versions = self.client.get_latest_versions(model_name)
            
            result = []
            for v in versions:
                result.append({
                    "version": v.version,
                    "stage": v.current_stage,
                    "creation_timestamp": v.creation_timestamp,
                    "run_id": v.run_id,
                    "description": v.description,
                    "status": v.status
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting model versions: {str(e)}")
            return []


# Example usage
def main():
    """Example of using the experiment tracker"""
    # Initialize tracker
    tracker = ExperimentTracker(
        experiment_name="battery_health_prediction",
        tracking_uri="sqlite:///mlflow.db"
    )
    
    # Start a run
    run_id = tracker.start_run(
        run_name="random_forest_v1",
        tags={"model_type": "random_forest", "author": "data_science_team"}
    )
    
    # Log parameters
    tracker.log_params({
        "n_estimators": 100,
        "max_depth": 5,
        "random_state": 42,
        "features": ["battery_temp", "charge_cycles", "voltage", "current", "ambient_temp"]
    })
    
    # Train a dummy model
    from sklearn.ensemble import RandomForestRegressor
    X = np.random.rand(100, 5)
    y = 0.3 * X[:, 0] + 0.4 * X[:, 1] + 0.3 * X[:, 2] + 0.1 * np.random.rand(100)
    model = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    
    # Log metrics
    tracker.log_metrics({
        "rmse": 0.05,
        "r2": 0.95,
        "mae": 0.04
    })
    
    # Log model
    model_uri = tracker.log_model(
        model=model,
        artifact_path="models/random_forest",
        registered_model_name="battery_health_predictor"
    )
    
    # End the run
    tracker.end_run()
    
    # Get the best run
    best_run = tracker.get_best_run(metric_name="rmse", ascending=True)
    print(f"Best run: {best_run['run_id']}, RMSE: {best_run['metrics']['rmse']}")
    
    # Transition model to staging
    tracker.transition_model_stage(
        name="battery_health_predictor",
        version="1",
        stage="Staging"
    )


if __name__ == "__main__":
    main() 