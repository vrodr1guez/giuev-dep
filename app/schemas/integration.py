from pydantic import BaseModel, Field, HttpUrl, validator, root_validator
from typing import Optional, List, Dict, Any, Union, Literal
from datetime import datetime
from enum import Enum

# Enum Types
class IntegrationType(str, Enum):
    CHARGING_NETWORK = "charging_network"
    FLEET_MANAGEMENT = "fleet_management" 
    WEATHER_SERVICE = "weather_service"
    ENERGY_DATA = "energy_data"
    GRID_OPERATOR = "grid_operator"
    VEHICLE_TELEMATICS = "vehicle_telematics"
    OTHER = "other"

class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    TESTING = "testing"

class AuthType(str, Enum):
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    BASIC = "basic"
    TOKEN = "token"
    NONE = "none"

# API Key Schemas
class ApiKeyBase(BaseModel):
    key_name: str
    key_value: str
    is_active: bool = True
    expires_at: Optional[datetime] = None

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyUpdate(BaseModel):
    key_name: Optional[str] = None
    key_value: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None

class ApiKeyInDB(ApiKeyBase):
    id: int
    integration_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApiKey(ApiKeyInDB):
    pass

# Integration Schemas
class ExternalIntegrationBase(BaseModel):
    name: str
    description: Optional[str] = None
    integration_type: IntegrationType
    provider: str
    api_base_url: Optional[str] = None
    auth_type: Optional[str] = None
    status: IntegrationStatus = IntegrationStatus.INACTIVE
    configuration: Optional[Dict[str, Any]] = None

class ExternalIntegrationCreate(ExternalIntegrationBase):
    credentials: Optional[Dict[str, Any]] = None

class ExternalIntegrationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    integration_type: Optional[IntegrationType] = None
    provider: Optional[str] = None
    api_base_url: Optional[str] = None
    auth_type: Optional[str] = None
    status: Optional[IntegrationStatus] = None
    credentials: Optional[Dict[str, Any]] = None
    configuration: Optional[Dict[str, Any]] = None

class ExternalIntegrationInDB(ExternalIntegrationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_sync_at: Optional[datetime] = None
    last_error: Optional[str] = None
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

class ExternalIntegration(ExternalIntegrationInDB):
    api_keys: List[ApiKey] = []

# Weather Service Schemas
class WeatherForecastBase(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: Optional[str] = None
    forecast_time: datetime

class WeatherDataCreate(WeatherForecastBase):
    integration_id: int
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    cloud_cover: Optional[float] = None
    precipitation: Optional[float] = None
    solar_radiation: Optional[float] = None
    weather_condition: Optional[str] = None
    solar_generation_forecast: Optional[float] = None
    wind_generation_forecast: Optional[float] = None
    renewable_percentage_forecast: Optional[float] = None
    raw_data: Optional[Dict[str, Any]] = None

class WeatherDataUpdate(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    cloud_cover: Optional[float] = None
    precipitation: Optional[float] = None
    solar_radiation: Optional[float] = None
    weather_condition: Optional[str] = None
    solar_generation_forecast: Optional[float] = None
    wind_generation_forecast: Optional[float] = None
    renewable_percentage_forecast: Optional[float] = None
    raw_data: Optional[Dict[str, Any]] = None

class WeatherForecastInDB(WeatherForecastBase):
    id: int
    integration_id: int
    prediction_timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    cloud_cover: Optional[float] = None
    precipitation: Optional[float] = None
    solar_radiation: Optional[float] = None
    weather_condition: Optional[str] = None
    solar_generation_forecast: Optional[float] = None
    wind_generation_forecast: Optional[float] = None
    renewable_percentage_forecast: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class WeatherForecast(WeatherForecastInDB):
    pass

# Fleet Management Schemas
class FleetVehicleSyncBase(BaseModel):
    integration_id: int
    external_vehicle_id: str
    vehicle_id: Optional[int] = None

class FleetVehicleCreate(FleetVehicleSyncBase):
    last_location_lat: Optional[float] = None
    last_location_lon: Optional[float] = None
    last_battery_level: Optional[float] = None
    odometer: Optional[float] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None
    scheduled_destination: Optional[str] = None
    estimated_arrival: Optional[datetime] = None
    sync_data: Optional[Dict[str, Any]] = None

class FleetVehicleUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    last_location_lat: Optional[float] = None
    last_location_lon: Optional[float] = None
    last_battery_level: Optional[float] = None
    odometer: Optional[float] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None
    scheduled_destination: Optional[str] = None
    estimated_arrival: Optional[datetime] = None
    sync_data: Optional[Dict[str, Any]] = None

class FleetVehicleSyncInDB(FleetVehicleSyncBase):
    id: int
    last_sync_at: Optional[datetime] = None
    last_location_lat: Optional[float] = None
    last_location_lon: Optional[float] = None
    last_battery_level: Optional[float] = None
    odometer: Optional[float] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None
    scheduled_destination: Optional[str] = None
    estimated_arrival: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FleetVehicleSync(FleetVehicleSyncInDB):
    sync_data: Optional[Dict[str, Any]] = None

# Data Sync Schemas
class IntegrationDataSyncBase(BaseModel):
    integration_id: int
    sync_type: str

class IntegrationDataSyncCreate(IntegrationDataSyncBase):
    status: str = "in_progress"
    records_processed: int = 0
    records_succeeded: int = 0
    records_failed: int = 0
    error_message: Optional[str] = None
    sync_details: Optional[Dict[str, Any]] = None

class IntegrationDataSyncUpdate(BaseModel):
    completed_at: Optional[datetime] = None
    status: Optional[str] = None
    records_processed: Optional[int] = None
    records_succeeded: Optional[int] = None
    records_failed: Optional[int] = None
    error_message: Optional[str] = None
    sync_details: Optional[Dict[str, Any]] = None

class IntegrationDataSyncInDB(IntegrationDataSyncBase):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    records_processed: int
    records_succeeded: int
    records_failed: int
    error_message: Optional[str] = None
    sync_details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class IntegrationDataSync(IntegrationDataSyncInDB):
    pass

# API Request/Response Schemas for Integration Endpoints
class IntegrationTestRequest(BaseModel):
    integration_id: int

class IntegrationTestResponse(BaseModel):
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None
    latency_ms: Optional[int] = None

class ChargingNetworkStationSyncRequest(BaseModel):
    integration_id: int
    sync_all: bool = False
    specific_stations: Optional[List[str]] = None  # External station IDs to sync

class FleetVehicleSyncRequest(BaseModel):
    integration_id: int
    sync_all: bool = False
    specific_vehicles: Optional[List[Union[int, str]]] = None  # Vehicle IDs or external IDs

class WeatherDataRequest(BaseModel):
    integration_id: int
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    forecast_days: int = Field(1, ge=1, le=10)
    include_renewables_forecast: bool = True

class ChargingNetworkAuthRequest(BaseModel):
    integration_id: int
    user_id: int
    authorization_code: Optional[str] = None
    redirect_uri: Optional[str] = None 