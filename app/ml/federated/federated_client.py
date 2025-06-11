"""
Federated Learning Client

This module provides client-side functionality for participating in
federated learning from edge devices (charging stations).
"""
import os
import sys
import json
import logging
import datetime
import numpy as np
import requests
from typing import Dict, List, Optional, Any, Union, Callable, Tuple
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FederatedClient:
    """
    Client for federated learning on edge devices (charging stations)
    
    Handles:
    - Local model training on device data
    - Communication with federated coordinator
    - Secure model updates
    - Local evaluation and reporting
    """
    
    def __init__(
        self,
        client_id: str,
        client_name: str,
        coordinator_url: str,
        models_dir: str = 'app/ml/models',
        local_data_dir: str = 'data/local'
    ):
        """
        Initialize federated learning client
        
        Args:
            client_id: Unique identifier for this client
            client_name: Human-readable name
            coordinator_url: URL of the federated learning coordinator
            models_dir: Directory to store models
            local_data_dir: Directory containing local data
        """
        self.client_id = client_id
        self.client_name = client_name
        self.coordinator_url = coordinator_url
        self.models_dir = Path(models_dir)
        self.local_data_dir = Path(local_data_dir)
        
        # Create directories if they don't exist
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.local_data_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize state
        self.current_model = None
        self.current_model_version = None
        self.current_round = None
        self.is_registered = False
        
        logger.info(f"Initialized FederatedClient {client_id} ({client_name})")
    
    def register_with_coordinator(self, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Register this client with the federated learning coordinator
        
        Args:
            metadata: Additional metadata about the client
            
        Returns:
            Registration result
        """
        # In a real implementation, this would make an HTTP request
        # to the coordinator. For simplicity, we'll simulate the response.
        
        logger.info(f"Registering with coordinator at {self.coordinator_url}")
        
        # Prepare client metadata
        client_metadata = metadata or {}
        client_metadata.update({
            "device_type": "charging_station",
            "registration_time": datetime.datetime.now().isoformat()
        })
        
        # Simulate request to coordinator
        try:
            # In a real implementation, this would be:
            # response = requests.post(
            #     f"{self.coordinator_url}/register",
            #     json={
            #         "client_id": self.client_id,
            #         "client_name": self.client_name,
            #         "client_metadata": client_metadata
            #     }
            # )
            # registration_result = response.json()
            
            # Simulated response
            registration_result = {
                "client_id": self.client_id,
                "status": "registered",
                "registration_date": datetime.datetime.now().isoformat()
            }
            
            self.is_registered = True
            logger.info(f"Successfully registered with coordinator")
            
            return registration_result
            
        except Exception as e:
            logger.error(f"Failed to register with coordinator: {str(e)}")
            raise
    
    def check_for_training_round(self) -> Optional[Dict[str, Any]]:
        """
        Check if there is an active training round
        
        Returns:
            Training round information or None if not selected
        """
        if not self.is_registered:
            logger.warning("Client not registered with coordinator")
            return None
        
        logger.info("Checking for active training rounds")
        
        # In a real implementation, this would make an HTTP request
        # to the coordinator. For simplicity, we'll simulate the response.
        
        try:
            # Simulated response
            # Randomly decide if this client is selected (for demo purposes)
            is_selected = np.random.random() > 0.5
            
            if is_selected:
                round_info = {
                    "round_id": f"round_{np.random.randint(1, 100)}",
                    "round_number": np.random.randint(1, 10),
                    "global_model_version": np.random.randint(1, 5),
                    "selected": True,
                    "deadline": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat()
                }
                
                self.current_round = round_info["round_number"]
                logger.info(f"Selected for training round {round_info['round_number']}")
                
                return round_info
            else:
                logger.info("Not selected for current training round")
                return None
                
        except Exception as e:
            logger.error(f"Error checking for training round: {str(e)}")
            return None
    
    def get_global_model(self, model_name: str) -> Dict[str, Any]:
        """
        Retrieve the current global model from the coordinator
        
        Args:
            model_name: Name of the model
            
        Returns:
            Model information
        """
        if not self.is_registered:
            raise ValueError("Client not registered with coordinator")
        
        logger.info(f"Retrieving global model {model_name} from coordinator")
        
        # In a real implementation, this would make an HTTP request
        # to the coordinator. For simplicity, we'll simulate the response.
        
        try:
            # Simulated response
            model_version = np.random.randint(1, 5)
            
            # Create a dummy model file for demonstration
            model_dir = self.models_dir / f"{model_name}_v{model_version}"
            model_dir.mkdir(parents=True, exist_ok=True)
            
            weights_path = model_dir / "global_weights.npz"
            
            # Create a dummy weights file
            if not weights_path.exists():
                # Create random weights
                weights1 = np.random.randn(10, 10)
                weights2 = np.random.randn(10)
                
                np.savez(weights_path, weights1=weights1, weights2=weights2)
            
            # Create metadata file
            metadata_path = model_dir / "metadata.json"
            metadata = {
                "model_name": model_name,
                "model_version": model_version,
                "created_at": datetime.datetime.now().isoformat(),
                "aggregation_method": "fedavg"
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.current_model_version = model_version
            logger.info(f"Retrieved global model {model_name} v{model_version}")
            
            return {
                "model_name": model_name,
                "model_version": model_version,
                "weights_path": str(weights_path),
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error retrieving global model: {str(e)}")
            raise
    
    def train_local_model(
        self,
        model_name: str,
        epochs: int = 5,
        batch_size: int = 32,
        learning_rate: float = 0.001
    ) -> Tuple[Dict[str, Any], Dict[str, float]]:
        """
        Train a model locally using on-device data
        
        Args:
            model_name: Name of the model
            epochs: Number of training epochs
            batch_size: Batch size for training
            learning_rate: Learning rate for training
            
        Returns:
            Tuple of (model update, metrics)
        """
        # First, get the global model
        model_info = self.get_global_model(model_name)
        
        logger.info(f"Training local model {model_name} v{model_info['model_version']} for {epochs} epochs")
        
        # Load the model weights
        weights_path = model_info["weights_path"]
        
        # In a real implementation, this would:
        # 1. Load the global model weights
        # 2. Load local data
        # 3. Train the model for the specified number of epochs
        # 4. Return the updated weights and metrics
        
        # For simplicity, we'll simulate the training process
        
        # Load weights from the NPZ file
        try:
            with np.load(weights_path) as data:
                # In a real implementation, these would be loaded into the model
                weights = [data[key] for key in data.files]
        except Exception as e:
            logger.error(f"Error loading model weights: {str(e)}")
            # Create dummy weights if we can't load the file
            weights = [
                np.random.randn(10, 10),
                np.random.randn(10)
            ]
        
        # Simulate training on local data
        # In a real implementation, this would use TensorFlow, PyTorch, etc.
        
        # Create dummy local dataset
        # In a real implementation, this would load data from local_data_dir
        np.random.seed(42)  # For reproducibility
        X = np.random.randn(100, 10)
        y = np.random.randint(0, 2, size=100)
        
        # Simulate training loop
        logger.info("Simulating local training...")
        
        # Instead of actual training, we'll just add small updates to the weights
        # to simulate the training process
        updates = []
        for weight in weights:
            # Add a small gradient update
            update = np.random.randn(*weight.shape) * 0.01
            updates.append(update)
        
        # Simulate some metrics
        metrics = {
            "loss": 0.3 - np.random.random() * 0.1,
            "accuracy": 0.7 + np.random.random() * 0.2,
            "precision": 0.75 + np.random.random() * 0.2,
            "recall": 0.8 + np.random.random() * 0.15
        }
        
        logger.info(f"Local training completed with metrics: {metrics}")
        
        # Package the updates
        model_update = {}
        for i, update in enumerate(updates):
            model_update[f"layer_{i}"] = update
        
        # In a real implementation, we would save the updated model
        # locally in case we need to use it before the next global update
        
        return model_update, metrics
    
    def send_model_update(
        self,
        model_name: str,
        model_update: Dict[str, Any],
        metrics: Dict[str, float],
        round_id: str
    ) -> Dict[str, Any]:
        """
        Send model updates to the coordinator
        
        Args:
            model_name: Name of the model
            model_update: Model updates (weights or gradients)
            metrics: Performance metrics
            round_id: Training round identifier
            
        Returns:
            Update status
        """
        if not self.is_registered:
            raise ValueError("Client not registered with coordinator")
        
        logger.info(f"Sending model update for {model_name} to coordinator")
        
        # In a real implementation, this would make an HTTP request
        # to the coordinator. For simplicity, we'll simulate the response.
        
        # Create training metadata
        training_metadata = {
            "epochs": 5,
            "batch_size": 32,
            "learning_rate": 0.001,
            "local_data_samples": 100,
            "training_time": datetime.datetime.now().isoformat()
        }
        
        try:
            # Simulated response
            update_status = {
                "client_id": self.client_id,
                "round_id": round_id,
                "model_name": model_name,
                "update_status": "accepted",
                "timestamp": datetime.datetime.now().isoformat()
            }
            
            logger.info(f"Model update sent and accepted by coordinator")
            
            return update_status
            
        except Exception as e:
            logger.error(f"Error sending model update: {str(e)}")
            raise
    
    def participate_in_training_round(self, model_name: str) -> Dict[str, Any]:
        """
        Participate in a federated learning training round
        
        This method orchestrates the entire process:
        1. Check for an active round
        2. Get the global model
        3. Train locally
        4. Send updates
        
        Args:
            model_name: Name of the model
            
        Returns:
            Status information
        """
        # Check if there's an active round
        round_info = self.check_for_training_round()
        
        if not round_info:
            return {
                "status": "not_selected",
                "message": "Client not selected for current training round"
            }
        
        try:
            # Train the local model
            model_update, metrics = self.train_local_model(
                model_name=model_name,
                epochs=5,
                batch_size=32
            )
            
            # Send the update to the coordinator
            update_status = self.send_model_update(
                model_name=model_name,
                model_update=model_update,
                metrics=metrics,
                round_id=round_info["round_id"]
            )
            
            return {
                "status": "completed",
                "round_id": round_info["round_id"],
                "round_number": round_info["round_number"],
                "model_name": model_name,
                "metrics": metrics,
                "update_status": update_status["update_status"]
            }
            
        except Exception as e:
            logger.error(f"Error participating in training round: {str(e)}")
            
            return {
                "status": "failed",
                "round_id": round_info["round_id"] if round_info else None,
                "error": str(e)
            }
    
    def evaluate_global_model(self, model_name: str) -> Dict[str, Any]:
        """
        Evaluate the current global model on local data
        
        Args:
            model_name: Name of the model
            
        Returns:
            Evaluation metrics
        """
        # Get the global model
        model_info = self.get_global_model(model_name)
        
        logger.info(f"Evaluating global model {model_name} v{model_info['model_version']} on local data")
        
        # In a real implementation, this would:
        # 1. Load the global model
        # 2. Load local validation data
        # 3. Evaluate the model
        
        # For simplicity, we'll simulate the evaluation process
        
        # Simulate metrics
        metrics = {
            "loss": 0.25 - np.random.random() * 0.1,
            "accuracy": 0.8 + np.random.random() * 0.15,
            "precision": 0.82 + np.random.random() * 0.1,
            "recall": 0.85 + np.random.random() * 0.1,
            "f1_score": 0.83 + np.random.random() * 0.1
        }
        
        logger.info(f"Evaluation completed with metrics: {metrics}")
        
        return {
            "client_id": self.client_id,
            "model_name": model_name,
            "model_version": model_info["model_version"],
            "metrics": metrics,
            "eval_time": datetime.datetime.now().isoformat()
        }


# Example usage
def main():
    """Example of using the federated learning client"""
    # Create client
    client = FederatedClient(
        client_id="charging_station_001",
        client_name="Main Street Charging Station 1",
        coordinator_url="https://coordinator.example.com"
    )
    
    # Register with coordinator
    registration = client.register_with_coordinator(
        metadata={
            "location": "Main Street",
            "charging_type": "Level 2",
            "capacity": 4
        }
    )
    
    print(f"Registration status: {registration['status']}")
    
    # Participate in a training round
    model_name = "battery_health"
    result = client.participate_in_training_round(model_name)
    
    print(f"Training round status: {result['status']}")
    
    if result['status'] == 'completed':
        print(f"Metrics: {result['metrics']}")
    
    # Evaluate the global model
    eval_result = client.evaluate_global_model(model_name)
    print(f"Evaluation metrics: {eval_result['metrics']}")


if __name__ == "__main__":
    main() 