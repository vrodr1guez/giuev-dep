from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.session import get_db
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.models.charging_station import ChargingSession as ChargingSessionModel, ChargingConnector as ChargingConnectorModel, ChargingStationStatus
from app.models.charging_station import ChargingStation as ChargingStationModel
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.charging import (
    ChargingSession,
    ChargingSessionCreate,
    ChargingSessionUpdate,
    ChargingSessionList,
)
from app.core.logging import logger

router = APIRouter()


@router.get("/", response_model=ChargingSessionList)
async def get_charging_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[int] = None,
    charging_station_id: Optional[int] = None,
    is_completed: Optional[bool] = None,
    user_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
):
    """
    Get all charging sessions with optional filtering.
    """
    try:
        query = db.query(ChargingSessionModel)
        
        # Apply filters
        if vehicle_id:
            query = query.filter(ChargingSessionModel.vehicle_id == vehicle_id)
        
        if charging_station_id:
            query = query.filter(ChargingSessionModel.charging_station_id == charging_station_id)
        
        if is_completed is not None:
            query = query.filter(ChargingSessionModel.is_completed == is_completed)
        
        # Only superusers can see sessions from other users
        if not current_user.is_superuser:
            query = query.filter(ChargingSessionModel.user_id == current_user.id)
        elif user_id:
            query = query.filter(ChargingSessionModel.user_id == user_id)
        
        # Date range filtering
        if start_date:
            query = query.filter(ChargingSessionModel.start_time >= start_date)
        
        if end_date:
            query = query.filter(ChargingSessionModel.start_time <= end_date)
        
        total = query.count()
        sessions = query.order_by(ChargingSessionModel.start_time.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "sessions": sessions
        }
    except Exception as e:
        logger.error(f"Error in get_charging_sessions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/", response_model=ChargingSession, status_code=status.HTTP_201_CREATED)
async def create_charging_session(
    *,
    db: Session = Depends(get_db),
    session_in: ChargingSessionCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Start a new charging session.
    """
    try:
        # Verify the vehicle exists and the user has access to it
        vehicle = db.query(Vehicle).filter(Vehicle.id == session_in.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user can access this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to start charging sessions for this vehicle"
            )
        
        # Verify the charging station and connector exist
        station = db.query(ChargingStationModel).filter(
            ChargingStationModel.id == session_in.charging_station_id
        ).first()
        if not station:
            raise HTTPException(status_code=404, detail="Charging station not found")
        
        # Verify connector exists and is available
        connector = db.query(ChargingConnectorModel).filter(
            ChargingConnectorModel.id == session_in.connector_id,
            ChargingConnectorModel.charging_station_id == session_in.charging_station_id
        ).first()
        
        if not connector:
            raise HTTPException(status_code=404, detail="Connector not found")
        
        if connector.status != ChargingStationStatus.AVAILABLE:
            raise HTTPException(
                status_code=400, 
                detail=f"Connector is not available (current status: {connector.status})"
            )
        
        # Create the session
        db_session = ChargingSessionModel(
            vehicle_id=session_in.vehicle_id,
            charging_station_id=session_in.charging_station_id,
            connector_id=session_in.connector_id,
            user_id=current_user.id,  # Always use the current user's ID
            start_time=session_in.start_time,
            start_soc_percent=session_in.start_soc_percent,
            is_completed=False,
        )
        
        # Update connector status
        connector.status = ChargingStationStatus.OCCUPIED
        
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        return db_session
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in create_charging_session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{session_id}", response_model=ChargingSession)
async def get_charging_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific charging session by ID.
    """
    try:
        session = db.query(ChargingSessionModel).filter(
            ChargingSessionModel.id == session_id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Charging session not found")
        
        # Check authorization - only superusers or session owners can access the session
        if not current_user.is_superuser and session.user_id != current_user.id:
            # Also check if the vehicle belongs to the user's organization
            vehicle = db.query(Vehicle).filter(Vehicle.id == session.vehicle_id).first()
            if not vehicle or vehicle.organization_id != current_user.organization_id:
                raise HTTPException(
                    status_code=403, 
                    detail="Not authorized to access this charging session"
                )
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_charging_session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/{session_id}", response_model=ChargingSession)
async def update_charging_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    session_in: ChargingSessionUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a charging session (e.g., end the session).
    """
    try:
        db_session = db.query(ChargingSessionModel).filter(
            ChargingSessionModel.id == session_id
        ).first()
        
        if not db_session:
            raise HTTPException(status_code=404, detail="Charging session not found")
        
        # Check authorization - only superusers or session owners can update the session
        if not current_user.is_superuser and db_session.user_id != current_user.id:
            # Also check if the vehicle belongs to the user's organization
            vehicle = db.query(Vehicle).filter(Vehicle.id == db_session.vehicle_id).first()
            if not vehicle or vehicle.organization_id != current_user.organization_id:
                raise HTTPException(
                    status_code=403, 
                    detail="Not authorized to update this charging session"
                )
        
        # Don't allow updating completed sessions
        if db_session.is_completed:
            raise HTTPException(
                status_code=400,
                detail="Cannot update a completed charging session"
            )
        
        # Update session
        update_data = session_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_session, field, value)
        
        # If we're completing the session, also update the connector status
        if session_in.is_completed:
            connector = db.query(ChargingConnectorModel).filter(
                ChargingConnectorModel.id == db_session.connector_id
            ).first()
            
            if connector:
                connector.status = ChargingStationStatus.AVAILABLE
        
        db.commit()
        db.refresh(db_session)
        
        return db_session
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in update_charging_session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_charging_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can delete sessions
):
    """
    Delete a charging session (admin only).
    """
    try:
        db_session = db.query(ChargingSessionModel).filter(
            ChargingSessionModel.id == session_id
        ).first()
        
        if not db_session:
            raise HTTPException(status_code=404, detail="Charging session not found")
        
        # If session is active, free the connector
        if not db_session.is_completed:
            connector = db.query(ChargingConnectorModel).filter(
                ChargingConnectorModel.id == db_session.connector_id
            ).first()
            
            if connector and connector.status == ChargingStationStatus.OCCUPIED:
                connector.status = ChargingStationStatus.AVAILABLE
        
        db.delete(db_session)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in delete_charging_session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 