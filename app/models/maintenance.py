from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from app.db.session import Base


class MaintenanceType(str, PyEnum):
    """Types of maintenance activities."""
    SCHEDULED = "scheduled"
    UNSCHEDULED = "unscheduled"
    REPAIR = "repair"
    INSPECTION = "inspection"
    BATTERY = "battery"
    SOFTWARE = "software"


class MaintenanceStatus(str, PyEnum):
    """Status of maintenance records."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DEFERRED = "deferred"


class MaintenanceRecord(Base):
    """SQLAlchemy model for vehicle maintenance records."""
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False,
        index=True)

    # Maintenance details
    type = Column(String, nullable=False)
    status = Column(
        String,
        nullable=False,
        default=MaintenanceStatus.SCHEDULED)
    description = Column(Text, nullable=False)
    mileage_at_service = Column(Float)  # Odometer reading at service
    cost = Column(Float)
    parts_replaced = Column(Text)  # JSON list of parts

    # Service provider details
    service_provider = Column(String(100))
    technician = Column(String(100))
    location = Column(String(200))

    # Dates
    scheduled_date = Column(DateTime(timezone=True))
    start_date = Column(DateTime(timezone=True))
    completion_date = Column(DateTime(timezone=True))
    next_service_date = Column(DateTime(timezone=True))
    next_service_mileage = Column(Float)

    # Metadata
    created_at = Column(
        DateTime(
            timezone=True),
        server_default=func.now(),
        nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))

    # Flags
    is_warranty_service = Column(Boolean, default=False)
    requires_vehicle_offline = Column(Boolean, default=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_records")
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])

    def __repr__(self):
        return f"<MaintenanceRecord(id={self.id}, vehicle_id={self.vehicle_id}, type={self.type}, status={self.status})>"
