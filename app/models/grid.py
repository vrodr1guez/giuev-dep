from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.db.base_class import Base


class GridLoadForecast(Base):
    """Model for tracking and forecasting grid load."""
    __tablename__ = "grid_load_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(
        Integer,
        ForeignKey("charging_stations.id"),
        nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    load_kw = Column(Float, nullable=False)  # Current/forecasted load in kW
    available_capacity_kw = Column(
        Float, nullable=False)  # Available capacity in kW
    peak_threshold_kw = Column(Float, nullable=False)  # Peak load threshold
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    station = relationship("ChargingStation", back_populates="load_forecasts")

    class Config:
        indexes = [
            ("station_id", "timestamp")  # Composite index for efficient querying
        ]


class DynamicTariff(Base):
    """Model for dynamic electricity tariffs."""
    __tablename__ = "dynamic_tariffs"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(
        Integer,
        ForeignKey("charging_stations.id"),
        nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    base_rate = Column(Float, nullable=False)  # Base electricity rate
    # Multiplier based on demand
    demand_multiplier = Column(Float, default=1.0)
    # Discount for renewable energy
    renewable_discount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    station = relationship("ChargingStation", back_populates="tariffs")

    class Config:
        indexes = [
            # Composite index for time range queries
            ("station_id", "start_time", "end_time")
        ]


class StationAvailability(Base):
    """Model for real-time charging station availability."""
    __tablename__ = "station_availability"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(
        Integer,
        ForeignKey("charging_stations.id"),
        nullable=False)
    # Specific connector identifier
    connector_id = Column(String, nullable=False)
    # Available, Occupied, Out of Service, Reserved
    status = Column(String, nullable=False)
    current_session_id = Column(
        Integer,
        ForeignKey("charging_sessions.id"),
        nullable=True)
    max_power_kw = Column(Float, nullable=False)
    current_power_kw = Column(Float, default=0.0)
    reservation_id = Column(Integer, ForeignKey(
        "charging_reservations.id"), nullable=True)
    last_status_update = Column(
        DateTime(
            timezone=True),
        server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    station = relationship("ChargingStation", back_populates="connectors")
    current_session = relationship("ChargingSession")
    reservation = relationship("ChargingReservation")

    class Config:
        indexes = [
            # Composite index for station connectors
            ("station_id", "connector_id"),
            ("status", "station_id")  # Index for status queries
        ]
