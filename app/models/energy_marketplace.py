from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from typing import Dict, Any, Optional, List

from app.db.base_class import Base
from app.schemas.energy_marketplace import EnergySourceType, EnergyOfferStatus, CarbonCreditStatus

class EnergyOffer(Base):
    """Model for storing energy marketplace offers."""
    __tablename__ = "energy_offers"
    
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_type = Column(String(20), nullable=False)
    energy_amount_kwh = Column(Float, nullable=False)
    price_per_kwh = Column(Float, nullable=False)
    availability_start = Column(DateTime, nullable=False)
    availability_end = Column(DateTime, nullable=False)
    location_latitude = Column(Float, nullable=False)
    location_longitude = Column(Float, nullable=False)
    min_purchase_kwh = Column(Float, default=0.1)
    max_distance_km = Column(Float, default=10.0)
    carbon_intensity = Column(Float, nullable=True)
    is_renewable = Column(Boolean, default=True)
    status = Column(String(20), default=EnergyOfferStatus.PENDING.value)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    total_sold_kwh = Column(Float, default=0)
    remaining_kwh = Column(Float, nullable=False)
    
    # Relationships
    seller = relationship("User", back_populates="energy_offers")
    purchases = relationship("EnergyPurchase", back_populates="offer")
    
    # Indexes for spatial queries and time-based filtering
    __table_args__ = (
        Index('idx_energy_offers_location', 'location_latitude', 'location_longitude'),
        Index('idx_energy_offers_availability', 'availability_start', 'availability_end'),
        Index('idx_energy_offers_status', 'status'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "seller_id": self.seller_id,
            "seller_name": self.seller.name if hasattr(self, "seller") else None,
            "source_type": self.source_type,
            "energy_amount_kwh": self.energy_amount_kwh,
            "price_per_kwh": self.price_per_kwh,
            "availability_start": self.availability_start.isoformat() if self.availability_start else None,
            "availability_end": self.availability_end.isoformat() if self.availability_end else None,
            "location_latitude": self.location_latitude,
            "location_longitude": self.location_longitude,
            "min_purchase_kwh": self.min_purchase_kwh,
            "max_distance_km": self.max_distance_km,
            "carbon_intensity": self.carbon_intensity,
            "is_renewable": self.is_renewable,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "total_sold_kwh": self.total_sold_kwh,
            "remaining_kwh": self.remaining_kwh
        }


class EnergyPurchase(Base):
    """Model for storing energy marketplace purchases."""
    __tablename__ = "energy_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("energy_offers.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    energy_amount_kwh = Column(Float, nullable=False)
    purchase_price_per_kwh = Column(Float, nullable=False)
    delivery_time = Column(DateTime, nullable=False)
    delivery_location_latitude = Column(Float, nullable=False)
    delivery_location_longitude = Column(Float, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    
    offer_source_type = Column(String(20), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    carbon_credits_earned = Column(Float, default=0)
    transaction_hash = Column(String(100), nullable=True, index=True)
    is_delivered = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    delivered_at = Column(DateTime, nullable=True)
    
    # Relationships
    offer = relationship("EnergyOffer", back_populates="purchases")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="energy_purchases")
    seller = relationship("User", foreign_keys=[seller_id])
    vehicle = relationship("Vehicle", backref="energy_purchases")
    carbon_credits = relationship("CarbonCredit", back_populates="source_transaction")
    
    # Indexes
    __table_args__ = (
        Index('idx_energy_purchases_delivery', 'delivery_time'),
        Index('idx_energy_purchases_buyer', 'buyer_id'),
        Index('idx_energy_purchases_seller', 'seller_id'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "offer_id": self.offer_id,
            "offer_source_type": self.offer_source_type,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "energy_amount_kwh": self.energy_amount_kwh,
            "purchase_price_per_kwh": self.purchase_price_per_kwh,
            "delivery_time": self.delivery_time.isoformat() if self.delivery_time else None,
            "delivery_location_latitude": self.delivery_location_latitude,
            "delivery_location_longitude": self.delivery_location_longitude,
            "vehicle_id": self.vehicle_id,
            "carbon_credits_earned": self.carbon_credits_earned,
            "transaction_hash": self.transaction_hash,
            "is_delivered": self.is_delivered,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None
        }


class CarbonCredit(Base):
    """Model for storing carbon credits from renewable energy use."""
    __tablename__ = "carbon_credits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_transaction_id = Column(Integer, ForeignKey("energy_purchases.id"), nullable=True)
    source_type = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default=CarbonCreditStatus.PENDING.value)
    certificate_id = Column(String(100), nullable=True, unique=True)
    
    created_at = Column(DateTime, server_default=func.now())
    verified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", backref="carbon_credits")
    source_transaction = relationship("EnergyPurchase", back_populates="carbon_credits")
    
    # Indexes
    __table_args__ = (
        Index('idx_carbon_credits_user', 'user_id'),
        Index('idx_carbon_credits_status', 'status'),
        Index('idx_carbon_credits_expires', 'expires_at'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "source_transaction_id": self.source_transaction_id,
            "source_type": self.source_type,
            "amount": self.amount,
            "status": self.status,
            "certificate_id": self.certificate_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }


class MarketplaceActivity(Base):
    """Model for tracking marketplace activity and analytics."""
    __tablename__ = "marketplace_activity"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, index=True)
    total_offers = Column(Integer, default=0)
    total_energy_kwh = Column(Float, default=0)
    total_transactions = Column(Integer, default=0)
    total_volume_kwh = Column(Float, default=0)
    total_value = Column(Float, default=0)
    renewable_percentage = Column(Float, default=0)
    carbon_credits_generated = Column(Float, default=0)
    average_price = Column(Float, default=0)
    peak_hour = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "date": self.date.isoformat() if self.date else None,
            "total_offers": self.total_offers,
            "total_energy_kwh": self.total_energy_kwh,
            "total_transactions": self.total_transactions,
            "total_volume_kwh": self.total_volume_kwh,
            "total_value": self.total_value,
            "renewable_percentage": self.renewable_percentage,
            "carbon_credits_generated": self.carbon_credits_generated,
            "average_price": self.average_price,
            "peak_hour": self.peak_hour
        } 