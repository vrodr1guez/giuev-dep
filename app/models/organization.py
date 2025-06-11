from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Organization(Base):
    """SQLAlchemy model for organizations."""
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=True)
    address = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization")
    vehicles = relationship("Vehicle", back_populates="organization")
    fleets = relationship("Fleet", back_populates="organization")
    charging_stations = relationship("ChargingStation", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization {self.name} ({self.id})>"


class Fleet(Base):
    """SQLAlchemy model for vehicle fleets."""
    __tablename__ = "fleets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    description = Column(String)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="fleets")
    vehicles = relationship("Vehicle", back_populates="fleet")
    
    def __repr__(self):
        return f"<Fleet(id={self.id}, name={self.name})>"