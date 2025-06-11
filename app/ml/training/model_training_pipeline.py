"""
Model Training Pipeline Management

This module provides a framework for managing ML model training pipelines,
including versioning, evaluation, and scheduling regular updates.
"""
import os
import sys
import json
import uuid
import logging
import argparse
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional, Union, Callable
from datetime import datetime, timedelta
from pathlib import Path
import joblib
from enum import Enum
import git

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Import specific model training modules
from app.ml.training.usage_prediction_training import UsagePredictionModel
from app.ml.models.battery_health.battery_degradation_model import BatteryDegradationModel
from app.ml.training.energy_price_training import EnergyPricePredictionModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ModelType(str, Enum):
    """Enum for supported model types"""
    BATTERY_HEALTH = "battery_health"
    USAGE_PREDICTION = "usage_prediction"
    ENERGY_PRICE = "energy_price"


class ModelVersion:
    """Class for managing model versioning"""
    
    def __init__(
        self,
        model_type: ModelType,
        model_id: Optional[str] = None,
        major: int = 1,
        minor: int = 0,
        patch: int = 0,
        stage: str = "development",
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a model version
        
        Args:
            model_type: Type of the model
            model_id: Unique identifier for the model (generated if None)
            major: Major version number (incremented for breaking changes)
            minor: Minor version number (incremented for new features)
            patch: Patch version number (incremented for bug fixes)
            stage: Deployment stage ('development', 'staging', 'production')
            metadata: Additional metadata about the model
        """
        self.model_type = model_type
        self.model_id = model_id or str(uuid.uuid4())
        self.major = major
        self.minor = minor
        self.patch = patch
        self.stage = stage
        self.created_at = datetime.now().isoformat()
        self.metadata = metadata or {}
        
        # Try to get git information
        try:
            repo = git.Repo(search_parent_directories=True)
            self.git_commit = repo.head.object.hexsha
            self.git_branch = repo.active_branch.name
        except Exception:
            self.git_commit = None
            self.git_branch = None
    
    @classmethod
    def from_string(cls, version_string: str, model_type: ModelType) -> 'ModelVersion':
        """
        Create a ModelVersion from a version string (e.g., "1.2.3-production")
        
        Args:
            version_string: Version string in format "major.minor.patch-stage"
            model_type: Type of the model
            
        Returns:
            ModelVersion instance
        """
        # Split into version and stage
        version_parts = version_string.split('-')
        version_numbers = version_parts[0].split('.')
        
        # Get stage or default to development
        stage = version_parts[1] if len(version_parts) > 1 else "development"
        
        # Parse version numbers
        major = int(version_numbers[0])
        minor = int(version_numbers[1]) if len(version_numbers) > 1 else 0
        patch = int(version_numbers[2]) if len(version_numbers) > 2 else 0
        
        return cls(
            model_type=model_type,
            major=major,
            minor=minor,
            patch=patch,
            stage=stage
        )
    
    def increment(self, level: str = "patch") -> 'ModelVersion':
        """
        Create a new version with incremented version number
        
        Args:
            level: Which level to increment ('major', 'minor', or 'patch')
            
        Returns:
            New ModelVersion instance with incremented version
        """
        if level == "major":
            return ModelVersion(
                model_type=self.model_type,
                model_id=self.model_id,
                major=self.major + 1,
                minor=0,
                patch=0,
                stage=self.stage,
                metadata=self.metadata
            )
        elif level == "minor":
            return ModelVersion(
                model_type=self.model_type,
                model_id=self.model_id,
                major=self.major,
                minor=self.minor + 1,
                patch=0,
                stage=self.stage,
                metadata=self.metadata
            )
        else:  # patch
            return ModelVersion(
                model_type=self.model_type,
                model_id=self.model_id,
                major=self.major,
                minor=self.minor,
                patch=self.patch + 1,
                stage=self.stage,
                metadata=self.metadata
            )
    
    def promote(self, to_stage: str) -> 'ModelVersion':
        """
        Create a new version with updated stage
        
        Args:
            to_stage: New stage ('development', 'staging', 'production')
            
        Returns:
            New ModelVersion instance with updated stage
        """
        return ModelVersion(
            model_type=self.model_type,
            model_id=self.model_id,
            major=self.major,
            minor=self.minor,
            patch=self.patch,
            stage=to_stage,
            metadata=self.metadata
        )
    
    def to_string(self) -> str:
        """
        Convert the version to a string
        
        Returns:
            Version string in format "major.minor.patch-stage"
        """
        return f"{self.major}.{self.minor}.{self.patch}-{self.stage}"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the version to a dictionary
        
        Returns:
            Dictionary representation of the version
        """
        return {
            "model_type": self.model_type,
            "model_id": self.model_id,
            "major": self.major,
            "minor": self.minor,
            "patch": self.patch,
            "stage": self.stage,
            "created_at": self.created_at,
            "git_commit": self.git_commit,
            "git_branch": self.git_branch,
            "metadata": self.metadata
        }


class ModelTrainingPipeline:
    """
    Framework for managing model training pipelines
    
    This class handles the end-to-end process of training, evaluating,
    and deploying machine learning models, with support for versioning
    and regular updates.
    """
    
    def __init__(
        self,
        model_type: ModelType,
        base_model_dir: str = 'app/ml/models',
        data_loader_fn: Optional[Callable] = None,
        model_factory_fn: Optional[Callable] = None,
        evaluation_fn: Optional[Callable] = None,
        version_registry_path: Optional[str] = None
    ):
        """
        Initialize the model training pipeline
        
        Args:
            model_type: Type of model to train
            base_model_dir: Base directory for model storage
            data_loader_fn: Function to load training data
            model_factory_fn: Function to create model instance
            evaluation_fn: Function to evaluate model performance
            version_registry_path: Path to the version registry file
        """
        self.model_type = model_type
        self.base_model_dir = base_model_dir
        self.data_loader_fn = data_loader_fn
        self.model_factory_fn = model_factory_fn
        self.evaluation_fn = evaluation_fn
        
        # Set model directory based on model type
        self.model_dir = os.path.join(base_model_dir, model_type.value)
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Set version registry path
        if version_registry_path:
            self.version_registry_path = version_registry_path
        else:
            self.version_registry_path = os.path.join(self.model_dir, "version_registry.json")
        
        # Load or create version registry
        self.version_registry = self._load_version_registry()
    
    def _load_version_registry(self) -> Dict[str, Any]:
        """
        Load the version registry from file or create a new one
        
        Returns:
            Version registry dictionary
        """
        if os.path.exists(self.version_registry_path):
            try:
                with open(self.version_registry_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading version registry: {str(e)}")
                # Create a new registry if loading fails
                return self._create_new_registry()
        else:
            return self._create_new_registry()
    
    def _create_new_registry(self) -> Dict[str, Any]:
        """
        Create a new version registry
        
        Returns:
            New version registry dictionary
        """
        return {
            "model_type": self.model_type,
            "versions": [],
            "current_production": None,
            "current_staging": None,
            "current_development": None,
            "last_updated": datetime.now().isoformat()
        }
    
    def _save_version_registry(self) -> None:
        """Save the version registry to file"""
        try:
            self.version_registry["last_updated"] = datetime.now().isoformat()
            
            with open(self.version_registry_path, 'w') as f:
                json.dump(self.version_registry, f, indent=2)
                
            logger.info(f"Version registry saved to {self.version_registry_path}")
        except Exception as e:
            logger.error(f"Error saving version registry: {str(e)}")
    
    def _create_model_instance(self, **kwargs) -> Any:
        """
        Create a model instance based on model type
        
        Args:
            **kwargs: Additional arguments to pass to the model constructor
            
        Returns:
            Model instance
        """
        if self.model_factory_fn:
            return self.model_factory_fn(**kwargs)
        
        # Default implementations based on model type
        if self.model_type == ModelType.BATTERY_HEALTH:
            return BatteryDegradationModel(**kwargs)
        elif self.model_type == ModelType.USAGE_PREDICTION:
            return UsagePredictionModel(**kwargs)
        elif self.model_type == ModelType.ENERGY_PRICE:
            return EnergyPricePredictionModel(**kwargs)
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def _load_training_data(self, **kwargs) -> Any:
        """
        Load training data
        
        Args:
            **kwargs: Additional arguments to pass to the data loader
            
        Returns:
            Training data
        """
        if self.data_loader_fn:
            return self.data_loader_fn(**kwargs)
        
        # No default implementation; must be provided by user
        raise NotImplementedError("Data loader function not implemented")
    
    def _evaluate_model(self, model, test_data, **kwargs) -> Dict[str, Any]:
        """
        Evaluate model performance
        
        Args:
            model: Trained model instance
            test_data: Test data for evaluation
            **kwargs: Additional arguments for evaluation
            
        Returns:
            Dictionary with evaluation metrics
        """
        if self.evaluation_fn:
            return self.evaluation_fn(model, test_data, **kwargs)
        
        # Default implementation based on model type
        if hasattr(model, 'evaluate'):
            return model.evaluate(test_data, **kwargs)
        else:
            # Basic evaluation
            try:
                predictions = model.predict(test_data)
                return {
                    "predictions": predictions,
                    "timestamp": datetime.now().isoformat()
                }
            except Exception as e:
                logger.error(f"Error evaluating model: {str(e)}")
                return {"error": str(e)}
    
    def _get_model_path(self, version: ModelVersion) -> str:
        """
        Get the file path for saving/loading a model
        
        Args:
            version: ModelVersion instance
            
        Returns:
            Path to the model file
        """
        version_str = version.to_string()
        model_id = version.model_id
        return os.path.join(self.model_dir, f"{model_id}_{version_str}.joblib")
    
    def train_model(
        self,
        training_data: Optional[Any] = None,
        version: Optional[ModelVersion] = None,
        model_kwargs: Optional[Dict[str, Any]] = None,
        training_kwargs: Optional[Dict[str, Any]] = None,
        data_loader_kwargs: Optional[Dict[str, Any]] = None,
        evaluation_kwargs: Optional[Dict[str, Any]] = None,
        auto_increment: str = "patch"
    ) -> Tuple[Any, ModelVersion, Dict[str, Any]]:
        """
        Train a new model
        
        Args:
            training_data: Training data (loaded via data_loader_fn if None)
            version: Model version (created if None)
            model_kwargs: Additional arguments for model creation
            training_kwargs: Additional arguments for model training
            data_loader_kwargs: Additional arguments for data loading
            evaluation_kwargs: Additional arguments for model evaluation
            auto_increment: Which version level to increment ('major', 'minor', 'patch')
            
        Returns:
            Tuple of (trained model, model version, evaluation results)
        """
        # Initialize arguments
        model_kwargs = model_kwargs or {}
        training_kwargs = training_kwargs or {}
        data_loader_kwargs = data_loader_kwargs or {}
        evaluation_kwargs = evaluation_kwargs or {}
        
        # Create or update version
        if version is None:
            # Get the latest development version
            latest_version = self._get_latest_version("development")
            
            if latest_version:
                # Increment the version
                version = latest_version.increment(auto_increment)
            else:
                # Create a new version
                version = ModelVersion(model_type=self.model_type, stage="development")
        
        logger.info(f"Training {self.model_type} model version {version.to_string()}")
        
        # Load training data if not provided
        if training_data is None:
            training_data = self._load_training_data(**data_loader_kwargs)
        
        # Create model instance
        model = self._create_model_instance(**model_kwargs)
        
        # Set model version if the model supports it
        if hasattr(model, 'model_version'):
            model.model_version = version.to_string()
        
        # Extract a portion for evaluation if needed
        test_data = None
        if training_kwargs.get('test_size', 0) > 0:
            # Some model training methods return split data
            pass
        elif 'test_data' in training_kwargs:
            # Test data explicitly provided
            test_data = training_kwargs.pop('test_data')
        
        # Train the model
        training_start_time = datetime.now()
        training_results = model.train(training_data, **training_kwargs)
        training_duration = (datetime.now() - training_start_time).total_seconds()
        
        # Extract test data if returned by train method
        if isinstance(training_results, dict) and 'test_data' in training_results:
            test_data = training_results['test_data']
        
        # Evaluate model
        evaluation_results = {}
        if test_data is not None:
            evaluation_results = self._evaluate_model(model, test_data, **evaluation_kwargs)
        
        # Get performance metrics from training if available
        if (isinstance(training_results, dict) and 
            'metrics' in training_results and 
            isinstance(training_results['metrics'], dict)):
            
            # Combine with evaluation results
            evaluation_results.update(training_results['metrics'])
        
        # Save model and update registry
        self._save_model(model, version, {
            "training_duration": training_duration,
            "training_timestamp": training_start_time.isoformat(),
            "evaluation_results": evaluation_results,
            **model_kwargs
        })
        
        return model, version, evaluation_results
    
    def _save_model(self, model: Any, version: ModelVersion, metadata: Dict[str, Any]) -> None:
        """
        Save a trained model and update the version registry
        
        Args:
            model: Trained model to save
            version: Model version
            metadata: Additional metadata to store
        """
        # Update version metadata
        version.metadata.update(metadata)
        
        # Generate model path
        model_path = self._get_model_path(version)
        
        # Save the model
        try:
            if hasattr(model, 'save'):
                # Use model's save method if available
                model.save(model_path)
            else:
                # Default to joblib
                joblib.dump(model, model_path)
                
            logger.info(f"Model saved to {model_path}")
            
            # Update version registry
            self._add_version_to_registry(version)
            
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            raise
    
    def _add_version_to_registry(self, version: ModelVersion) -> None:
        """
        Add a version to the registry
        
        Args:
            version: ModelVersion to add
        """
        # Convert version to dict
        version_dict = version.to_dict()
        
        # Add to versions list
        self.version_registry["versions"].append(version_dict)
        
        # Update current version for the stage
        self.version_registry[f"current_{version.stage}"] = version.to_string()
        
        # Save registry
        self._save_version_registry()
    
    def _get_latest_version(self, stage: Optional[str] = None) -> Optional[ModelVersion]:
        """
        Get the latest model version
        
        Args:
            stage: Optional stage filter ('development', 'staging', 'production')
            
        Returns:
            Latest ModelVersion or None if no versions found
        """
        versions = self.version_registry.get("versions", [])
        
        if not versions:
            return None
        
        # Filter by stage if specified
        if stage:
            versions = [v for v in versions if v.get("stage") == stage]
            
        if not versions:
            return None
        
        # Find the latest version
        latest = max(versions, 
                     key=lambda v: (v.get("major", 0), v.get("minor", 0), v.get("patch", 0)))
        
        return ModelVersion(
            model_type=self.model_type,
            model_id=latest.get("model_id"),
            major=latest.get("major", 0),
            minor=latest.get("minor", 0),
            patch=latest.get("patch", 0),
            stage=latest.get("stage", "development"),
            metadata=latest.get("metadata", {})
        )
    
    def load_model(
        self,
        version: Optional[Union[str, ModelVersion]] = None,
        stage: str = "production"
    ) -> Any:
        """
        Load a trained model
        
        Args:
            version: Specific version to load (if None, loads latest for stage)
            stage: Stage to load from if version not specified
            
        Returns:
            Loaded model
        """
        # Convert string version to ModelVersion if needed
        if isinstance(version, str):
            version = ModelVersion.from_string(version, self.model_type)
        
        # Get latest version for stage if not specified
        if version is None:
            # Check if there's a current version for the stage
            current_version_str = self.version_registry.get(f"current_{stage}")
            
            if current_version_str:
                version = ModelVersion.from_string(current_version_str, self.model_type)
                
                # Find the model_id for this version
                for v in self.version_registry.get("versions", []):
                    if v.get("major") == version.major and \
                       v.get("minor") == version.minor and \
                       v.get("patch") == version.patch and \
                       v.get("stage") == version.stage:
                        version.model_id = v.get("model_id")
                        break
            else:
                # Get latest version for the stage
                version = self._get_latest_version(stage)
                
            if version is None:
                raise ValueError(f"No {stage} model version found")
        
        # Generate model path
        model_path = self._get_model_path(version)
        
        # Check if file exists
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        # Load model
        try:
            # Try to use model-specific load method
            if self.model_type == ModelType.BATTERY_HEALTH:
                return BatteryDegradationModel.load(model_path)
            elif self.model_type == ModelType.USAGE_PREDICTION:
                return UsagePredictionModel.load(model_path)
            elif self.model_type == ModelType.ENERGY_PRICE:
                return EnergyPricePredictionModel.load(model_path)
            else:
                # Default to joblib
                return joblib.load(model_path)
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def promote_model(
        self,
        version: Union[str, ModelVersion],
        to_stage: str,
        evaluation_results: Optional[Dict[str, Any]] = None
    ) -> ModelVersion:
        """
        Promote a model to a different stage
        
        Args:
            version: Version to promote
            to_stage: Target stage ('development', 'staging', 'production')
            evaluation_results: Optional evaluation results to store
            
        Returns:
            Updated ModelVersion
        """
        # Convert string version to ModelVersion if needed
        if isinstance(version, str):
            version = ModelVersion.from_string(version, self.model_type)
            
            # Find the model_id for this version
            for v in self.version_registry.get("versions", []):
                if v.get("major") == version.major and \
                   v.get("minor") == version.minor and \
                   v.get("patch") == version.patch:
                    version.model_id = v.get("model_id")
                    version.metadata = v.get("metadata", {})
                    break
        
        # Make sure version exists
        if version.model_id not in [v.get("model_id") for v in self.version_registry.get("versions", [])]:
            raise ValueError(f"Version {version.to_string()} not found in registry")
        
        # Create new version with updated stage
        new_version = version.promote(to_stage)
        
        # Update metadata with evaluation results if provided
        if evaluation_results:
            new_version.metadata["promotion_evaluation"] = evaluation_results
            new_version.metadata["promoted_at"] = datetime.now().isoformat()
        
        # Generate model paths
        old_path = self._get_model_path(version)
        new_path = self._get_model_path(new_version)
        
        # Check if source model exists
        if not os.path.exists(old_path):
            raise FileNotFoundError(f"Source model file not found: {old_path}")
        
        # Load and save model with new version
        try:
            # Load existing model
            model = self.load_model(version)
            
            # Update model version if supported
            if hasattr(model, 'model_version'):
                model.model_version = new_version.to_string()
            
            # Save with new version
            self._save_model(model, new_version, new_version.metadata)
            
            logger.info(f"Model promoted from {version.to_string()} to {new_version.to_string()}")
            
            return new_version
            
        except Exception as e:
            logger.error(f"Error promoting model: {str(e)}")
            raise
    
    def compare_versions(
        self,
        version_a: Union[str, ModelVersion],
        version_b: Union[str, ModelVersion],
        test_data: Any,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Compare two model versions
        
        Args:
            version_a: First version to compare
            version_b: Second version to compare
            test_data: Test data for evaluation
            **kwargs: Additional arguments for evaluation
            
        Returns:
            Dictionary with comparison results
        """
        # Load the models
        model_a = self.load_model(version_a)
        model_b = self.load_model(version_b)
        
        # Evaluate both models
        results_a = self._evaluate_model(model_a, test_data, **kwargs)
        results_b = self._evaluate_model(model_b, test_data, **kwargs)
        
        # Convert versions to strings if needed
        ver_a_str = version_a.to_string() if isinstance(version_a, ModelVersion) else version_a
        ver_b_str = version_b.to_string() if isinstance(version_b, ModelVersion) else version_b
        
        # Combine results
        return {
            "version_a": ver_a_str,
            "version_b": ver_b_str,
            "results_a": results_a,
            "results_b": results_b,
            "comparison_timestamp": datetime.now().isoformat()
        }
    
    def get_version_history(self, stage: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get the version history
        
        Args:
            stage: Optional stage filter
            
        Returns:
            List of version dictionaries
        """
        versions = self.version_registry.get("versions", [])
        
        # Filter by stage if specified
        if stage:
            versions = [v for v in versions if v.get("stage") == stage]
        
        # Sort by version (major, minor, patch)
        return sorted(versions, key=lambda v: (v.get("major", 0), v.get("minor", 0), v.get("patch", 0)))
    
    def get_current_version(self, stage: str = "production") -> Optional[Dict[str, Any]]:
        """
        Get the current version for a stage
        
        Args:
            stage: Stage to get version for
            
        Returns:
            Version dictionary or None if no version found
        """
        version_str = self.version_registry.get(f"current_{stage}")
        
        if not version_str:
            return None
        
        # Find the version in the registry
        for version in self.version_registry.get("versions", []):
            if f"{version.get('major')}.{version.get('minor')}.{version.get('patch')}-{version.get('stage')}" == version_str:
                return version
        
        return None


# Example usage
if __name__ == "__main__":
    # Example data loader function
    def load_battery_data(data_path=None, **kwargs):
        """Load battery telemetry data for training"""
        if data_path:
            return pd.read_csv(data_path)
        
        # Generate synthetic data for demo
        np.random.seed(42)
        timestamps = [datetime.now() - timedelta(days=i) for i in range(180, 0, -1)]
        
        data = []
        # Generate data for 3 vehicles
        for vehicle_id in ['v1', 'v2', 'v3']:
            for i, ts in enumerate(timestamps):
                data.append({
                    'vehicle_id': vehicle_id,
                    'timestamp': ts,
                    'state_of_health': 100 - i/len(timestamps)*5 + np.random.normal(0, 0.5),
                    'state_of_charge': 70 + np.random.normal(0, 10),
                    'battery_temp': 25 + np.random.normal(0, 5),
                    'charge_cycles': i/3,
                    'odometer': 10000 + i*50,
                    'battery_chemistry': 'NMC',
                    'vehicle_type': 'sedan'
                })
        
        return pd.DataFrame(data)
    
    # Create pipeline
    pipeline = ModelTrainingPipeline(
        model_type=ModelType.BATTERY_HEALTH,
        data_loader_fn=load_battery_data
    )
    
    # Train model
    model, version, results = pipeline.train_model(
        model_kwargs={'model_type': 'gradient_boosting'},
        training_kwargs={'test_size': 0.2}
    )
    
    # Promote to staging
    staging_version = pipeline.promote_model(version, "staging")
    
    # Promote to production
    production_version = pipeline.promote_model(staging_version, "production")
    
    # Get version history
    history = pipeline.get_version_history()
    print(f"Version history: {len(history)} versions")
    
    # Get current production version
    current = pipeline.get_current_version("production")
    print(f"Current production version: {current.get('major')}.{current.get('minor')}.{current.get('patch')}") 