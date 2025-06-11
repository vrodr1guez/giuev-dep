from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.services.VehicleUsagePrediction import get_vehicle_usage_prediction
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.vehicle import Vehicle
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

class UsagePatternResponse(BaseModel):
    vehicle_id: str
    next_trip_time: Optional[str] = None
    next_trip_distance: Optional[float] = None
    expected_return_time: Optional[str] = None
    confidence: float
    minimum_required_soc: float

class ChargingConstraintsResponse(BaseModel):
    plugin_time: str
    departure_time: str
    minimum_soc: float
    target_soc: float
    confidence: float

@router.get("/predict/{vehicle_id}", response_model=UsagePatternResponse)
async def predict_vehicle_usage(
    vehicle_id: str,
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Predict when a vehicle will next be used and for how long/far
    
    Uses machine learning to analyze historical vehicle usage patterns
    and predict future usage.
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")
        
        # Get prediction service
        prediction_service = get_vehicle_usage_prediction()
        
        # Get prediction
        usage_pattern = prediction_service.predict_next_usage(vehicle_id)
        
        # Convert to response model
        response = UsagePatternResponse(
            vehicle_id=usage_pattern.vehicle_id,
            next_trip_time=usage_pattern.next_trip_time.isoformat() if usage_pattern.next_trip_time else None,
            next_trip_distance=usage_pattern.next_trip_distance,
            expected_return_time=usage_pattern.expected_return_time.isoformat() if usage_pattern.expected_return_time else None,
            confidence=usage_pattern.confidence,
            minimum_required_soc=usage_pattern.minimum_required_soc
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error predicting vehicle usage: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to predict vehicle usage")

@router.get("/fleet", response_model=Dict[str, UsagePatternResponse])
async def predict_fleet_usage(
    vehicles: str = Query(..., description="Comma-separated list of vehicle IDs"),
    prediction_window: int = Query(24, description="Prediction window in hours"),
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Predict usage patterns for multiple vehicles
    
    Returns a dictionary mapping vehicle IDs to their predicted usage patterns
    within the specified time window.
    """
    try:
        # Split vehicle IDs
        vehicle_ids = [v.strip() for v in vehicles.split(",")]
        
        # Verify the vehicles exist and user has access
        accessible_vehicles = []
        for vehicle_id in vehicle_ids:
            vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
            if vehicle:
                if current_user.is_superuser or vehicle.organization_id == current_user.organization_id:
                    accessible_vehicles.append(vehicle_id)
        
        if not accessible_vehicles:
            raise HTTPException(status_code=404, detail="No accessible vehicles found")
        
        # Get prediction service
        prediction_service = get_vehicle_usage_prediction()
        
        # Get fleet predictions
        usage_predictions = prediction_service.predict_fleet_usage(accessible_vehicles, prediction_window)
        
        # Convert to response format
        response = {}
        for vehicle_id, usage_pattern in usage_predictions.items():
            response[vehicle_id] = UsagePatternResponse(
                vehicle_id=usage_pattern.vehicle_id,
                next_trip_time=usage_pattern.next_trip_time.isoformat() if usage_pattern.next_trip_time else None,
                next_trip_distance=usage_pattern.next_trip_distance,
                expected_return_time=usage_pattern.expected_return_time.isoformat() if usage_pattern.expected_return_time else None,
                confidence=usage_pattern.confidence,
                minimum_required_soc=usage_pattern.minimum_required_soc
            )
        
        return response
        
    except Exception as e:
        logger.error(f"Error predicting fleet usage: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to predict fleet usage")

@router.get("/charging-constraints/{vehicle_id}", response_model=ChargingConstraintsResponse)
async def get_charging_constraints(
    vehicle_id: str,
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get charging constraints for a vehicle based on predicted usage patterns
    
    Returns constraints that can be used for charging optimization:
    - plugin_time: When vehicle is plugged in (now)
    - departure_time: When vehicle needs to be ready
    - minimum_soc: Minimum state of charge to maintain
    - target_soc: Target state of charge for the next trip
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")
        
        # Get prediction service
        prediction_service = get_vehicle_usage_prediction()
        
        # Get charging constraints
        constraints = prediction_service.get_charging_constraints(vehicle_id)
        
        # Convert to response model
        response = ChargingConstraintsResponse(**constraints)
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting charging constraints: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get charging constraints") 