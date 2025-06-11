"""
ML Model API Endpoints

This module provides FastAPI endpoints for serving machine learning models
and accessing their predictions, metrics, and monitoring data.
"""
import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
import numpy as np
import pandas as pd

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from fastapi import FastAPI, HTTPException, Query, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from starlette.responses import Response

# Import ML components
from app.ml.models.battery_health.battery_degradation_model import BatteryDegradationModel
from app.ml.inference.usage_predictor import VehicleUsagePredictor
from app.ml.training.energy_price_training import EnergyPricePredictionModel
from app.ml.data_pipeline.anomaly_detection import AnomalyDetectionPipeline
from app.ml.monitoring.model_monitor import ModelMonitorRegistry

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create API router
from fastapi import APIRouter
router = APIRouter(tags=["ML Models"])

# Initialize model registry for monitoring
model_registry = ModelMonitorRegistry(storage_path='data/monitoring')

# Model loading and caching
_battery_model = None
_usage_predictor = None
_energy_price_model = None
_anomaly_pipeline = None


def get_battery_model():
    """Get or load the battery degradation model"""
    global _battery_model
    if _battery_model is None:
        try:
            model_path = os.path.join('app/ml/models/battery_health', 'battery_model_latest.joblib')
            if not os.path.exists(model_path):
                # Fall back to any available model
                model_dir = 'app/ml/models/battery_health'
                model_files = [f for f in os.listdir(model_dir) if f.endswith('.joblib')]
                if model_files:
                    model_path = os.path.join(model_dir, model_files[0])
                else:
                    raise FileNotFoundError("No battery health model found")
                
            _battery_model = BatteryDegradationModel.load(model_path)
            logger.info(f"Loaded battery model from {model_path}")
        except Exception as e:
            logger.error(f"Error loading battery model: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to load battery model: {str(e)}")
    
    return _battery_model


def get_usage_predictor():
    """Get or load the usage prediction model"""
    global _usage_predictor
    if _usage_predictor is None:
        try:
            _usage_predictor = VehicleUsagePredictor(
                models_dir='app/ml/models/usage_prediction'
            )
            logger.info("Loaded usage predictor")
        except Exception as e:
            logger.error(f"Error loading usage predictor: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to load usage predictor: {str(e)}")
    
    return _usage_predictor


def get_energy_price_model():
    """Get or load the energy price prediction model"""
    global _energy_price_model
    if _energy_price_model is None:
        try:
            model_path = os.path.join('app/ml/models/energy_price', 'price_prediction_24h_gradient_boosting_latest.joblib')
            if not os.path.exists(model_path):
                # Fall back to any available model
                model_dir = 'app/ml/models/energy_price'
                model_files = [f for f in os.listdir(model_dir) if f.endswith('.joblib')]
                if model_files:
                    model_path = os.path.join(model_dir, model_files[0])
                else:
                    raise FileNotFoundError("No energy price model found")
                
            _energy_price_model = EnergyPricePredictionModel.load(model_path)
            logger.info(f"Loaded energy price model from {model_path}")
        except Exception as e:
            logger.error(f"Error loading energy price model: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to load energy price model: {str(e)}")
    
    return _energy_price_model


def get_anomaly_pipeline():
    """Get or create the anomaly detection pipeline"""
    global _anomaly_pipeline
    if _anomaly_pipeline is None:
        try:
            _anomaly_pipeline = AnomalyDetectionPipeline(
                buffer_size=100,
                sliding_window=24,
                alert_threshold=0.5,
                storage_path='data/anomalies'
            )
            logger.info("Created anomaly detection pipeline")
        except Exception as e:
            logger.error(f"Error creating anomaly pipeline: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create anomaly pipeline: {str(e)}")
    
    return _anomaly_pipeline


# Request/Response models

# Battery Health Models
class BatteryTelemetryData(BaseModel):
    """Battery telemetry data for prediction"""
    vehicle_id: str
    timestamp: Optional[datetime] = None
    state_of_charge: float = Field(..., ge=0, le=100)
    battery_temp: float = Field(..., ge=-20, le=80)
    voltage: Optional[float] = None
    current: Optional[float] = None
    charge_cycles: Optional[float] = None
    odometer: Optional[float] = None
    battery_chemistry: Optional[str] = None
    vehicle_type: Optional[str] = None
    
    @validator('timestamp', pre=True, always=True)
    def set_timestamp(cls, v):
        return v or datetime.now()


class BatteryHealthPrediction(BaseModel):
    """Battery health prediction response"""
    vehicle_id: str
    predicted_soh: float
    timestamp: datetime
    confidence: Optional[float] = None
    predicted_remaining_life_days: Optional[int] = None


class FutureHealthRequest(BaseModel):
    """Request for future health prediction"""
    vehicle_id: str
    prediction_days: int = Field(default=30, ge=1, le=3650)
    telemetry_data: List[BatteryTelemetryData]


class FutureHealthData(BaseModel):
    """Future health prediction data point"""
    timestamp: datetime
    predicted_soh: float
    odometer: Optional[float] = None


class FutureHealthPrediction(BaseModel):
    """Future health prediction response"""
    vehicle_id: str
    current_soh: float
    future_predictions: List[FutureHealthData]
    replacement_date: Optional[datetime] = None
    days_until_replacement: Optional[int] = None


class ReplacementDateRequest(BaseModel):
    """Request for battery replacement date prediction"""
    vehicle_id: str
    soh_threshold: float = Field(default=0.7, ge=0.5, le=0.9)
    max_prediction_days: int = Field(default=1825, ge=30, le=3650)
    telemetry_data: List[BatteryTelemetryData]


class ReplacementPrediction(BaseModel):
    """Battery replacement prediction response"""
    vehicle_id: str
    current_soh: float
    replacement_date: Optional[datetime] = None
    days_until_replacement: Optional[int] = None
    predicted_odometer_at_replacement: Optional[float] = None
    soh_at_replacement: Optional[float] = None
    message: Optional[str] = None


# Usage Prediction Models
class UsageHistoryData(BaseModel):
    """Vehicle usage history data for prediction"""
    vehicle_id: str
    start_time: datetime
    end_time: datetime
    trip_distance: Optional[float] = None


class NextUsagePrediction(BaseModel):
    """Next usage prediction response"""
    vehicle_id: str
    current_time: datetime
    next_usage_time: datetime
    hours_until_next_usage: float
    confidence: float


class TripDurationPrediction(BaseModel):
    """Trip duration prediction response"""
    vehicle_id: str
    trip_start_time: datetime
    predicted_duration_minutes: float
    predicted_end_time: datetime


class TripDistancePrediction(BaseModel):
    """Trip distance prediction response"""
    vehicle_id: str
    trip_start_time: datetime
    predicted_distance: float


class AvailabilityRequest(BaseModel):
    """Vehicle availability request"""
    vehicle_id: str
    start_time: datetime
    end_time: datetime
    usage_history: List[UsageHistoryData]


class AvailabilityPrediction(BaseModel):
    """Vehicle availability prediction response"""
    vehicle_id: str
    start_time: datetime
    end_time: datetime
    is_available: bool
    next_usage_time: Optional[datetime] = None
    confidence: Optional[float] = None


# Energy Price Models
class EnergyPriceData(BaseModel):
    """Energy price data for prediction"""
    timestamp: datetime
    energy_price: float
    renewable_percentage: Optional[float] = None
    grid_load: Optional[float] = None


class EnergyPricePrediction(BaseModel):
    """Energy price prediction response"""
    timestamp: datetime
    forecast_timestamp: datetime
    predicted_price: float


# Anomaly Detection Models
class AnomalyStats(BaseModel):
    """Anomaly statistics response"""
    total_anomalies: int
    by_severity: Dict[str, int]
    by_vehicle: Dict[str, int]
    recent_24h: int
    vehicle_count: int


class AnomalyRecord(BaseModel):
    """Anomaly record response"""
    vehicle_id: str
    timestamp: datetime
    anomaly_type: str
    severity: str
    detection_methods: List[str]
    detection_source: str
    detection_time: datetime
    metrics: Dict[str, float]


class VehicleAnalysis(BaseModel):
    """Vehicle anomaly analysis response"""
    vehicle_id: str
    anomaly_count: int
    by_type: Optional[Dict[str, int]] = None
    metric_stats: Optional[Dict[str, Dict[str, float]]] = None
    time_trend: Optional[Dict[str, Any]] = None
    severity_distribution: Optional[Dict[str, int]] = None
    analysis: Optional[str] = None


# Model Monitoring Models
class ModelPerformanceMetrics(BaseModel):
    """Model performance metrics response"""
    model_id: str
    model_type: str
    timestamp: datetime
    metrics: Dict[str, float]
    sample_size: int


class DriftStatus(BaseModel):
    """Drift status response"""
    status: str
    overall_drift: Optional[float] = None
    max_drift_feature: Optional[str] = None
    max_drift_score: Optional[float] = None
    timestamp: Optional[datetime] = None
    message: Optional[str] = None


class ModelStatus(BaseModel):
    """Model status response"""
    model_id: str
    model_type: str
    monitoring_since: Optional[datetime] = None
    predictions_tracked: int
    actuals_tracked: int
    current_performance: Optional[Dict[str, Any]] = None
    drift_status: Optional[Dict[str, Any]] = None
    retrain_status: Dict[str, Any]
    timestamp: datetime


# Fleet Insights Models and Endpoints
class FleetInsights(BaseModel):
    """Fleet insights response"""
    total_vehicles: int
    active_vehicles: int
    charging_vehicles: int
    maintenance_vehicles: int
    fleet_efficiency: float
    avg_battery_health: float
    total_energy_consumed: float
    carbon_saved: float
    cost_savings: float
    anomalies_detected: int
    timestamp: datetime


class VehicleStatus(BaseModel):
    """Individual vehicle status"""
    vehicle_id: str
    status: str  # "active", "charging", "maintenance", "idle"
    battery_soh: float
    current_soc: float
    location: Optional[str] = None
    last_usage: Optional[datetime] = None


class FleetMetrics(BaseModel):
    """Detailed fleet metrics"""
    insights: FleetInsights
    vehicle_statuses: List[VehicleStatus]
    efficiency_trend: List[Dict[str, Any]]
    battery_health_distribution: Dict[str, int]


# API Endpoints

# Health check endpoint
@router.get("/health")
def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}


# Battery Health Endpoints
@router.post("/battery/predict", response_model=BatteryHealthPrediction)
def predict_battery_health(
    data: BatteryTelemetryData,
    background_tasks: BackgroundTasks,
    model: BatteryDegradationModel = Depends(get_battery_model)
):
    """Predict current battery health"""
    try:
        # Extract only the features the model was trained on in correct order
        required_features = ['state_of_charge', 'battery_temp', 'voltage', 'current', 'charge_cycles']
        
        # Create feature vector with default values for missing fields
        feature_values = []
        data_dict = data.dict()
        
        for feature in required_features:
            if feature in data_dict and data_dict[feature] is not None:
                feature_values.append(float(data_dict[feature]))
            else:
                # Provide reasonable defaults for missing values
                defaults = {
                    'state_of_charge': 50.0,
                    'battery_temp': 25.0,
                    'voltage': 400.0,
                    'current': 0.0,
                    'charge_cycles': 100.0
                }
                feature_values.append(defaults.get(feature, 0.0))
        
        # Create numpy array with shape (1, 5) for single prediction
        feature_array = np.array([feature_values])
        
        # Make prediction directly with the sklearn model to bypass preprocessing
        prediction = float(model.model.predict(feature_array)[0])
        
        # Record prediction for monitoring
        background_tasks.add_task(
            model_registry.record_prediction,
            model_id="battery_health",
            model_type="battery_health",
            prediction=prediction,
            features=data.dict(exclude={'timestamp'}),
            timestamp=data.timestamp
        )
        
        return {
            "vehicle_id": data.vehicle_id,
            "predicted_soh": prediction,
            "timestamp": data.timestamp,
            "confidence": 0.9,  # Placeholder - actual model doesn't provide confidence
            "predicted_remaining_life_days": int((prediction - 70) / 0.025) if prediction > 70 else 0  # Simple heuristic
        }
    except Exception as e:
        logger.error(f"Error predicting battery health: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/battery/future-health", response_model=FutureHealthPrediction)
def predict_future_health(
    request: FutureHealthRequest,
    background_tasks: BackgroundTasks,
    model: BatteryDegradationModel = Depends(get_battery_model)
):
    """Predict future battery health over time"""
    try:
        # Convert to DataFrame for prediction
        df = pd.DataFrame([t.dict() for t in request.telemetry_data])
        
        # Predict future health
        future_health = model.predict_future_health(
            vehicle_id=request.vehicle_id,
            current_telemetry=df,
            prediction_days=request.prediction_days
        )
        
        # Get current SOH
        current_soh = float(future_health['predicted_soh'].iloc[0])
        
        # Format predictions
        predictions = []
        for _, row in future_health.iterrows():
            predictions.append({
                "timestamp": row['timestamp'],
                "predicted_soh": float(row['predicted_soh']),
                "odometer": float(row['odometer']) if 'odometer' in row else None
            })
        
        # Get replacement date (simple heuristic)
        replacement_date = None
        days_until_replacement = None
        
        for i, pred in enumerate(predictions):
            if pred["predicted_soh"] < 70:
                replacement_date = pred["timestamp"]
                days_until_replacement = i
                break
        
        # Record for monitoring
        if len(predictions) > 0:
            background_tasks.add_task(
                model_registry.record_prediction,
                model_id="battery_health_future",
                model_type="battery_health",
                prediction=predictions[0]["predicted_soh"],
                features=request.telemetry_data[0].dict(exclude={'timestamp'})
            )
        
        return {
            "vehicle_id": request.vehicle_id,
            "current_soh": current_soh,
            "future_predictions": predictions,
            "replacement_date": replacement_date,
            "days_until_replacement": days_until_replacement
        }
    except Exception as e:
        logger.error(f"Error predicting future health: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/battery/replacement-date", response_model=ReplacementPrediction)
def predict_replacement_date(
    request: ReplacementDateRequest,
    model: BatteryDegradationModel = Depends(get_battery_model)
):
    """Predict when battery will need replacement"""
    try:
        # Convert to DataFrame for prediction
        df = pd.DataFrame([t.dict() for t in request.telemetry_data])
        
        # Get replacement prediction
        result = model.get_replacement_date(
            vehicle_id=request.vehicle_id,
            current_telemetry=df,
            soh_threshold=request.soh_threshold,
            max_prediction_days=request.max_prediction_days
        )
        
        # Convert date string to datetime if present
        if result.get('replacement_date'):
            result['replacement_date'] = datetime.strptime(result['replacement_date'], '%Y-%m-%d')
        
        return result
    except Exception as e:
        logger.error(f"Error predicting replacement date: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Usage Prediction Endpoints
@router.post("/usage/next-usage", response_model=NextUsagePrediction)
def predict_next_usage(
    vehicle_id: str,
    usage_history: List[UsageHistoryData],
    background_tasks: BackgroundTasks,
    predictor: VehicleUsagePredictor = Depends(get_usage_predictor),
    current_time: Optional[datetime] = None
):
    """Predict when a vehicle will be used next"""
    try:
        # Set default current time if not provided
        if current_time is None:
            current_time = datetime.now()
        
        # Convert to DataFrame for prediction
        df = pd.DataFrame([h.dict() for h in usage_history])
        
        # Make prediction
        result = predictor.predict_next_usage(
            vehicle_id=vehicle_id,
            usage_history=df,
            current_time=current_time
        )
        
        # Check for errors
        if 'error' in result:
            raise ValueError(result['error'])
        
        # Convert timestamp strings to datetime
        if 'next_usage_time' in result:
            result['next_usage_time'] = datetime.strptime(
                result['next_usage_time'], 
                '%Y-%m-%d %H:%M:%S'
            )
        
        if 'current_time' in result:
            result['current_time'] = datetime.strptime(
                result['current_time'], 
                '%Y-%m-%d %H:%M:%S'
            )
        
        # Record for monitoring
        background_tasks.add_task(
            model_registry.record_prediction,
            model_id="usage_prediction",
            model_type="usage_prediction",
            prediction=result.get('hours_until_next_usage'),
            features={"vehicle_id": vehicle_id, "history_entries": len(usage_history)}
        )
        
        return result
    except Exception as e:
        logger.error(f"Error predicting next usage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/usage/trip-duration", response_model=TripDurationPrediction)
def predict_trip_duration(
    vehicle_id: str,
    trip_start_time: datetime,
    usage_history: List[UsageHistoryData],
    predictor: VehicleUsagePredictor = Depends(get_usage_predictor)
):
    """Predict the duration of a trip"""
    try:
        # Convert to DataFrame for prediction
        df = pd.DataFrame([h.dict() for h in usage_history])
        
        # Make prediction
        result = predictor.predict_trip_duration(
            vehicle_id=vehicle_id,
            trip_start_time=trip_start_time,
            usage_history=df
        )
        
        # Check for errors
        if 'error' in result:
            raise ValueError(result['error'])
        
        # Convert timestamp strings to datetime
        if 'trip_start_time' in result:
            result['trip_start_time'] = datetime.strptime(
                result['trip_start_time'], 
                '%Y-%m-%d %H:%M:%S'
            )
        
        if 'predicted_end_time' in result:
            result['predicted_end_time'] = datetime.strptime(
                result['predicted_end_time'], 
                '%Y-%m-%d %H:%M:%S'
            )
        
        return result
    except Exception as e:
        logger.error(f"Error predicting trip duration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/usage/availability", response_model=AvailabilityPrediction)
def predict_availability(
    request: AvailabilityRequest,
    predictor: VehicleUsagePredictor = Depends(get_usage_predictor)
):
    """Predict if a vehicle will be available during a specific time window"""
    try:
        # Convert to DataFrame for prediction
        df = pd.DataFrame([h.dict() for h in request.usage_history])
        
        # Make prediction
        result = predictor.predict_vehicle_availability(
            vehicle_id=request.vehicle_id,
            start_time=request.start_time,
            end_time=request.end_time,
            usage_history=df
        )
        
        # Check for errors
        if 'error' in result:
            raise ValueError(result['error'])
        
        # Convert timestamp strings to datetime
        for key in ['start_time', 'end_time', 'next_usage_time']:
            if key in result:
                result[key] = datetime.strptime(
                    result[key], 
                    '%Y-%m-%d %H:%M:%S'
                )
        
        return result
    except Exception as e:
        logger.error(f"Error predicting availability: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Energy Price Endpoints
@router.post("/energy/price-forecast", response_model=List[EnergyPricePrediction])
def predict_energy_prices(
    price_data: List[EnergyPriceData],
    background_tasks: BackgroundTasks,
    model: EnergyPricePredictionModel = Depends(get_energy_price_model)
):
    """Predict future energy prices"""
    try:
        # Convert to DataFrame for prediction
        df = pd.DataFrame([p.dict() for p in price_data])
        
        # Make prediction
        result = model.predict(price_data=df)
        
        # Format predictions
        predictions = []
        for _, row in result.iterrows():
            predictions.append({
                "timestamp": row['timestamp'],
                "forecast_timestamp": row['forecast_timestamp'],
                "predicted_price": float(row['predicted_price'])
            })
        
        # Record for monitoring
        if len(predictions) > 0:
            background_tasks.add_task(
                model_registry.record_prediction,
                model_id="energy_price",
                model_type="energy_price",
                prediction=predictions[0]["predicted_price"],
                features=price_data[0].dict(exclude={'timestamp'})
            )
        
        return predictions
    except Exception as e:
        logger.error(f"Error predicting energy prices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Anomaly Detection Endpoints
@router.get("/anomalies/stats", response_model=AnomalyStats)
def get_anomaly_stats(
    pipeline: AnomalyDetectionPipeline = Depends(get_anomaly_pipeline)
):
    """Get statistics about detected anomalies"""
    try:
        return pipeline.get_anomaly_stats()
    except Exception as e:
        logger.error(f"Error getting anomaly stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/anomalies/vehicle/{vehicle_id}", response_model=List[AnomalyRecord])
def get_vehicle_anomalies(
    vehicle_id: str,
    severity: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=1000),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    pipeline: AnomalyDetectionPipeline = Depends(get_anomaly_pipeline)
):
    """Get anomalies for a specific vehicle"""
    try:
        # Set up time range if provided
        time_range = None
        if start_time and end_time:
            time_range = (start_time, end_time)
        
        # Get anomalies
        anomalies = pipeline.get_vehicle_anomalies(
            vehicle_id=vehicle_id,
            time_range=time_range,
            severity=severity,
            limit=limit
        )
        
        # Convert timestamp strings to datetime
        for anomaly in anomalies:
            anomaly['timestamp'] = datetime.fromisoformat(anomaly['timestamp'].replace('Z', '+00:00'))
            anomaly['detection_time'] = datetime.fromisoformat(anomaly['detection_time'].replace('Z', '+00:00'))
        
        return anomalies
    except Exception as e:
        logger.error(f"Error getting vehicle anomalies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/anomalies/analysis/{vehicle_id}", response_model=VehicleAnalysis)
def analyze_vehicle_anomalies(
    vehicle_id: str,
    pipeline: AnomalyDetectionPipeline = Depends(get_anomaly_pipeline)
):
    """Get in-depth analysis of a vehicle's anomalies"""
    try:
        analysis = pipeline.analyze_vehicle_anomalies(vehicle_id)
        
        # Convert timestamp strings to datetime if present
        if 'time_trend' in analysis and analysis['time_trend']:
            if 'first_anomaly' in analysis['time_trend']:
                analysis['time_trend']['first_anomaly'] = datetime.fromisoformat(
                    analysis['time_trend']['first_anomaly'].replace('Z', '+00:00')
                )
            if 'last_anomaly' in analysis['time_trend']:
                analysis['time_trend']['last_anomaly'] = datetime.fromisoformat(
                    analysis['time_trend']['last_anomaly'].replace('Z', '+00:00')
                )
        
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing vehicle anomalies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Model Monitoring Endpoints
@router.get("/monitoring/performance/{model_id}", response_model=ModelPerformanceMetrics)
def get_model_performance(model_id: str):
    """Get performance metrics for a specific model"""
    try:
        monitor = model_registry.get_monitor(model_id)
        performance = monitor._calculate_performance_metrics()
        
        if 'status' in performance and performance['status'] != 'error':
            return {
                "model_id": model_id,
                "model_type": monitor.model_type,
                "timestamp": datetime.fromisoformat(performance['timestamp']),
                "metrics": performance['metrics'],
                "sample_size": performance['sample_size']
            }
        else:
            raise ValueError(performance.get('message', 'Insufficient data'))
    except Exception as e:
        logger.error(f"Error getting model performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/drift/{model_id}", response_model=DriftStatus)
def get_drift_status(model_id: str):
    """Get drift status for a specific model"""
    try:
        monitor = model_registry.get_monitor(model_id)
        drift = monitor._check_for_drift()
        
        # Convert timestamp string to datetime if present
        if 'timestamp' in drift:
            drift['timestamp'] = datetime.fromisoformat(drift['timestamp'].replace('Z', '+00:00'))
        
        return drift
    except Exception as e:
        logger.error(f"Error getting drift status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/status/{model_id}", response_model=ModelStatus)
def get_model_status(model_id: str):
    """Get status summary for a specific model"""
    try:
        monitor = model_registry.get_monitor(model_id)
        status = monitor.get_monitoring_summary()
        
        # Convert timestamp strings to datetime
        if 'timestamp' in status:
            status['timestamp'] = datetime.fromisoformat(status['timestamp'].replace('Z', '+00:00'))
        
        if 'monitoring_since' in status and status['monitoring_since']:
            status['monitoring_since'] = datetime.fromisoformat(status['monitoring_since'].replace('Z', '+00:00'))
        
        if 'retrain_status' in status and 'last_retrain_date' in status['retrain_status'] and status['retrain_status']['last_retrain_date']:
            status['retrain_status']['last_retrain_date'] = datetime.fromisoformat(
                status['retrain_status']['last_retrain_date'].replace('Z', '+00:00')
            )
        
        return status
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/all-models")
def get_all_models_status():
    """Get status summary for all monitored models"""
    try:
        return model_registry.get_all_models_status()
    except Exception as e:
        logger.error(f"Error getting all models status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/monitoring/record-actual/{model_id}")
def record_actual_value(
    model_id: str,
    actual_value: float,
    prediction_index: int = -1
):
    """Record an actual value for a previous prediction"""
    try:
        model_registry.record_actual(
            model_id=model_id,
            actual=actual_value,
            prediction_index=prediction_index
        )
        return {"status": "success", "message": "Actual value recorded"}
    except Exception as e:
        logger.error(f"Error recording actual value: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fleet-insights", response_model=FleetMetrics)
def get_fleet_insights():
    """Get comprehensive fleet insights for Digital Twin Dashboard"""
    try:
        current_time = datetime.now()
        
        # Generate comprehensive fleet data for demonstration
        # In a real implementation, this would query actual fleet data
        insights = FleetInsights(
            total_vehicles=25,
            active_vehicles=18,
            charging_vehicles=4,
            maintenance_vehicles=3,
            fleet_efficiency=87.3,
            avg_battery_health=89.2,
            total_energy_consumed=2847.6,
            carbon_saved=421.8,
            cost_savings=18456.0,
            anomalies_detected=7,  # Mock value
            timestamp=current_time
        )
        
        # Generate sample vehicle statuses
        vehicle_statuses = []
        for i in range(1, 26):
            vehicle_id = f"EV-{i:03d}"
            statuses = ["active", "charging", "maintenance", "idle"]
            status = statuses[i % 4]
            
            vehicle_statuses.append(VehicleStatus(
                vehicle_id=vehicle_id,
                status=status,
                battery_soh=85.0 + (i % 15),  # Range 85-100%
                current_soc=20.0 + (i * 3 % 80),  # Range 20-100%
                location=f"Zone-{(i % 5) + 1}",
                last_usage=current_time - timedelta(hours=i % 24)
            ))
        
        # Generate efficiency trend (last 7 days)
        efficiency_trend = []
        for i in range(7):
            date = current_time - timedelta(days=6-i)
            efficiency_trend.append({
                "date": date.strftime("%Y-%m-%d"),
                "efficiency": 82.0 + (i * 2) + np.random.uniform(-2, 2)
            })
        
        # Battery health distribution
        battery_health_distribution = {
            "Excellent (90-100%)": 12,
            "Good (80-89%)": 10,
            "Fair (70-79%)": 3,
            "Poor (<70%)": 0
        }
        
        return FleetMetrics(
            insights=insights,
            vehicle_statuses=vehicle_statuses,
            efficiency_trend=efficiency_trend,
            battery_health_distribution=battery_health_distribution
        )
        
    except Exception as e:
        logger.error(f"Error getting fleet insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# FastAPI app creation
def create_ml_app():
    """Create FastAPI app with ML endpoints"""
    app = FastAPI(
        title="GIU EV Charging Infrastructure - ML API",
        description="API for machine learning models in the GIU EV Charging Infrastructure",
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
    
    # Include router
    app.include_router(router)
    
    @app.on_event("startup")
    async def startup_event():
        """Startup event handler"""
        logger.info("Starting ML API")
        
        # Preload models
        try:
            get_battery_model()
            get_usage_predictor()
            get_energy_price_model()
            get_anomaly_pipeline()
        except Exception as e:
            logger.warning(f"Could not preload all models: {str(e)}")
    
    return app


# Run the API directly when this file is executed
if __name__ == "__main__":
    import uvicorn
    app = create_ml_app()
    uvicorn.run(app, host="0.0.0.0", port=8000) 