#!/usr/bin/env python3
"""
Comprehensive ONNX model testing with various test cases
"""

import numpy as np
import onnx
import onnxruntime as ort
import json
from datetime import datetime

def create_test_cases():
    """Create various test cases for model testing"""
    return [
        {
            "name": "Low usage scenario",
            "features": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            "description": "All features at low values"
        },
        {
            "name": "High usage scenario", 
            "features": [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
            "description": "All features at high values"
        },
        {
            "name": "Mixed scenario 1",
            "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0],
            "description": "Increasing values"
        },
        {
            "name": "Mixed scenario 2",
            "features": [10.0, 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 1.0],
            "description": "Decreasing values"
        },
        {
            "name": "Peak hours simulation",
            "features": [2.5, 8.0, 3.5, 9.0, 1.5, 7.5, 4.0, 6.5, 2.0, 8.5],
            "description": "Simulating peak and off-peak patterns"
        },
        {
            "name": "Weekend pattern",
            "features": [3.0, 3.5, 4.0, 4.5, 5.0, 5.0, 4.5, 4.0, 3.5, 3.0],
            "description": "Moderate, consistent usage"
        }
    ]

def test_model_comprehensive(model_path, test_cases):
    """Test an ONNX model with multiple test cases"""
    print(f"\n{'='*60}")
    print(f"Testing model: {model_path}")
    print(f"{'='*60}")
    
    # Load model
    model = onnx.load(model_path)
    onnx.checker.check_model(model)
    
    # Create inference session
    session = ort.InferenceSession(model_path)
    
    # Get model info
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    
    print(f"\nModel Information:")
    print(f"- Input name: {input_name}")
    print(f"- Input shape: {session.get_inputs()[0].shape}")
    print(f"- Output name: {output_name}")
    print(f"- Output shape: {session.get_outputs()[0].shape}")
    
    results = []
    
    print(f"\nRunning {len(test_cases)} test cases:")
    print("-" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        # Prepare input
        test_input = np.array([test_case["features"]], dtype=np.float32)
        
        # Run inference
        result = session.run([output_name], {input_name: test_input})
        prediction = result[0][0][0]
        
        # Store result
        results.append({
            "test_case": test_case["name"],
            "description": test_case["description"],
            "input_features": test_case["features"],
            "prediction": float(prediction)
        })
        
        # Display result
        print(f"\nTest Case {i}: {test_case['name']}")
        print(f"Description: {test_case['description']}")
        print(f"Input: {test_case['features']}")
        print(f"Prediction: {prediction:.4f}")
    
    return results

def generate_report(all_results):
    """Generate a comprehensive test report"""
    report = {
        "test_date": datetime.now().isoformat(),
        "models_tested": len(all_results),
        "test_cases_per_model": len(create_test_cases()),
        "results": all_results
    }
    
    # Save report to JSON
    report_path = "model_test_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Test report saved to: {report_path}")
    
    # Generate summary statistics
    print(f"\nSUMMARY STATISTICS:")
    print("-" * 60)
    
    for model_name, results in all_results.items():
        # Skip if there was an error
        if isinstance(results, dict) and "error" in results:
            print(f"\n{model_name}: ERROR - {results['error']}")
            continue
            
        predictions = [r["prediction"] for r in results]
        print(f"\n{model_name}:")
        print(f"  - Min prediction: {min(predictions):.4f}")
        print(f"  - Max prediction: {max(predictions):.4f}")
        print(f"  - Mean prediction: {np.mean(predictions):.4f}")
        print(f"  - Std deviation: {np.std(predictions):.4f}")

def main():
    """Main test function"""
    print("COMPREHENSIVE ONNX MODEL TESTING")
    print("================================")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    models = {
        "usage_model": "models/usage_model.onnx",
        "price_model": "models/price_model.onnx"
    }
    
    test_cases = create_test_cases()
    all_results = {}
    
    for model_name, model_path in models.items():
        try:
            results = test_model_comprehensive(model_path, test_cases)
            all_results[model_name] = results
        except Exception as e:
            print(f"\nError testing {model_name}: {str(e)}")
            all_results[model_name] = {"error": str(e)}
    
    # Generate report
    generate_report(all_results)
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 