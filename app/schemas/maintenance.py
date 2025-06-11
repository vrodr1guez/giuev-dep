from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ValidationInfo

from app.models.maintenance import MaintenanceType, MaintenanceStatus


class MaintenanceRecordBase(BaseModel):
    """Base schema for maintenance records."""
    vehicle_id: int = Field(..., description="ID of the vehicle")
    type: MaintenanceType = Field(..., description="Type of maintenance")
    status: MaintenanceStatus = Field(
        default=MaintenanceStatus.SCHEDULED,
        description="Current status of the maintenance record"
    )
    description: str = Field(...,
                             min_length=10,
                             description="Detailed description of maintenance work")
    mileage_at_service: Optional[float] = Field(
        None, ge=0, description="Vehicle mileage at service")
    cost: Optional[float] = Field(
        None, ge=0, description="Cost of maintenance")
    parts_replaced: Optional[List[str]] = Field(
        default_factory=list, description="List of parts replaced")

    service_provider: Optional[str] = Field(
        None, max_length=100, description="Name of service provider")
    technician: Optional[str] = Field(
        None, max_length=100, description="Name of technician")
    location: Optional[str] = Field(
        None, max_length=200, description="Service location")

    scheduled_date: Optional[datetime] = Field(
        None, description="Scheduled maintenance date")
    next_service_date: Optional[datetime] = Field(
        None, description="Next scheduled maintenance date")
    next_service_mileage: Optional[float] = Field(
        None, ge=0, description="Mileage for next service")

    is_warranty_service: bool = Field(
        default=False, description="Whether this is a warranty service")
    requires_vehicle_offline: bool = Field(
        default=False, description="Whether vehicle needs to be taken offline")

    @field_validator('scheduled_date')
    @classmethod
    def validate_scheduled_date(cls, v, info: ValidationInfo):
        """Validate scheduled date is not in the past."""
        if v is not None:
            # Use UTC now to ensure consistent comparison
            now = datetime.utcnow()
            if v < now:
                raise ValueError("Scheduled date cannot be in the past")
        return v

    @field_validator('next_service_date')
    @classmethod
    def validate_next_service_date(cls, v, info: ValidationInfo):
        """Validate next service date is after scheduled date."""
        scheduled_date = info.data.get('scheduled_date')
        if v is not None and scheduled_date is not None:
            if v <= scheduled_date:
                raise ValueError(
                    "Next service date must be after scheduled date")
        return v

    @field_validator('next_service_mileage')
    @classmethod
    def validate_next_service_mileage(cls, v, info: ValidationInfo):
        """Validate next service mileage is greater than current mileage."""
        mileage_at_service = info.data.get('mileage_at_service')
        if v is not None and mileage_at_service is not None:
            if v <= mileage_at_service:
                raise ValueError(
                    "Next service mileage must be greater than current mileage")
        return v


class MaintenanceRecordCreate(MaintenanceRecordBase):
    """Schema for creating a maintenance record."""
    pass


class MaintenanceRecordUpdate(BaseModel):
    """Schema for updating a maintenance record."""
    type: Optional[MaintenanceType] = None
    status: Optional[MaintenanceStatus] = None
    description: Optional[str] = Field(None, min_length=10)
    mileage_at_service: Optional[float] = Field(None, ge=0)
    cost: Optional[float] = Field(None, ge=0)
    parts_replaced: Optional[List[str]] = None
    service_provider: Optional[str] = Field(None, max_length=100)
    technician: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    scheduled_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    next_service_date: Optional[datetime] = None
    next_service_mileage: Optional[float] = Field(None, ge=0)
    is_warranty_service: Optional[bool] = None
    requires_vehicle_offline: Optional[bool] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "in_progress",
                "start_date": "2024-03-20T10:00:00Z",
                "technician": "John Smith",
                "description": "Updated maintenance description"
            }
        }
    }


class MaintenanceRecord(MaintenanceRecordBase):
    """Schema for reading maintenance record data."""
    id: int = Field(...,
                    description="Unique identifier for the maintenance record")
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int
    updated_by: Optional[int] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "vehicle_id": 1,
                "type": "scheduled",
                "status": "completed",
                "description": "Regular maintenance including battery check",
                "mileage_at_service": 15000.5,
                "cost": 250.00,
                "parts_replaced": ["air filter", "brake pads"],
                "service_provider": "EV Service Center",
                "technician": "John Smith",
                "location": "Main Service Center",
                "scheduled_date": "2024-03-20T10:00:00Z",
                "start_date": "2024-03-20T10:00:00Z",
                "completion_date": "2024-03-20T12:00:00Z",
                "next_service_date": "2024-09-20T10:00:00Z",
                "next_service_mileage": 30000.0,
                "is_warranty_service": True,
                "requires_vehicle_offline": True,
                "created_at": "2024-03-19T10:00:00Z",
                "updated_at": "2024-03-20T12:00:00Z",
                "created_by": 1,
                "updated_by": 1
            }
        }


class MaintenanceRecordList(BaseModel):
    """Schema for paginated maintenance record list response."""
    total: int = Field(...,
                       description="Total number of records matching the query")
    records: List[MaintenanceRecord] = Field(...,
                                             description="List of maintenance records")

    class Config:
        json_schema_extra = {
            "example": {
                "total": 1,
                "records": [{
                    "id": 1,
                    "vehicle_id": 1,
                    "type": "scheduled",
                    "status": "completed",
                    "description": "Regular maintenance including battery check",
                    "scheduled_date": "2024-03-20T10:00:00Z",
                    "completion_date": "2024-03-20T12:00:00Z"
                }]
            }
        }
