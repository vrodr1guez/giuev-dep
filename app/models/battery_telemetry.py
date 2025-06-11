from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class BatteryTelemetry(Base):
    """Model for storing battery telemetry data"""
    __tablename__ = "battery_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), index=True)
    timestamp = Column(DateTime, index=True, default=func.now())
    
    # Raw telemetry data stored as JSON
    data = Column(JSON)
    
    # Extracted and validated key metrics
    voltage = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    power = Column(Float, nullable=True)
    state_of_charge = Column(Float, nullable=True)
    state_of_health = Column(Float, nullable=True)
    temperature_min = Column(Float, nullable=True)
    temperature_max = Column(Float, nullable=True)
    temperature_avg = Column(Float, nullable=True)
    
    # Data validation and processing status
    validation_status = Column(String, nullable=False, default="unknown")
    validation_messages = Column(JSON, nullable=True)
    processing_status = Column(String, nullable=False, default="raw")
    
    # Relations
    vehicle = relationship("Vehicle", back_populates="telemetry_data")
    
    def __repr__(self):
        return f"<BatteryTelemetry(id={self.id}, vehicle_id={self.vehicle_id}, timestamp={self.timestamp})>"


class AnomalyDetection(Base):
    """Model for storing detected battery anomalies"""
    __tablename__ = "battery_anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), index=True)
    detection_timestamp = Column(DateTime, index=True, default=func.now())
    
    # Anomaly details
    anomaly_type = Column(String, nullable=False, index=True)
    severity = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False, default=0.0)
    
    # Related telemetry data IDs that contributed to detection
    related_telemetry_ids = Column(JSON, nullable=True) 
    
    # Status tracking
    is_acknowledged = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    
    # Recommended action
    recommended_action = Column(Text, nullable=True)
    
    # Relations
    vehicle = relationship("Vehicle", back_populates="battery_anomalies")
    
    def __repr__(self):
        return f"<AnomalyDetection(id={self.id}, vehicle_id={self.vehicle_id}, type={self.anomaly_type})>"


class BatteryMaintenanceRecord(Base):
    """Model for storing battery maintenance records"""
    __tablename__ = "battery_maintenance"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), index=True)
    
    # Maintenance details
    maintenance_date = Column(DateTime, nullable=False, index=True)
    maintenance_type = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    performed_by = Column(String, nullable=True)
    
    # Related anomalies that were addressed
    related_anomaly_ids = Column(JSON, nullable=True)
    
    # Measurements before and after
    pre_maintenance_soh = Column(Float, nullable=True)
    post_maintenance_soh = Column(Float, nullable=True)
    
    # Notes and outcomes
    notes = Column(Text, nullable=True)
    outcome = Column(String, nullable=True)
    
    # Relations
    vehicle = relationship("Vehicle", back_populates="battery_maintenance")
    
    def __repr__(self):
        return f"<BatteryMaintenanceRecord(id={self.id}, vehicle_id={self.vehicle_id}, date={self.maintenance_date})>" 