"""
Data Versioning System

This module provides utilities for versioning datasets using DVC, 
tracking changes, and managing different versions of training data.
"""
import os
import sys
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any, Union

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DataVersioningManager:
    """
    Manages data versioning using DVC (Data Version Control)
    
    This class provides utilities for:
    1. Initializing DVC in a data directory
    2. Adding data files to DVC tracking
    3. Creating versions/tags for datasets
    4. Switching between dataset versions
    5. Retrieving dataset metadata and history
    """
    
    def __init__(
        self, 
        data_dir: str = "data",
        remote_storage: Optional[str] = None
    ):
        """
        Initialize the data versioning manager
        
        Args:
            data_dir: Base directory for data storage
            remote_storage: Optional remote storage URL (S3, GCS, etc.)
        """
        self.data_dir = Path(data_dir).resolve()
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        self.features_dir = self.data_dir / "features"
        self.remote_storage = remote_storage
        
        # Create data directories if they don't exist
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        os.makedirs(self.features_dir, exist_ok=True)
        
        logger.info(f"DataVersioningManager initialized with data directory: {self.data_dir}")
    
    def initialize_dvc(self) -> bool:
        """
        Initialize DVC in the data directory
        
        Returns:
            True if initialization was successful, False otherwise
        """
        try:
            # Initialize DVC
            result = subprocess.run(
                ["dvc", "init"], 
                cwd=str(self.data_dir.parent),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0 and "already initialized" not in result.stderr:
                logger.error(f"Failed to initialize DVC: {result.stderr}")
                return False
            
            # Set up remote storage if provided
            if self.remote_storage:
                result = subprocess.run(
                    ["dvc", "remote", "add", "storage", self.remote_storage],
                    cwd=str(self.data_dir.parent),
                    capture_output=True,
                    text=True
                )
                
                if result.returncode != 0:
                    logger.error(f"Failed to add remote storage: {result.stderr}")
                    return False
                
                # Set as default remote
                subprocess.run(
                    ["dvc", "remote", "default", "storage"],
                    cwd=str(self.data_dir.parent),
                    capture_output=True
                )
            
            logger.info("DVC initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing DVC: {str(e)}")
            return False
    
    def add_data(self, data_path: Union[str, Path], message: str = "") -> bool:
        """
        Add data to DVC tracking
        
        Args:
            data_path: Path to data file or directory to add
            message: Optional message describing the data
            
        Returns:
            True if the data was added successfully, False otherwise
        """
        try:
            data_path = Path(data_path)
            
            # Make path relative to data directory if needed
            if not data_path.is_absolute():
                data_path = self.data_dir / data_path
            
            # Verify the path exists
            if not data_path.exists():
                logger.error(f"Data path does not exist: {data_path}")
                return False
            
            # Add to DVC
            result = subprocess.run(
                ["dvc", "add", str(data_path)],
                cwd=str(self.data_dir.parent),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to add data to DVC: {result.stderr}")
                return False
            
            # Add to git
            dvc_file = f"{data_path}.dvc"
            if os.path.exists(dvc_file):
                git_result = subprocess.run(
                    ["git", "add", dvc_file],
                    cwd=str(self.data_dir.parent),
                    capture_output=True,
                    text=True
                )
                
                # Commit with message
                if git_result.returncode == 0 and message:
                    commit_msg = f"Add {data_path.name} - {message}"
                    subprocess.run(
                        ["git", "commit", "-m", commit_msg],
                        cwd=str(self.data_dir.parent),
                        capture_output=True
                    )
            
            logger.info(f"Added {data_path} to DVC tracking")
            return True
            
        except Exception as e:
            logger.error(f"Error adding data to DVC: {str(e)}")
            return False
    
    def create_dataset_version(
        self, 
        version_name: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Create a version tag for the current dataset state
        
        Args:
            version_name: Name or version identifier
            metadata: Optional metadata about this version
            
        Returns:
            True if version was created successfully, False otherwise
        """
        try:
            # Create git tag for this version
            tag_name = f"dataset-{version_name}"
            
            # Create tag message with metadata
            message = f"Dataset version {version_name}"
            if metadata:
                message += f"\n\nMetadata: {metadata}"
            
            result = subprocess.run(
                ["git", "tag", "-a", tag_name, "-m", message],
                cwd=str(self.data_dir.parent),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to create dataset version: {result.stderr}")
                return False
            
            logger.info(f"Created dataset version: {version_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating dataset version: {str(e)}")
            return False
    
    def switch_to_version(self, version_name: str) -> bool:
        """
        Switch to a specific dataset version
        
        Args:
            version_name: Version identifier to switch to
            
        Returns:
            True if switch was successful, False otherwise
        """
        try:
            tag_name = f"dataset-{version_name}"
            
            # First checkout the git tag to get the right DVC files
            result = subprocess.run(
                ["git", "checkout", tag_name],
                cwd=str(self.data_dir.parent),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to checkout dataset version: {result.stderr}")
                return False
            
            # Then pull the data using DVC
            result = subprocess.run(
                ["dvc", "pull"],
                cwd=str(self.data_dir.parent),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to pull dataset: {result.stderr}")
                return False
            
            logger.info(f"Switched to dataset version: {version_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error switching dataset version: {str(e)}")
            return False
    
    def get_dataset_versions(self) -> List[Dict[str, Any]]:
        """
        Get a list of all available dataset versions
        
        Returns:
            List of dictionaries containing version information
        """
        try:
            # Get all dataset tags
            result = subprocess.run(
                ["git", "tag", "-l", "dataset-*"],
                cwd=str(self.data_dir.parent),
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Failed to retrieve dataset versions: {result.stderr}")
                return []
            
            tags = result.stdout.strip().split("\n")
            versions = []
            
            for tag in tags:
                if not tag:
                    continue
                
                # Get tag message which contains metadata
                show_result = subprocess.run(
                    ["git", "show", tag, "-s", "--format=%ai %s"],
                    cwd=str(self.data_dir.parent),
                    capture_output=True,
                    text=True
                )
                
                if show_result.returncode != 0:
                    continue
                
                info = show_result.stdout.strip().split(" ", 3)
                date = info[0] if len(info) > 0 else ""
                version_name = tag.replace("dataset-", "")
                
                versions.append({
                    "version": version_name,
                    "created_at": date,
                    "tag": tag
                })
            
            return versions
            
        except Exception as e:
            logger.error(f"Error getting dataset versions: {str(e)}")
            return []
    
    def save_dataset_metadata(self, metadata: Dict[str, Any], version: str) -> bool:
        """
        Save metadata about a dataset version
        
        Args:
            metadata: Dictionary with dataset metadata
            version: Dataset version identifier
            
        Returns:
            True if metadata was saved successfully, False otherwise
        """
        try:
            metadata_file = self.data_dir / f"metadata_{version}.json"
            
            import json
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            # Add metadata file to DVC
            self.add_data(metadata_file, f"Metadata for version {version}")
            
            logger.info(f"Saved metadata for version {version}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving dataset metadata: {str(e)}")
            return False


# Example usage
def main():
    """Example of using the data versioning manager"""
    versioning = DataVersioningManager(
        data_dir="data",
        remote_storage="s3://my-bucket/dvc-storage"
    )
    
    # Initialize DVC
    versioning.initialize_dvc()
    
    # Add a sample dataset
    versioning.add_data("raw/battery_telemetry_2023.csv", "Battery telemetry from 2023")
    
    # Create a version
    versioning.create_dataset_version(
        "v1.0", 
        metadata={"description": "Initial dataset", "records": 10000}
    )
    
    # List available versions
    versions = versioning.get_dataset_versions()
    for v in versions:
        print(f"Version: {v['version']}, Created: {v['created_at']}")


if __name__ == "__main__":
    main() 