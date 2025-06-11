"""
Edge Model Optimizer

This module provides functionality to optimize machine learning models
for deployment on edge devices (charging stations with limited resources).
"""
import os
import sys
import logging
import numpy as np
from typing import Optional, Dict, Any, Tuple, Union, List
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EdgeModelOptimizer:
    """
    Optimizes ML models for deployment on edge devices (EV charging stations)
    with limited computational resources.
    
    Supports model compression, quantization, and format conversion to ensure
    efficient inference on edge hardware.
    """
    
    def __init__(self, model_path: str, target_device: str = "cpu"):
        """
        Initialize edge model optimizer
        
        Args:
            model_path: Path to the model file
            target_device: Target device ("cpu", "gpu", "tpu", etc.)
        """
        self.model_path = model_path
        self.target_device = target_device
        self.model_type = self._detect_model_type()
        self.model = None
        
        logger.info(f"Initialized EdgeModelOptimizer for {model_path} targeting {target_device}")
    
    def _detect_model_type(self) -> str:
        """Detect the type of model based on file extension"""
        if self.model_path.endswith('.h5') or self.model_path.endswith('.keras'):
            return "tensorflow"
        elif self.model_path.endswith('.pt') or self.model_path.endswith('.pth'):
            return "pytorch"
        elif self.model_path.endswith('.onnx'):
            return "onnx"
        elif self.model_path.endswith('.tflite'):
            return "tflite"
        elif self.model_path.endswith('.pb'):
            return "tensorflow_pb"
        elif self.model_path.endswith('.joblib') or self.model_path.endswith('.pkl'):
            return "sklearn"
        else:
            return "unknown"
    
    def optimize(self, quantize: bool = True, pruning_ratio: float = 0.3) -> str:
        """
        Optimize model for edge deployment
        
        Args:
            quantize: Whether to apply quantization
            pruning_ratio: Ratio of weights to prune (0.0 to 1.0)
            
        Returns:
            Path to optimized model
        """
        logger.info(f"Optimizing model with quantize={quantize}, pruning_ratio={pruning_ratio}")
        
        if self.model_type == "tensorflow":
            return self._optimize_tensorflow(quantize, pruning_ratio)
        elif self.model_type == "pytorch":
            return self._optimize_pytorch(quantize, pruning_ratio)
        elif self.model_type == "sklearn":
            return self._optimize_sklearn(quantize)
        elif self.model_type == "onnx":
            return self._optimize_onnx()
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def _optimize_tensorflow(self, quantize: bool, pruning_ratio: float) -> str:
        """
        Optimize TensorFlow model
        
        Args:
            quantize: Whether to apply quantization
            pruning_ratio: Ratio of weights to prune
            
        Returns:
            Path to optimized model
        """
        try:
            import tensorflow as tf
            # Load the model
            model = tf.keras.models.load_model(self.model_path)
            
            # Apply pruning if specified
            if pruning_ratio > 0:
                try:
                    import tensorflow_model_optimization as tfmot
                    # Apply weight pruning
                    pruning_params = {
                        'pruning_schedule': tfmot.sparsity.keras.PolynomialDecay(
                            initial_sparsity=0.0,
                            final_sparsity=pruning_ratio,
                            begin_step=0,
                            end_step=1000
                        )
                    }
                    
                    # Apply pruning to all layers
                    model_for_pruning = tfmot.sparsity.keras.prune_low_magnitude(model, **pruning_params)
                    model_for_pruning.compile(
                        optimizer='adam',
                        loss=model.loss,
                        metrics=model.metrics_names
                    )
                    
                    # Finalize pruning
                    model = tfmot.sparsity.keras.strip_pruning(model_for_pruning)
                    logger.info(f"Applied pruning with ratio {pruning_ratio}")
                    
                except ImportError:
                    logger.warning("tensorflow_model_optimization not available, skipping pruning")
            
            # Convert to TFLite if quantization is requested
            if quantize:
                # Create TFLite converter
                converter = tf.lite.TFLiteConverter.from_keras_model(model)
                
                # Apply optimization
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
                
                # For full integer quantization
                converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
                converter.inference_input_type = tf.int8
                converter.inference_output_type = tf.int8
                
                # Convert the model
                tflite_model = converter.convert()
                
                # Save the model to disk
                output_path = self.model_path.replace('.h5', '.tflite').replace('.keras', '.tflite')
                with open(output_path, 'wb') as f:
                    f.write(tflite_model)
                
                logger.info(f"Created quantized TFLite model at {output_path}")
                return output_path
            else:
                # Save optimized model (without quantization)
                output_path = self.model_path.replace('.h5', '_optimized.h5').replace('.keras', '_optimized.keras')
                model.save(output_path)
                logger.info(f"Saved optimized TensorFlow model to {output_path}")
                return output_path
                
        except ImportError:
            logger.error("TensorFlow not available. Please install tensorflow.")
            raise
    
    def _optimize_pytorch(self, quantize: bool, pruning_ratio: float) -> str:
        """
        Optimize PyTorch model
        
        Args:
            quantize: Whether to apply quantization
            pruning_ratio: Ratio of weights to prune
            
        Returns:
            Path to optimized model
        """
        try:
            import torch
            
            # Load the model
            model = torch.load(self.model_path)
            model.eval()  # Set to evaluation mode
            
            # Apply pruning if specified
            if pruning_ratio > 0:
                try:
                    import torch.nn.utils.prune as prune
                    
                    # Prune each parameter by the specified ratio
                    for name, module in model.named_modules():
                        if isinstance(module, torch.nn.Conv2d) or isinstance(module, torch.nn.Linear):
                            prune.l1_unstructured(module, name='weight', amount=pruning_ratio)
                            prune.remove(module, 'weight')  # Make pruning permanent
                    
                    logger.info(f"Applied pruning with ratio {pruning_ratio}")
                except Exception as e:
                    logger.warning(f"Error applying pruning: {str(e)}")
            
            # Apply quantization if specified
            if quantize:
                try:
                    # Use dynamic quantization
                    quantized_model = torch.quantization.quantize_dynamic(
                        model, 
                        {torch.nn.Linear, torch.nn.LSTM, torch.nn.LSTMCell}, 
                        dtype=torch.qint8
                    )
                    model = quantized_model
                    logger.info("Applied quantization")
                except Exception as e:
                    logger.warning(f"Error applying quantization: {str(e)}")
            
            # Save the optimized model
            output_path = self.model_path.replace('.pt', '_optimized.pt').replace('.pth', '_optimized.pth')
            torch.save(model, output_path)
            
            # Export to ONNX for broader compatibility
            try:
                # Create a dummy input of appropriate size
                dummy_input = torch.randn(1, 3, 224, 224)
                onnx_path = output_path.replace('.pt', '.onnx').replace('.pth', '.onnx')
                
                # Export the model
                torch.onnx.export(
                    model,
                    dummy_input,
                    onnx_path,
                    export_params=True,
                    opset_version=11,
                    do_constant_folding=True,
                    verbose=False
                )
                logger.info(f"Exported model to ONNX format at {onnx_path}")
                return onnx_path
            except Exception as e:
                logger.warning(f"Error exporting to ONNX: {str(e)}")
                return output_path
                
        except ImportError:
            logger.error("PyTorch not available. Please install torch.")
            raise
    
    def _optimize_sklearn(self, quantize: bool) -> str:
        """
        Optimize scikit-learn model by converting to ONNX
        
        Args:
            quantize: Whether to apply quantization
            
        Returns:
            Path to optimized model
        """
        try:
            import joblib
            import numpy as np
            
            # Load the model
            model = joblib.load(self.model_path)
            logger.info(f"Loaded scikit-learn model from {self.model_path}")
            
            # Convert to ONNX if possible
            try:
                import skl2onnx
                from skl2onnx.common.data_types import FloatTensorType
                
                # Get initial shape from model if possible
                n_features = 1
                if hasattr(model, 'n_features_in_'):
                    n_features = model.n_features_in_
                
                # Define input type
                initial_type = [('float_input', FloatTensorType([None, n_features]))]
                
                # Convert to ONNX
                onnx_model = skl2onnx.convert_sklearn(
                    model,
                    initial_types=initial_type,
                    target_opset=12
                )
                
                # Save the ONNX model
                output_path = self.model_path.replace('.joblib', '.onnx').replace('.pkl', '.onnx')
                with open(output_path, 'wb') as f:
                    f.write(onnx_model.SerializeToString())
                
                logger.info(f"Converted scikit-learn model to ONNX at {output_path}")
                return output_path
                
            except ImportError:
                # If skl2onnx is not available, just compress the joblib file
                output_path = self.model_path.replace('.joblib', '_optimized.joblib').replace('.pkl', '_optimized.pkl')
                joblib.dump(model, output_path, compress=3)
                logger.info(f"Compressed scikit-learn model to {output_path}")
                return output_path
                
        except ImportError:
            logger.error("joblib not available. Please install joblib.")
            raise
    
    def _optimize_onnx(self) -> str:
        """
        Optimize ONNX model
        
        Returns:
            Path to optimized model
        """
        try:
            import onnx
            from onnxruntime.transformers import optimizer
            
            # Load the model
            model = onnx.load(self.model_path)
            
            # Optimize the model
            optimized_model = optimizer.optimize_model(
                self.model_path,
                model_type='bert',  # Generic optimization type
                num_heads=12,
                hidden_size=768
            )
            
            # Save the optimized model
            output_path = self.model_path.replace('.onnx', '_optimized.onnx')
            optimized_model.save_model_to_file(output_path)
            
            logger.info(f"Optimized ONNX model to {output_path}")
            return output_path
            
        except ImportError:
            logger.error("ONNX Runtime not available. Please install onnxruntime.")
            raise

    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the model
        
        Returns:
            Dictionary with model information
        """
        info = {
            'model_path': self.model_path,
            'model_type': self.model_type,
            'target_device': self.target_device,
            'file_size_mb': round(os.path.getsize(self.model_path) / (1024 * 1024), 2)
        }
        
        return info


# Example usage
def main():
    """Example of using the edge model optimizer"""
    model_path = 'app/ml/models/battery_health/battery_model_latest.joblib'
    
    # Create optimizer
    optimizer = EdgeModelOptimizer(model_path)
    
    # Print model info
    print(f"Model info: {optimizer.get_model_info()}")
    
    # Optimize model for edge
    optimized_path = optimizer.optimize(quantize=True, pruning_ratio=0.2)
    
    print(f"Optimized model saved to {optimized_path}")


if __name__ == "__main__":
    main() 