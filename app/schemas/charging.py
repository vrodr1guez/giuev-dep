from pydantic import BaseModel, Field, field_validator, ValidationInfo, ConfigDict, constr, model_validator
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from datetime import datetime, timezone

from app.models.charging_station import ChargingConnectorType, ChargingStationStatus

# Import for forward reference resolution
if TYPE_CHECKING:
    from app.schemas.charging_network import ChargingNetwork


class ChargingOptimizationRequest(BaseModel):
    """Schema for charging optimization request."""
    vehicle_id: int = Field(..., description="ID of the vehicle")
    station_id: int = Field(..., description="ID of the charging station")
    target_soc_percent: Optional[float] = Field(100.0, description="Target state of charge")
    departure_time: datetime = Field(..., description="Departure time")
    max_charging_power_kw: Optional[float] = None

    @field_validator('departure_time')
    @classmethod
    def validate_departure_time(cls, v: datetime, info: ValidationInfo):
        """Validate that departure time is in the future."""
        if v.tzinfo is None:
            # If incoming datetime is naive, assume UTC
            v = v.replace(tzinfo=timezone.utc)
        
        now_utc = datetime.now(timezone.utc)

        if v <= now_utc:
            raise ValueError("Departure time must be in the future and timezone-aware")
        return v


class ChargingScheduleSlot(BaseModel):
    """Schema for a charging schedule time slot."""
    start_time: datetime
    end_time: datetime
    charging_power_kw: float
    estimated_soc_achieved_percent: float

    @field_validator('end_time')
    @classmethod
    def validate_time_range(cls, v: datetime, info: ValidationInfo):
        """Validate that end time is after start time."""
        start_time = info.data.get('start_time')
        if start_time:
            # Ensure both are timezone-aware for comparison
            if v.tzinfo is None:
                v = v.replace(tzinfo=timezone.utc) # Assume UTC if naive
            if start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=timezone.utc) # Assume UTC if naive
            
            if v <= start_time:
                raise ValueError("End time must be after start time")
        return v


# Enhanced charging optimization schemas for the ML-based charging optimizer
class ChargingSchedulePoint(BaseModel):
    """Schema for a point in the charging schedule."""
    timestamp: str = Field(..., description="ISO format timestamp")
    charging_power: float = Field(..., description="Charging power in kW")
    price: float = Field(..., description="Energy price per kWh")
    renewable_percentage: float = Field(..., description="Percentage of renewable energy")
    expected_soc: float = Field(..., description="Expected state of charge")
    energy_kwh: float = Field(..., description="Energy to be delivered in kWh")


class ChargingOptimizationResponse(BaseModel):
    """Schema for charging optimization response."""
    vehicle_id: int
    schedule: List[ChargingSchedulePoint] = []
    total_cost: float
    total_energy_kwh: float
    cost_savings_percent: float
    total_duration_minutes: int
    optimal_plugin_time: str
    optimal_start_time: str
    warnings: Optional[List[str]] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "vehicle_id": 1,
                "schedule": [
                    {
                        "timestamp": "2024-03-20T22:00:00Z",
                        "charging_power": 7.4,
                        "price": 0.12,
                        "renewable_percentage": 65.0,
                        "expected_soc": 80.0,
                        "energy_kwh": 4.8
                    },
                    {
                        "timestamp": "2024-03-21T02:00:00Z",
                        "charging_power": 11.0,
                        "price": 0.08,
                        "renewable_percentage": 35.0,
                        "expected_soc": 100.0,
                        "energy_kwh": 6.4
                    }
                ],
                "total_cost": 15.75,
                "total_energy_kwh": 11.2,
                "cost_savings_percent": 12.5,
                "total_duration_minutes": 240,
                "optimal_plugin_time": "2024-03-20T22:00:00Z",
                "optimal_start_time": "2024-03-20T22:00:00Z",
                "warnings": [
                    "Charging at reduced power due to station limitations"
                ]
            }
        }
    }


# Base schemas for charging connectors
class ChargingConnectorBase(BaseModel):
    """Base schema for charging connector data."""
    connector_type: ChargingConnectorType
    power_kw: float = Field(..., gt=0, description="Maximum charging power in kilowatts")
    voltage: float = Field(..., gt=0, description="Voltage in volts")
    amperage: float = Field(..., gt=0, description="Current in amperes")
    connector_number: int = Field(..., gt=0, description="Physical connector number at the station")
    status: ChargingStationStatus = Field(default=ChargingStationStatus.AVAILABLE)


class ChargingConnectorCreate(ChargingConnectorBase):
    """Schema for creating a charging connector."""
    model_config = ConfigDict(extra="forbid")


class ChargingConnectorUpdate(BaseModel):
    """Schema for updating a charging connector."""
    connector_type: Optional[ChargingConnectorType] = None
    power_kw: Optional[float] = Field(default=None, gt=0)
    voltage: Optional[float] = Field(default=None, gt=0)
    amperage: Optional[float] = Field(default=None, gt=0)
    connector_number: Optional[int] = Field(default=None, gt=0)
    status: Optional[ChargingStationStatus] = None
    
    model_config = ConfigDict(extra="forbid")


class ChargingConnector(ChargingConnectorBase):
    """Schema for reading charging connector data."""
    id: int
    charging_station_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "charging_station_id": 1,
                "connector_type": "CCS2",
                "power_kw": 150.0,
                "voltage": 400.0,
                "amperage": 375.0,
                "connector_number": 1,
                "status": "available",
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T10:00:00Z",
            }
        }
    )


# Base schemas for charging stations
class ChargingStationBase(BaseModel):
    """Base schema for charging station data."""
    name: constr(min_length=1, max_length=100)
    description: Optional[constr(max_length=500)] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: constr(min_length=1, max_length=200)
    city: constr(min_length=1, max_length=100)
    state: constr(min_length=1, max_length=100)
    country: constr(min_length=1, max_length=100)
    zip_code: constr(min_length=1, max_length=20)
    status: ChargingStationStatus = Field(default=ChargingStationStatus.AVAILABLE)
    organization_id: int
    network_id: Optional[int] = None
    is_public: bool = True
    hourly_rate: Optional[float] = Field(default=None, ge=0)
    has_restroom: bool = False
    has_convenience_store: bool = False
    has_restaurant: bool = False
    open_24_hours: bool = False
    external_id: Optional[str] = None
    is_hpc: bool = False
    last_confirmed_date: Optional[datetime] = None


class ChargingStationCreate(ChargingStationBase):
    """Schema for creating a charging station."""
    connectors: List[ChargingConnectorCreate] = Field(..., min_items=1)
    
    model_config = ConfigDict(extra="forbid")


class ChargingStationUpdate(BaseModel):
    """Schema for updating a charging station."""
    name: Optional[constr(min_length=1, max_length=100)] = None
    description: Optional[constr(max_length=500)] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    address: Optional[constr(min_length=1, max_length=200)] = None
    city: Optional[constr(min_length=1, max_length=100)] = None
    state: Optional[constr(min_length=1, max_length=100)] = None
    country: Optional[constr(min_length=1, max_length=100)] = None
    zip_code: Optional[constr(min_length=1, max_length=20)] = None
    status: Optional[ChargingStationStatus] = None
    network_id: Optional[int] = None
    is_public: Optional[bool] = None
    hourly_rate: Optional[float] = Field(default=None, ge=0)
    has_restroom: Optional[bool] = None
    has_convenience_store: Optional[bool] = None
    has_restaurant: Optional[bool] = None
    open_24_hours: Optional[bool] = None
    external_id: Optional[str] = None
    is_hpc: Optional[bool] = None
    last_confirmed_date: Optional[datetime] = None
    
    model_config = ConfigDict(extra="forbid")


class ChargingStation(ChargingStationBase):
    """Schema for reading charging station data."""
    id: int
    connectors: List[ChargingConnector] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    network: Optional[Dict[str, Any]] = None  # Changed from ChargingNetwork to Dict to avoid forward reference issues
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Downtown Fast Charging Hub",
                "description": "24/7 fast charging station in downtown area",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "address": "123 Main St",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "zip_code": "10001",
                "status": "available",
                "organization_id": 1,
                "network_id": 1,
                "is_public": True,
                "hourly_rate": 0.45,
                "has_restroom": True,
                "has_convenience_store": True,
                "has_restaurant": False,
                "open_24_hours": True,
                "external_id": "NYSTATE-HPC-0001",
                "is_hpc": True,
                "last_confirmed_date": "2024-05-01T10:00:00Z",
                "connectors": [
                    {
                        "id": 1,
                        "charging_station_id": 1,
                        "connector_type": "CCS2",
                        "power_kw": 150.0,
                        "voltage": 400.0,
                        "amperage": 375.0,
                        "connector_number": 1,
                        "status": "available",
                        "created_at": "2024-03-20T10:00:00Z",
                        "updated_at": "2024-03-20T10:00:00Z"
                    },
                    {
                        "id": 2,
                        "charging_station_id": 1,
                        "connector_type": "CHADEMO",
                        "power_kw": 50.0,
                        "voltage": 400.0,
                        "amperage": 125.0,
                        "connector_number": 2,
                        "status": "available",
                        "created_at": "2024-03-20T10:00:00Z",
                        "updated_at": "2024-03-20T10:00:00Z"
                    }
                ],
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T10:00:00Z",
                "network": {
                    "id": 1,
                    "name": "Tesla Supercharger",
                    "description": "Tesla's proprietary fast charging network",
                    "website": "https://www.tesla.com/supercharger",
                    "supports_payment_cards": True,
                    "supports_app_payment": True,
                    "base_charging_rate": 0.28
                }
            }
        }
    )


# Base schemas for charging sessions
class ChargingSessionBase(BaseModel):
    """Base schema for charging session data."""
    vehicle_id: int
    charging_station_id: int
    connector_id: int
    user_id: Optional[int] = None
    
    start_time: datetime = Field(default_factory=datetime.now)
    start_soc_percent: Optional[float] = Field(default=None, ge=0, le=100)


class ChargingSessionCreate(ChargingSessionBase):
    """Schema for creating a charging session."""
    model_config = ConfigDict(extra="forbid")


class ChargingSessionUpdate(BaseModel):
    """Schema for updating a charging session."""
    end_time: Optional[datetime] = None
    end_soc_percent: Optional[float] = Field(default=None, ge=0, le=100)
    energy_delivered_kwh: Optional[float] = Field(default=None, ge=0)
    total_cost: Optional[float] = Field(default=None, ge=0)
    is_completed: Optional[bool] = None
    
    model_config = ConfigDict(extra="forbid")
    
    @model_validator(mode='after')
    @classmethod
    def validate_completion(cls, values):
        """Validate that if is_completed is True, end_time must be set."""
        if values.is_completed and not values.end_time:
            raise ValueError("end_time must be set if is_completed is True")
        return values


class ChargingSession(ChargingSessionBase):
    """Schema for reading charging session data."""
    id: int
    end_time: Optional[datetime] = None
    end_soc_percent: Optional[float] = None
    energy_delivered_kwh: Optional[float] = None
    total_cost: Optional[float] = None
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "vehicle_id": 1,
                "charging_station_id": 1,
                "connector_id": 1,
                "user_id": 1,
                "start_time": "2024-03-20T10:00:00Z",
                "end_time": "2024-03-20T11:30:00Z",
                "start_soc_percent": 20.0,
                "end_soc_percent": 80.0,
                "energy_delivered_kwh": 40.0,
                "total_cost": 15.0,
                "is_completed": True,
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T11:30:00Z"
            }
        }
    )


# List response schemas
class ChargingStationList(BaseModel):
    """Schema for paginated charging station list response."""
    total: int
    stations: List[ChargingStation]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 1,
                "stations": [
                    {
                        "id": 1,
                        "name": "Downtown Fast Charging Hub",
                        "latitude": 45.4215,
                        "longitude": -75.6972,
                        "status": "available",
                    }
                ]
            }
        }
    )


class ChargingSessionList(BaseModel):
    """Schema for paginated charging session list response."""
    total: int
    sessions: List[ChargingSession]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 1,
                "sessions": [
                    {
                        "id": 1,
                        "vehicle_id": 1,
                        "charging_station_id": 1,
                        "start_time": "2024-03-20T10:00:00Z",
                        "is_completed": False
                    }
                ]
            }
        }
    )


class BatteryParameters(BaseModel):
    """Battery parameters for charging optimization."""
    capacity: float = Field(..., description="Battery capacity in kWh")
    current_soc: float = Field(..., description="Current state of charge in %")
    target_soc: float = Field(..., description="Target state of charge in %")
    max_charging_rate: Optional[float] = Field(None, description="Maximum charging rate in kW")
    chemistry: Optional[str] = Field(None, description="Battery chemistry")


class ChargingConstraints(BaseModel):
    """Constraints for charging optimization."""
    plugin_time: datetime = Field(..., description="Time when vehicle is plugged in")
    departure_time: datetime = Field(..., description="Time when vehicle will depart")
    min_soc_needed: Optional[float] = Field(None, description="Minimum SoC needed by departure")
    prefer_renewable: Optional[bool] = Field(False, description="Prefer charging during high renewable periods")
