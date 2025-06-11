#!/usr/bin/env python3
"""Test script for fallback ML endpoints"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.abspath('.'))

async def test_fallback_ml():
    print("🧪 Testing Fallback ML Endpoints")
    print("=" * 50)
    
    try:
        # Import the fallback module
        from app.api.ml_fallback import (
            ml_health_check, get_models, predict_price, predict_usage, predict_next_usage,
            PricePredictionRequest, UsagePredictionRequest, NextUsagePredictionRequest
        )
        
        print("✅ Fallback ML module imported successfully")
        
        # Test health check
        print("\n1. Testing health check...")
        health = await ml_health_check()
        print(f"   Status: {health['status']}")
        print(f"   Service: {health['service']}")
        print(f"   Message: {health['message']}")
        
        # Test models endpoint
        print("\n2. Testing models endpoint...")
        models = await get_models()
        print(f"   Found {len(models)} models:")
        for model in models:
            print(f"   - {model.name} ({model.type}): {model.status}")
        
        # Test price prediction
        print("\n3. Testing price prediction...")
        price_req = PricePredictionRequest(
            hour=18,  # Peak hour
            day_of_week=2,  # Wednesday
            demand_mw=500.0,
            temperature=25.0
        )
        price_result = await predict_price(price_req)
        print(f"   Prediction: ${price_result.prediction:.3f}/kWh")
        print(f"   Confidence: {price_result.confidence:.1%}")
        print(f"   Model: {price_result.model_type}")
        
        # Test usage prediction
        print("\n4. Testing usage prediction...")
        usage_req = UsagePredictionRequest(
            vehicle_type="sedan",
            battery_capacity=75.0,
            current_soc=20.0,
            target_soc=80.0,
            charging_power=50.0
        )
        usage_result = await predict_usage(usage_req)
        print(f"   Prediction: {usage_result.prediction:.1f} kWh")
        print(f"   Confidence: {usage_result.confidence:.1%}")
        print(f"   Model: {usage_result.model_type}")
        
        # Test next usage prediction
        print("\n5. Testing next usage prediction...")
        next_usage_req = NextUsagePredictionRequest(
            station_id="CP001-ABB",
            hour=17,  # Evening commute
            day_of_week=1  # Tuesday
        )
        next_usage_result = await predict_next_usage(next_usage_req)
        print(f"   Prediction: {next_usage_result.prediction:.1f} kWh")
        print(f"   Confidence: {next_usage_result.confidence:.1%}")
        print(f"   Model: {next_usage_result.model_type}")
        
        print("\n🎉 All fallback ML tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_mock_predictors():
    print("\n🎭 Testing Mock Predictors Directly")
    print("=" * 50)
    
    try:
        from app.api.ml_fallback import MockPredictor
        
        mock = MockPredictor()
        
        # Test price prediction
        price = mock.predict_price(hour=18, day_of_week=2, demand_mw=500.0, temperature=30.0)
        print(f"Mock price prediction: ${price:.3f}/kWh")
        
        # Test usage prediction
        usage = mock.predict_usage("sedan", 75.0, 20.0, 80.0, 50.0)
        print(f"Mock usage prediction: {usage:.1f} kWh")
        
        # Test next usage prediction
        next_usage = mock.predict_next_usage("CP001-ABB", 17, 1)
        print(f"Mock next usage prediction: {next_usage:.1f} kWh")
        
        print("✅ Mock predictors working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Mock predictor test failed: {e}")
        return False

def test_onnx_models():
    print("\n🔄 Testing ONNX Model Loading")
    print("=" * 50)
    
    try:
        from app.api.ml_fallback import ONNXModelManager
        
        manager = ONNXModelManager()
        
        print("ONNX Models Status:")
        for name, info in manager.models.items():
            status = info.get("status", "unknown")
            print(f"  {name}: {status}")
            
            if status == "loaded":
                print(f"    Input: {info['input_name']}")
                print(f"    Shape: {info['input_shape']}")
        
        return True
        
    except Exception as e:
        print(f"❌ ONNX test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting ML Fallback Tests\n")
    
    # Test mock predictors
    mock_success = test_mock_predictors()
    
    # Test ONNX models
    onnx_success = test_onnx_models()
    
    # Test async endpoints
    async_success = asyncio.run(test_fallback_ml())
    
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"Mock Predictors: {'✅ PASS' if mock_success else '❌ FAIL'}")
    print(f"ONNX Models: {'✅ PASS' if onnx_success else '❌ FAIL'}")
    print(f"Async Endpoints: {'✅ PASS' if async_success else '❌ FAIL'}")
    
    if all([mock_success, onnx_success, async_success]):
        print("\n🎉 All tests passed! Fallback ML system is working.")
    else:
        print("\n⚠️  Some tests failed. Check the output above.") 