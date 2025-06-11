#!/usr/bin/env python3
"""
Simple API server for serving ONNX models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import json
import logging
from typing import List, Dict, Any
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="EV Charging ML API",
    description="Machine Learning API for EV Charging Infrastructure",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
MODEL_PATHS = {
    "usage": "models/usage_model.onnx",
    "price": "models/price_model.onnx"
}

# Load models
sessions = {}
for name, path in MODEL_PATHS.items():
    try:
        sessions[name] = ort.InferenceSession(path)
        print(f"✓ Loaded {name} model from {path}")
    except Exception as e:
        print(f"✗ Error loading {name} model: {e}")

# Request/Response models
class PredictionRequest(BaseModel):
    features: List[float]
    model_type: str = "usage"  # "usage" or "price"

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_type: str
    status: str

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    version: str

class ModelInfo(BaseModel):
    name: str
    input_shape: List[int]
    output_shape: List[int]
    input_name: str
    output_name: str

# Mock ML models (in production, these would be loaded from actual model files)
class MockMLModel:
    def __init__(self, model_type: str):
        self.model_type = model_type
        self.is_loaded = True
        
    def predict(self, features: List[float]) -> Dict[str, Any]:
        """Mock prediction function"""
        try:
            # Simulate model prediction
            if self.model_type == "usage":
                # Usage prediction (kWh)
                prediction = np.random.uniform(0.5, 5.0)
                confidence = np.random.uniform(0.8, 0.95)
            elif self.model_type == "price":
                # Price prediction ($/MWh)
                prediction = np.random.uniform(15.0, 45.0)
                confidence = np.random.uniform(0.75, 0.90)
            else:
                raise ValueError(f"Unknown model type: {self.model_type}")
                
            return {
                "prediction": float(prediction),
                "confidence": float(confidence),
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {
                "prediction": 0.0,
                "confidence": 0.0,
                "status": "error",
                "error": str(e)
            }

# Initialize models
usage_model = MockMLModel("usage")
price_model = MockMLModel("price")

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {"message": "EV Charging ML API", "status": "running"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        models_loaded=usage_model.is_loaded and price_model.is_loaded,
        version="1.0.0"
    )

@app.get("/models", response_model=List[str])
async def list_models():
    """List available models"""
    return list(sessions.keys())

@app.get("/models/{model_name}", response_model=ModelInfo)
async def get_model_info(model_name: str):
    """Get information about a specific model"""
    if model_name not in sessions:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    
    session = sessions[model_name]
    input_info = session.get_inputs()[0]
    output_info = session.get_outputs()[0]
    
    return ModelInfo(
        name=model_name,
        input_shape=list(input_info.shape),
        output_shape=list(output_info.shape),
        input_name=input_info.name,
        output_name=output_info.name
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make predictions using ML models"""
    try:
        # Validate input
        if len(request.features) != 10:
            raise HTTPException(
                status_code=400, 
                detail="Expected 10 features, got {}".format(len(request.features))
            )
        
        # Select model
        if request.model_type == "usage":
            model = usage_model
        elif request.model_type == "price":
            model = price_model
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown model type: {request.model_type}"
            )
        
        # Make prediction
        result = model.predict(request.features)
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result.get("error", "Prediction failed"))
        
        return PredictionResponse(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_type=request.model_type,
            status="success"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch")
async def predict_batch(requests: List[PredictionRequest]):
    """Batch prediction endpoint"""
    try:
        results = []
        for req in requests:
            try:
                # Make individual prediction
                if req.model_type == "usage":
                    model = usage_model
                elif req.model_type == "price":
                    model = price_model
                else:
                    results.append({
                        "prediction": 0.0,
                        "confidence": 0.0,
                        "model_type": req.model_type,
                        "status": "error",
                        "error": f"Unknown model type: {req.model_type}"
                    })
                    continue
                
                result = model.predict(req.features)
                results.append({
                    "prediction": result["prediction"],
                    "confidence": result["confidence"],
                    "model_type": req.model_type,
                    "status": result["status"]
                })
                
            except Exception as e:
                results.append({
                    "prediction": 0.0,
                    "confidence": 0.0,
                    "model_type": req.model_type,
                    "status": "error",
                    "error": str(e)
                })
        
        return {"results": results, "total": len(results)}
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/info")
async def get_models_info():
    """Get information about loaded models"""
    return {
        "models": [
            {
                "name": "usage_prediction",
                "type": "usage",
                "status": "loaded" if usage_model.is_loaded else "not_loaded",
                "description": "Predicts energy usage in kWh"
            },
            {
                "name": "price_prediction", 
                "type": "price",
                "status": "loaded" if price_model.is_loaded else "not_loaded",
                "description": "Predicts energy price in $/MWh"
            }
        ]
    }

@app.get("/metrics")
async def get_metrics():
    """Get API metrics"""
    return {
        "requests_total": 0,  # Would be tracked in production
        "predictions_total": 0,
        "errors_total": 0,
        "uptime_seconds": 0,
        "models_loaded": 2
    }

# Example requests for testing
@app.get("/examples")
async def get_examples():
    """Get example requests for testing"""
    return {
        "examples": [
            {
                "description": "Usage prediction - Low usage",
                "request": {
                    "model_type": "usage",
                    "features": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
                }
            },
            {
                "description": "Price prediction - Peak hours",
                "request": {
                    "model_type": "price",
                    "features": [2.5, 8.0, 3.5, 9.0, 1.5, 7.5, 4.0, 6.5, 2.0, 8.5]
                }
            }
        ]
    }

if __name__ == "__main__":
    print("Starting EV Charging ML API server...")
    print("Access the API at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    uvicorn.run(
        "model_api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 