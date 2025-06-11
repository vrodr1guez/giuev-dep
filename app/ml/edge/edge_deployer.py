"""
Edge Model Deployer

This module provides functionality to deploy optimized models to edge devices
(charging stations) and manage their lifecycle.
"""
import os
import sys
import json
import logging
import tempfile
import datetime
from typing import Dict, List, Optional, Any, Union
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EdgeDeployer:
    """
    Handles deployment of ML models to edge devices (charging stations)
    
    Manages the entire deployment lifecycle including:
    - Packaging models with necessary dependencies
    - Versioning and tracking deployments
    - Deployment to specified targets
    - Status monitoring and rollback capabilities
    """
    
    def __init__(
        self,
        models_dir: str = 'app/ml/models',
        edge_config_path: str = 'app/ml/edge/edge_config.json',
        deployment_registry_path: str = 'app/ml/edge/deployments_registry.json'
    ):
        """
        Initialize edge deployer
        
        Args:
            models_dir: Directory containing models
            edge_config_path: Path to edge device configuration
            deployment_registry_path: Path to deployment registry
        """
        self.models_dir = Path(models_dir)
        self.edge_config_path = Path(edge_config_path)
        self.deployment_registry_path = Path(deployment_registry_path)
        
        # Load configurations
        self.edge_config = self._load_config(self.edge_config_path)
        self.deployment_registry = self._load_deployment_registry()
        
        logger.info(f"Initialized EdgeDeployer with {len(self.edge_config.get('devices', []))} registered devices")
    
    def _load_config(self, config_path: Path) -> Dict[str, Any]:
        """Load edge device configuration"""
        if not config_path.exists():
            # Create default configuration
            default_config = {
                "devices": [],
                "deployment_method": "http",
                "authentication": {
                    "type": "api_key",
                    "key": ""
                },
                "retry_policy": {
                    "max_attempts": 3,
                    "backoff_factor": 2
                }
            }
            
            # Ensure parent directory exists
            config_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write default config
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            return default_config
        
        # Load existing configuration
        with open(config_path, 'r') as f:
            return json.load(f)
    
    def _load_deployment_registry(self) -> Dict[str, Any]:
        """Load deployment registry"""
        if not self.deployment_registry_path.exists():
            # Create default registry
            default_registry = {
                "deployments": [],
                "last_updated": datetime.datetime.now().isoformat()
            }
            
            # Ensure parent directory exists
            self.deployment_registry_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write default registry
            with open(self.deployment_registry_path, 'w') as f:
                json.dump(default_registry, f, indent=2)
            
            return default_registry
        
        # Load existing registry
        with open(self.deployment_registry_path, 'r') as f:
            return json.load(f)
    
    def _save_deployment_registry(self) -> None:
        """Save deployment registry"""
        self.deployment_registry["last_updated"] = datetime.datetime.now().isoformat()
        
        with open(self.deployment_registry_path, 'w') as f:
            json.dump(self.deployment_registry, f, indent=2)
    
    def register_edge_device(
        self,
        device_id: str,
        device_name: str,
        device_type: str,
        deployment_endpoint: str,
        capabilities: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Register a new edge device
        
        Args:
            device_id: Unique identifier for the device
            device_name: Human-readable name
            device_type: Type of device
            deployment_endpoint: Endpoint for deployment
            capabilities: Device capabilities (memory, CPU, etc.)
            
        Returns:
            Dictionary with registered device information
        """
        # Check if device already exists
        devices = self.edge_config.get("devices", [])
        for device in devices:
            if device["device_id"] == device_id:
                logger.warning(f"Device {device_id} already registered, updating information")
                device.update({
                    "device_name": device_name,
                    "device_type": device_type,
                    "deployment_endpoint": deployment_endpoint,
                    "capabilities": capabilities or {},
                    "last_updated": datetime.datetime.now().isoformat()
                })
                
                # Save configuration
                with open(self.edge_config_path, 'w') as f:
                    json.dump(self.edge_config, f, indent=2)
                
                return device
        
        # Create new device entry
        new_device = {
            "device_id": device_id,
            "device_name": device_name,
            "device_type": device_type,
            "deployment_endpoint": deployment_endpoint,
            "capabilities": capabilities or {},
            "registration_date": datetime.datetime.now().isoformat(),
            "last_updated": datetime.datetime.now().isoformat(),
            "status": "registered"
        }
        
        # Add to devices list
        devices.append(new_device)
        self.edge_config["devices"] = devices
        
        # Save configuration
        with open(self.edge_config_path, 'w') as f:
            json.dump(self.edge_config, f, indent=2)
        
        logger.info(f"Registered new edge device: {device_id} ({device_name})")
        return new_device
    
    def get_edge_devices(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get registered edge devices
        
        Args:
            status: Filter by device status
            
        Returns:
            List of registered devices
        """
        devices = self.edge_config.get("devices", [])
        
        if status:
            return [d for d in devices if d.get("status") == status]
        
        return devices
    
    def get_device_status(self, device_id: str) -> Dict[str, Any]:
        """
        Get status of a specific device
        
        Args:
            device_id: Device identifier
            
        Returns:
            Device status information
        """
        devices = self.edge_config.get("devices", [])
        
        for device in devices:
            if device["device_id"] == device_id:
                # Here we would typically make a request to the device
                # to get its current status, but for simplicity we'll
                # just return the stored information
                return {
                    "device_id": device["device_id"],
                    "status": device.get("status", "unknown"),
                    "last_deployment": device.get("last_deployment"),
                    "deployed_models": device.get("deployed_models", []),
                    "last_heartbeat": device.get("last_heartbeat")
                }
        
        raise ValueError(f"Device {device_id} not found")
    
    def package_model(
        self,
        model_path: str,
        model_name: str,
        model_version: str,
        include_dependencies: bool = True
    ) -> str:
        """
        Package model for edge deployment
        
        Args:
            model_path: Path to optimized model
            model_name: Name of the model
            model_version: Version of the model
            include_dependencies: Whether to include dependencies
            
        Returns:
            Path to packaged model
        """
        # Create temporary directory for packaging
        package_dir = tempfile.mkdtemp()
        package_dir_path = Path(package_dir)
        
        # Copy model file
        model_file_path = Path(model_path)
        if not model_file_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        # Create package structure
        package_model_dir = package_dir_path / "model"
        package_model_dir.mkdir()
        
        import shutil
        shutil.copy2(model_file_path, package_model_dir / model_file_path.name)
        
        # Create metadata file
        metadata = {
            "model_name": model_name,
            "model_version": model_version,
            "created_at": datetime.datetime.now().isoformat(),
            "original_path": str(model_file_path),
            "packaged_by": "EdgeDeployer",
            "dependencies": {}
        }
        
        # Include dependencies if requested
        if include_dependencies:
            # For simplicity, we'll just include a list of common dependencies
            # In a real implementation, this would analyze the model and include
            # only the necessary dependencies
            metadata["dependencies"] = {
                "numpy": ">=1.20.0",
                "onnxruntime": ">=1.7.0"
            }
            
            # Copy runtime libraries (simplified)
            (package_dir_path / "runtime").mkdir()
            with open(package_dir_path / "runtime" / "requirements.txt", 'w') as f:
                for dep, ver in metadata["dependencies"].items():
                    f.write(f"{dep}{ver}\n")
        
        # Write metadata
        with open(package_dir_path / "metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Create package zip file
        package_path = f"app/ml/edge/packages/{model_name}_{model_version}.zip"
        package_path_dir = Path(package_path).parent
        package_path_dir.mkdir(parents=True, exist_ok=True)
        
        shutil.make_archive(
            str(package_path).replace(".zip", ""),
            'zip',
            package_dir
        )
        
        # Clean up temporary directory
        shutil.rmtree(package_dir)
        
        logger.info(f"Packaged model to {package_path}")
        return package_path
    
    def deploy_model(
        self,
        model_path: str,
        device_ids: List[str],
        model_name: Optional[str] = None,
        model_version: Optional[str] = None,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Deploy model to edge devices
        
        Args:
            model_path: Path to model file (optimized or packaged)
            device_ids: List of device IDs to deploy to
            model_name: Name of the model (inferred from path if not provided)
            model_version: Version of the model (timestamp if not provided)
            force: Whether to force deployment even if device already has the model
            
        Returns:
            Deployment status information
        """
        # Validate model path
        model_file_path = Path(model_path)
        if not model_file_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        # Infer model name and version if not provided
        if not model_name:
            model_name = model_file_path.stem.split('_')[0]
        
        if not model_version:
            model_version = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Check if model is already packaged
        if not model_path.endswith('.zip'):
            # Package the model
            model_path = self.package_model(
                model_path=model_path,
                model_name=model_name,
                model_version=model_version
            )
        
        # Prepare deployment record
        deployment_id = f"deploy_{model_name}_{model_version}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        deployment_record = {
            "deployment_id": deployment_id,
            "model_name": model_name,
            "model_version": model_version,
            "model_path": model_path,
            "device_ids": device_ids,
            "status": "in_progress",
            "start_time": datetime.datetime.now().isoformat(),
            "completed_time": None,
            "results": {}
        }
        
        # Add to deployment registry
        self.deployment_registry["deployments"].append(deployment_record)
        self._save_deployment_registry()
        
        # Deploy to each device
        for device_id in device_ids:
            try:
                # Get device information
                device = None
                for d in self.edge_config.get("devices", []):
                    if d["device_id"] == device_id:
                        device = d
                        break
                
                if not device:
                    raise ValueError(f"Device {device_id} not found")
                
                # In a real implementation, this would make an HTTP/MQTT/etc. request
                # to the device to deploy the model. For simplicity, we'll just
                # simulate a successful deployment.
                
                # Update device status
                device["status"] = "deployed"
                device["last_deployment"] = datetime.datetime.now().isoformat()
                device["deployed_models"] = device.get("deployed_models", [])
                device["deployed_models"].append({
                    "model_name": model_name,
                    "model_version": model_version,
                    "deployment_id": deployment_id,
                    "deployed_at": datetime.datetime.now().isoformat()
                })
                
                # Update deployment record
                deployment_record["results"][device_id] = {
                    "status": "success",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "message": "Model deployed successfully (simulated)"
                }
                
            except Exception as e:
                logger.error(f"Error deploying to device {device_id}: {str(e)}")
                deployment_record["results"][device_id] = {
                    "status": "failed",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "message": str(e)
                }
        
        # Update deployment status
        failed_count = sum(1 for r in deployment_record["results"].values() if r["status"] == "failed")
        if failed_count == 0:
            deployment_record["status"] = "completed"
        elif failed_count == len(device_ids):
            deployment_record["status"] = "failed"
        else:
            deployment_record["status"] = "partial"
        
        deployment_record["completed_time"] = datetime.datetime.now().isoformat()
        
        # Save updated registry
        self._save_deployment_registry()
        
        # Save updated device config
        with open(self.edge_config_path, 'w') as f:
            json.dump(self.edge_config, f, indent=2)
        
        return deployment_record
    
    def get_deployment_status(self, deployment_id: str) -> Dict[str, Any]:
        """
        Get status of a deployment
        
        Args:
            deployment_id: Deployment identifier
            
        Returns:
            Deployment status information
        """
        for deployment in self.deployment_registry.get("deployments", []):
            if deployment["deployment_id"] == deployment_id:
                return deployment
        
        raise ValueError(f"Deployment {deployment_id} not found")
    
    def rollback_deployment(self, device_id: str, deployment_id: str) -> Dict[str, Any]:
        """
        Rollback a deployment on a specific device
        
        Args:
            device_id: Device identifier
            deployment_id: Deployment identifier
            
        Returns:
            Rollback status information
        """
        # Find the device
        device = None
        for d in self.edge_config.get("devices", []):
            if d["device_id"] == device_id:
                device = d
                break
        
        if not device:
            raise ValueError(f"Device {device_id} not found")
        
        # Find the deployment
        deployment = None
        for d in self.deployment_registry.get("deployments", []):
            if d["deployment_id"] == deployment_id:
                deployment = d
                break
        
        if not deployment:
            raise ValueError(f"Deployment {deployment_id} not found")
        
        # Find the previous model
        deployed_models = device.get("deployed_models", [])
        current_model = None
        previous_model = None
        
        for i, model in enumerate(deployed_models):
            if model["deployment_id"] == deployment_id:
                current_model = model
                # Find previous model (if any)
                if i > 0:
                    previous_model = deployed_models[i-1]
                break
        
        if not current_model:
            raise ValueError(f"Deployment {deployment_id} not found on device {device_id}")
        
        # If no previous model, clear the device
        if not previous_model:
            # Remove current model
            device["deployed_models"] = [m for m in deployed_models 
                                         if m["deployment_id"] != deployment_id]
            device["status"] = "registered"
            
            rollback_result = {
                "device_id": device_id,
                "deployment_id": deployment_id,
                "status": "rolled_back",
                "message": "Removed model from device (no previous version)",
                "timestamp": datetime.datetime.now().isoformat()
            }
        else:
            # In a real implementation, this would make a request to
            # the device to roll back to the previous model
            
            # Update device status
            device["deployed_models"] = [m for m in deployed_models 
                                        if m["deployment_id"] != deployment_id]
            device["deployed_models"].append(previous_model)
            device["status"] = "deployed"
            device["last_deployment"] = datetime.datetime.now().isoformat()
            
            rollback_result = {
                "device_id": device_id,
                "deployment_id": deployment_id,
                "previous_model": {
                    "model_name": previous_model["model_name"],
                    "model_version": previous_model["model_version"],
                    "deployment_id": previous_model["deployment_id"]
                },
                "status": "rolled_back",
                "message": "Rolled back to previous model",
                "timestamp": datetime.datetime.now().isoformat()
            }
        
        # Save updated device config
        with open(self.edge_config_path, 'w') as f:
            json.dump(self.edge_config, f, indent=2)
        
        # Create rollback record in registry
        rollback_id = f"rollback_{deployment_id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        rollback_record = {
            "rollback_id": rollback_id,
            "original_deployment_id": deployment_id,
            "device_id": device_id,
            "status": "completed",
            "start_time": datetime.datetime.now().isoformat(),
            "completed_time": datetime.datetime.now().isoformat(),
            "result": rollback_result
        }
        
        # Add to registry
        if "rollbacks" not in self.deployment_registry:
            self.deployment_registry["rollbacks"] = []
        
        self.deployment_registry["rollbacks"].append(rollback_record)
        self._save_deployment_registry()
        
        return rollback_result


# Example usage
def main():
    """Example of using the edge deployer"""
    # Create deployer
    deployer = EdgeDeployer()
    
    # Register edge device
    device = deployer.register_edge_device(
        device_id="charging_station_001",
        device_name="Main Street Charging Station 1",
        device_type="level2_charger",
        deployment_endpoint="https://charging-station-001.example.com/deploy",
        capabilities={
            "memory": "512MB",
            "cpu": "ARM Cortex-A53",
            "storage": "8GB",
            "supported_formats": ["onnx", "tflite"]
        }
    )
    
    print(f"Registered device: {device['device_name']} ({device['device_id']})")
    
    # List devices
    devices = deployer.get_edge_devices()
    print(f"Registered devices: {len(devices)}")
    
    # Deploy model (simulated)
    model_path = "app/ml/models/battery_health/battery_model_optimized.onnx"
    
    # For demonstration, let's pretend the model file exists
    Path("app/ml/models/battery_health").mkdir(parents=True, exist_ok=True)
    Path(model_path).touch()
    
    deployment = deployer.deploy_model(
        model_path=model_path,
        device_ids=["charging_station_001"],
        model_name="battery_health",
        model_version="v1.0.0"
    )
    
    print(f"Deployment status: {deployment['status']}")
    
    # Get device status
    status = deployer.get_device_status("charging_station_001")
    print(f"Device status: {status['status']}")
    
    # Clean up demonstration file
    Path(model_path).unlink()


if __name__ == "__main__":
    main() 