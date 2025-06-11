from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, JSON, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from typing import Dict, Any, Optional

from app.db.base_class import Base


class IntegrationType(enum.Enum):
    """Type of external integration."""
    CHARGING_NETWORK = "charging_network"
    FLEET_MANAGEMENT = "fleet_management"
    WEATHER_SERVICE = "weather_service"
    ENERGY_DATA = "energy_data"
    GRID_OPERATOR = "grid_operator"
    VEHICLE_TELEMATICS = "vehicle_telematics"
    OTHER = "other"


class IntegrationStatus(enum.Enum):
    """Status of the integration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    TESTING = "testing"


class ExternalIntegration(Base):
    """Model for external service integrations."""
    __tablename__ = "external_integrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    integration_type = Column(Enum(IntegrationType), nullable=False)
    provider = Column(String(100), nullable=False)
    api_base_url = Column(String(255), nullable=True)
    auth_type = Column(String(50), nullable=True)  # e.g., API_KEY, OAUTH2, BASIC
    status = Column(Enum(IntegrationStatus), default=IntegrationStatus.INACTIVE)
    
    # Credentials and configuration (encrypted in production)
    credentials = Column(JSON, nullable=True)
    configuration = Column(JSON, nullable=True)
    
    # Relations
    api_keys = relationship("ApiKey", back_populates="integration", cascade="all, delete-orphan")
    data_syncs = relationship("IntegrationDataSync", back_populates="integration", cascade="all, delete-orphan")
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    last_sync_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "integration_type": self.integration_type.value,
            "provider": self.provider,
            "api_base_url": self.api_base_url,
            "auth_type": self.auth_type,
            "status": self.status.value,
            "configuration": self.configuration,  # Exclude credentials for security
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_sync_at": self.last_sync_at.isoformat() if self.last_sync_at else None,
        }


class ApiKey(Base):
    """API keys for external integrations."""
    __tablename__ = "integration_api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("external_integrations.id"))
    key_name = Column(String(100), nullable=False)
    key_value = Column(String(255), nullable=False)  # Should be encrypted in production
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Relations
    integration = relationship("ExternalIntegration", back_populates="api_keys")
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class IntegrationDataSync(Base):
    """Track data synchronization with external services."""
    __tablename__ = "integration_data_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("external_integrations.id"))
    sync_type = Column(String(50), nullable=False)  # e.g., FULL, INCREMENTAL, STATION_DATA
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="in_progress")  # success, failed, in_progress
    records_processed = Column(Integer, default=0)
    records_succeeded = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    sync_details = Column(JSON, nullable=True)
    
    # Relations
    integration = relationship("ExternalIntegration", back_populates="data_syncs")


class WeatherForecast(Base):
    """Weather forecast data from weather service integrations."""
    __tablename__ = "weather_forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("external_integrations.id"))
    location_name = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    forecast_time = Column(DateTime, nullable=False)
    prediction_timestamp = Column(DateTime, server_default=func.now())
    
    # Weather data
    temperature = Column(Float, nullable=True)  # in Celsius
    humidity = Column(Float, nullable=True)  # percentage
    wind_speed = Column(Float, nullable=True)  # m/s
    wind_direction = Column(Float, nullable=True)  # degrees
    cloud_cover = Column(Float, nullable=True)  # percentage
    precipitation = Column(Float, nullable=True)  # mm
    solar_radiation = Column(Float, nullable=True)  # W/m²
    weather_condition = Column(String(50), nullable=True)  # e.g., clear, cloudy, rain
    
    # Forecasting for renewables
    solar_generation_forecast = Column(Float, nullable=True)  # kWh
    wind_generation_forecast = Column(Float, nullable=True)  # kWh
    renewable_percentage_forecast = Column(Float, nullable=True)  # percentage
    
    # Raw data
    raw_data = Column(JSON, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())


class FleetVehicleSync(Base):
    """Synchronization data for fleet vehicles."""
    __tablename__ = "fleet_vehicle_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("external_integrations.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    external_vehicle_id = Column(String(100), nullable=False)  # ID in external system
    
    # Last known status
    last_sync_at = Column(DateTime, nullable=True)
    last_location_lat = Column(Float, nullable=True)
    last_location_lon = Column(Float, nullable=True)
    last_battery_level = Column(Float, nullable=True)  # percentage
    odometer = Column(Float, nullable=True)  # km or miles
    
    # Operational data
    status = Column(String(50), nullable=True)  # in_use, charging, available, maintenance
    driver_id = Column(String(100), nullable=True)
    scheduled_destination = Column(String(255), nullable=True)
    estimated_arrival = Column(DateTime, nullable=True)
    
    # Raw data from fleet management system
    sync_data = Column(JSON, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now()) 