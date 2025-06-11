from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import pandas as pd

from app.services.BatteryHealthPrediction import get_battery_health_prediction
from app.services.EnhancedBatteryHealthPredictor import get_enhanced_battery_predictor
from app.services.TelemetryDataService import get_telemetry_processor
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.battery_telemetry import BatteryTelemetry, AnomalyDetection
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

router = APIRouter()
logger = logging.getLogger(__name__)

class BatteryHealthResponse(BaseModel):
    vehicle_id: str
    state_of_health: float
    estimated_capacity: float
    nominal_capacity: float
    cycle_count: int
    predicted_degradation_rate: float
    estimated_replacement_date: Optional[str] = None
    anomalies: List[Dict[str, Any]] = []
    confidence: float

class MaintenanceScheduleResponse(BaseModel):
    vehicle_id: str
    next_maintenance_date: str
    maintenance_type: str
    reason: str
    priority: str
    estimated_downtime_hours: float
    recommended_actions: List[str]
    predicted_days_to_replacement: Optional[int] = None

class FleetHealthReportResponse(BaseModel):
    timestamp: str
    fleet_size: int
    vehicles_analyzed: int
    fleet_avg_soh: float
    health_distribution: Dict[str, int]
    anomalies_detected: int
    maintenance_required_count: int
    critical_issues_count: int
    total_predicted_replacement_cost: float
    vehicles_by_priority: Dict[str, List[str]]

class TelemetryDataRequest(BaseModel):
    vehicle_id: str
    provider: str = Field(..., description="API provider (e.g., 'tesla', 'ford', 'generic_oem')")
    
class TelemetryFetchResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None
    validation_messages: List[str] = []

class BatteryChemistryInfo(BaseModel):
    chemistry: str = Field(..., description="Battery chemistry type (e.g., 'NMC', 'LFP', 'NCA')")
    cycle_life: int = Field(..., description="Expected cycle life")
    typical_degradation_rate: float = Field(..., description="Typical degradation rate (% per month)")

@router.get("/vehicle/{vehicle_id}", response_model=BatteryHealthResponse)
async def get_vehicle_battery_health(
    vehicle_id: str,
    use_enhanced: bool = Query(False, description="Use enhanced prediction with ML models"),
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get comprehensive battery health data for a vehicle
    
    Returns detailed battery health metrics including state of health,
    estimated capacity, degradation rate, and any detected anomalies.
    
    - **use_enhanced**: Set to true to use machine learning models for prediction
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")
        
        if use_enhanced:
            # Use enhanced prediction with ML
            prediction_service = get_enhanced_battery_predictor()
            health_data = prediction_service.get_battery_health(vehicle_id, db)
        else:
            # Use base prediction service
            prediction_service = get_battery_health_prediction()
            health_data = prediction_service.get_battery_health(vehicle_id)
        
        # Convert to response model
        response = BatteryHealthResponse(
            vehicle_id=health_data.vehicle_id,
            state_of_health=health_data.state_of_health,
            estimated_capacity=health_data.estimated_capacity,
            nominal_capacity=health_data.nominal_capacity,
            cycle_count=health_data.cycle_count,
            predicted_degradation_rate=health_data.predicted_degradation_rate,
            estimated_replacement_date=health_data.estimated_replacement_date.isoformat() if health_data.estimated_replacement_date else None,
            anomalies=health_data.anomalies,
            confidence=health_data.confidence
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting battery health: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get battery health data")

@router.get("/maintenance/{vehicle_id}", response_model=MaintenanceScheduleResponse)
async def get_vehicle_maintenance_schedule(
    vehicle_id: str,
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get recommended maintenance schedule for a vehicle
    
    Returns maintenance recommendations based on battery health, anomalies,
    and predicted future degradation.
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
        prediction_service = get_battery_health_prediction()
        
        # Get maintenance schedule
        schedule = prediction_service.get_maintenance_schedule(vehicle_id)
        
        # Convert to response model
        response = MaintenanceScheduleResponse(**schedule)
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting maintenance schedule: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get maintenance schedule")

@router.get("/fleet", response_model=Dict[str, MaintenanceScheduleResponse])
async def get_fleet_maintenance_schedule(
    vehicles: str = Query(..., description="Comma-separated list of vehicle IDs"),
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get maintenance schedules for multiple vehicles
    
    Returns a dictionary mapping vehicle IDs to their maintenance schedules,
    which can be used for fleet-wide maintenance planning.
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
        prediction_service = get_battery_health_prediction()
        
        # Get fleet maintenance schedules
        fleet_schedules = prediction_service.predict_fleet_maintenance(accessible_vehicles)
        
        # Convert to response format
        response = {}
        for vehicle_id, schedule in fleet_schedules.items():
            response[vehicle_id] = MaintenanceScheduleResponse(**schedule)
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting fleet maintenance schedules: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get fleet maintenance schedules")

@router.get("/fleet-report", response_model=FleetHealthReportResponse)
async def get_fleet_health_report(
    vehicles: str = Query(..., description="Comma-separated list of vehicle IDs"),
    db = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a comprehensive fleet health report
    
    Returns aggregated statistics about fleet battery health,
    maintenance needs, and cost projections.
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
        prediction_service = get_battery_health_prediction()
        
        # Get fleet health report
        report = prediction_service.get_fleet_health_report(accessible_vehicles)
        
        # Convert to response model
        response = FleetHealthReportResponse(**report)
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating fleet health report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate fleet health report")

@router.post("/telemetry/fetch", response_model=TelemetryFetchResponse)
async def fetch_telemetry_data(
    request: TelemetryDataRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Fetch telemetry data from vehicle API provider
    
    Connects to external vehicle API, fetches battery telemetry data,
    validates it, and stores it in the database.
    
    - **vehicle_id**: Vehicle identifier
    - **provider**: API provider name (tesla, ford, generic_oem)
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")
        
        # Get telemetry processor
        telemetry_processor = get_telemetry_processor()
        
        # Process and store telemetry data
        result = await telemetry_processor.process_and_store_telemetry(
            request.vehicle_id,
            request.provider,
            db
        )
        
        return TelemetryFetchResponse(**result)
        
    except Exception as e:
        logger.error(f"Error fetching telemetry data: {str(e)}")
        return TelemetryFetchResponse(
            status="error",
            message=f"Failed to fetch telemetry data: {str(e)}"
        )

@router.get("/telemetry/{vehicle_id}", response_model=List[Dict[str, Any]])
async def get_vehicle_telemetry(
    vehicle_id: str,
    days: int = Query(7, description="Number of days of data to retrieve"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get historical telemetry data for a vehicle
    
    Returns battery telemetry data for the specified time period.
    
    - **vehicle_id**: Vehicle identifier
    - **days**: Number of days of data to retrieve (default: 7)
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")
        
        # Get telemetry data from database
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        telemetry_data = db.query(BatteryTelemetry).filter(
            BatteryTelemetry.vehicle_id == vehicle_id,
            BatteryTelemetry.timestamp >= start_date,
            BatteryTelemetry.timestamp <= end_date
        ).order_by(BatteryTelemetry.timestamp).all()
        
        # If no database records, use telemetry processor to generate demo data
        if not telemetry_data:
            telemetry_processor = get_telemetry_processor()
            telemetry_df = telemetry_processor.get_historical_telemetry(
                vehicle_id, start_date, end_date, db
            )
            
            # Convert DataFrame to list of dicts
            if not telemetry_df.empty:
                return telemetry_df.to_dict('records')
            else:
                return []
        
        # Convert database records to response format
        result = []
        for record in telemetry_data:
            data_dict = {
                "timestamp": record.timestamp.isoformat(),
                "voltage": record.voltage,
                "current": record.current,
                "state_of_charge": record.state_of_charge,
                "state_of_health": record.state_of_health,
                "temperature_min": record.temperature_min,
                "temperature_max": record.temperature_max,
                "temperature_avg": record.temperature_avg,
                # Include raw data if needed
                "raw_data": record.data
            }
            result.append(data_dict)
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving vehicle telemetry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve telemetry data")

@router.get("/anomalies/{vehicle_id}", response_model=List[Dict[str, Any]])
async def get_vehicle_anomalies(
    vehicle_id: str,
    days: int = Query(30, description="Number of days of data to retrieve"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get detected anomalies for a vehicle
    
    Returns battery anomalies detected within the specified time period.
    
    - **vehicle_id**: Vehicle identifier
    - **days**: Number of days of data to retrieve (default: 30)
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this vehicle")
        
        # Get anomaly data from database
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        anomalies = db.query(AnomalyDetection).filter(
            AnomalyDetection.vehicle_id == vehicle_id,
            AnomalyDetection.detection_timestamp >= start_date,
            AnomalyDetection.detection_timestamp <= end_date
        ).order_by(AnomalyDetection.detection_timestamp.desc()).all()
        
        # If no database records, use enhanced predictor to generate anomalies
        if not anomalies:
            # Get telemetry data
            telemetry_processor = get_telemetry_processor()
            telemetry_df = telemetry_processor.get_historical_telemetry(
                vehicle_id, start_date, end_date, db
            )
            
            # Get enhanced predictor
            predictor = get_enhanced_battery_predictor()
            
            # Get vehicle data to determine chemistry
            # In a real implementation, this would query the vehicle model
            vehicle_data = {
                "v1": {"chemistry": "NMC"},
                "v2": {"chemistry": "LFP"},
                "v3": {"chemistry": "NMC"},
                "v4": {"chemistry": "NCA"},
                "v5": {"chemistry": "NMC"}
            }.get(vehicle_id, {"chemistry": "NMC"})
            
            # Detect anomalies
            if not telemetry_df.empty:
                detected_anomalies = predictor._detect_anomalies(telemetry_df, vehicle_data["chemistry"])
                return detected_anomalies
            else:
                return []
        
        # Convert database records to response format
        result = []
        for anomaly in anomalies:
            anomaly_dict = {
                "type": anomaly.anomaly_type,
                "severity": anomaly.severity,
                "date": anomaly.detection_timestamp.isoformat(),
                "description": anomaly.description,
                "recommended_action": anomaly.recommended_action,
                "is_acknowledged": anomaly.is_acknowledged,
                "is_resolved": anomaly.is_resolved
            }
            result.append(anomaly_dict)
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving vehicle anomalies: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve anomaly data")

@router.get("/chemistry-info", response_model=Dict[str, BatteryChemistryInfo])
async def get_battery_chemistry_info(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get information about different battery chemistry types
    
    Returns specifications for different battery chemistry types including
    cycle life, degradation rates, and other key parameters.
    """
    try:
        # Get data from enhanced predictor
        from app.services.EnhancedBatteryHealthPredictor import BATTERY_CHEMISTRY
        
        result = {}
        for chemistry, data in BATTERY_CHEMISTRY.items():
            result[chemistry] = BatteryChemistryInfo(
                chemistry=chemistry,
                cycle_life=data["cycle_life"],
                typical_degradation_rate=data["typical_degradation_rate"]
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving battery chemistry info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve battery chemistry information")

@router.post("/train-models", response_model=Dict[str, Any])
async def train_prediction_models(
    training_config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Train machine learning models for battery health prediction
    
    Triggers training of ML models using historical data.
    
    Body should contain:
    - chemistries: List of battery chemistry types to train models for
    - days: Number of days of historical data to use
    """
    # Only superusers can train models
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to train models")
    
    try:
        # Extract parameters
        chemistries = training_config.get("chemistries", ["NMC", "LFP", "NCA"])
        days = training_config.get("days", 365)
        
        # Get telemetry processor and enhanced predictor
        telemetry_processor = get_telemetry_processor()
        predictor = get_enhanced_battery_predictor()
        
        # Prepare training data
        training_data = {}
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        for chemistry in chemistries:
            # Get vehicle IDs with this chemistry
            # In a real implementation, this would query the vehicle model
            vehicle_ids = []
            for vehicle_id, data in {
                "v1": {"chemistry": "NMC"},
                "v2": {"chemistry": "LFP"},
                "v3": {"chemistry": "NMC"},
                "v4": {"chemistry": "NCA"},
                "v5": {"chemistry": "NMC"}
            }.items():
                if data["chemistry"] == chemistry:
                    vehicle_ids.append(vehicle_id)
            
            # Skip if no vehicles with this chemistry
            if not vehicle_ids:
                continue
            
            # Get telemetry data for these vehicles
            all_data = []
            for vehicle_id in vehicle_ids:
                telemetry_df = telemetry_processor.get_historical_telemetry(
                    vehicle_id, start_date, end_date, db
                )
                if not telemetry_df.empty:
                    all_data.append(telemetry_df)
            
            # Combine data from all vehicles
            if all_data:
                combined_df = pd.concat(all_data, ignore_index=True)
                training_data[chemistry] = combined_df
            else:
                training_data[chemistry] = pd.DataFrame()
        
        # Train models
        results = predictor.train_models(training_data)
        
        return {
            "status": "success",
            "message": "Models trained successfully",
            "details": results
        }
        
    except Exception as e:
        logger.error(f"Error training models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to train models: {str(e)}") 