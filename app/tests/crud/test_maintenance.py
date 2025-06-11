import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.crud.maintenance import maintenance_service
from app.models.maintenance import MaintenanceStatus, MaintenanceType
from app.models.vehicle import VehicleStatus
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordUpdate


def test_create_maintenance_record(db: Session, test_vehicle, test_user):
    """Test creating a maintenance record."""
    record_in = MaintenanceRecordCreate(
        vehicle_id=test_vehicle.id,
        type=MaintenanceType.SCHEDULED,
        description="Regular maintenance check",
        scheduled_date=datetime.utcnow() + timedelta(days=1),
        mileage_at_service=15000.0,
        requires_vehicle_offline=True
    )

    record = maintenance_service.create_maintenance_record(
        db=db,
        obj_in=record_in,
        current_user_id=test_user.id
    )

    assert record.vehicle_id == test_vehicle.id
    assert record.type == MaintenanceType.SCHEDULED
    assert record.status == MaintenanceStatus.SCHEDULED
    assert record.created_by == test_user.id

    # Check if vehicle status was updated
    db.refresh(test_vehicle)
    assert test_vehicle.status == VehicleStatus.MAINTENANCE


def test_create_maintenance_record_retired_vehicle(
        db: Session, test_vehicle, test_user):
    """Test creating a maintenance record for a retired vehicle."""
    test_vehicle.status = VehicleStatus.RETIRED
    db.add(test_vehicle)
    db.commit()

    record_in = MaintenanceRecordCreate(
        vehicle_id=test_vehicle.id,
        type=MaintenanceType.SCHEDULED,
        description="Regular maintenance check",
        scheduled_date=datetime.utcnow() + timedelta(days=1)
    )

    with pytest.raises(ValueError) as exc:
        maintenance_service.create_maintenance_record(
            db=db,
            obj_in=record_in,
            current_user_id=test_user.id
        )
    assert "retired vehicle" in str(exc.value)


def test_update_maintenance_record(
        db: Session,
        test_maintenance_record,
        test_user):
    """Test updating a maintenance record."""
    update_in = MaintenanceRecordUpdate(
        status=MaintenanceStatus.IN_PROGRESS,
        technician="John Smith",
        description="Updated maintenance description"
    )

    updated_record = maintenance_service.update_maintenance_record(
        db=db,
        db_obj=test_maintenance_record,
        obj_in=update_in,
        current_user_id=test_user.id
    )

    assert updated_record.status == MaintenanceStatus.IN_PROGRESS
    assert updated_record.technician == "John Smith"
    assert updated_record.updated_by == test_user.id


def test_invalid_status_transition(
        db: Session,
        test_maintenance_record,
        test_user):
    """Test invalid maintenance status transition."""
    # Try to transition from SCHEDULED directly to COMPLETED
    update_in = MaintenanceRecordUpdate(status=MaintenanceStatus.COMPLETED)

    with pytest.raises(ValueError) as exc:
        maintenance_service.update_maintenance_record(
            db=db,
            db_obj=test_maintenance_record,
            obj_in=update_in,
            current_user_id=test_user.id
        )
    assert "Invalid status transition" in str(exc.value)


def test_complete_maintenance(
        db: Session,
        test_maintenance_record,
        test_vehicle,
        test_user):
    """Test completing a maintenance record."""
    # First transition to IN_PROGRESS
    update_in = MaintenanceRecordUpdate(status=MaintenanceStatus.IN_PROGRESS)
    record = maintenance_service.update_maintenance_record(
        db=db,
        db_obj=test_maintenance_record,
        obj_in=update_in,
        current_user_id=test_user.id
    )

    # Then complete the maintenance
    complete_in = MaintenanceRecordUpdate(status=MaintenanceStatus.COMPLETED)
    completed_record = maintenance_service.update_maintenance_record(
        db=db,
        db_obj=record,
        obj_in=complete_in,
        current_user_id=test_user.id
    )

    assert completed_record.status == MaintenanceStatus.COMPLETED
    assert completed_record.completion_date is not None

    # Check if vehicle status was updated back to ACTIVE
    if completed_record.requires_vehicle_offline:
        db.refresh(test_vehicle)
        assert test_vehicle.status == VehicleStatus.ACTIVE


def test_delete_maintenance_record(db: Session, test_maintenance_record):
    """Test deleting a maintenance record."""
    maintenance_service.delete_maintenance_record(
        db=db, db_obj=test_maintenance_record)

    # Verify record was deleted
    record = maintenance_service.get_maintenance_record(
        db, test_maintenance_record.id)
    assert record is None


def test_delete_in_progress_maintenance(
        db: Session,
        test_maintenance_record,
        test_user):
    """Test attempting to delete an in-progress maintenance record."""
    # Set record to IN_PROGRESS
    update_in = MaintenanceRecordUpdate(status=MaintenanceStatus.IN_PROGRESS)
    record = maintenance_service.update_maintenance_record(
        db=db,
        db_obj=test_maintenance_record,
        obj_in=update_in,
        current_user_id=test_user.id
    )

    with pytest.raises(ValueError) as exc:
        maintenance_service.delete_maintenance_record(db=db, db_obj=record)
    assert "Cannot delete maintenance record that is in progress" in str(
        exc.value)


def test_get_vehicle_maintenance_records(db: Session, test_vehicle, test_user):
    """Test retrieving maintenance records for a vehicle."""
    # Create multiple maintenance records
    for i in range(3):
        record_in = MaintenanceRecordCreate(
            vehicle_id=test_vehicle.id,
            type=MaintenanceType.SCHEDULED,
            description=f"Maintenance {i}",
            scheduled_date=datetime.utcnow() + timedelta(days=i)
        )
        maintenance_service.create_maintenance_record(
            db=db,
            obj_in=record_in,
            current_user_id=test_user.id
        )

    records = maintenance_service.get_vehicle_maintenance_records(
        db=db,
        vehicle_id=test_vehicle.id
    )

    assert len(records) == 3
    # Verify records are ordered by scheduled_date desc
    assert records[0].scheduled_date > records[1].scheduled_date


@pytest.fixture
def test_maintenance_record(db: Session, test_vehicle, test_user):
    """Fixture to create a test maintenance record."""
    record_in = MaintenanceRecordCreate(
        vehicle_id=test_vehicle.id,
        type=MaintenanceType.SCHEDULED,
        description="Test maintenance",
        scheduled_date=datetime.utcnow() + timedelta(days=1),
        requires_vehicle_offline=True
    )
    return maintenance_service.create_maintenance_record(
        db=db,
        obj_in=record_in,
        current_user_id=test_user.id
    )
