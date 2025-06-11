from typing import List, Optional, Tuple, Union, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from fastapi.encoders import jsonable_encoder

from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

def get_vehicle(db: Session, vehicle_id: int) -> Optional[Vehicle]:
    """Get a vehicle by ID."""
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def get_vehicle_by_vin(db: Session, vin: str) -> Optional[Vehicle]:
    """Get a vehicle by VIN."""
    return db.query(Vehicle).filter(Vehicle.vin == vin).first()

def get_vehicles(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    organization_id: Optional[int] = None,
    fleet_id: Optional[int] = None,
    status: Optional[VehicleStatus] = None,
    search: Optional[str] = None
) -> Tuple[List[Vehicle], int]:
    """
    Get vehicles with optional filtering.
    Returns a tuple of (vehicles, total_count)
    """
    query = db.query(Vehicle)
    
    # Apply filters if provided
    if organization_id is not None:
        query = query.filter(Vehicle.organization_id == organization_id)
        
    if fleet_id is not None:
        query = query.filter(Vehicle.fleet_id == fleet_id)
        
    if status is not None:
        query = query.filter(Vehicle.status == status)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Vehicle.vin.ilike(search_term),
                Vehicle.license_plate.ilike(search_term),
                Vehicle.make.ilike(search_term),
                Vehicle.model.ilike(search_term)
            )
        )
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    vehicles = query.offset(skip).limit(limit).all()
    
    return vehicles, total

def create_vehicle(db: Session, vehicle: VehicleCreate) -> Vehicle:
    """Create a new vehicle."""
    vehicle_data = jsonable_encoder(vehicle)
    db_vehicle = Vehicle(**vehicle_data)
    
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    return db_vehicle

def update_vehicle(
    db: Session,
    vehicle: Vehicle,
    vehicle_in: Union[VehicleUpdate, Dict[str, Any]]
) -> Vehicle:
    """Update a vehicle."""
    vehicle_data = jsonable_encoder(vehicle)
    
    if isinstance(vehicle_in, dict):
        update_data = vehicle_in
    else:
        update_data = vehicle_in.dict(exclude_unset=True)
        
    for field in vehicle_data:
        if field in update_data:
            setattr(vehicle, field, update_data[field])
    
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    
    return vehicle

def delete_vehicle(db: Session, vehicle_id: int) -> None:
    """
    Soft delete a vehicle by setting its status to RETIRED.
    """
    vehicle = get_vehicle(db, vehicle_id)
    if vehicle:
        vehicle.status = VehicleStatus.RETIRED
        db.add(vehicle)
        db.commit()

def get_vehicle_with_telematics(
    db: Session,
    vehicle_id: int,
    history_limit: int = 10
) -> Optional[Vehicle]:
    """Get a vehicle with its latest telematics data and history."""
    vehicle = get_vehicle(db, vehicle_id)
    
    if vehicle:
        # Ensure relationships are loaded
        if vehicle.telematics_live:
            db.refresh(vehicle.telematics_live)
            
        # Load limited telematics history
        if history_limit > 0:
            vehicle.telematics_history = (
                db.query(vehicle.telematics_history.entity_class)
                .filter(vehicle.telematics_history.entity_class.vehicle_id == vehicle_id)
                .order_by(vehicle.telematics_history.entity_class.timestamp.desc())
                .limit(history_limit)
                .all()
            )
            
    return vehicle

def get_vehicle_telematics_history(
    db: Session,
    vehicle_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Tuple[List, int]:
    """
    Get vehicle telematics history with optional date filtering.
    Returns a tuple of (records, total_count)
    """
    from app.models.telematics import VehicleTelematicsHistory
    
    query = db.query(VehicleTelematicsHistory).filter(
        VehicleTelematicsHistory.vehicle_id == vehicle_id
    )
    
    # Apply date filters if provided
    if start_date:
        try:
            start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(VehicleTelematicsHistory.timestamp >= start_datetime)
        except ValueError:
            raise ValueError("Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)")
            
    if end_date:
        try:
            end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(VehicleTelematicsHistory.timestamp <= end_datetime)
        except ValueError:
            raise ValueError("Invalid end_date format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)")
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    records = (
        query
        .order_by(VehicleTelematicsHistory.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return records, total 