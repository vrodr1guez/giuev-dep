"""
Grid integration models for enhanced battery health monitoring system.
These models track grid-related metrics and vehicle-to-grid (V2G) activities.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base

class V2GActionType(enum.Enum):
    """Types of vehicle-to-grid actions"""
    DISCHARGE_FULL = "discharge_full"
    DISCHARGE_PARTIAL = "discharge_partial"
    STANDBY = "standby"
    CHARGE = "charge"
    
class GridStressLevel(enum.Enum):
    """Levels of grid stress"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    
class PriceTier(enum.Enum):
    """Energy price tiers"""
    OFF_PEAK = "off-peak"
    MID = "mid"
    PEAK = "peak"

class GridStatus(Base):
    """Model to store grid status updates"""
    __tablename__ = "grid_status"
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    demand_percentage = Column(Float, nullable=False, default=50.0)
    capacity_available = Column(Float, nullable=False, default=50.0)
    grid_stress_level = Column(Enum(GridStressLevel), nullable=False, default=GridStressLevel.MEDIUM)
    current_price_kwh = Column(Float, nullable=False, default=0.12)
    price_tier = Column(Enum(PriceTier), nullable=False, default=PriceTier.MID)
    
    # Relationships
    v2g_opportunities = relationship("V2GOpportunity", back_populates="grid_status")
    v2g_transactions = relationship("V2GTransaction", back_populates="grid_status")
    
class V2GOpportunity(Base):
    """Model to store V2G opportunity assessments"""
    __tablename__ = "v2g_opportunity"
    
    id = Column(Integer, primary_key=True)
    grid_status_id = Column(Integer, ForeignKey("grid_status.id"))
    timestamp = Column(DateTime, default=func.now(), index=True)
    level = Column(Enum(GridStressLevel), nullable=False, default=GridStressLevel.MEDIUM)
    estimated_return_per_kwh = Column(Float, nullable=False, default=0.10)
    recommended_action = Column(Enum(V2GActionType), nullable=False, default=V2GActionType.STANDBY)
    
    # Relationships
    grid_status = relationship("GridStatus", back_populates="v2g_opportunities")
    
class V2GTransaction(Base):
    """Model to store vehicle-to-grid energy transactions"""
    __tablename__ = "v2g_transaction"
    
    id = Column(Integer, primary_key=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.id"))
    grid_status_id = Column(Integer, ForeignKey("grid_status.id"))
    
    timestamp_start = Column(DateTime, default=func.now(), index=True)
    timestamp_end = Column(DateTime, nullable=True)
    energy_kwh = Column(Float, nullable=False, default=0.0)
    compensation_amount = Column(Float, nullable=False, default=0.0)
    carbon_offset_kg = Column(Float, nullable=False, default=0.0)
    battery_soc_start = Column(Float, nullable=False, default=80.0)
    battery_soc_end = Column(Float, nullable=True)
    action_type = Column(Enum(V2GActionType), nullable=False, default=V2GActionType.DISCHARGE_PARTIAL)
    completed = Column(Boolean, default=False)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="v2g_transactions")
    grid_status = relationship("GridStatus", back_populates="v2g_transactions")
    battery_impact = relationship("V2GBatteryImpact", back_populates="v2g_transaction", uselist=False)
    
class V2GBatteryImpact(Base):
    """Model to store the impact of V2G activities on battery health"""
    __tablename__ = "v2g_battery_impact"
    
    id = Column(Integer, primary_key=True)
    v2g_transaction_id = Column(Integer, ForeignKey("v2g_transaction.id"))
    
    health_impact_level = Column(String, nullable=False, default="low")
    estimated_health_impact_pct = Column(Float, nullable=False, default=0.001)
    estimated_lifetime_impact_cycles = Column(Integer, nullable=False, default=1)
    health_assessment = Column(String, nullable=True)
    
    # Relationships
    v2g_transaction = relationship("V2GTransaction", back_populates="battery_impact")
    
class GridPriceForecast(Base):
    """Model to store grid price forecasts"""
    __tablename__ = "grid_price_forecast"
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    forecast_time = Column(DateTime, nullable=False, index=True)
    price_kwh = Column(Float, nullable=False, default=0.12)
    price_tier = Column(Enum(PriceTier), nullable=False, default=PriceTier.MID)
    
class GridFleetImpact(Base):
    """Model to store fleet-wide grid impact assessments"""
    __tablename__ = "grid_fleet_impact"
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    fleet_size = Column(Integer, nullable=False, default=0)
    total_available_energy_kwh = Column(Float, nullable=False, default=0.0)
    grid_impact_percentage = Column(Float, nullable=False, default=0.0)
    total_earnings_potential = Column(Float, nullable=False, default=0.0)
    total_carbon_offset_kg = Column(Float, nullable=False, default=0.0)
    grid_stress_level = Column(Enum(GridStressLevel), nullable=False, default=GridStressLevel.MEDIUM)
    assessment_details = Column(String, nullable=True)