#!/usr/bin/env python3
"""
ML.NET Model Converter
Converts scikit-learn models to ONNX format for ML.NET compatibility
"""

import os
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import skl2onnx
from skl2onnx.common.data_types import FloatTensorType
import onnx
from onnxruntime.transformers import optimizer
from typing import Dict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MLNetConverter:
    """Convert ML models to ONNX format for ML.NET compatibility"""
    
    def __init__(self, model_dir: str = "app/ml/models"):
        """
        Initialize the converter
        
        Args:
            model_dir: Directory containing the models to convert
        """
        self.model_dir = Path(model_dir)
        self.output_dir = self.model_dir / "mlnet"
        self.output_dir.mkdir(exist_ok=True)
    
    def convert_model(self, model_path: str) -> str:
        """
        Convert a model to ONNX format
        
        Args:
            model_path: Path to the model file
            
        Returns:
            Path to the converted ONNX model
        """
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        # Load the model
        model_data = joblib.load(model_path)
        
        # Extract model and metadata
        if isinstance(model_data, dict):
            model = model_data.get('model')
            metadata = model_data.get('metadata', {})
        else:
            model = model_data
            metadata = {}
        
        if model is None:
            raise ValueError(f"No model found in {model_path}")
        
        # Get feature names from metadata or model
        feature_names = metadata.get('features', [])
        n_features = 0
        
        # Try to get number of features from the model
        if hasattr(model, 'n_features_in_'):
            n_features = model.n_features_in_
        elif hasattr(model, 'feature_names_in_'):
            n_features = len(model.feature_names_in_)
        elif hasattr(model, 'named_steps'):
            # Handle sklearn Pipeline
            for step_name, step in model.named_steps.items():
                if hasattr(step, 'n_features_in_'):
                    n_features = step.n_features_in_
                    break
        
        # If we couldn't determine the number of features, use a default
        if n_features == 0:
            logger.warning(f"Could not determine number of features for {model_path}, using default of 10")
            n_features = 10  # Default based on our training script
        
        # Create initial type
        initial_type = [('float_input', FloatTensorType([None, n_features]))]
        
        # Convert to ONNX
        try:
            onnx_model = skl2onnx.convert_sklearn(
                model,
                initial_types=initial_type,
                name=f"{model_path.stem}_onnx",
                target_opset=12  # ML.NET compatible opset
            )
            
            # Save the ONNX model
            output_path = self.output_dir / f"{model_path.stem}.onnx"
            with open(output_path, "wb") as f:
                f.write(onnx_model.SerializeToString())
            
            # Don't optimize the model for now to avoid errors
            logger.info(f"Converted model to ONNX format: {output_path}")
            logger.info(f"Model expects {n_features} input features")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error converting model to ONNX: {str(e)}")
            raise
    
    def convert_all_models(self) -> Dict[str, str]:
        """
        Convert all models in the model directory to ONNX format
        
        Returns:
            Dictionary mapping model names to their ONNX paths
        """
        converted_models = {}
        
        # Find all model files
        model_files = list(self.model_dir.rglob("*.joblib"))
        model_files.extend(self.model_dir.rglob("*.pkl"))
        
        for model_file in model_files:
            try:
                onnx_path = self.convert_model(str(model_file))
                converted_models[model_file.stem] = onnx_path
            except Exception as e:
                logger.error(f"Error converting {model_file}: {str(e)}")
        
        return converted_models

def main():
    """Main function to convert models to ONNX format"""
    converter = MLNetConverter()
    
    try:
        converted_models = converter.convert_all_models()
        
        # Print summary
        print("\nConversion Summary:")
        print("------------------")
        for model_name, onnx_path in converted_models.items():
            print(f"✓ {model_name} -> {onnx_path}")
        
        print("\nNext steps:")
        print("1. Create a new C# project in Visual Studio")
        print("2. Add the ML.NET NuGet package")
        print("3. Copy the converted ONNX models to your C# project")
        print("4. Use ML.NET's OnnxTransformer to load and use the models")
        
    except Exception as e:
        logger.error(f"Error during conversion: {str(e)}")
        raise

if __name__ == "__main__":
    main() 