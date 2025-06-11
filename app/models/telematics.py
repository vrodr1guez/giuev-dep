from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, DateTime, String, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class VehicleTelematicsLive(Base):
    """SQLAlchemy model for live vehicle telematics data."""
    __tablename__ = "vehicle_telematics_live"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"), unique=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    
    # Location data
    latitude = Column(Float)
    longitude = Column(Float)
    speed_kmh = Column(Float)
    
    # Battery and charging data
    state_of_charge_percent = Column(Float)
    state_of_health_percent = Column(Float)
    odometer_km = Column(Float)
    is_charging = Column(Boolean, default=False)
    charging_power_kw = Column(Float)
    estimated_range_km = Column(Float)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="telematics_live")
    
    def __repr__(self):
        return f"<VehicleTelematicsLive(id={self.id}, vehicle_id={self.vehicle_id})>"


class VehicleTelematicsHistory(Base):
    """SQLAlchemy model for historical vehicle telematics data."""
    __tablename__ = "vehicle_telematics_history"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), index=True, nullable=False)
    
    # Location data
    latitude = Column(Float)
    longitude = Column(Float)
    speed_kmh = Column(Float)
    
    # Battery and charging data
    state_of_charge_percent = Column(Float)
    state_of_health_percent = Column(Float)
    odometer_km = Column(Float)
    is_charging = Column(Boolean, default=False)
    charging_power_kw = Column(Float)
    estimated_range_km = Column(Float)
    
    # Energy consumption since last entry
    energy_consumed_kwh_since_last = Column(Float)
    
    # Diagnostic codes
    diagnostic_trouble_codes = Column(JSON)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="telematics_history")
    
    def __repr__(self):
        return f"<VehicleTelematicsHistory(id={self.id}, vehicle_id={self.vehicle_id})>" 