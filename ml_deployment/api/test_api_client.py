#!/usr/bin/env python3
"""
Test client for the ML API
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

def test_api():
    """Test the API endpoints"""
    
    print("Testing EV Charging ML API")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test models endpoint
    print("\n2. Getting available models...")
    response = requests.get(f"{BASE_URL}/models")
    print(f"Available models: {response.json()}")
    
    # Test model info
    print("\n3. Getting model information...")
    for model in ["usage", "price"]:
        response = requests.get(f"{BASE_URL}/models/{model}")
        print(f"\n{model} model info:")
        print(json.dumps(response.json(), indent=2))
    
    # Test predictions
    print("\n4. Testing predictions...")
    
    test_cases = [
        {
            "name": "Usage prediction - Low usage",
            "model_name": "usage",
            "features": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
        },
        {
            "name": "Usage prediction - High usage",
            "model_name": "usage",
            "features": [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0]
        },
        {
            "name": "Price prediction - Weekend",
            "model_name": "price",
            "features": [3.0, 3.5, 4.0, 4.5, 5.0, 5.0, 4.5, 4.0, 3.5, 3.0]
        },
        {
            "name": "Price prediction - Peak hours",
            "model_name": "price",
            "features": [2.5, 8.0, 3.5, 9.0, 1.5, 7.5, 4.0, 6.5, 2.0, 8.5]
        }
    ]
    
    for test_case in test_cases:
        print(f"\n{test_case['name']}:")
        response = requests.post(
            f"{BASE_URL}/predict",
            json={
                "model_name": test_case["model_name"],
                "features": test_case["features"]
            }
        )
        if response.status_code == 200:
            result = response.json()
            print(f"  Prediction: {result['prediction']:.4f}")
        else:
            print(f"  Error: {response.status_code} - {response.text}")
    
    print("\n" + "=" * 50)
    print("API testing completed!")

if __name__ == "__main__":
    print("Make sure the API server is running (python3 model_api_server.py)")
    print("Press Enter to start testing...")
    input()
    
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API server.")
        print("Please make sure the server is running on http://localhost:8000") 