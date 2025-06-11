from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.db.base_class import Base


class ChargingPreferenceType(str, enum.Enum):
    ECO = "eco"             # Optimize for minimal environmental impact
    COST = "cost"           # Optimize for lowest cost
    SPEED = "speed"         # Optimize for fastest charging
    BALANCED = "balanced"   # Balance between cost, speed, and battery health
    CUSTOM = "custom"       # Custom settings defined by user


class DriverProfile(Base):
    """Model for storing driver profiles with personalized settings."""
    __tablename__ = "driver_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Basic preferences
    preferred_min_soc = Column(Integer, default=20)  # Minimum state of charge (percent)
    preferred_max_soc = Column(Integer, default=90)  # Maximum state of charge (percent)
    optimal_departure_soc = Column(Integer, default=80)  # Optimal SoC for departure
    
    # Charging preferences
    charging_preference = Column(String(20), default=ChargingPreferenceType.BALANCED)
    eco_priority = Column(Integer, default=5)  # 1-10 scale, how much to prioritize renewable energy
    cost_priority = Column(Integer, default=5)  # 1-10 scale, how much to prioritize low cost
    speed_priority = Column(Integer, default=5)  # 1-10 scale, how much to prioritize charging speed
    
    # Schedule-related preferences
    typical_departure_times = Column(JSON, nullable=True)  # JSON array of typical departure times by day of week
    typical_return_times = Column(JSON, nullable=True)    # JSON array of typical return times by day of week
    
    # Range preferences
    min_comfortable_range = Column(Float, default=50.0)  # Miles/km
    typical_daily_mileage = Column(Float, nullable=True)
    
    # Custom parameters
    custom_parameters = Column(JSON, nullable=True)  # For any additional custom preferences
    
    # Advanced settings
    enable_v2g = Column(Boolean, default=False)  # Whether V2G is enabled
    v2g_min_soc = Column(Integer, default=50)  # Minimum SoC to allow V2G (percent)
    v2g_max_discharge = Column(Integer, default=30)  # Maximum discharge percentage
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="driver_profile")
    charging_schedules = relationship("ChargingSchedule", back_populates="driver_profile")
    

class DriverBehaviorData(Base):
    """Model for storing analyzed driver behavior for personalization."""
    __tablename__ = "driver_behavior_data"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_profile_id = Column(Integer, ForeignKey("driver_profiles.id"), nullable=False)
    
    # Time periods (daily, weekly, monthly)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    period_start = Column(DateTime, nullable=False)
    
    # Observed behavior metrics
    avg_daily_mileage = Column(Float, nullable=True)
    avg_energy_consumption = Column(Float, nullable=True)  # kWh/mile or kWh/km
    common_departure_times = Column(JSON, nullable=True)  # By day of week
    common_return_times = Column(JSON, nullable=True)  # By day of week
    
    # Charging patterns
    charging_frequency = Column(Float, nullable=True)  # Average times per week
    avg_charging_duration = Column(Integer, nullable=True)  # Average minutes per session
    preferred_charging_locations = Column(JSON, nullable=True)  # Most frequently used locations
    
    # Energy usage patterns
    peak_consumption_hours = Column(JSON, nullable=True)
    off_peak_consumption_hours = Column(JSON, nullable=True)
    
    # Analysis and recommendations
    recommendations = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    driver_profile = relationship("DriverProfile", backref="behavior_data")


class ChargingSchedule(Base):
    """Model for scheduled charging sessions."""
    __tablename__ = "charging_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    driver_profile_id = Column(Integer, ForeignKey("driver_profiles.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    # Schedule details
    name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    
    # Time range
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    # Charging parameters
    target_soc = Column(Integer, default=80)  # Target state of charge (percent)
    charging_preference = Column(String(20), default=ChargingPreferenceType.BALANCED)
    
    # Location
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=True)
    
    # Status tracking
    is_active = Column(Boolean, default=True)
    is_complete = Column(Boolean, default=False)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(JSON, nullable=True)  # e.g., {"type": "weekly", "days": [1,3,5]}
    
    # Smart charging details
    smart_charging_enabled = Column(Boolean, default=True)
    price_threshold = Column(Float, nullable=True)  # Maximum price willing to pay
    
    # Notifications
    notify_on_start = Column(Boolean, default=True)
    notify_on_complete = Column(Boolean, default=True)
    notify_on_error = Column(Boolean, default=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    driver_profile = relationship("DriverProfile", back_populates="charging_schedules")
    vehicle = relationship("Vehicle")
    location = relationship("Location", foreign_keys=[location_id])
    station = relationship("ChargingStation", foreign_keys=[station_id]) 