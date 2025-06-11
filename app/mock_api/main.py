#!/usr/bin/env python3
"""
Mock API for GIU EV Charging Infrastructure
Provides sample data for ML dashboard demonstration
"""
import random
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application
app = FastAPI(
    title="GIU EV Charging Infrastructure API",
    description="Mock API for ML dashboard demonstration",
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

# ======== Health Check Endpoint ========
@app.get("/api/ml/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# ======== Battery Endpoints ========
@app.post("/api/ml/battery/predict")
async def predict_battery_health(data: Dict[str, Any]):
    """Predict battery health based on current state"""
    try:
        # Deterministic but realistic prediction based on input data
        battery_chemistry = data.get("battery_chemistry", "Unknown")
        state_of_charge = data.get("state_of_charge", 50)
        battery_temp = data.get("battery_temp", 25)
        
        # Base SOH modified by chemistry and conditions
        base_soh = 90
        if battery_chemistry == "LFP":
            chemistry_factor = 1.05
        elif battery_chemistry == "NCA":
            chemistry_factor = 0.95
        else:  # NMC
            chemistry_factor = 1.0
            
        # Temperature impact (extreme temps reduce health)
        temp_factor = 1.0
        if battery_temp < 0 or battery_temp > 40:
            temp_factor = 0.95
        
        # Calculate predicted SOH with slight randomization
        predicted_soh = base_soh * chemistry_factor * temp_factor
        predicted_soh += random.uniform(-2, 2)  # Small random variation
        
        # Calculate remaining life based on SOH
        remaining_life = int((predicted_soh - 70) * 30)  # Rough estimate: 30 days per % above 70%
        
        return {
            "predicted_soh": round(predicted_soh, 2),
            "confidence": round(0.85 + random.uniform(-0.05, 0.05), 2),
            "predicted_remaining_life_days": max(30, remaining_life)
        }
    except Exception as e:
        return {
            "predicted_soh": 85.0,
            "confidence": 0.82,
            "predicted_remaining_life_days": 450,
            "note": "Fallback prediction used due to error"
        }

@app.post("/api/ml/battery/future-health")
async def predict_future_health(data: Dict[str, Any]):
    """Predict future battery health"""
    try:
        prediction_days = data.get("prediction_days", 365)
        vehicle_id = data.get("vehicle_id", "unknown")
        
        # Create realistic degradation curve
        start_soh = 92.0
        
        # Vehicle ID affects degradation rate slightly for variety
        id_number = sum(ord(c) for c in vehicle_id) % 10
        degradation_rate = 0.02 + (id_number / 1000)  # Between 0.02 and 0.03 per day
        
        predictions = []
        for i in range(0, prediction_days, 10):
            date = datetime.now() + timedelta(days=i)
            soh = start_soh - (degradation_rate * i)
            # Add some noise to make it look realistic
            soh += random.uniform(-1.0, 1.0)
            predictions.append({
                "timestamp": date.isoformat(),
                "predicted_soh": round(max(60, soh), 2)
            })
        
        # Determine if replacement needed
        result = {"future_predictions": predictions}
        
        final_soh = predictions[-1]["predicted_soh"]
        if final_soh < 80:
            # Estimate when SOH will reach 70%
            days_to_70 = int((start_soh - 70) / degradation_rate)
            replacement_date = datetime.now() + timedelta(days=days_to_70)
            result["replacement_date"] = replacement_date.isoformat()
            result["days_until_replacement"] = days_to_70
        
        return result
    except Exception as e:
        # Fallback to simple degradation
        predictions = []
        for i in range(0, min(365, data.get("prediction_days", 365)), 10):
            date = datetime.now() + timedelta(days=i)
            soh = 90 - (i * 0.02)
            predictions.append({
                "timestamp": date.isoformat(),
                "predicted_soh": round(max(60, soh), 2)
            })
            
        return {"future_predictions": predictions}

# ======== Usage Prediction Endpoints ========
@app.post("/api/ml/usage/next-usage")
async def predict_next_usage(data: Dict[str, Any]):
    """Predict when vehicle will be used next"""
    try:
        # Parse usage history to establish patterns if available
        usage_history = data.get("usage_history", [])
        vehicle_id = data.get("vehicle_id", "EV-001")
        
        # Default prediction (semi-random but realistic)
        if not usage_history:
            hours = random.uniform(2, 36)
            confidence = 0.7
        else:
            # With history, make more informed prediction
            # Calculate average time between usages
            start_times = [datetime.fromisoformat(u["start_time"]) for u in usage_history 
                          if "start_time" in u]
            
            if len(start_times) >= 2:
                # Sort chronologically
                start_times.sort()
                # Calculate average time delta between usages
                deltas = [(start_times[i] - start_times[i-1]).total_seconds() / 3600 
                         for i in range(1, len(start_times))]
                avg_hours = sum(deltas) / len(deltas)
                # Add some variability
                hours = avg_hours * random.uniform(0.8, 1.2)
                confidence = 0.85
            else:
                hours = random.uniform(6, 24)
                confidence = 0.75
        
        current_time = datetime.now()
        next_time = current_time + timedelta(hours=hours)
        
        return {
            "current_time": current_time.isoformat(),
            "next_usage_time": next_time.isoformat(),
            "hours_until_next_usage": round(hours, 1),
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        # Fallback prediction
        hours = 12
        current_time = datetime.now()
        next_time = current_time + timedelta(hours=hours)
        
        return {
            "current_time": current_time.isoformat(),
            "next_usage_time": next_time.isoformat(),
            "hours_until_next_usage": hours,
            "confidence": 0.7
        }

# ======== Energy Price Endpoints ========
@app.post("/api/ml/energy/price-forecast")
async def predict_energy_prices(data: Optional[List[Dict[str, Any]]] = None):
    """Forecast energy prices"""
    try:
        forecasts = []
        base_time = datetime.now()
        
        # Create realistic daily pattern with two peaks
        for i in range(24):  # 24 hour forecast
            forecast_time = base_time + timedelta(hours=i)
            hour = forecast_time.hour
            
            # Morning peak (7-9 AM)
            if 7 <= hour <= 9:
                base_price = 25 + (hour - 7) * 3
            # Evening peak (5-8 PM)
            elif 17 <= hour <= 20:
                base_price = 28 + (hour - 17) * 2
            # Night low (11 PM - 5 AM)
            elif hour >= 23 or hour <= 5:
                base_price = 15
            # Other times
            else:
                base_price = 20
            
            # Add some noise and renewable impact
            # More renewables (sun) during day
            renewable_factor = 0.8 if 9 <= hour <= 16 else 1.0
            price = base_price * renewable_factor
            price += random.uniform(-1.5, 1.5)
            
            forecasts.append({
                "forecast_timestamp": forecast_time.isoformat(),
                "predicted_price": round(price, 2),
                "confidence": round(0.9 - (i * 0.01), 2),  # Confidence decreases with time
                "renewable_mix": round(30 + (20 if 9 <= hour <= 16 else 0) + random.uniform(-5, 5), 1)
            })
        
        return forecasts
    except Exception as e:
        # Simple fallback forecast
        forecasts = []
        base_time = datetime.now()
        
        for i in range(24):
            forecast_time = base_time + timedelta(hours=i)
            price = 20 + random.uniform(-3, 3)
            forecasts.append({
                "forecast_timestamp": forecast_time.isoformat(),
                "predicted_price": round(price, 2)
            })
        
        return forecasts

# ======== Anomaly Detection Endpoints ========
@app.get("/api/ml/anomalies/stats")
async def get_anomaly_stats():
    """Get statistics about anomalies"""
    return {
        "total_anomalies": random.randint(15, 85),
        "vehicle_count": random.randint(3, 12),
        "recent_24h": random.randint(0, 8),
        "by_severity": {
            "high": random.randint(1, 10),
            "medium": random.randint(8, 25),
            "low": random.randint(15, 50)
        },
        "by_vehicle": {f"EV-{i:03d}": random.randint(1, 15) for i in range(1, 6)}
    }

@app.get("/api/ml/anomalies/analysis/{vehicle_id}")
async def get_vehicle_anomaly_analysis(vehicle_id: str):
    """Get anomaly analysis for a specific vehicle"""
    # Generate consistent but seemingly random data for the same vehicle ID
    seed = sum(ord(c) for c in vehicle_id)
    random.seed(seed)
    
    anomaly_count = random.randint(5, 25)
    high = random.randint(0, 5)
    medium = random.randint(3, 10)
    low = anomaly_count - high - medium
    
    # Reset the random seed
    random.seed()
    
    return {
        "vehicle_id": vehicle_id,
        "anomaly_count": anomaly_count,
        "severity_distribution": {
            "high": high,
            "medium": medium,
            "low": low
        },
        "by_type": {
            "voltage_spike": random.randint(1, 8),
            "temperature_anomaly": random.randint(1, 8),
            "charging_irregular": random.randint(1, 8),
            "capacity_drop": random.randint(1, 8)
        },
        "trends": {
            "increasing": ["temperature_anomaly"],
            "decreasing": ["voltage_spike"],
            "stable": ["charging_irregular", "capacity_drop"]
        }
    }

@app.get("/api/ml/anomalies/vehicle/{vehicle_id}")
async def get_vehicle_anomalies(vehicle_id: str):
    """Get detailed anomalies for a specific vehicle"""
    anomaly_types = ["voltage_spike", "temperature_anomaly", "charging_irregular", "capacity_drop"]
    severities = ["high", "medium", "low"]
    detection_methods = ["statistical", "ml_model", "rule_based", "time_series"]
    
    # Make the anomalies consistent for the same vehicle ID
    seed = sum(ord(c) for c in vehicle_id)
    random.seed(seed)
    
    anomaly_count = random.randint(3, 8)
    anomalies = []
    
    for i in range(anomaly_count):
        # Generate anomaly timestamp between 1 and 168 hours ago
        hours_ago = random.randint(1, 168)
        timestamp = datetime.now() - timedelta(hours=hours_ago)
        
        # Select anomaly details
        anomaly_type = random.choice(anomaly_types)
        severity = random.choice(severities) if i > 0 else "high"  # Ensure at least one high severity
        detection_method_count = random.randint(1, 3)
        
        # Generate consistent anomaly details
        anomalies.append({
            "timestamp": timestamp.isoformat(),
            "vehicle_id": vehicle_id,
            "anomaly_type": anomaly_type,
            "severity": severity,
            "detection_methods": random.sample(detection_methods, k=detection_method_count),
            "detection_source": random.choice(["onboard", "station", "cloud"]),
            "metrics": {
                "confidence": round(random.uniform(0.7, 0.99), 2),
                "magnitude": round(random.uniform(1.0, 10.0), 1),
                "duration_minutes": random.randint(1, 60)
            },
            "recommended_action": get_recommendation(anomaly_type, severity)
        })
    
    # Reset random seed
    random.seed()
    
    # Sort by timestamp (most recent first)
    return sorted(anomalies, key=lambda x: x["timestamp"], reverse=True)

def get_recommendation(anomaly_type, severity):
    """Get recommendation based on anomaly type and severity"""
    recommendations = {
        "voltage_spike": {
            "high": "Immediate inspection of battery management system required",
            "medium": "Schedule diagnostic check within 48 hours",
            "low": "Monitor closely during next charging cycle"
        },
        "temperature_anomaly": {
            "high": "Stop vehicle use until cooling system inspection",
            "medium": "Reduce fast charging until inspection",
            "low": "Monitor temperature patterns during next 5 charging cycles"
        },
        "charging_irregular": {
            "high": "Use different charging station and schedule inspection",
            "medium": "Try alternate charging station",
            "low": "Monitor charging behavior"
        },
        "capacity_drop": {
            "high": "Schedule battery diagnostic and capacity test",
            "medium": "Monitor capacity over next 3 charging cycles",
            "low": "No immediate action required"
        }
    }
    
    return recommendations.get(anomaly_type, {}).get(severity, "Monitor system")

# ======== Model Monitoring Endpoints ========
@app.get("/api/ml/monitoring/all-models")
async def get_all_models():
    """Get status of all ML models"""
    models = {
        "battery_health_predictor": {
            "model_type": "regression",
            "predictions_tracked": random.randint(5000, 15000),
            "actuals_tracked": random.randint(4000, 14000),
            "monitoring_since": (datetime.now() - timedelta(days=random.randint(30, 180))).isoformat(),
            "status": "active",
            "version": "2.3.1"
        },
        "usage_forecaster": {
            "model_type": "time_series",
            "predictions_tracked": random.randint(3000, 12000),
            "actuals_tracked": random.randint(2500, 10000),
            "monitoring_since": (datetime.now() - timedelta(days=random.randint(30, 180))).isoformat(),
            "status": "active",
            "version": "1.8.2"
        },
        "anomaly_detector": {
            "model_type": "classification",
            "predictions_tracked": random.randint(8000, 20000),
            "actuals_tracked": random.randint(7000, 18000),
            "monitoring_since": (datetime.now() - timedelta(days=random.randint(30, 180))).isoformat(),
            "status": "active",
            "version": "3.1.0"
        },
        "price_forecaster": {
            "model_type": "time_series",
            "predictions_tracked": random.randint(2000, 8000),
            "actuals_tracked": random.randint(1800, 7500),
            "monitoring_since": (datetime.now() - timedelta(days=random.randint(30, 90))).isoformat(),
            "status": "active",
            "version": "1.2.3"
        }
    }
    
    return {"models": models}

@app.get("/api/ml/monitoring/performance/{model_id}")
async def get_model_performance(model_id: str):
    """Get performance metrics for a specific model"""
    if "battery" in model_id:
        metrics = {
            "rmse": round(random.uniform(0.05, 0.15), 4),
            "mae": round(random.uniform(0.03, 0.12), 4),
            "r2": round(random.uniform(0.75, 0.95), 4)
        }
    elif "anomaly" in model_id:
        metrics = {
            "precision": round(random.uniform(0.75, 0.95), 4),
            "recall": round(random.uniform(0.75, 0.95), 4),
            "f1": round(random.uniform(0.75, 0.95), 4),
            "auroc": round(random.uniform(0.82, 0.98), 4)
        }
    elif "price" in model_id:
        metrics = {
            "rmse": round(random.uniform(1.5, 3.5), 4),
            "mape": round(random.uniform(4.5, 12.5), 4),
            "forecast_accuracy": round(random.uniform(85.0, 95.0), 4)
        }
    else:
        metrics = {
            "rmse": round(random.uniform(0.05, 0.2), 4),
            "mae": round(random.uniform(0.03, 0.15), 4),
            "mape": round(random.uniform(5.0, 15.0), 4)
        }
    
    return {
        "model_id": model_id,
        "metrics": metrics,
        "sample_size": random.randint(500, 5000),
        "period": "last_30_days",
        "comparison_to_baseline": {
            "improvement": f"{round(random.uniform(5, 25), 1)}%",
            "baseline_version": "1.0.0"
        }
    }

@app.get("/api/ml/monitoring/drift/{model_id}")
async def get_model_drift(model_id: str):
    """Get drift detection results for a specific model"""
    has_drift = random.random() > 0.7
    
    if has_drift:
        return {
            "status": "drift_detected",
            "overall_drift": round(random.uniform(0.3, 0.7), 4),
            "max_drift_feature": random.choice(["temperature", "voltage", "charge_cycles", "usage_pattern"]),
            "max_drift_score": round(random.uniform(0.4, 0.8), 4),
            "recommendation": "Model retraining recommended",
            "detection_date": (datetime.now() - timedelta(days=random.randint(1, 5))).isoformat(),
            "affected_segments": ["fast_charging", "high_temperature_operation"]
        }
    else:
        return {
            "status": "normal",
            "overall_drift": round(random.uniform(0.05, 0.25), 4),
            "monitored_since": (datetime.now() - timedelta(days=random.randint(10, 90))).isoformat(),
            "next_assessment": (datetime.now() + timedelta(days=random.randint(1, 7))).isoformat()
        }

# Start server directly if running this file
if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on port 8003...")
    uvicorn.run(app, host="0.0.0.0", port=8003) 