"""
Fallback ML endpoints using ONNX models and mock predictors
Used when XGBoost dependencies are not available
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import os
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

# Request/Response Models
class PricePredictionRequest(BaseModel):
    hour: int = Field(..., ge=0, le=23, description="Hour of day (0-23)")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    demand_mw: float = Field(..., ge=0, description="Energy demand in MW")
    temperature: Optional[float] = Field(25.0, description="Temperature in Celsius")

class UsagePredictionRequest(BaseModel):
    vehicle_type: str = Field(..., description="Type of vehicle")
    battery_capacity: float = Field(..., ge=0, description="Battery capacity in kWh")
    current_soc: float = Field(..., ge=0, le=100, description="Current state of charge (%)")
    target_soc: float = Field(..., ge=0, le=100, description="Target state of charge (%)")
    charging_power: Optional[float] = Field(50.0, description="Charging power in kW")

class NextUsagePredictionRequest(BaseModel):
    station_id: str = Field(..., description="Charging station ID")
    hour: int = Field(..., ge=0, le=23, description="Hour of day")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week")

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_type: str
    timestamp: datetime

class ModelInfo(BaseModel):
    name: str
    type: str
    status: str
    size_kb: float
    last_updated: datetime

# ONNX Model Manager
class ONNXModelManager:
    def __init__(self):
        self.models = {}
        self.model_paths = {
            "price": "app/ml/models/mlnet/price_model.onnx",
            "usage": "app/ml/models/mlnet/usage_model.onnx"
        }
        self.load_models()
    
    def load_models(self):
        """Load ONNX models if available"""
        try:
            import onnxruntime as ort
            
            for model_name, path in self.model_paths.items():
                if os.path.exists(path):
                    try:
                        session = ort.InferenceSession(path)
                        self.models[model_name] = {
                            "session": session,
                            "input_name": session.get_inputs()[0].name,
                            "input_shape": session.get_inputs()[0].shape,
                            "status": "loaded"
                        }
                        logger.info(f"Loaded ONNX model: {model_name}")
                    except Exception as e:
                        logger.error(f"Failed to load ONNX model {model_name}: {e}")
                        self.models[model_name] = {"status": "error", "error": str(e)}
                else:
                    logger.warning(f"ONNX model not found: {path}")
                    self.models[model_name] = {"status": "not_found"}
                    
        except ImportError:
            logger.error("ONNX Runtime not available")
            
    def predict_with_onnx(self, model_name: str, features: np.ndarray) -> float:
        """Make prediction using ONNX model"""
        if model_name not in self.models or self.models[model_name]["status"] != "loaded":
            raise ValueError(f"Model {model_name} not available")
            
        model_info = self.models[model_name]
        session = model_info["session"]
        input_name = model_info["input_name"]
        expected_shape = model_info["input_shape"]
        
        # Ensure features have correct shape
        if len(features.shape) == 1:
            features = features.reshape(1, -1)
            
        # Check if dimensions match expected shape
        expected_features = expected_shape[1] if isinstance(expected_shape[1], int) else 10
        if features.shape[1] != expected_features:
            # Pad with zeros or truncate to match expected dimensions
            if features.shape[1] < expected_features:
                # Pad with zeros
                padding = np.zeros((features.shape[0], expected_features - features.shape[1]))
                features = np.concatenate([features, padding], axis=1)
            else:
                # Truncate to expected size
                features = features[:, :expected_features]
            
        features = features.astype(np.float32)
        
        # Run prediction
        result = session.run(None, {input_name: features})
        return float(result[0][0])

# Mock Predictor for fallback
class MockPredictor:
    """Mock predictor that provides realistic predictions for demo purposes"""
    
    def predict_price(self, hour: int, day_of_week: int, demand_mw: float, temperature: float = 25.0) -> float:
        """Mock price prediction based on time patterns and demand"""
        # Base price
        base_price = 0.15
        
        # Hour-based pricing (peak hours cost more)
        if 17 <= hour <= 21:  # Evening peak
            hour_factor = 0.05
        elif 9 <= hour <= 17:  # Day hours
            hour_factor = 0.02
        else:  # Off-peak
            hour_factor = -0.03
            
        # Weekend discount
        weekend_factor = -0.02 if day_of_week >= 5 else 0
        
        # Demand factor
        demand_factor = (demand_mw / 1000.0) * 0.01
        
        # Temperature factor (more expensive during extreme temperatures)
        temp_factor = abs(temperature - 20) * 0.002
        
        price = base_price + hour_factor + weekend_factor + demand_factor + temp_factor
        return max(0.05, price)  # Minimum price of 5 cents
    
    def predict_usage(self, vehicle_type: str, battery_capacity: float, current_soc: float, 
                     target_soc: float, charging_power: float = 50.0) -> float:
        """Mock usage prediction based on battery parameters"""
        # Calculate energy needed
        energy_needed = (target_soc - current_soc) / 100.0 * battery_capacity
        
        # Add efficiency factor based on vehicle type
        efficiency_factors = {
            "sedan": 0.92,
            "suv": 0.88,
            "truck": 0.85,
            "compact": 0.95
        }
        
        efficiency = efficiency_factors.get(vehicle_type.lower(), 0.90)
        actual_energy = energy_needed / efficiency
        
        # Add some realistic variation (±5%)
        import random
        variation = random.uniform(0.95, 1.05)
        
        return actual_energy * variation
    
    def predict_next_usage(self, station_id: str, hour: int, day_of_week: int) -> float:
        """Mock next usage prediction based on patterns"""
        # Base usage patterns
        base_usage = 25.0  # kWh
        
        # Hour patterns (more usage during commute times)
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            hour_factor = 1.5
        elif 10 <= hour <= 16:
            hour_factor = 1.2
        else:
            hour_factor = 0.6
            
        # Weekend patterns
        weekend_factor = 0.7 if day_of_week >= 5 else 1.0
        
        # Station-specific factor (hash-based for consistency)
        station_hash = hash(station_id) % 100
        station_factor = 0.8 + (station_hash / 100.0) * 0.4  # Between 0.8 and 1.2
        
        usage = base_usage * hour_factor * weekend_factor * station_factor
        
        # Add some randomness
        import random
        variation = random.uniform(0.9, 1.1)
        
        return usage * variation

# Initialize managers
onnx_manager = ONNXModelManager()
mock_predictor = MockPredictor()

# Health check
@router.get("/health")
async def ml_health_check():
    """ML service health check"""
    onnx_status = {name: info.get("status", "unknown") for name, info in onnx_manager.models.items()}
    
    return {
        "status": "healthy",
        "service": "ML Fallback Service",
        "onnx_models": onnx_status,
        "mock_predictor": "available",
        "message": "Using fallback ML service (XGBoost unavailable)"
    }

# Model information
@router.get("/models", response_model=List[ModelInfo])
async def get_models():
    """Get information about available models"""
    models = []
    
    # ONNX models
    for name, path in onnx_manager.model_paths.items():
        if os.path.exists(path):
            size_kb = os.path.getsize(path) / 1024
            models.append(ModelInfo(
                name=f"onnx_{name}",
                type="ONNX",
                status=onnx_manager.models.get(name, {}).get("status", "unknown"),
                size_kb=size_kb,
                last_updated=datetime.fromtimestamp(os.path.getmtime(path))
            ))
    
    # Mock models
    models.extend([
        ModelInfo(
            name="mock_price",
            type="Mock",
            status="available",
            size_kb=0.1,
            last_updated=datetime.now()
        ),
        ModelInfo(
            name="mock_usage",
            type="Mock", 
            status="available",
            size_kb=0.1,
            last_updated=datetime.now()
        )
    ])
    
    return models

# Prediction endpoints
@router.post("/predict/price", response_model=PredictionResponse)
async def predict_price(request: PricePredictionRequest):
    """Predict energy price"""
    try:
        prediction = None
        model_type = None
        confidence = None
        
        # Try ONNX model first
        if "price" in onnx_manager.models and onnx_manager.models["price"]["status"] == "loaded":
            try:
                features = np.array([request.hour, request.day_of_week, request.demand_mw, request.temperature])
                onnx_prediction = onnx_manager.predict_with_onnx("price", features)
                
                # Validate ONNX prediction is realistic (between $0.01 and $2.00 per kWh)
                if 0.01 <= onnx_prediction <= 2.0:
                    prediction = onnx_prediction
                    model_type = "ONNX"
                    confidence = 0.85
                else:
                    logger.warning(f"ONNX price prediction unrealistic: ${onnx_prediction:.3f}/kWh, using mock")
                    raise ValueError("Unrealistic ONNX prediction")
                    
            except Exception as onnx_error:
                logger.warning(f"ONNX price prediction failed, falling back to mock: {onnx_error}")
                prediction = None
        
        # Use mock predictor if ONNX failed or gave unrealistic results
        if prediction is None:
            prediction = mock_predictor.predict_price(
                request.hour, request.day_of_week, request.demand_mw, request.temperature
            )
            model_type = "Mock (Realistic Fallback)" if "price" in onnx_manager.models else "Mock"
            confidence = 0.75
            
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_type=model_type,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Price prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/usage", response_model=PredictionResponse)
async def predict_usage(request: UsagePredictionRequest):
    """Predict energy usage"""
    try:
        prediction = None
        model_type = None
        confidence = None
        
        # Try ONNX model first
        if "usage" in onnx_manager.models and onnx_manager.models["usage"]["status"] == "loaded":
            try:
                features = np.array([
                    request.battery_capacity, request.current_soc, request.target_soc, request.charging_power
                ])
                onnx_prediction = onnx_manager.predict_with_onnx("usage", features)
                
                # Validate ONNX prediction is realistic for EV charging (5-200 kWh)
                if 5.0 <= onnx_prediction <= 200.0:
                    prediction = onnx_prediction
                    model_type = "ONNX"
                    confidence = 0.85
                else:
                    logger.warning(f"ONNX usage prediction unrealistic: {onnx_prediction:.1f} kWh, using mock")
                    raise ValueError("Unrealistic ONNX prediction")
                    
            except Exception as onnx_error:
                logger.warning(f"ONNX usage prediction failed, falling back to mock: {onnx_error}")
                prediction = None
        
        # Use mock predictor if ONNX failed or gave unrealistic results
        if prediction is None:
            prediction = mock_predictor.predict_usage(
                request.vehicle_type, request.battery_capacity, 
                request.current_soc, request.target_soc, request.charging_power
            )
            model_type = "Mock (Realistic Fallback)" if "usage" in onnx_manager.models else "Mock"
            confidence = 0.75
            
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_type=model_type,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Usage prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/next-usage", response_model=PredictionResponse)
async def predict_next_usage(request: NextUsagePredictionRequest):
    """Predict next usage pattern"""
    try:
        # Use mock predictor (no ONNX model for this yet)
        prediction = mock_predictor.predict_next_usage(
            request.station_id, request.hour, request.day_of_week
        )
        
        return PredictionResponse(
            prediction=prediction,
            confidence=0.75,
            model_type="Mock",
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Next usage prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Batch prediction endpoint
@router.post("/predict/batch")
async def predict_batch(requests: Dict[str, Any]):
    """Batch prediction endpoint for multiple requests"""
    results = {}
    
    try:
        if "price_requests" in requests:
            results["price_predictions"] = []
            for req_data in requests["price_requests"]:
                req = PricePredictionRequest(**req_data)
                pred = await predict_price(req)
                results["price_predictions"].append(pred.dict())
        
        if "usage_requests" in requests:
            results["usage_predictions"] = []
            for req_data in requests["usage_requests"]:
                req = UsagePredictionRequest(**req_data)
                pred = await predict_usage(req)
                results["usage_predictions"].append(pred.dict())
                
        return results
        
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}") 