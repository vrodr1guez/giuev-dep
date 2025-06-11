from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base


class VehicleStatus(str, enum.Enum):
    """Enum for vehicle status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    CHARGING = "charging"
    V2G_ACTIVE = "v2g_active"


class Vehicle(Base):
    """SQLAlchemy model for vehicles."""
    __tablename__ = "vehicles"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), index=True)
    
    # Vehicle details
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    vin = Column(String, nullable=True, unique=True)
    license_plate = Column(String, nullable=True)
    
    # Battery information
    battery_type = Column(String, nullable=True)
    battery_chemistry = Column(String, nullable=True)
    nominal_battery_capacity = Column(Float, nullable=True)  # in kWh
    battery_thermal_management = Column(String, nullable=True)
    battery_manufacture_date = Column(DateTime, nullable=True)
    
    # V2G capabilities and grid integration
    v2g_capable = Column(Boolean, default=False)
    max_discharge_rate_kw = Column(Float, nullable=True)  # Max power output for V2G
    v2g_enabled = Column(Boolean, default=False)  # User preference for V2G participation
    min_soc_limit = Column(Integer, default=30)  # Minimum SoC to maintain during V2G
    smart_charging_enabled = Column(Boolean, default=True)  # Allow charging based on grid conditions
    
    # Status tracking
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # API configuration
    telematics_provider = Column(String, nullable=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=True)
    
    # Relations
    organization = relationship("Organization", back_populates="vehicles")
    api_key = relationship("ApiKey", back_populates="vehicles")
    
    # New relations for battery health monitoring
    telemetry_data = relationship("BatteryTelemetry", back_populates="vehicle", cascade="all, delete-orphan")
    battery_anomalies = relationship("AnomalyDetection", back_populates="vehicle", cascade="all, delete-orphan")
    battery_maintenance = relationship("BatteryMaintenanceRecord", back_populates="vehicle", cascade="all, delete-orphan")
    
    # V2G and grid integration relationships
    v2g_transactions = relationship("V2GTransaction", back_populates="vehicle", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Vehicle(id={self.id}, name={self.name}, make={self.make}, model={self.model})>"
        
    @property
    def v2g_status(self):
        """Return the vehicle's current V2G status based on activity and settings"""
        if not self.v2g_capable:
            return "not_capable"
        if not self.v2g_enabled:
            return "disabled"
        if not self.is_active:
            return "unavailable"
            
        # Check if there's an active V2G transaction
        active_v2g = False
        for transaction in self.v2g_transactions:
            if transaction.completed is False and transaction.timestamp_end is None:
                active_v2g = True
                break
                
        if active_v2g:
            return "active"
        else:
            return "ready"
            
    @property
    def v2g_eligibility_issues(self):
        """Return any issues preventing V2G participation"""
        issues = []
        
        if not self.v2g_capable:
            issues.append("Vehicle not V2G capable")
        if not self.v2g_enabled:
            issues.append("V2G disabled by user preferences")
        if not self.is_active:
            issues.append("Vehicle inactive")
            
        # In a real implementation, would also check:
        # - Current battery state of charge
        # - Connection status
        # - Scheduled use requirements
        
        return issues
