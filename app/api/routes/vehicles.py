from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.session import get_db
from app.schemas.vehicle import (
    Vehicle,
    VehicleCreate,
    VehicleUpdate,
    VehicleList,
    VehicleTelematicsLive,
    VehicleTelematicsHistoryResponse,
    VehicleWithTelematics
)
from app.models.vehicle import VehicleStatus
from app.crud import vehicle as vehicle_crud
from app.api.deps import get_current_user, get_current_active_user
from app.core.logging import logger

router = APIRouter()

@router.post("/", response_model=Vehicle)
async def create_vehicle(
    *,
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Create a new vehicle.
    
    Requires authentication and appropriate permissions.
    """
    try:
        # Check if user has permission to create vehicles for this organization
        # This would depend on your permission system
        
        vehicle = vehicle_crud.create_vehicle(db=db, vehicle=vehicle_in)
        return vehicle
    except IntegrityError as e:
        logger.error(f"Integrity error creating vehicle: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Vehicle with this VIN or license plate already exists"
        )
    except Exception as e:
        logger.error(f"Error creating vehicle: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

@router.get("/", response_model=VehicleList)
async def list_vehicles(
    *,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    organization_id: Optional[int] = None,
    fleet_id: Optional[int] = None,
    status: Optional[VehicleStatus] = None,
    search: Optional[str] = None
):
    """
    Retrieve vehicles with optional filtering.
    
    Filter by organization, fleet, status, or search term.
    Results are paginated.
    """
    try:
        # Permission checks would go here
        
        vehicles, total = vehicle_crud.get_vehicles(
            db=db,
            skip=skip,
            limit=limit,
            organization_id=organization_id,
            fleet_id=fleet_id,
            status=status,
            search=search
        )
        
        return {
            "total": total,
            "vehicles": vehicles
        }
    except Exception as e:
        logger.error(f"Error listing vehicles: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

@router.get("/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(
    *,
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Get a specific vehicle by ID.
    """
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )
    
    # Permission check would go here
    
    return vehicle

@router.get("/{vehicle_id}/telematics", response_model=VehicleWithTelematics)
async def get_vehicle_with_telematics(
    *,
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    history_limit: int = Query(10, ge=1, le=100)
):
    """
    Get a vehicle with its latest telematics data and history.
    """
    vehicle = vehicle_crud.get_vehicle_with_telematics(
        db=db, 
        vehicle_id=vehicle_id,
        history_limit=history_limit
    )
    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )
    
    # Permission check would go here
    
    return vehicle

@router.put("/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(
    *,
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Update a vehicle.
    
    Only fields provided in the request will be updated.
    """
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )
    
    # Permission check would go here
    
    try:
        updated_vehicle = vehicle_crud.update_vehicle(
            db=db, 
            vehicle=vehicle,
            vehicle_in=vehicle_in
        )
        return updated_vehicle
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Vehicle with this license plate already exists"
        )
    except Exception as e:
        logger.error(f"Error updating vehicle {vehicle_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

@router.delete("/{vehicle_id}", response_model=dict)
async def delete_vehicle(
    *,
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Delete a vehicle.
    
    This is a soft delete that marks the vehicle as RETIRED.
    Set permanent=True to permanently delete (requires admin).
    """
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )
    
    # Permission check would go here
    
    vehicle_crud.delete_vehicle(db=db, vehicle_id=vehicle_id)
    return {"message": "Vehicle successfully deleted"}

@router.get("/{vehicle_id}/telematics/history", response_model=VehicleTelematicsHistoryResponse)
async def get_vehicle_telematics_history(
    *,
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Get vehicle telematics history with optional date range filtering.
    
    Results are paginated.
    """
    vehicle = vehicle_crud.get_vehicle(db=db, vehicle_id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )
    
    # Permission check would go here
    
    try:
        records, total = vehicle_crud.get_vehicle_telematics_history(
            db=db,
            vehicle_id=vehicle_id,
            skip=skip,
            limit=limit,
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "total_records": total,
            "records": records
        }
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error retrieving telematics history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        ) 