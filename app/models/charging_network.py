from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class ChargingNetwork(Base):
    """Charging network database model to classify charging stations by network provider."""
    __tablename__ = "charging_networks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    api_endpoint = Column(String(255), nullable=True)
    logo_url = Column(String(255), nullable=True)
    
    # Network features
    supports_payment_cards = Column(Boolean, default=True)
    supports_app_payment = Column(Boolean, default=True)
    supports_rfid = Column(Boolean, default=False)
    supports_plug_and_charge = Column(Boolean, default=False)
    has_subscription_model = Column(Boolean, default=False)
    base_charging_rate = Column(Float, nullable=True)  # Base charging rate in $/kWh
    
    # Relationships
    stations = relationship("ChargingStation", back_populates="network")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<ChargingNetwork {self.name} ({self.id})>" 