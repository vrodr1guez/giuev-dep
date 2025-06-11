from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base


class ChargingConnectorType(str, enum.Enum):
    """Enumeration of charging connector types."""
    TYPE_1 = "Type 1 (J1772)"
    TYPE_2 = "Type 2 (Mennekes)"
    CCS1 = "CCS Combo 1"
    CCS2 = "CCS Combo 2"
    CHADEMO = "CHAdeMO"
    TESLA = "Tesla"
    GBDC = "GB/T DC"
    GBAC = "GB/T AC"


class ChargingStationStatus(str, enum.Enum):
    """Enumeration of charging station statuses."""
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    RESERVED = "reserved"


class ChargingStation(Base):
    """Charging station database model."""
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=False)
    status = Column(Enum(ChargingStationStatus), default=ChargingStationStatus.AVAILABLE)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    network_id = Column(Integer, ForeignKey("charging_networks.id"), nullable=True)
    
    # Charging station features
    is_public = Column(Boolean, default=True)
    hourly_rate = Column(Float, nullable=True)  # Hourly charging rate (if applicable)
    has_restroom = Column(Boolean, default=False)
    has_convenience_store = Column(Boolean, default=False)
    has_restaurant = Column(Boolean, default=False)
    open_24_hours = Column(Boolean, default=False)
    
    # Metadata for imported stations
    external_id = Column(String(100), nullable=True, index=True)  # External ID from data source
    is_hpc = Column(Boolean, default=False)  # Whether this is a high-power charger
    last_confirmed_date = Column(DateTime(timezone=True), nullable=True)  # When data was last confirmed
    
    # Relationships
    connectors = relationship("ChargingConnector", back_populates="charging_station", cascade="all, delete-orphan")
    sessions = relationship("ChargingSession", back_populates="charging_station", cascade="all, delete-orphan")
    organization = relationship("Organization", back_populates="charging_stations")
    network = relationship("ChargingNetwork", back_populates="stations")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ChargingStation {self.name} ({self.id})>"


class ChargingConnector(Base):
    """Charging connector database model."""
    __tablename__ = "charging_connectors"
    
    id = Column(Integer, primary_key=True, index=True)
    charging_station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=False)
    connector_type = Column(Enum(ChargingConnectorType), nullable=False)
    power_kw = Column(Float, nullable=False)  # Maximum charging power in kilowatts
    voltage = Column(Float, nullable=False)  # Voltage in volts
    amperage = Column(Float, nullable=False)  # Current in amperes
    connector_number = Column(Integer, nullable=False)  # Physical connector number at the station
    status = Column(Enum(ChargingStationStatus), default=ChargingStationStatus.AVAILABLE)
    
    # Relationships
    charging_station = relationship("ChargingStation", back_populates="connectors")
    sessions = relationship("ChargingSession", back_populates="connector", cascade="all, delete-orphan")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ChargingConnector {self.connector_type} ({self.id})>"


class ChargingSession(Base):
    """Charging session database model."""
    __tablename__ = "charging_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    charging_station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=False)
    connector_id = Column(Integer, ForeignKey("charging_connectors.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be null for anonymous sessions
    
    start_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    start_soc_percent = Column(Float, nullable=True)  # State of charge at start
    end_soc_percent = Column(Float, nullable=True)  # State of charge at end
    
    energy_delivered_kwh = Column(Float, nullable=True)  # Total energy delivered in kilowatt-hours
    total_cost = Column(Float, nullable=True)  # Total cost of the charging session
    
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="charging_sessions")
    charging_station = relationship("ChargingStation", back_populates="sessions")
    connector = relationship("ChargingConnector", back_populates="sessions")
    user = relationship("User", back_populates="charging_sessions")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ChargingSession {self.id}>" 