#!/usr/bin/env python3
"""
Test ONNX models to verify they work correctly
"""

import numpy as np
import onnx
import onnxruntime as ort

def test_onnx_model(model_path):
    """Test an ONNX model"""
    print(f"\nTesting model: {model_path}")
    
    # Load and check the model
    model = onnx.load(model_path)
    onnx.checker.check_model(model)
    print("✓ Model is valid ONNX")
    
    # Create inference session
    session = ort.InferenceSession(model_path)
    
    # Get input and output details
    input_name = session.get_inputs()[0].name
    input_shape = session.get_inputs()[0].shape
    output_name = session.get_outputs()[0].name
    
    print(f"Input name: {input_name}")
    print(f"Input shape: {input_shape}")
    print(f"Output name: {output_name}")
    
    # Create test input (10 features)
    test_input = np.array([[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]], dtype=np.float32)
    
    # Run inference
    result = session.run([output_name], {input_name: test_input})
    
    print(f"Prediction result: {result[0]}")
    print("✓ Inference successful")

def main():
    """Test all ONNX models"""
    print("ONNX Model Testing")
    print("==================")
    
    models = [
        "models/usage_model.onnx",
        "models/price_model.onnx"
    ]
    
    for model_path in models:
        try:
            test_onnx_model(model_path)
        except Exception as e:
            print(f"Error testing {model_path}: {str(e)}")

if __name__ == "__main__":
    main() 