from typing import Optional, Dict, Any, List, Union, Annotated
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator, ValidationInfo, ConfigDict, constr, confloat, model_validator
from enum import Enum

# Import VehicleStatus from the same file instead of creating circular imports
class VehicleStatus(str, Enum):
    """Enumeration of possible vehicle statuses."""
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"
    RETIRED = "retired"


class VehicleTelematicsLiveBase(BaseModel):
    """Base schema for vehicle live telematics data."""
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of the telematics data")
    latitude: Optional[Annotated[float, confloat(ge=-90, le=90)]] = Field(
        default=None, description="Vehicle latitude in decimal degrees")
    longitude: Optional[Annotated[float, confloat(ge=-180, le=180)]] = Field(
        default=None, description="Vehicle longitude in decimal degrees")
    speed_kmh: Optional[Annotated[float, confloat(ge=0)]] = Field(
        default=None, description="Vehicle speed in kilometers per hour")
    state_of_charge_percent: Optional[Annotated[float, confloat(ge=0, le=100)]] = Field(
        default=None, description="Battery state of charge percentage")
    state_of_health_percent: Optional[Annotated[float, confloat(ge=0, le=100)]] = Field(
        default=None, description="Battery state of health percentage")
    odometer_km: Optional[Annotated[float, confloat(ge=0)]] = Field(
        default=None, description="Vehicle odometer reading in kilometers")
    is_charging: bool = Field(
        default=False, description="Whether the vehicle is currently charging")
    ambient_temperature_celsius: Optional[float] = Field(
        default=None, description="Ambient temperature in Celsius")
    raw_data: Optional[Dict[str, Any]] = Field(
        default=None, description="Raw telematics data from provider")

    model_config = ConfigDict(
        from_attributes=True,
    )

    @field_validator('timestamp')
    @classmethod
    def ensure_utc(cls, v: datetime, info: ValidationInfo) -> datetime:
        """Ensure timestamp is in UTC."""
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


class VehicleTelematicsLiveCreate(VehicleTelematicsLiveBase):
    """Schema for creating live telematics data."""
    model_config = ConfigDict(extra="forbid")


class VehicleTelematicsLive(VehicleTelematicsLiveBase):
    """Schema for reading live telematics data (includes vehicle_id and updated_at)."""
    vehicle_id: int = Field(..., description="ID of the vehicle")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "vehicle_id": 1,
                "timestamp": "2024-03-20T10:00:00Z",
                "latitude": 45.4215,
                "longitude": -75.6972,
                "speed_kmh": 60.5,
                "state_of_charge_percent": 75.5,
                "state_of_health_percent": 98.0,
                "odometer_km": 15000.5,
                "is_charging": False,
                "ambient_temperature_celsius": 22.5,
                "updated_at": "2024-03-20T10:00:00Z"
            }
        }
    )


class VehicleTelematicsHistoryBase(BaseModel):
    """Base schema for vehicle telematics history."""
    timestamp: datetime = Field(...,
                                description="Timestamp of the historical record")
    latitude: Optional[Annotated[float, confloat(ge=-90, le=90)]] = Field(
        default=None, description="Vehicle latitude in decimal degrees")
    longitude: Optional[Annotated[float, confloat(ge=-180, le=180)]] = Field(
        default=None, description="Vehicle longitude in decimal degrees")
    speed_kmh: Optional[Annotated[float, confloat(ge=0)]] = Field(
        default=None, description="Vehicle speed in kilometers per hour")
    state_of_charge_percent: Optional[Annotated[float, confloat(ge=0, le=100)]] = Field(
        default=None, description="Battery state of charge percentage")
    energy_consumed_kwh_since_last: Optional[Annotated[float, confloat(ge=0)]] = Field(
        default=None,
        description="Energy consumed since last record in kilowatt-hours"
    )
    odometer_km: Optional[Annotated[float, confloat(ge=0)]] = Field(
        default=None, description="Vehicle odometer reading in kilometers")
    diagnostic_trouble_codes: List[str] = Field(
        default_factory=list,
        description="List of diagnostic trouble codes"
    )
    raw_data: Optional[Dict[str, Any]] = Field(
        default=None, description="Raw telematics data from provider")
        
    model_config = ConfigDict(
        from_attributes=True,
    )

    @field_validator('timestamp')
    @classmethod
    def ensure_timestamp_utc(cls, v: datetime, info: ValidationInfo) -> datetime:
        """Ensure timestamp is in UTC."""
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    @field_validator('diagnostic_trouble_codes')
    @classmethod
    def validate_dtcs(cls, v: List[str], info: ValidationInfo) -> List[str]:
        """Validate diagnostic trouble codes format."""
        if not all(isinstance(code, str) for code in v):
            raise ValueError("All diagnostic trouble codes must be strings")
        return v


class VehicleTelematicsHistoryCreate(VehicleTelematicsHistoryBase):
    """Schema for creating historical telematics records."""
    model_config = ConfigDict(extra="forbid")


class VehicleTelematicsHistory(VehicleTelematicsHistoryBase):
    """Schema for reading historical telematics records (includes log_id and vehicle_id)."""
    log_id: int = Field(...,
                        description="Unique identifier for the historical record")
    vehicle_id: int = Field(..., description="ID of the vehicle")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "log_id": 1,
                "vehicle_id": 1,
                "timestamp": "2024-03-20T10:00:00Z",
                "latitude": 45.4215,
                "longitude": -75.6972,
                "speed_kmh": 60.5,
                "state_of_charge_percent": 75.5,
                "energy_consumed_kwh_since_last": 2.5,
                "odometer_km": 15000.5,
                "diagnostic_trouble_codes": ["P0100", "P0200"],
                "raw_data": {
                    "provider_specific_field": "value"
                }
            }
        }
    )

# Response models for API endpoints


class VehicleTelematicsResponse(BaseModel):
    """Generic response model for telematics operations."""
    success: bool = Field(...,
                          description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Response data")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "message": "Telematics data processed successfully",
                "data": {
                    "vehicle_id": 1,
                    "timestamp": "2024-03-20T10:00:00Z"
                }
            }
        }
    )


class VehicleTelematicsHistoryResponse(BaseModel):
    """Response model for historical telematics queries."""
    total_records: int = Field(...,
                               description="Total number of records matching the query")
    records: List[VehicleTelematicsHistory] = Field(
        ..., description="List of historical records")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_records": 1,
                "records": [{
                    "log_id": 1,
                    "vehicle_id": 1,
                    "timestamp": "2024-03-20T10:00:00Z",
                    "latitude": 45.4215,
                    "longitude": -75.6972,
                    "speed_kmh": 60.5,
                    "state_of_charge_percent": 75.5,
                    "energy_consumed_kwh_since_last": 2.5,
                    "odometer_km": 15000.5,
                    "diagnostic_trouble_codes": ["P0100"],
                    "raw_data": {
                        "provider_specific_field": "value"
                    }
                }]
            }
        }
    )


class VehicleBase(BaseModel):
    """Base schema for vehicle data."""
    vin: Annotated[str, constr(min_length=17, max_length=17)] = Field(
        ..., description="Vehicle Identification Number")
    license_plate: Annotated[str, constr(max_length=20)] = Field(
        ..., description="Vehicle license plate number")
    make: Annotated[str, constr(max_length=50)] = Field(..., description="Vehicle manufacturer")
    model: Annotated[str, constr(max_length=50)] = Field(..., description="Vehicle model")
    year: int = Field(..., ge=1900, description="Vehicle manufacturing year")
    battery_capacity_kwh: float = Field(..., gt=0, description="Battery capacity in kilowatt-hours")
    nominal_range_km: float = Field(..., gt=0, description="Nominal range in kilometers")
    telematics_provider_id: Optional[int] = Field(
        default=None, description="ID of the telematics provider")
    telematics_vehicle_id: Optional[str] = Field(
        default=None, max_length=100, description="Vehicle ID in telematics provider's system")
    status: VehicleStatus = Field(
        default=VehicleStatus.ACTIVE,
        description="Current vehicle status")
    organization_id: int = Field(..., description="ID of the organization that owns the vehicle")
    fleet_id: Optional[int] = Field(
        default=None, description="ID of the fleet this vehicle belongs to")
        
    model_config = ConfigDict(
        from_attributes=True,
    )

    @field_validator('vin')
    @classmethod
    def validate_vin(cls, v: str, info: ValidationInfo) -> str:
        """Validate VIN format."""
        if not v.isalnum():
            raise ValueError("VIN must contain only alphanumeric characters")
        return v.upper()

    @field_validator('year')
    @classmethod
    def validate_year(cls, v: int, info: ValidationInfo) -> int:
        """Validate that year is not in the future."""
        if v > datetime.now().year + 1:  # Allow next year's models
            raise ValueError("Year cannot be in the future")
        return v


class VehicleCreate(VehicleBase):
    """Schema for creating a new vehicle."""
    model_config = ConfigDict(extra="forbid")


class VehicleUpdate(BaseModel):
    """Schema for updating a vehicle. All fields are optional."""
    license_plate: Optional[Annotated[str, constr(max_length=20)]] = None
    make: Optional[Annotated[str, constr(max_length=50)]] = None
    model: Optional[Annotated[str, constr(max_length=50)]] = None
    year: Optional[int] = Field(default=None, ge=1900)
    battery_capacity_kwh: Optional[float] = Field(default=None, gt=0)
    nominal_range_km: Optional[float] = Field(default=None, gt=0)
    telematics_provider_id: Optional[int] = None
    telematics_vehicle_id: Optional[str] = Field(default=None, max_length=100)
    status: Optional[VehicleStatus] = None
    fleet_id: Optional[int] = None
    
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "license_plate": "ABC123",
                "battery_capacity_kwh": 75.0,
                "nominal_range_km": 400.0,
                "status": "active"
            }
        }
    )


class Vehicle(VehicleBase):
    """Schema for reading vehicle data (includes id and timestamps)."""
    id: int = Field(..., description="Unique identifier for the vehicle")
    created_at: datetime
    updated_at: Optional[datetime] = None
    telematics_live: Optional[VehicleTelematicsLive] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "vin": "1HGCM82633A123456",
                "license_plate": "ABC123",
                "make": "Tesla",
                "model": "Model Y",
                "year": 2024,
                "battery_capacity_kwh": 75.0,
                "nominal_range_km": 450.0,
                "telematics_provider_id": 1,
                "telematics_vehicle_id": "TESLA123",
                "status": "active",
                "organization_id": 1,
                "fleet_id": 1,
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T10:00:00Z",
                "telematics_live": {
                    "vehicle_id": 1,
                    "timestamp": "2024-03-20T10:00:00Z",
                    "state_of_charge_percent": 75.5,
                    "is_charging": False
                }
            }
        }
    )


class VehicleWithTelematics(Vehicle):
    """Schema for reading vehicle data with full telematics information."""
    telematics_live: Optional[VehicleTelematicsLive] = None
    telematics_history: List[VehicleTelematicsHistory] = Field(
        default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class VehicleList(BaseModel):
    """Schema for paginated vehicle list response."""
    total: int = Field(...,
                       description="Total number of records matching the query")
    vehicles: List[Vehicle] = Field(..., description="List of vehicles")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "total": 1,
                "vehicles": [{
                    "id": 1,
                    "vin": "1HGCM82633A123456",
                    "license_plate": "ABC123",
                    "make": "Tesla",
                    "model": "Model Y",
                    "year": 2024,
                    "battery_capacity_kwh": 75.0,
                    "nominal_range_km": 450.0,
                    "status": "active",
                    "organization_id": 1,
                    "fleet_id": 1
                }]
            }
        }
    )
