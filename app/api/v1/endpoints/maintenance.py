from typing import Optional, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.maintenance import maintenance_service
from app.models.maintenance import MaintenanceStatus
from app.schemas.maintenance import (
    MaintenanceRecord,
    MaintenanceRecordCreate,
    MaintenanceRecordUpdate,
    MaintenanceRecordList
)
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/{record_id}", response_model=MaintenanceRecord)
def get_maintenance_record(
    record_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_user)
):
    """
    Retrieve a specific maintenance record by ID.
    """
    record = maintenance_service.get_maintenance_record(db, record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found")
    return record


@router.get("/vehicle/{vehicle_id}", response_model=MaintenanceRecordList)
def get_vehicle_maintenance_records(
    vehicle_id: int,
    status: Optional[MaintenanceStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_user)
):
    """
    Retrieve maintenance records for a specific vehicle with optional filters.
    """
    records = maintenance_service.get_vehicle_maintenance_records(
        db,
        vehicle_id=vehicle_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )
    return MaintenanceRecordList(
        total=len(records),
        records=records
    )


@router.post("", response_model=MaintenanceRecord)
def create_maintenance_record(
    *,
    record_in: MaintenanceRecordCreate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_user)
):
    """
    Create a new maintenance record.
    """
    return maintenance_service.create_maintenance_record(
        db=db,
        obj_in=record_in,
        current_user_id=current_user.id
    )


@router.put("/{record_id}", response_model=MaintenanceRecord)
def update_maintenance_record(
    *,
    record_id: int,
    record_in: MaintenanceRecordUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_user)
):
    """
    Update an existing maintenance record.
    """
    record = maintenance_service.get_maintenance_record(db, record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found")

    return maintenance_service.update_maintenance_record(
        db=db,
        db_obj=record,
        obj_in=record_in,
        current_user_id=current_user.id
    )


@router.delete("/{record_id}", response_model=MaintenanceRecord)
def delete_maintenance_record(
    record_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_user)
):
    """
    Delete a maintenance record.
    """
    record = maintenance_service.get_maintenance_record(db, record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found")

    return maintenance_service.delete_maintenance_record(db=db, db_obj=record)
