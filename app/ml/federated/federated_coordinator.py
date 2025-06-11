"""
Federated Learning Coordinator

This module provides a coordinator for federated learning across
distributed charging stations without sharing raw data.
"""
import os
import sys
import json
import logging
import uuid
import copy
import datetime
import numpy as np
from typing import Dict, List, Optional, Any, Union, Callable
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FederatedCoordinator:
    """
    Coordinates federated learning across distributed EV charging stations
    
    Handles:
    - Global model creation and distribution
    - Aggregation of local model updates from stations
    - Secure weight averaging with privacy-preserving techniques
    - Evaluation of global model performance
    """
    
    def __init__(
        self,
        model_name: str,
        model_registry_path: str = 'app/ml/federated/model_registry',
        config_path: str = 'app/ml/federated/federated_config.json'
    ):
        """
        Initialize federated learning coordinator
        
        Args:
            model_name: Name of the model for federated learning
            model_registry_path: Path to store models
            config_path: Path to configuration file
        """
        self.model_name = model_name
        self.model_registry_path = Path(model_registry_path)
        self.config_path = Path(config_path)
        
        # Create directories if they don't exist
        self.model_registry_path.mkdir(parents=True, exist_ok=True)
        
        # Load configuration
        self.config = self._load_config()
        
        # Initialize state
        self.global_model = None
        self.global_model_version = 0
        self.participating_clients = []
        self.client_updates = {}
        self.training_round = 0
        self.is_training_round_active = False
        
        logger.info(f"Initialized FederatedCoordinator for model: {model_name}")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load federated learning configuration"""
        if not self.config_path.exists():
            # Create default configuration
            default_config = {
                "aggregation_method": "fedavg",
                "min_clients_per_round": 3,
                "client_sample_rate": 0.8,
                "rounds_per_global_update": 5,
                "privacy": {
                    "differential_privacy": {
                        "enabled": True,
                        "noise_multiplier": 0.1,
                        "max_grad_norm": 1.0
                    },
                    "secure_aggregation": {
                        "enabled": True,
                        "method": "homomorphic"
                    }
                },
                "convergence_criteria": {
                    "min_improvement": 0.001,
                    "patience": 3
                }
            }
            
            # Ensure parent directory exists
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write default config
            with open(self.config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            return default_config
        
        # Load existing configuration
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
    def initialize_global_model(self, model: Any, model_metadata: Dict[str, Any] = None) -> str:
        """
        Initialize the global model for federated learning
        
        Args:
            model: The initial global model
            model_metadata: Metadata about the model
            
        Returns:
            Path to the saved global model
        """
        self.global_model = model
        self.global_model_version = 1
        
        # Prepare model metadata
        metadata = model_metadata or {}
        metadata.update({
            "model_name": self.model_name,
            "model_version": self.global_model_version,
            "created_at": datetime.datetime.now().isoformat(),
            "federated_learning": {
                "round": 0,
                "aggregation_method": self.config["aggregation_method"],
                "clients_participated": 0
            }
        })
        
        # Save model
        model_dir = self.model_registry_path / f"{self.model_name}_v{self.global_model_version}"
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # Path for model weights
        weights_path = model_dir / "global_weights.npz"
        
        # Extract and save weights
        if hasattr(model, 'get_weights'):
            # TensorFlow-like models
            weights = model.get_weights()
            np.savez(weights_path, *weights)
        elif hasattr(model, 'state_dict'):
            # PyTorch-like models
            import torch
            torch.save(model.state_dict(), weights_path)
        else:
            # Fallback for other model types
            import joblib
            joblib.dump(model, weights_path)
        
        # Save metadata
        with open(model_dir / "metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Initialized global model {self.model_name} v{self.global_model_version}")
        return str(weights_path)
    
    def register_client(
        self,
        client_id: str,
        client_name: str,
        client_metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Register a client (charging station) for federated learning
        
        Args:
            client_id: Unique identifier for the client
            client_name: Human-readable name
            client_metadata: Additional metadata about the client
            
        Returns:
            Client registration information
        """
        # Check if client is already registered
        for client in self.participating_clients:
            if client["client_id"] == client_id:
                logger.info(f"Client {client_id} already registered, updating information")
                client.update({
                    "client_name": client_name,
                    "client_metadata": client_metadata or {},
                    "last_active": datetime.datetime.now().isoformat()
                })
                return client
        
        # Register new client
        client_info = {
            "client_id": client_id,
            "client_name": client_name,
            "client_metadata": client_metadata or {},
            "registration_date": datetime.datetime.now().isoformat(),
            "last_active": datetime.datetime.now().isoformat(),
            "participation_count": 0,
            "status": "registered"
        }
        
        self.participating_clients.append(client_info)
        logger.info(f"Registered new client: {client_id} ({client_name})")
        return client_info
    
    def start_training_round(self) -> Dict[str, Any]:
        """
        Start a new federated learning training round
        
        Returns:
            Training round information
        """
        if self.is_training_round_active:
            raise ValueError("A training round is already active")
        
        if not self.global_model:
            raise ValueError("Global model not initialized. Call initialize_global_model first.")
        
        # Increment training round
        self.training_round += 1
        
        # Sample clients for this round
        sample_rate = self.config["client_sample_rate"]
        min_clients = self.config["min_clients_per_round"]
        
        available_clients = [c for c in self.participating_clients if c["status"] == "registered"]
        
        # Calculate number of clients to select
        num_clients = max(min_clients, int(len(available_clients) * sample_rate))
        
        # Ensure we don't try to select more clients than available
        num_clients = min(num_clients, len(available_clients))
        
        if num_clients < min_clients:
            logger.warning(f"Only {num_clients} clients available, which is less than min_clients ({min_clients})")
        
        # Randomly select clients
        selected_clients = np.random.choice(
            available_clients,
            size=num_clients,
            replace=False
        ).tolist() if available_clients else []
        
        # Create training round information
        round_info = {
            "round_id": f"round_{self.training_round}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            "round_number": self.training_round,
            "global_model_version": self.global_model_version,
            "start_time": datetime.datetime.now().isoformat(),
            "status": "active",
            "selected_clients": [c["client_id"] for c in selected_clients],
            "responded_clients": [],
            "aggregation_method": self.config["aggregation_method"]
        }
        
        # Update state
        self.is_training_round_active = True
        self.client_updates = {}
        
        # Update client status
        for client in selected_clients:
            client["status"] = "training"
        
        logger.info(f"Started training round {self.training_round} with {len(selected_clients)} clients")
        return round_info
    
    def get_global_model_for_client(self, client_id: str) -> Dict[str, Any]:
        """
        Get the current global model for a client
        
        Args:
            client_id: Client identifier
            
        Returns:
            Global model information
        """
        # Verify client is registered
        client = None
        for c in self.participating_clients:
            if c["client_id"] == client_id:
                client = c
                break
        
        if not client:
            raise ValueError(f"Client {client_id} not registered")
        
        # Update client activity timestamp
        client["last_active"] = datetime.datetime.now().isoformat()
        
        # Get the latest global model
        model_dir = self.model_registry_path / f"{self.model_name}_v{self.global_model_version}"
        weights_path = model_dir / "global_weights.npz"
        metadata_path = model_dir / "metadata.json"
        
        if not weights_path.exists() or not metadata_path.exists():
            raise FileNotFoundError(f"Global model files not found at {model_dir}")
        
        # Load metadata
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        return {
            "client_id": client_id,
            "model_name": self.model_name,
            "model_version": self.global_model_version,
            "weights_path": str(weights_path),
            "metadata": metadata,
            "current_round": self.training_round
        }
    
    def receive_client_update(
        self,
        client_id: str,
        model_update: Dict[str, Any],
        metrics: Dict[str, float],
        training_metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Receive and process a client's model update
        
        Args:
            client_id: Client identifier
            model_update: Model weights or gradients
            metrics: Performance metrics on client's local data
            training_metadata: Additional metadata about training
            
        Returns:
            Status of update processing
        """
        if not self.is_training_round_active:
            raise ValueError("No active training round")
        
        # Verify client is registered and selected for this round
        client = None
        is_selected = False
        for c in self.participating_clients:
            if c["client_id"] == client_id:
                client = c
                if c["status"] == "training":
                    is_selected = True
                break
        
        if not client:
            raise ValueError(f"Client {client_id} not registered")
        
        if not is_selected:
            logger.warning(f"Client {client_id} was not selected for this round, but still sent an update")
        
        # Save client update
        if "updates" not in self.client_updates:
            self.client_updates["updates"] = []
        
        # Apply differential privacy if enabled
        if self.config["privacy"]["differential_privacy"]["enabled"]:
            model_update = self._apply_differential_privacy(model_update)
        
        self.client_updates["updates"].append({
            "client_id": client_id,
            "model_update": model_update,
            "metrics": metrics,
            "training_metadata": training_metadata or {},
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Update client status and participation count
        client["status"] = "registered"
        client["participation_count"] += 1
        client["last_active"] = datetime.datetime.now().isoformat()
        
        # Record that this client responded
        if "responded_clients" not in self.client_updates:
            self.client_updates["responded_clients"] = []
        self.client_updates["responded_clients"].append(client_id)
        
        logger.info(f"Received update from client {client_id} for round {self.training_round}")
        
        # Check if we should aggregate updates
        min_clients = self.config["min_clients_per_round"]
        
        if len(self.client_updates["updates"]) >= min_clients:
            # We have enough updates to aggregate
            if self.training_round % self.config["rounds_per_global_update"] == 0:
                # Time to update the global model
                self._aggregate_updates()
            else:
                logger.info(f"Received sufficient updates, but waiting until round "
                           f"{self.training_round + (self.config['rounds_per_global_update'] - (self.training_round % self.config['rounds_per_global_update']))} "
                           f"to update global model")
                self.is_training_round_active = False
        
        return {
            "client_id": client_id,
            "round": self.training_round,
            "global_model_version": self.global_model_version,
            "update_status": "accepted",
            "timestamp": datetime.datetime.now().isoformat()
        }
    
    def _apply_differential_privacy(self, model_update: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply differential privacy to client update
        
        Args:
            model_update: Model weights or gradients
            
        Returns:
            Privacy-enhanced update
        """
        # Get DP configuration
        dp_config = self.config["privacy"]["differential_privacy"]
        noise_multiplier = dp_config["noise_multiplier"]
        max_grad_norm = dp_config["max_grad_norm"]
        
        # Apply DP to each parameter
        for key, value in model_update.items():
            if isinstance(value, np.ndarray):
                # Clip gradients to maximum norm
                norm = np.sqrt(np.sum(np.square(value)))
                scale = min(1.0, max_grad_norm / (norm + 1e-7))
                value *= scale
                
                # Add Gaussian noise
                noise = np.random.normal(0, noise_multiplier * max_grad_norm, value.shape)
                value += noise
                
                model_update[key] = value
        
        return model_update
    
    def _aggregate_updates(self) -> Dict[str, Any]:
        """
        Aggregate client updates to create new global model
        
        Returns:
            Aggregation results
        """
        if not self.client_updates or "updates" not in self.client_updates:
            raise ValueError("No client updates to aggregate")
        
        updates = self.client_updates["updates"]
        aggregation_method = self.config["aggregation_method"]
        
        logger.info(f"Aggregating {len(updates)} client updates using {aggregation_method}")
        
        # Update the global model based on the chosen aggregation method
        if aggregation_method == "fedavg":
            self._federated_averaging()
        elif aggregation_method == "fedprox":
            self._federated_proximal()
        elif aggregation_method == "fedma":
            self._federated_matched_averaging()
        else:
            raise ValueError(f"Unknown aggregation method: {aggregation_method}")
        
        # Increment global model version
        self.global_model_version += 1
        
        # Save new global model
        model_dir = self.model_registry_path / f"{self.model_name}_v{self.global_model_version}"
        model_dir.mkdir(parents=True, exist_ok=True)
        
        weights_path = model_dir / "global_weights.npz"
        
        # Save weights
        if hasattr(self.global_model, 'get_weights'):
            # TensorFlow-like models
            weights = self.global_model.get_weights()
            np.savez(weights_path, *weights)
        elif hasattr(self.global_model, 'state_dict'):
            # PyTorch-like models
            import torch
            torch.save(self.global_model.state_dict(), weights_path)
        else:
            # Fallback for other model types
            import joblib
            joblib.dump(self.global_model, weights_path)
        
        # Prepare metadata
        metadata = {
            "model_name": self.model_name,
            "model_version": self.global_model_version,
            "created_at": datetime.datetime.now().isoformat(),
            "federated_learning": {
                "round": self.training_round,
                "aggregation_method": aggregation_method,
                "clients_participated": len(updates),
                "client_ids": [u["client_id"] for u in updates]
            }
        }
        
        # Save metadata
        with open(model_dir / "metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Reset state for next round
        self.is_training_round_active = False
        
        logger.info(f"Created new global model {self.model_name} v{self.global_model_version}")
        
        return {
            "model_name": self.model_name,
            "model_version": self.global_model_version,
            "aggregation_method": aggregation_method,
            "clients_participated": len(updates),
            "round": self.training_round
        }
    
    def _federated_averaging(self) -> None:
        """
        Implement Federated Averaging (FedAvg) to aggregate client updates
        """
        updates = self.client_updates["updates"]
        
        # Extract weights or gradients from updates
        client_weights = []
        for update in updates:
            client_weights.append(update["model_update"])
        
        # Perform weighted averaging (assuming equal weight for all clients)
        n_clients = len(client_weights)
        
        if hasattr(self.global_model, 'get_weights') and hasattr(self.global_model, 'set_weights'):
            # TensorFlow-like handling
            avg_weights = []
            
            # Check if updates contain weights or gradients
            if all(isinstance(cw, list) for cw in client_weights):
                # Assume these are weights
                for i in range(len(client_weights[0])):
                    layer_weights = [cw[i] for cw in client_weights]
                    avg_weights.append(np.mean(layer_weights, axis=0))
                
                self.global_model.set_weights(avg_weights)
            else:
                # Assume these are gradients to be applied to the model
                current_weights = self.global_model.get_weights()
                for i, weight in enumerate(current_weights):
                    grad_sum = np.zeros_like(weight)
                    for cw in client_weights:
                        grad_sum += cw.get(f"layer_{i}", np.zeros_like(weight))
                    
                    # Apply average gradient
                    current_weights[i] = weight - (grad_sum / n_clients)
                
                self.global_model.set_weights(current_weights)
                
        elif hasattr(self.global_model, 'state_dict') and hasattr(self.global_model, 'load_state_dict'):
            # PyTorch-like handling
            import torch
            
            global_state = self.global_model.state_dict()
            
            # Check if updates contain state dicts or gradients
            if all(isinstance(cw, dict) and all(isinstance(k, str) for k in cw.keys()) for cw in client_weights):
                # Assume these are state dicts
                for key in global_state:
                    global_state[key] = torch.stack([cw[key] for cw in client_weights], dim=0).mean(dim=0)
                
                self.global_model.load_state_dict(global_state)
            else:
                # Assume these are gradients to be applied
                for key in global_state:
                    grad_sum = torch.zeros_like(global_state[key])
                    for cw in client_weights:
                        grad_sum += cw.get(key, torch.zeros_like(global_state[key]))
                    
                    # Apply average gradient
                    global_state[key] = global_state[key] - (grad_sum / n_clients)
                
                self.global_model.load_state_dict(global_state)
        
        else:
            # Generic model handling
            # This is a simplified approach that assumes the model can be updated with a weighted average
            for key in self.global_model.__dict__:
                if isinstance(self.global_model.__dict__[key], np.ndarray):
                    param_sum = np.zeros_like(self.global_model.__dict__[key])
                    for cw in client_weights:
                        param_sum += cw.get(key, np.zeros_like(self.global_model.__dict__[key]))
                    
                    self.global_model.__dict__[key] = param_sum / n_clients
    
    def _federated_proximal(self) -> None:
        """
        Implement FedProx (Federated Proximal) aggregation
        """
        # FedProx is similar to FedAvg but with a proximal term
        # This is a simplified implementation
        self._federated_averaging()
    
    def _federated_matched_averaging(self) -> None:
        """
        Implement Federated Matched Averaging
        """
        # This is a placeholder for a more sophisticated aggregation method
        # For now, we'll use standard averaging
        self._federated_averaging()
    
    def get_model_performance(self) -> Dict[str, Any]:
        """
        Get performance metrics for the global model
        
        Returns:
            Dictionary of performance metrics
        """
        # In a real implementation, this would compute performance
        # metrics on a validation dataset. For now, we'll return
        # the average of client-reported metrics from the last round.
        
        if not self.client_updates or "updates" not in self.client_updates:
            return {
                "model_name": self.model_name,
                "model_version": self.global_model_version,
                "metrics": {},
                "message": "No client updates available to compute metrics"
            }
        
        # Aggregate metrics across clients
        all_metrics = {}
        for update in self.client_updates["updates"]:
            metrics = update["metrics"]
            for key, value in metrics.items():
                if key not in all_metrics:
                    all_metrics[key] = []
                all_metrics[key].append(value)
        
        # Calculate average metrics
        avg_metrics = {key: np.mean(values) for key, values in all_metrics.items()}
        
        return {
            "model_name": self.model_name,
            "model_version": self.global_model_version,
            "round": self.training_round,
            "clients_participated": len(self.client_updates["updates"]),
            "metrics": avg_metrics,
            "timestamp": datetime.datetime.now().isoformat()
        }


# Example usage
def main():
    """Example of using the federated learning coordinator"""
    # Create coordinator
    coordinator = FederatedCoordinator(model_name="battery_health")
    
    # Initialize a dummy global model
    class DummyModel:
        def __init__(self):
            self.weights = [
                np.random.randn(10, 10),
                np.random.randn(10)
            ]
        
        def get_weights(self):
            return self.weights
        
        def set_weights(self, weights):
            self.weights = weights
    
    global_model = DummyModel()
    
    # Initialize the global model
    coordinator.initialize_global_model(global_model)
    
    # Register some clients
    for i in range(5):
        coordinator.register_client(
            client_id=f"charging_station_{i+1}",
            client_name=f"Charging Station {i+1}",
            client_metadata={"location": f"City {i+1}"}
        )
    
    # Start a training round
    round_info = coordinator.start_training_round()
    print(f"Started round {round_info['round_number']} with {len(round_info['selected_clients'])} clients")
    
    # Simulate client updates
    for client_id in round_info["selected_clients"]:
        # Create a dummy update (in practice, this would be the actual model update)
        model_update = {
            "layer_0": np.random.randn(10, 10) * 0.01,  # Small gradient for first layer
            "layer_1": np.random.randn(10) * 0.01  # Small gradient for second layer
        }
        
        # Random metrics
        metrics = {
            "loss": np.random.random() * 0.5,
            "accuracy": 0.7 + np.random.random() * 0.2
        }
        
        # Send update to coordinator
        update_status = coordinator.receive_client_update(
            client_id=client_id,
            model_update=model_update,
            metrics=metrics,
            training_metadata={"epochs": 5, "batch_size": 32}
        )
        
        print(f"Client {client_id} update status: {update_status['update_status']}")
    
    # Get model performance
    performance = coordinator.get_model_performance()
    print(f"Global model performance: {performance['metrics']}")


if __name__ == "__main__":
    main() 