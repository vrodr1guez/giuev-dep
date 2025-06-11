from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import logging
import json
import requests
from app.db.session import get_db
from app.core.config import settings
from app.api.deps import get_current_active_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

class EnergyPricePoint(BaseModel):
    timestamp: str
    price: float
    renewable: float
    demand: float
    isOptimal: bool

class GridLoadPoint(BaseModel):
    timestamp: str
    load: float
    capacity: float
    renewable_percentage: float

# Cache for energy price data to avoid hitting external APIs too frequently
price_cache = {}
cache_expiry = {}

@router.get("/", response_model=List[EnergyPricePoint])
async def get_energy_prices(
    location: str = Query(..., description="Location identifier"),
    timeframe: str = Query("24h", description="Time frame for predictions (24h, 48h, 7d)"),
    include_historical: bool = Query(False, description="Include historical data"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get energy price predictions for a specific location
    
    This endpoint combines data from:
    - Historical energy prices
    - Real-time market data
    - Weather forecasts for renewable energy predictions
    - Grid load predictions
    """
    try:
        # Check if we have fresh cached data
        cache_key = f"{location}_{timeframe}_{include_historical}"
        now = datetime.now()
        
        if cache_key in price_cache and cache_expiry.get(cache_key, now) > now:
            logger.info(f"Returning cached energy price data for {cache_key}")
            return price_cache[cache_key]
        
        # Convert timeframe to hours
        hours = _convert_timeframe_to_hours(timeframe)
        
        # In a production environment, this would call external APIs
        # Here we'll simulate the external data
        
        # For demonstration, we'll use a simulated data source
        # In production, this would integrate with APIs like:
        # - Grid operators (PJM, CAISO, ERCOT)
        # - Energy market data providers
        # - Weather forecast services
        pricing_data = await _get_energy_pricing_data(location, hours, include_historical)
        
        # Cache the results
        # Set expiry to 15 minutes for real-time data
        price_cache[cache_key] = pricing_data
        cache_expiry[cache_key] = now + timedelta(minutes=15)
        
        return pricing_data
        
    except Exception as e:
        logger.error(f"Error retrieving energy prices: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve energy pricing data"
        )

@router.get("/grid-load", response_model=List[GridLoadPoint])
async def get_grid_load(
    location: str = Query(..., description="Location identifier"),
    timeframe: str = Query("24h", description="Time frame for predictions (24h, 48h, 7d)"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get grid load predictions for a specific location
    
    This endpoint provides data about:
    - Current and forecasted grid load
    - Grid capacity
    - Renewable energy percentage
    """
    try:
        # Convert timeframe to hours
        hours = _convert_timeframe_to_hours(timeframe)
        
        # Simulate grid load data
        # In production, this would call external grid operator APIs
        grid_data = await _get_grid_load_data(location, hours)
        
        return grid_data
        
    except Exception as e:
        logger.error(f"Error retrieving grid load: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve grid load data"
        )

def _convert_timeframe_to_hours(timeframe: str) -> int:
    """Convert timeframe string to hours"""
    if timeframe == "24h":
        return 24
    elif timeframe == "48h":
        return 48
    elif timeframe == "7d":
        return 168
    else:
        return 24  # Default to 24 hours

async def _get_energy_pricing_data(location: str, hours: int, include_historical: bool) -> List[EnergyPricePoint]:
    """
    Get energy pricing data from external sources or simulation
    
    In a production environment, this would integrate with real-time energy price APIs
    """
    # For demonstration, generate simulated pricing data
    pricing_data = []
    now = datetime.now()
    
    # Add historical data if requested
    if include_historical:
        # Generate 12 hours of historical data
        for i in range(-12, 0):
            timestamp = now + timedelta(hours=i)
            hour_of_day = timestamp.hour
            
            # Base price varies by hour of day
            base_price = _get_base_price_for_hour(hour_of_day)
            
            # Adjust price based on location
            price = _adjust_price_for_location(base_price, location)
            
            # Add random variation
            price *= (0.9 + 0.2 * (timestamp.minute / 60))
            
            # Calculate renewable percentage
            renewable = _get_renewable_percentage(hour_of_day, location)
            
            # Calculate demand
            demand = _get_demand_percentage(hour_of_day)
            
            # Determine if this is an optimal charging time
            is_optimal = price < 0.11 and renewable > 40
            
            pricing_data.append(
                EnergyPricePoint(
                    timestamp=timestamp.isoformat(),
                    price=round(price, 4),
                    renewable=round(renewable, 1),
                    demand=round(demand, 1),
                    isOptimal=is_optimal
                )
            )
    
    # Generate forecast data
    for i in range(0, hours):
        timestamp = now + timedelta(hours=i)
        hour_of_day = timestamp.hour
        
        # Base price varies by hour of day
        base_price = _get_base_price_for_hour(hour_of_day)
        
        # Adjust price based on location
        price = _adjust_price_for_location(base_price, location)
        
        # Add uncertainty for future predictions
        uncertainty_factor = 1.0 + (i * 0.005)
        price *= uncertainty_factor * (0.95 + 0.1 * (timestamp.minute / 60))
        
        # Calculate renewable percentage with forecasting uncertainty
        renewable = _get_renewable_percentage(hour_of_day, location)
        renewable *= (0.9 + 0.2 * (i / hours))  # Add more variation for future predictions
        
        # Calculate demand with forecasting uncertainty
        demand = _get_demand_percentage(hour_of_day)
        demand *= (0.9 + 0.2 * (i / hours))
        
        # Determine if this is an optimal charging time
        is_optimal = price < 0.11 and renewable > 40
        
        pricing_data.append(
            EnergyPricePoint(
                timestamp=timestamp.isoformat(),
                price=round(price, 4),
                renewable=round(renewable, 1),
                demand=round(demand, 1),
                isOptimal=is_optimal
            )
        )
    
    return pricing_data

async def _get_grid_load_data(location: str, hours: int) -> List[GridLoadPoint]:
    """
    Get grid load data from external sources or simulation
    
    In a production environment, this would integrate with grid operator APIs
    """
    # For demonstration, generate simulated grid load data
    grid_data = []
    now = datetime.now()
    
    # Fixed parameters (in a real implementation these would be fetched from a database or external API)
    location_capacity = {
        "main-depot": 1000,  # kW
        "north-hub": 500,    # kW
        "downtown": 750,     # kW
        "airport": 1500,     # kW
    }
    
    capacity = location_capacity.get(location, 1000)  # Default to 1000 kW if location not found
    
    for i in range(0, hours):
        timestamp = now + timedelta(hours=i)
        hour_of_day = timestamp.hour
        
        # Grid load follows daily patterns
        load_factor = _get_load_factor_for_hour(hour_of_day)
        
        # Calculate load
        load = capacity * load_factor * (0.8 + 0.4 * (i / hours))
        
        # Calculate renewable percentage
        renewable_percentage = _get_renewable_percentage(hour_of_day, location)
        
        grid_data.append(
            GridLoadPoint(
                timestamp=timestamp.isoformat(),
                load=round(load, 1),
                capacity=capacity,
                renewable_percentage=round(renewable_percentage, 1)
            )
        )
    
    return grid_data

def _get_base_price_for_hour(hour: int) -> float:
    """Get base electricity price based on hour of day"""
    # Price patterns follow typical daily demand curves
    if 0 <= hour < 5:  # Night (lowest)
        return 0.08
    elif 5 <= hour < 7:  # Early morning
        return 0.10
    elif 7 <= hour < 10:  # Morning peak
        return 0.15
    elif 10 <= hour < 16:  # Midday
        return 0.12
    elif 16 <= hour < 21:  # Evening peak
        return 0.18
    else:  # Late evening
        return 0.11

def _adjust_price_for_location(price: float, location: str) -> float:
    """Adjust price based on location"""
    # Different locations have different pricing structures
    location_factors = {
        "main-depot": 1.0,
        "north-hub": 1.05,
        "downtown": 1.2,
        "airport": 1.1,
    }
    
    factor = location_factors.get(location, 1.0)
    return price * factor

def _get_renewable_percentage(hour: int, location: str) -> float:
    """Get renewable energy percentage based on hour of day and location"""
    # Base renewable percentage varies by time of day (primarily solar)
    if 9 <= hour < 16:  # Daylight hours
        base_renewable = 40 + (hour - 9) * 5  # Peaks at 1pm-2pm
        if hour > 13:
            base_renewable -= (hour - 13) * 5
    elif 6 <= hour < 9:  # Morning ramp-up
        base_renewable = 15 + (hour - 6) * 8
    elif 16 <= hour < 20:  # Evening decline
        base_renewable = 40 - (hour - 16) * 9
    else:
        base_renewable = 15  # Night baseline (wind)
    
    # Location adjustments
    location_factors = {
        "main-depot": 1.0,
        "north-hub": 1.1,  # More wind
        "downtown": 0.8,   # Urban area, less renewable
        "airport": 1.2,    # Open area, more solar and wind
    }
    
    factor = location_factors.get(location, 1.0)
    return base_renewable * factor

def _get_demand_percentage(hour: int) -> float:
    """Get grid demand percentage based on hour of day"""
    # Demand patterns follow typical daily usage
    if 0 <= hour < 5:  # Night (lowest)
        return 30 + hour
    elif 5 <= hour < 9:  # Morning ramp-up
        return 35 + (hour - 5) * 15
    elif 9 <= hour < 16:  # Midday plateau
        return 80 - (hour - 9) * 2
    elif 16 <= hour < 21:  # Evening peak
        return 70 + (hour - 16) * 6
    else:  # Late evening decline
        return 80 - (hour - 21) * 15

def _get_load_factor_for_hour(hour: int) -> float:
    """Get grid load factor based on hour of day"""
    # Load follows daily demand patterns
    if 0 <= hour < 5:  # Night (lowest)
        return 0.4
    elif 5 <= hour < 9:  # Morning ramp-up
        return 0.4 + (hour - 5) * 0.15
    elif 9 <= hour < 16:  # Midday plateau
        return 0.8
    elif 16 <= hour < 21:  # Evening peak
        return 0.8 + (hour - 16) * 0.04
    else:  # Late evening decline
        return 0.7 - (hour - 21) * 0.1 