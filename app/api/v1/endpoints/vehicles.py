from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.vehicle import Vehicle as VehicleModel, VehicleStatus
from app.models.user import User
from app.core.logging import logger

router = APIRouter()

@router.get("/")
async def get_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all vehicles with optional filtering
    """
    try:
        # Simple query to debug
        vehicles = db.query(VehicleModel).offset(skip).limit(limit).all()
        total = len(vehicles)
        
        # Return simplified data
        return {
            "total": total,
            "vehicles": [
                {
                    "id": v.id,
                    "vin": v.vin,
                    "make": v.make,
                    "model": v.model,
                    "status": v.status
                } for v in vehicles
            ]
        }
    except Exception as e:
        logger.error(f"Error in get_vehicles: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/{vehicle_id}")
async def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific vehicle by ID
    """
    try:
        vehicle = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Return simplified data
        return {
            "id": vehicle.id,
            "vin": vehicle.vin,
            "make": vehicle.make,
            "model": vehicle.model,
            "status": vehicle.status
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_vehicle: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 