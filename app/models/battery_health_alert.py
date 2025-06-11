from sqlalchemy import Column, Integer, Float, String, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class BatteryHealthReport(Base):
    __tablename__ = "battery_health_reports"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    report_date = Column(Date, nullable=False)
    state_of_health_percent = Column(Float)
    estimated_remaining_capacity_kwh = Column(Float)
    cycle_count_estimate = Column(Integer)
    average_cell_temperature_celsius = Column(Float)
    notes = Column(Text)
    raw_diagnostic_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="battery_health_reports")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    # User who triggered or is target
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    alert_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="active")
    acknowledged_by_user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="alerts")
    vehicle = relationship("Vehicle", back_populates="alerts")
    alerted_user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="received_alerts")
    acknowledged_by = relationship("User",
                                   foreign_keys=[acknowledged_by_user_id],
                                   back_populates="acknowledged_alerts")
