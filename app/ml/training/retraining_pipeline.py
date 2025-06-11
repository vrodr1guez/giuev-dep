"""
Automated Model Retraining Pipeline

This module provides a framework for automatically retraining ML models
with data validation, performance checks, and deployment controls.
"""
import os
import sys
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Callable
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import joblib

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.ml.monitoring.experiment_tracking import ExperimentTracker
from app.ml.data_pipeline.data_versioning import DataVersioningManager

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ModelRetrainingPipeline:
    """
    Pipeline for automated model retraining with validation
    
    This class provides utilities for:
    1. Assessing when models need retraining
    2. Building training datasets from versioned data
    3. Training models with hyperparameter optimization
    4. Validating model performance against thresholds
    5. Deploying models to production with proper controls
    """
    
    def __init__(
        self,
        model_name: str,
        model_type: str,
        data_manager: DataVersioningManager,
        experiment_tracker: ExperimentTracker,
        model_builder: Callable,
        performance_metrics: List[str] = None,
        validation_thresholds: Dict[str, float] = None,
        notification_callbacks: List[Callable] = None,
        retrain_frequency_days: int = 30,
        data_drift_threshold: float = 0.2
    ):
        """
        Initialize the retraining pipeline
        
        Args:
            model_name: Name of the model
            model_type: Type of model (e.g., 'regression', 'classification')
            data_manager: Data versioning manager
            experiment_tracker: Experiment tracking system
            model_builder: Function to build and train the model
            performance_metrics: List of metrics to track
            validation_thresholds: Dict of metric thresholds for validation
            notification_callbacks: Functions to call with notifications
            retrain_frequency_days: How often to check for retraining
            data_drift_threshold: Threshold for data drift to trigger retraining
        """
        self.model_name = model_name
        self.model_type = model_type
        self.data_manager = data_manager
        self.experiment_tracker = experiment_tracker
        self.model_builder = model_builder
        self.validation_thresholds = validation_thresholds or {}
        self.notification_callbacks = notification_callbacks or []
        self.retrain_frequency_days = retrain_frequency_days
        self.data_drift_threshold = data_drift_threshold
        
        # Set default metrics if not provided
        if not performance_metrics:
            if 'regression' in model_type:
                self.performance_metrics = ['rmse', 'mae', 'r2']
            elif 'classification' in model_type:
                self.performance_metrics = ['accuracy', 'precision', 'recall', 'f1']
            else:
                self.performance_metrics = ['rmse', 'mae']
        else:
            self.performance_metrics = performance_metrics
        
        # Retraining status
        self.last_retrain_date = None
        self.last_retrain_version = None
        self.production_model_version = None
        
        # Load retraining status if available
        self._load_retraining_status()
        
        logger.info(f"Initialized retraining pipeline for model {model_name}")
    
    def _load_retraining_status(self) -> None:
        """Load retraining status from file if available"""
        status_file = f"data/models/{self.model_name}/retraining_status.json"
        
        try:
            if os.path.exists(status_file):
                with open(status_file, 'r') as f:
                    status = json.load(f)
                    
                    self.last_retrain_date = datetime.fromisoformat(status.get('last_retrain_date')) if status.get('last_retrain_date') else None
                    self.last_retrain_version = status.get('last_retrain_version')
                    self.production_model_version = status.get('production_model_version')
        except Exception as e:
            logger.error(f"Error loading retraining status: {str(e)}")
    
    def _save_retraining_status(self) -> None:
        """Save retraining status to file"""
        status_file = f"data/models/{self.model_name}/retraining_status.json"
        
        try:
            os.makedirs(os.path.dirname(status_file), exist_ok=True)
            
            with open(status_file, 'w') as f:
                json.dump({
                    'last_retrain_date': self.last_retrain_date.isoformat() if self.last_retrain_date else None,
                    'last_retrain_version': self.last_retrain_version,
                    'production_model_version': self.production_model_version,
                    'model_name': self.model_name,
                    'model_type': self.model_type,
                    'updated_at': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving retraining status: {str(e)}")
    
    def check_retraining_needed(
        self,
        force: bool = False,
        data_drift_detected: bool = False
    ) -> bool:
        """
        Check if model retraining is needed
        
        Args:
            force: Force retraining regardless of other conditions
            data_drift_detected: Whether data drift has been detected
            
        Returns:
            True if retraining is needed, False otherwise
        """
        if force:
            return True
        
        # If data drift was detected above threshold, retrain
        if data_drift_detected:
            logger.info(f"Retraining needed due to data drift")
            return True
        
        # If it's been long enough since last retraining, check
        if self.last_retrain_date is None:
            return True
            
        days_since_retrain = (datetime.now() - self.last_retrain_date).days
        if days_since_retrain >= self.retrain_frequency_days:
            logger.info(f"Retraining needed: {days_since_retrain} days since last retraining")
            return True
        
        return False
    
    def prepare_training_data(
        self,
        data_version: Optional[str] = None,
        features: Optional[List[str]] = None,
        target: Optional[str] = None,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict[str, pd.DataFrame]:
        """
        Prepare training and validation datasets
        
        Args:
            data_version: Optional specific data version to use
            features: List of feature columns
            target: Target column name
            test_size: Proportion of data to use for testing
            random_state: Random state for reproducibility
            
        Returns:
            Dictionary with train and test dataframes
        """
        try:
            # Switch to the specified data version if provided
            if data_version:
                self.data_manager.switch_to_version(data_version)
            
            # Load the processed features data
            features_file = self.data_manager.features_dir / "battery_features.csv"
            if not features_file.exists():
                raise FileNotFoundError(f"Features file not found: {features_file}")
            
            # Load data
            data = pd.read_csv(features_file)
            
            # Extract features and target
            if not features:
                # Assume all columns except target are features
                features = [col for col in data.columns if col != target]
            
            if not target:
                raise ValueError("Target column must be specified")
            
            X = data[features]
            y = data[target]
            
            # Split data into train/test
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state
            )
            
            # Create dataset version to track what was used for this training
            dataset_meta = {
                'features': features,
                'target': target,
                'test_size': test_size,
                'random_state': random_state,
                'data_stats': {
                    'total_rows': len(data),
                    'training_rows': len(X_train),
                    'testing_rows': len(X_test)
                }
            }
            
            dataset_version = f"train_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            self.data_manager.save_dataset_metadata(dataset_meta, dataset_version)
            
            logger.info(f"Prepared training data: {len(X_train)} train samples, {len(X_test)} test samples")
            
            # Return train/test data
            return {
                'X_train': X_train,
                'X_test': X_test,
                'y_train': y_train,
                'y_test': y_test,
                'features': features,
                'target': target,
                'dataset_version': dataset_version
            }
            
        except Exception as e:
            logger.error(f"Error preparing training data: {str(e)}")
            raise
    
    def train_model(
        self,
        training_data: Dict[str, Any],
        hyperparams: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Train a model with the given training data
        
        Args:
            training_data: Dictionary with training data
            hyperparams: Optional hyperparameters for the model
            
        Returns:
            Dictionary with trained model and performance metrics
        """
        try:
            # Start tracking the training run
            run_name = f"{self.model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            run_id = self.experiment_tracker.start_run(
                run_name=run_name,
                tags={
                    'model_type': self.model_type,
                    'dataset_version': training_data.get('dataset_version', 'unknown'),
                    'model_name': self.model_name
                }
            )
            
            # Log training dataset info
            self.experiment_tracker.log_params({
                'features': training_data['features'],
                'target': training_data['target'],
                'training_samples': len(training_data['X_train']),
                'testing_samples': len(training_data['X_test'])
            })
            
            # Log hyperparameters
            if hyperparams:
                self.experiment_tracker.log_params(hyperparams)
            
            # Build and train the model
            model = self.model_builder(
                X_train=training_data['X_train'],
                y_train=training_data['y_train'],
                hyperparams=hyperparams
            )
            
            # Evaluate model performance
            performance = self._evaluate_model(
                model=model,
                X_test=training_data['X_test'],
                y_test=training_data['y_test']
            )
            
            # Log performance metrics
            self.experiment_tracker.log_metrics(performance)
            
            # Log the model
            model_uri = self.experiment_tracker.log_model(
                model=model,
                artifact_path=f"models/{self.model_name}",
                registered_model_name=self.model_name
            )
            
            # End the run
            self.experiment_tracker.end_run()
            
            logger.info(f"Trained model {self.model_name} with performance: {performance}")
            
            # Return the trained model and performance
            return {
                'model': model,
                'performance': performance,
                'run_id': run_id,
                'model_uri': model_uri
            }
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            # End the run in case of error
            self.experiment_tracker.end_run()
            raise
    
    def _evaluate_model(
        self,
        model: Any,
        X_test: pd.DataFrame,
        y_test: pd.Series
    ) -> Dict[str, float]:
        """
        Evaluate model performance
        
        Args:
            model: Trained model
            X_test: Test features
            y_test: Test target values
            
        Returns:
            Dictionary with performance metrics
        """
        from sklearn.metrics import (
            mean_squared_error, mean_absolute_error, r2_score,
            accuracy_score, precision_score, recall_score, f1_score
        )
        
        # Get predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics based on model type
        metrics = {}
        
        if 'regression' in self.model_type:
            # Regression metrics
            metrics['rmse'] = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            metrics['mae'] = float(mean_absolute_error(y_test, y_pred))
            metrics['r2'] = float(r2_score(y_test, y_pred))
            
        elif 'classification' in self.model_type:
            # Classification metrics
            metrics['accuracy'] = float(accuracy_score(y_test, y_pred))
            
            # For binary classification
            if len(np.unique(y_test)) == 2:
                metrics['precision'] = float(precision_score(y_test, y_pred, average='binary'))
                metrics['recall'] = float(recall_score(y_test, y_pred, average='binary'))
                metrics['f1'] = float(f1_score(y_test, y_pred, average='binary'))
            else:
                # Multi-class
                metrics['precision'] = float(precision_score(y_test, y_pred, average='weighted'))
                metrics['recall'] = float(recall_score(y_test, y_pred, average='weighted'))
                metrics['f1'] = float(f1_score(y_test, y_pred, average='weighted'))
        
        return metrics
    
    def validate_model(
        self,
        new_model_performance: Dict[str, float],
        current_model_performance: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Validate if the new model meets performance thresholds
        
        Args:
            new_model_performance: Performance metrics of new model
            current_model_performance: Optional performance of current model
            
        Returns:
            Dictionary with validation results
        """
        validation_results = {
            'is_valid': True,
            'reasons': [],
            'threshold_checks': {},
            'comparison': {}
        }
        
        # Check against absolute thresholds
        for metric, threshold in self.validation_thresholds.items():
            if metric not in new_model_performance:
                continue
                
            value = new_model_performance[metric]
            is_better_than_threshold = False
            
            # Determine if higher or lower is better
            if metric in ['rmse', 'mae', 'error']:
                # Lower is better
                is_better_than_threshold = value <= threshold
            else:
                # Higher is better (accuracy, r2, precision, recall, f1)
                is_better_than_threshold = value >= threshold
            
            validation_results['threshold_checks'][metric] = {
                'actual': value,
                'threshold': threshold,
                'passed': is_better_than_threshold
            }
            
            if not is_better_than_threshold:
                validation_results['is_valid'] = False
                validation_results['reasons'].append(
                    f"Metric {metric} ({value:.4f}) did not meet threshold ({threshold:.4f})"
                )
        
        # Compare against current model if available
        if current_model_performance:
            for metric in self.performance_metrics:
                if metric not in new_model_performance or metric not in current_model_performance:
                    continue
                
                new_value = new_model_performance[metric]
                current_value = current_model_performance[metric]
                
                # Determine if higher or lower is better
                if metric in ['rmse', 'mae', 'error']:
                    # Lower is better
                    is_better = new_value < current_value
                    improvement = (current_value - new_value) / current_value if current_value != 0 else 0
                else:
                    # Higher is better
                    is_better = new_value > current_value
                    improvement = (new_value - current_value) / current_value if current_value != 0 else 0
                
                validation_results['comparison'][metric] = {
                    'new_value': new_value,
                    'current_value': current_value,
                    'improvement': improvement,
                    'is_better': is_better
                }
        
        return validation_results
    
    def deploy_model(
        self,
        model_version: str,
        validation_results: Dict[str, Any],
        auto_promote_to_production: bool = False
    ) -> Dict[str, Any]:
        """
        Deploy a trained model to staging or production
        
        Args:
            model_version: Version of the model to deploy
            validation_results: Validation results for the model
            auto_promote_to_production: Whether to auto-promote to production
            
        Returns:
            Dictionary with deployment status
        """
        try:
            # Get model version info
            model_versions = self.experiment_tracker.get_model_versions(self.model_name)
            version_info = next((v for v in model_versions if v['version'] == model_version), None)
            
            if not version_info:
                raise ValueError(f"Model version {model_version} not found")
            
            # Transition to staging
            self.experiment_tracker.transition_model_stage(
                name=self.model_name,
                version=model_version,
                stage="Staging"
            )
            
            # Update retraining info
            self.last_retrain_date = datetime.now()
            self.last_retrain_version = model_version
            self._save_retraining_status()
            
            # Auto-promote to production if enabled and validation passed
            if auto_promote_to_production and validation_results['is_valid']:
                self.experiment_tracker.transition_model_stage(
                    name=self.model_name,
                    version=model_version,
                    stage="Production",
                    archive_existing_versions=True
                )
                
                self.production_model_version = model_version
                self._save_retraining_status()
            
            # Notify about deployment
            deployment_status = {
                'model_name': self.model_name,
                'model_version': model_version,
                'stage': "Production" if auto_promote_to_production and validation_results['is_valid'] else "Staging",
                'validation_results': validation_results,
                'deployment_time': datetime.now().isoformat()
            }
            
            # Send notifications
            for callback in self.notification_callbacks:
                try:
                    callback({
                        'type': 'model_deployment',
                        'status': deployment_status
                    })
                except Exception as e:
                    logger.error(f"Error in notification callback: {str(e)}")
            
            logger.info(f"Deployed model {self.model_name} version {model_version} to {deployment_status['stage']}")
            return deployment_status
            
        except Exception as e:
            logger.error(f"Error deploying model: {str(e)}")
            raise
    
    def run_retraining_pipeline(
        self,
        force_retrain: bool = False,
        data_drift_detected: bool = False,
        hyperparams: Optional[Dict[str, Any]] = None,
        features: Optional[List[str]] = None,
        target: Optional[str] = None,
        auto_promote_to_production: bool = False
    ) -> Dict[str, Any]:
        """
        Run the complete retraining pipeline
        
        Args:
            force_retrain: Force retraining regardless of other conditions
            data_drift_detected: Whether data drift has been detected
            hyperparams: Optional hyperparameters for the model
            features: Optional feature list to use
            target: Optional target column name
            auto_promote_to_production: Whether to auto-promote to production
            
        Returns:
            Dictionary with pipeline results
        """
        try:
            # Check if retraining is needed
            if not self.check_retraining_needed(force_retrain, data_drift_detected):
                return {
                    'status': 'skip',
                    'message': 'Retraining not needed at this time',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Prepare training data
            training_data = self.prepare_training_data(
                features=features,
                target=target
            )
            
            # Train model
            training_result = self.train_model(
                training_data=training_data,
                hyperparams=hyperparams
            )
            
            # Get current model performance if available
            current_performance = None
            if self.production_model_version:
                # Get the performance of the current production model
                production_runs = self.experiment_tracker.client.search_runs(
                    experiment_ids=[self.experiment_tracker.experiment_id],
                    filter_string=f"tags.model_name = '{self.model_name}' and tags.version = '{self.production_model_version}'"
                )
                
                if production_runs:
                    current_performance = production_runs[0].data.metrics
            
            # Validate model
            validation_results = self.validate_model(
                new_model_performance=training_result['performance'],
                current_model_performance=current_performance
            )
            
            # Get model version
            model_versions = self.experiment_tracker.get_model_versions(self.model_name)
            latest_version = model_versions[0]['version'] if model_versions else "1"
            
            # Deploy model
            deployment_result = self.deploy_model(
                model_version=latest_version,
                validation_results=validation_results,
                auto_promote_to_production=auto_promote_to_production
            )
            
            # Return pipeline result
            return {
                'status': 'success',
                'training_result': {
                    'run_id': training_result['run_id'],
                    'performance': training_result['performance']
                },
                'validation_results': validation_results,
                'deployment_result': deployment_result,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in retraining pipeline: {str(e)}")
            return {
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }


# Example usage
def main():
    """Example of using the model retraining pipeline"""
    # Create data versioning manager
    data_manager = DataVersioningManager(
        data_dir="data",
        remote_storage="s3://my-bucket/dvc-storage"
    )
    
    # Create experiment tracker
    experiment_tracker = ExperimentTracker(
        experiment_name="battery_health_prediction",
        tracking_uri="sqlite:///mlflow.db"
    )
    
    # Define model builder function
    def build_battery_model(X_train, y_train, hyperparams=None):
        """Build and train a battery health prediction model"""
        from sklearn.ensemble import RandomForestRegressor
        
        # Use provided hyperparameters or defaults
        params = hyperparams or {
            'n_estimators': 100,
            'max_depth': None,
            'min_samples_split': 2,
            'random_state': 42
        }
        
        # Create and train model
        model = RandomForestRegressor(**params)
        model.fit(X_train, y_train)
        
        return model
    
    # Create retraining pipeline
    pipeline = ModelRetrainingPipeline(
        model_name="battery_health_predictor",
        model_type="regression",
        data_manager=data_manager,
        experiment_tracker=experiment_tracker,
        model_builder=build_battery_model,
        validation_thresholds={
            'rmse': 0.1,  # Maximum acceptable RMSE
            'r2': 0.75    # Minimum acceptable R2
        }
    )
    
    # Run the pipeline
    result = pipeline.run_retraining_pipeline(
        force_retrain=True,  # Force retrain for demonstration
        target="state_of_health",
        auto_promote_to_production=False  # Require manual promotion
    )
    
    print(f"Pipeline result: {result['status']}")
    if result['status'] == 'success':
        print(f"Performance: {result['training_result']['performance']}")
        print(f"Validation: {result['validation_results']['is_valid']}")
        print(f"Deployment stage: {result['deployment_result']['stage']}")


if __name__ == "__main__":
    main() 