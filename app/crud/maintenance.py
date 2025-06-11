from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from app.models.maintenance import MaintenanceRecord, MaintenanceStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordUpdate
from app.core.logging import logger


class CRUDMaintenance:
    def get_maintenance_record(
        self,
        db: Session,
        record_id: int
    ) -> Optional[MaintenanceRecord]:
        """Get a single maintenance record by ID."""
        try:
            return db.query(MaintenanceRecord).filter(
                MaintenanceRecord.id == record_id).first()
        except SQLAlchemyError as e:
            logger.error(
                f"Database error retrieving maintenance record {record_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving maintenance record"
            )

    def get_vehicle_maintenance_records(
        self,
        db: Session,
        vehicle_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[MaintenanceStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[MaintenanceRecord]:
        """Get maintenance records for a specific vehicle with optional filters."""
        try:
            query = db.query(MaintenanceRecord).filter(
                MaintenanceRecord.vehicle_id == vehicle_id)

            if status:
                query = query.filter(MaintenanceRecord.status == status)
            if start_date:
                query = query.filter(
                    MaintenanceRecord.scheduled_date >= start_date)
            if end_date:
                query = query.filter(
                    MaintenanceRecord.scheduled_date <= end_date)

            return query.order_by(
                MaintenanceRecord.scheduled_date.desc()).offset(skip).limit(limit).all()

        except SQLAlchemyError as e:
            logger.error(
                f"Database error retrieving maintenance records for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving maintenance records"
            )

    def create_maintenance_record(
        self,
        db: Session,
        obj_in: MaintenanceRecordCreate,
        current_user_id: int
    ) -> MaintenanceRecord:
        """Create a new maintenance record with business logic validation."""
        try:
            # Check if vehicle exists and is active
            vehicle = db.query(Vehicle).filter(
                Vehicle.id == obj_in.vehicle_id).first()
            if not vehicle:
                raise ValueError(f"Vehicle {obj_in.vehicle_id} not found")
            if vehicle.status == VehicleStatus.RETIRED:
                raise ValueError(
                    f"Cannot create maintenance record for retired vehicle {obj_in.vehicle_id}")

            # Create maintenance record
            db_obj = MaintenanceRecord(
                **obj_in.model_dump(),
                created_by=current_user_id,
                updated_by=current_user_id
            )

            # Update vehicle status if maintenance requires vehicle offline
            if obj_in.requires_vehicle_offline:
                vehicle.status = VehicleStatus.MAINTENANCE
                db.add(vehicle)

            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

        except ValueError as e:
            logger.error(
                f"Validation error creating maintenance record: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error creating maintenance record: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error creating maintenance record"
            )

    def update_maintenance_record(
        self,
        db: Session,
        db_obj: MaintenanceRecord,
        obj_in: Union[MaintenanceRecordUpdate, Dict[str, Any]],
        current_user_id: int
    ) -> MaintenanceRecord:
        """Update a maintenance record with status transition validation."""
        try:
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.model_dump(exclude_unset=True)

            # Validate status transitions
            if 'status' in update_data:
                new_status = update_data['status']
                self._validate_status_transition(db_obj.status, new_status)

                # Handle completion
                if new_status == MaintenanceStatus.COMPLETED:
                    update_data['completion_date'] = datetime.utcnow()

                    # Update vehicle status if it was taken offline
                    if db_obj.requires_vehicle_offline:
                        vehicle = db.query(Vehicle).filter(
                            Vehicle.id == db_obj.vehicle_id).first()
                        if vehicle and vehicle.status == VehicleStatus.MAINTENANCE:
                            vehicle.status = VehicleStatus.ACTIVE
                            db.add(vehicle)

            # Update the record
            for field in update_data:
                if hasattr(db_obj, field):
                    setattr(db_obj, field, update_data[field])

            db_obj.updated_by = current_user_id
            db_obj.updated_at = datetime.utcnow()

            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

        except ValueError as e:
            logger.error(
                f"Validation error updating maintenance record {db_obj.id}: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error updating maintenance record {db_obj.id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error updating maintenance record"
            )

    def delete_maintenance_record(
        self,
        db: Session,
        db_obj: MaintenanceRecord
    ) -> MaintenanceRecord:
        """Delete a maintenance record with validation."""
        try:
            if db_obj.status in [
                    MaintenanceStatus.IN_PROGRESS,
                    MaintenanceStatus.COMPLETED]:
                raise ValueError(
                    "Cannot delete maintenance record that is in progress or completed")

            db.delete(db_obj)
            db.commit()
            return db_obj

        except ValueError as e:
            logger.error(
                f"Validation error deleting maintenance record {db_obj.id}: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error deleting maintenance record {db_obj.id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error deleting maintenance record"
            )

    def _validate_status_transition(
        self,
        current_status: MaintenanceStatus,
        new_status: MaintenanceStatus
    ) -> None:
        """Validate maintenance record status transitions."""
        valid_transitions = {
            MaintenanceStatus.SCHEDULED: [
                MaintenanceStatus.IN_PROGRESS,
                MaintenanceStatus.CANCELLED,
                MaintenanceStatus.DEFERRED
            ],
            MaintenanceStatus.IN_PROGRESS: [
                MaintenanceStatus.COMPLETED,
                MaintenanceStatus.DEFERRED
            ],
            MaintenanceStatus.DEFERRED: [
                MaintenanceStatus.SCHEDULED,
                MaintenanceStatus.CANCELLED
            ],
            MaintenanceStatus.COMPLETED: [],  # No transitions allowed from completed
            # Can reschedule cancelled maintenance
            MaintenanceStatus.CANCELLED: [MaintenanceStatus.SCHEDULED]
        }

        if new_status not in valid_transitions.get(current_status, []):
            raise ValueError(
                f"Invalid status transition from {current_status} to {new_status}. "
                f"Valid transitions are: {valid_transitions.get(current_status, [])}")


maintenance_service = CRUDMaintenance()
