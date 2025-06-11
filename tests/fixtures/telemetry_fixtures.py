"""
Test fixtures for generating realistic vehicle telemetry data.

This module provides factory functions and fixtures for creating
realistic test data for vehicle telemetry, with special focus on:
1. Realistic patterns over time
2. Different vehicle and battery types
3. Edge cases for testing system robustness
"""

import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Union, Tuple
import uuid
from decimal import Decimal
import redis
import json
import hashlib
from functools import wraps
from celery import Celery
import os
from app.db.session import SessionLocal
from app.models.battery_health_alert import BatteryHealthAlert
from app.services.battery_health_service import BatteryHealthService
from sqlalchemy import text, func
from app.db.session import get_read_db, get_write_db
import gc
import psutil
import logging
import time
from contextlib import contextmanager
from app.settings import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

# Configure Redis client
redis_client = redis.Redis(
    host='localhost', 
    port=6379, 
    db=0,
    decode_responses=True
)

# Create Celery app
celery_app = Celery('ev_charging_app')
celery_app.config_from_object('app.celeryconfig')

# Register tasks
celery_app.autodiscover_tasks(['app.tasks'])

def cache_key_generator(*args, **kwargs):
    """Generate a unique cache key from arguments."""
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
    key_string = ":".join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()

def cache_result(ttl_seconds=300):
    """Decorator to cache function results in Redis."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Skip cache for write operations
            if any(x in func.__name__.lower() for x in ["update", "create", "delete"]):
                return await func(*args, **kwargs)
                
            # Generate unique key based on function name and args
            prefix = func.__module__ + "." + func.__name__
            cache_key = f"cache:{prefix}:{cache_key_generator(*args, **kwargs)}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
                
            # Execute function and cache result
            result = await func(*args, **kwargs)
            if result is not None:
                redis_client.setex(cache_key, ttl_seconds, json.dumps(result))
            return result
        return wrapper
    return decorator

# Constants for realistic vehicle telemetry ranges
BATTERY_TYPES = {
    "NMC": {  # Lithium Nickel Manganese Cobalt Oxide
        "nominal_capacity_kwh": (60, 100),
        "degradation_rate_per_year": (2.5, 4.0),  # % per year
        "nominal_cycle_count": (1500, 2500),
        "temperature_sensitivity": "medium",
        "optimal_temp_range": (15, 30),  # °C
        "fast_charge_impact": "medium",
    },
    "LFP": {  # Lithium Iron Phosphate
        "nominal_capacity_kwh": (50, 80),
        "degradation_rate_per_year": (1.5, 2.5),  # % per year
        "nominal_cycle_count": (2000, 3000),
        "temperature_sensitivity": "low",
        "optimal_temp_range": (10, 35),  # °C
        "fast_charge_impact": "low",
    },
    "NCA": {  # Lithium Nickel Cobalt Aluminum Oxide
        "nominal_capacity_kwh": (70, 110),
        "degradation_rate_per_year": (3.0, 4.5),  # % per year
        "nominal_cycle_count": (1200, 2000),
        "temperature_sensitivity": "high",
        "optimal_temp_range": (18, 28),  # °C
        "fast_charge_impact": "high",
    }
}

VEHICLE_MODELS = {
    "Model S": {"battery_type": "NCA", "efficiency_kwh_per_100km": (16, 20)},
    "Model 3": {"battery_type": "NMC", "efficiency_kwh_per_100km": (14, 17)},
    "Model Y": {"battery_type": "NMC", "efficiency_kwh_per_100km": (15, 18)},
    "ID.4": {"battery_type": "LFP", "efficiency_kwh_per_100km": (17, 19)},
    "Bolt EV": {"battery_type": "NMC", "efficiency_kwh_per_100km": (15, 18)},
    "Kona Electric": {"battery_type": "NMC", "efficiency_kwh_per_100km": (14, 17)},
    "Ioniq 5": {"battery_type": "NMC", "efficiency_kwh_per_100km": (17, 20)},
    "MachE": {"battery_type": "NMC", "efficiency_kwh_per_100km": (18, 22)},
    "F-150 Lightning": {"battery_type": "LFP", "efficiency_kwh_per_100km": (25, 30)},
}

# Speed profiles based on driving conditions
SPEED_PROFILES = {
    "urban": {"mean": 30, "std_dev": 15, "max": 60},
    "highway": {"mean": 100, "std_dev": 20, "max": 130},
    "mixed": {"mean": 65, "std_dev": 25, "max": 120},
    "congested": {"mean": 15, "std_dev": 10, "max": 40},
}

def create_vehicle_profile(
    vehicle_id: Optional[int] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    battery_age_years: Optional[float] = None,
    initial_odometer_km: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Create a realistic vehicle profile for testing.
    
    Args:
        vehicle_id: Optional vehicle ID
        make: Optional vehicle make
        model: Optional vehicle model
        year: Optional vehicle manufacturing year
        battery_age_years: Optional battery age in years
        initial_odometer_km: Optional initial odometer reading
        
    Returns:
        Dict containing vehicle profile data
    """
    if vehicle_id is None:
        vehicle_id = random.randint(1, 10000)
    
    if make is None:
        make = random.choice(["Tesla", "Volkswagen", "Chevrolet", "Hyundai", "Ford"])
        
    if model is None:
        if make == "Tesla":
            model = random.choice(["Model 3", "Model S", "Model Y"])
        elif make == "Volkswagen":
            model = "ID.4"
        elif make == "Chevrolet":
            model = "Bolt EV"
        elif make == "Hyundai":
            model = random.choice(["Kona Electric", "Ioniq 5"])
        elif make == "Ford":
            model = random.choice(["MachE", "F-150 Lightning"])
            
    if model not in VEHICLE_MODELS:
        model = random.choice(list(VEHICLE_MODELS.keys()))
        
    if year is None:
        year = random.randint(2018, datetime.now().year)
        
    if battery_age_years is None:
        # Battery could be newer than the vehicle (replaced)
        battery_age_years = random.uniform(0, datetime.now().year - year + 0.5)
        
    if initial_odometer_km is None:
        # Calculate realistic odometer based on age and average yearly distance
        avg_yearly_km = random.uniform(10000, 25000)
        initial_odometer_km = avg_yearly_km * battery_age_years
        
    battery_type = VEHICLE_MODELS[model]["battery_type"]
    nominal_capacity_min, nominal_capacity_max = BATTERY_TYPES[battery_type]["nominal_capacity_kwh"]
    nominal_capacity_kwh = random.uniform(nominal_capacity_min, nominal_capacity_max)
    
    degradation_rate_min, degradation_rate_max = BATTERY_TYPES[battery_type]["degradation_rate_per_year"]
    degradation_rate = random.uniform(degradation_rate_min, degradation_rate_max)
    
    # Calculate current capacity based on degradation
    # More realistic than linear: initially faster, then slower
    degradation_factor = 1 - (degradation_rate / 100 * battery_age_years * (1 - 0.2 * battery_age_years / 10))
    current_capacity_kwh = nominal_capacity_kwh * max(0.6, degradation_factor)  # Cap at 60% minimum
    
    return {
        "id": vehicle_id,
        "make": make,
        "model": model,
        "year": year,
        "battery_type": battery_type,
        "nominal_capacity_kwh": nominal_capacity_kwh,
        "current_capacity_kwh": current_capacity_kwh,
        "battery_age_years": battery_age_years,
        "initial_odometer_km": initial_odometer_km,
        "state_of_health": degradation_factor * 100,  # as a percentage
        "efficiency_kwh_per_100km_range": VEHICLE_MODELS[model]["efficiency_kwh_per_100km"],
    }

def generate_telemetry_sequence(
    vehicle_profile: Dict[str, Any],
    start_time: datetime,
    end_time: datetime,
    interval_minutes: int = 5,
    driving_profile: str = "mixed",
    include_anomalies: bool = False,
    anomaly_probability: float = 0.05,
    initial_soc: Optional[float] = None,
    charging_events: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Generate a realistic sequence of telemetry data points for a vehicle.
    
    Args:
        vehicle_profile: Vehicle profile from create_vehicle_profile()
        start_time: Start timestamp for telemetry data
        end_time: End timestamp for telemetry data
        interval_minutes: Interval between data points in minutes
        driving_profile: One of 'urban', 'highway', 'mixed', 'congested'
        include_anomalies: Whether to include anomalous data points
        anomaly_probability: Probability of generating an anomalous data point
        initial_soc: Initial state of charge (%). If None, a random value is used.
        charging_events: List of charging events, each with 'start_time', 'end_time', 
                         and 'charging_rate_kw'
                         
    Returns:
        List of telemetry data points
    """
    if initial_soc is None:
        initial_soc = random.uniform(20, 90)
        
    speed_profile = SPEED_PROFILES.get(driving_profile, SPEED_PROFILES["mixed"])
    telemetry_sequence = []
    
    # Set up initial state
    current_time = start_time
    current_soc = initial_soc
    odometer_km = vehicle_profile["initial_odometer_km"]
    efficiency_min, efficiency_max = vehicle_profile["efficiency_kwh_per_100km_range"]
    current_capacity_kwh = vehicle_profile["current_capacity_kwh"]
    
    # Create a list of timestamps for the sequence
    timestamps = []
    while current_time <= end_time:
        timestamps.append(current_time)
        current_time += timedelta(minutes=interval_minutes)
    
    # Determine driving and idle periods (simplified)
    driving_probability = 0.7 if driving_profile != "congested" else 0.5
    driving_periods = []
    
    is_driving = False
    driving_start = None
    
    for idx, ts in enumerate(timestamps):
        # Check if time is between 7am and 10pm
        hour = ts.hour
        is_active_hour = 7 <= hour <= 22
        
        # Higher probability of driving during active hours
        driving_chance = driving_probability if is_active_hour else 0.3 * driving_probability
        
        # Start driving
        if not is_driving and random.random() < driving_chance:
            is_driving = True
            driving_start = idx
        
        # Stop driving 
        elif is_driving and random.random() > 0.8:
            is_driving = False
            driving_periods.append((driving_start, idx))
            driving_start = None
    
    # Add the last driving period if still driving at the end
    if is_driving and driving_start is not None:
        driving_periods.append((driving_start, len(timestamps) - 1))
    
    # Check for charging events
    charging_status = [False] * len(timestamps)
    charging_power = [0.0] * len(timestamps)
    
    if charging_events:
        for event in charging_events:
            charge_start = event["start_time"]
            charge_end = event["end_time"]
            charging_rate_kw = event["charging_rate_kw"]
            
            for idx, ts in enumerate(timestamps):
                if charge_start <= ts <= charge_end:
                    charging_status[idx] = True
                    charging_power[idx] = charging_rate_kw
    
    # Generate base telemetry data
    for idx, ts in enumerate(timestamps):
        # Find if this timestamp is in a driving period
        is_driving = any(start <= idx <= end for start, end in driving_periods)
        is_charging = charging_status[idx]
        
        # Can't be driving and charging at the same time
        if is_driving and is_charging:
            is_driving = False
        
        # Generate speed data
        speed_kmh = 0.0
        if is_driving:
            base_speed = random.normalvariate(speed_profile["mean"], speed_profile["std_dev"])
            speed_kmh = max(0, min(base_speed, speed_profile["max"]))
        
        # Calculate energy consumption and battery changes
        energy_consumed_kwh = 0.0
        distance_km = 0.0
        
        if is_driving:
            # Calculate distance traveled
            time_hours = interval_minutes / 60
            distance_km = speed_kmh * time_hours
            
            # Calculate energy consumption based on efficiency
            efficiency = random.uniform(efficiency_min, efficiency_max)
            energy_consumed_kwh = distance_km * efficiency / 100
            
            # Adjust for temperature effects
            ambient_temp_c = get_temperature_for_timestamp(ts)
            optimal_min, optimal_max = BATTERY_TYPES[vehicle_profile["battery_type"]]["optimal_temp_range"]
            
            if ambient_temp_c < optimal_min:
                # Cold temperature penalty
                temp_factor = 1 + 0.01 * (optimal_min - ambient_temp_c)
                energy_consumed_kwh *= temp_factor
            elif ambient_temp_c > optimal_max:
                # Hot temperature penalty (less severe than cold)
                temp_factor = 1 + 0.005 * (ambient_temp_c - optimal_max)
                energy_consumed_kwh *= temp_factor
            
            # Update odometer
            odometer_km += distance_km
            
            # Update SoC
            soc_change = (energy_consumed_kwh / current_capacity_kwh) * 100
            current_soc = max(0, current_soc - soc_change)
        
        elif is_charging:
            # Calculate energy added
            charging_rate = charging_power[idx]
            time_hours = interval_minutes / 60
            energy_added_kwh = charging_rate * time_hours
            
            # Different charging curves based on SoC
            if current_soc < 20:
                efficiency_factor = 0.95  # High efficiency at low SoC
            elif current_soc < 80:
                efficiency_factor = 0.9   # Good efficiency in the middle range
            else:
                # Efficiency drops as battery gets fuller
                efficiency_factor = 0.9 - ((current_soc - 80) / 20) * 0.3
            
            actual_energy_added = energy_added_kwh * efficiency_factor
            
            # Update SoC
            soc_change = (actual_energy_added / current_capacity_kwh) * 100
            current_soc = min(100, current_soc + soc_change)
        
        # Create base telemetry point
        telemetry_point = {
            "vehicle_id": vehicle_profile["id"],
            "timestamp": ts,
            "latitude": generate_latitude_for_timestamp(idx, driving_periods),
            "longitude": generate_longitude_for_timestamp(idx, driving_periods),
            "speed_kmh": speed_kmh,
            "state_of_charge_percent": current_soc,
            "is_charging": is_charging,
            "charging_power_kw": charging_power[idx] if is_charging else 0,
            "battery_temperature_celsius": generate_battery_temperature(
                ambient_temp_c, is_charging, charging_power[idx] if is_charging else 0, is_driving, speed_kmh
            ),
            "odometer_km": odometer_km,
            "energy_consumed_kwh": energy_consumed_kwh if is_driving else 0,
            "ambient_temperature_celsius": ambient_temp_c,
        }
        
        # Add anomalies if requested
        if include_anomalies and random.random() < anomaly_probability:
            add_anomaly(telemetry_point, vehicle_profile)
        
        telemetry_sequence.append(telemetry_point)
    
    return telemetry_sequence

def get_temperature_for_timestamp(timestamp: datetime) -> float:
    """Generate a realistic ambient temperature based on time of day and month."""
    month = timestamp.month
    hour = timestamp.hour
    
    # Base temperature by month (Northern Hemisphere)
    if 3 <= month <= 5:  # Spring
        base_temp = random.uniform(10, 22)
    elif 6 <= month <= 8:  # Summer
        base_temp = random.uniform(20, 35)
    elif 9 <= month <= 11:  # Fall
        base_temp = random.uniform(8, 20)
    else:  # Winter
        base_temp = random.uniform(-5, 10)
    
    # Daily variation (cooler at night, warmer in afternoon)
    if 0 <= hour < 6:  # Late night/early morning
        base_temp -= random.uniform(2, 5)
    elif 6 <= hour < 12:  # Morning
        base_temp += random.uniform(0, 3)
    elif 12 <= hour < 18:  # Afternoon
        base_temp += random.uniform(2, 5)
    else:  # Evening
        base_temp -= random.uniform(0, 3)
    
    return round(base_temp, 1)

def generate_battery_temperature(
    ambient_temp_c: float, 
    is_charging: bool, 
    charging_power: float,
    is_driving: bool,
    speed_kmh: float
) -> float:
    """Generate realistic battery temperature based on conditions."""
    # Start with ambient temperature
    battery_temp = ambient_temp_c
    
    # Add temperature rise based on activity
    if is_charging:
        # Higher charging rates produce more heat
        temp_rise = (charging_power / 50) * random.uniform(5, 12)
        battery_temp += temp_rise
    elif is_driving:
        # Higher speeds can produce more heat
        temp_rise = (speed_kmh / 100) * random.uniform(3, 8)
        battery_temp += temp_rise
    
    # Add random variation
    battery_temp += random.uniform(-1, 1)
    
    return round(battery_temp, 1)

def generate_latitude_for_timestamp(idx: int, driving_periods: List[Tuple[int, int]]) -> float:
    """Generate latitude values that change during driving periods."""
    # Base latitude (somewhere in USA)
    base_latitude = 37.7749
    
    # Check if this index is in a driving period
    is_driving = any(start <= idx <= end for start, end in driving_periods)
    
    if is_driving:
        # Generate a small change in latitude if driving
        change = random.uniform(-0.01, 0.01)
        return round(base_latitude + change, 6)
    else:
        # Small random noise when stationary to simulate GPS variation
        noise = random.uniform(-0.0001, 0.0001)
        return round(base_latitude + noise, 6)

def generate_longitude_for_timestamp(idx: int, driving_periods: List[Tuple[int, int]]) -> float:
    """Generate longitude values that change during driving periods."""
    # Base longitude (somewhere in USA)
    base_longitude = -122.4194
    
    # Check if this index is in a driving period
    is_driving = any(start <= idx <= end for start, end in driving_periods)
    
    if is_driving:
        # Generate a small change in longitude if driving
        change = random.uniform(-0.01, 0.01)
        return round(base_longitude + change, 6)
    else:
        # Small random noise when stationary to simulate GPS variation
        noise = random.uniform(-0.0001, 0.0001)
        return round(base_longitude + noise, 6)

def add_anomaly(telemetry_point: Dict[str, Any], vehicle_profile: Dict[str, Any]) -> None:
    """Add realistic anomalies to a telemetry data point."""
    anomaly_type = random.choice([
        "soc_drop", "temp_spike", "communication_error", "gps_jump", 
        "charging_fluctuation", "speed_anomaly"
    ])
    
    if anomaly_type == "soc_drop":
        # Sudden drop in state of charge
        telemetry_point["state_of_charge_percent"] = max(
            0, telemetry_point["state_of_charge_percent"] - random.uniform(5, 15)
        )
    elif anomaly_type == "temp_spike":
        # Temperature spike
        telemetry_point["battery_temperature_celsius"] += random.uniform(8, 20)
    elif anomaly_type == "communication_error":
        # Simulate missing or null values
        fields_to_nullify = random.sample(
            ["speed_kmh", "battery_temperature_celsius", "state_of_charge_percent"], 
            k=random.randint(1, 2)
        )
        for field in fields_to_nullify:
            telemetry_point[field] = None
    elif anomaly_type == "gps_jump":
        # GPS coordinate jump
        telemetry_point["latitude"] += random.uniform(-0.5, 0.5)
        telemetry_point["longitude"] += random.uniform(-0.5, 0.5)
    elif anomaly_type == "charging_fluctuation":
        if telemetry_point["is_charging"]:
            # Fluctuation in charging power
            telemetry_point["charging_power_kw"] *= random.uniform(0.5, 1.5)
    elif anomaly_type == "speed_anomaly":
        # Unrealistic speed value
        telemetry_point["speed_kmh"] = random.uniform(200, 300)

def create_charging_event(
    start_time: datetime,
    duration_hours: Optional[float] = None,
    charging_rate_kw: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Create a charging event for use in telemetry generation.
    
    Args:
        start_time: Start time of charging
        duration_hours: Duration of charging in hours
        charging_rate_kw: Charging rate in kW
        
    Returns:
        Dict containing charging event data
    """
    if duration_hours is None:
        duration_hours = random.uniform(0.5, 3.0)
        
    if charging_rate_kw is None:
        # Random charging rate between Level 2 and DC fast charging
        charging_tier = random.choice(["L2", "DCFC_50", "DCFC_150", "DCFC_350"])
        
        if charging_tier == "L2":
            charging_rate_kw = random.uniform(7, 11)
        elif charging_tier == "DCFC_50":
            charging_rate_kw = random.uniform(45, 55)
        elif charging_tier == "DCFC_150":
            charging_rate_kw = random.uniform(100, 150)
        elif charging_tier == "DCFC_350":
            charging_rate_kw = random.uniform(250, 350)
    
    return {
        "start_time": start_time,
        "end_time": start_time + timedelta(hours=duration_hours),
        "charging_rate_kw": charging_rate_kw,
    }

def generate_battery_health_report(
    vehicle_profile: Dict[str, Any],
    report_date: Optional[datetime] = None,
    include_anomalies: bool = False,
) -> Dict[str, Any]:
    """
    Generate a realistic battery health report for testing.
    
    Args:
        vehicle_profile: Vehicle profile from create_vehicle_profile()
        report_date: Date of the report, defaults to current date
        include_anomalies: Whether to include anomalous values
        
    Returns:
        Dict containing battery health report data
    """
    if report_date is None:
        report_date = datetime.now(timezone.utc)
    
    battery_type = vehicle_profile["battery_type"]
    nominal_capacity_kwh = vehicle_profile["nominal_capacity_kwh"]
    current_capacity_kwh = vehicle_profile["current_capacity_kwh"]
    battery_age_years = vehicle_profile["battery_age_years"]
    state_of_health = vehicle_profile["state_of_health"]
    
    # Estimated number of cycles based on age and usage pattern
    avg_cycles_per_year = random.uniform(200, 400)
    estimated_cycles = avg_cycles_per_year * battery_age_years
    
    # Calculate internal resistance increase (indicator of aging)
    internal_resistance_increase = (100 - state_of_health) * 0.3  # percentage
    
    # Cell voltage balance (more imbalance as battery ages)
    cell_imbalance_mv = min(100, battery_age_years * random.uniform(5, 10))
    
    # Health prediction
    degradation_rate_min, degradation_rate_max = BATTERY_TYPES[battery_type]["degradation_rate_per_year"]
    avg_degradation_rate = (degradation_rate_min + degradation_rate_max) / 2
    predicted_soh_1year = max(60, state_of_health - avg_degradation_rate)
    
    # Rapid capacity loss threshold (below this, battery needs replacement)
    replacement_threshold = 70
    
    # Generate report
    report = {
        "vehicle_id": vehicle_profile["id"],
        "report_date": report_date,
        "state_of_health": state_of_health,
        "nominal_capacity_kwh": nominal_capacity_kwh,
        "current_capacity_kwh": current_capacity_kwh,
        "estimated_cycles": estimated_cycles,
        "internal_resistance_increase_percent": internal_resistance_increase,
        "cell_voltage_imbalance_mv": cell_imbalance_mv,
        "predicted_soh_1year": predicted_soh_1year,
        "degradation_rate_per_year": avg_degradation_rate,
        "replacement_recommended": state_of_health < replacement_threshold,
        "battery_type": battery_type,
    }
    
    # Add anomalies if requested
    if include_anomalies and random.random() < 0.1:
        anomaly_type = random.choice(["extreme_degradation", "inconsistent_values", "internal_fault"])
        
        if anomaly_type == "extreme_degradation":
            # Sudden large drop in capacity
            report["state_of_health"] = max(40, report["state_of_health"] - random.uniform(15, 25))
            report["current_capacity_kwh"] = report["nominal_capacity_kwh"] * report["state_of_health"] / 100
            report["replacement_recommended"] = True
            
        elif anomaly_type == "inconsistent_values":
            # Inconsistency between SoH and capacity
            report["current_capacity_kwh"] = report["nominal_capacity_kwh"] * (
                report["state_of_health"] + random.uniform(10, 20)
            ) / 100
            
        elif anomaly_type == "internal_fault":
            # Sign of internal battery fault
            report["cell_voltage_imbalance_mv"] = random.uniform(200, 500)
            report["internal_resistance_increase_percent"] = random.uniform(50, 100)
            report["replacement_recommended"] = True
    
    return report

def create_v2g_transaction(
    vehicle_profile: Dict[str, Any],
    start_time: Optional[datetime] = None,
    duration_hours: Optional[float] = None,
    grid_demand_level: str = "medium",
    energy_price_kwh: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Create a Vehicle-to-Grid transaction for testing grid integration.
    
    Args:
        vehicle_profile: Vehicle profile from create_vehicle_profile()
        start_time: Start time of the V2G transaction
        duration_hours: Duration of the transaction in hours
        grid_demand_level: 'low', 'medium', 'high', or 'critical'
        energy_price_kwh: Price per kWh
        
    Returns:
        Dict containing V2G transaction data
    """
    if start_time is None:
        # Default to a peak demand time (weekday afternoon)
        now = datetime.now(timezone.utc)
        start_time = datetime(
            now.year, now.month, now.day, 
            hour=random.randint(16, 19),  # 4pm to 7pm
            minute=random.choice([0, 15, 30, 45]),
            tzinfo=timezone.utc
        )
    
    if duration_hours is None:
        # More realistic duration based on demand level
        if grid_demand_level == "low":
            duration_hours = random.uniform(0.5, 1.0)
        elif grid_demand_level == "medium":
            duration_hours = random.uniform(0.5, 2.0)
        elif grid_demand_level == "high":
            duration_hours = random.uniform(1.0, 3.0)
        else:  # critical
            duration_hours = random.uniform(2.0, 4.0)
    
    # Set realistic power export rate based on vehicle
    if vehicle_profile["model"] in ["Model S", "Model Y", "F-150 Lightning"]:
        max_export_kw = random.uniform(10, 15)
    else:
        max_export_kw = random.uniform(7, 10)
    
    # Energy exported depends on duration and power rate
    energy_exported_kwh = max_export_kw * duration_hours * random.uniform(0.8, 0.95)  # efficiency factor
    
    # Price varies by demand level
    if energy_price_kwh is None:
        if grid_demand_level == "low":
            energy_price_kwh = random.uniform(0.10, 0.15)
        elif grid_demand_level == "medium":
            energy_price_kwh = random.uniform(0.15, 0.25)
        elif grid_demand_level == "high":
            energy_price_kwh = random.uniform(0.25, 0.40)
        else:  # critical
            energy_price_kwh = random.uniform(0.40, 0.80)
    
    # Calculate revenue
    revenue = energy_exported_kwh * energy_price_kwh
    
    # Battery impact calculation
    battery_type = vehicle_profile["battery_type"]
    impact_factor = {
        "NMC": 0.5,
        "NCA": 0.7,
        "LFP": 0.3
    }.get(battery_type, 0.5)
    
    # More power = more stress on battery
    degradation_impact = (energy_exported_kwh / vehicle_profile["current_capacity_kwh"]) * impact_factor
    
    # Transaction ID
    transaction_id = str(uuid.uuid4())
    
    return {
        "id": transaction_id,
        "vehicle_id": vehicle_profile["id"],
        "start_time": start_time,
        "end_time": start_time + timedelta(hours=duration_hours),
        "energy_exported_kwh": energy_exported_kwh,
        "average_power_kw": max_export_kw * random.uniform(0.85, 1.0),  # slight fluctuation
        "grid_demand_level": grid_demand_level,
        "price_per_kwh": energy_price_kwh,
        "total_revenue": revenue,
        "battery_degradation_impact": degradation_impact,
        "completed": random.random() > 0.05,  # 5% chance of incomplete transaction
        "settlement_status": random.choice(["pending", "completed", "rejected"]) 
        if random.random() > 0.8 else "completed",  # Most are completed
    }

@celery_app.task(name="battery_health_analysis")
def analyze_fleet_battery_health(fleet_id):
    """Analyze battery health for all vehicles in a fleet."""
    db = SessionLocal()
    try:
        health_service = BatteryHealthService()
        vehicles = db.query(Vehicle).filter(Vehicle.fleet_id == fleet_id).all()
        
        results = {
            "fleet_id": fleet_id,
            "total_vehicles": len(vehicles),
            "alerts_generated": 0,
            "vehicles_analyzed": 0
        }
        
        for vehicle in vehicles:
            try:
                alerts = health_service.analyze_battery_health(db, vehicle.id)
                results["alerts_generated"] += len(alerts)
                results["vehicles_analyzed"] += 1
            except Exception as e:
                # Log but continue with other vehicles
                logger.error(f"Error analyzing vehicle {vehicle.id}: {e}")
                
        return results
    finally:
        db.close()

# Schedule periodic tasks
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Run battery health analysis every 6 hours
    sender.add_periodic_task(
        21600.0,  # 6 hours
        analyze_all_fleets.s(),
        name='analyze-all-fleets-every-6-hours'
    )
    
    # Run integration maintenance every day at midnight
    sender.add_periodic_task(
        crontab(hour=0, minute=0),
        maintain_integrations.s(),
        name='daily-integration-maintenance'
    )

@celery_app.task
def analyze_all_fleets():
    """Trigger analysis for all fleets."""
    db = SessionLocal()
    try:
        fleets = db.query(Fleet).all()
        for fleet in fleets:
            analyze_fleet_battery_health.delay(fleet.id)
    finally:
        db.close()

def get_fleet_battery_health_overview(fleet_id):
    """Optimized query for fleet-wide battery health."""
    with get_read_db() as db:
        # Use raw SQL for maximum performance with window functions
        sql = text("""
            WITH vehicle_latest_telemetry AS (
                SELECT DISTINCT ON (vehicle_id) 
                    vehicle_id,
                    state_of_charge_percent,
                    battery_temperature_celsius
                FROM telemetry_data
                WHERE timestamp > NOW() - INTERVAL '24 hours'
                ORDER BY vehicle_id, timestamp DESC
            ),
            vehicle_battery_health AS (
                SELECT DISTINCT ON (vehicle_id)
                    vehicle_id,
                    state_of_health,
                    report_date,
                    predicted_soh_1year,
                    cell_voltage_imbalance_mv
                FROM battery_health_reports
                ORDER BY vehicle_id, report_date DESC
            )
            SELECT 
                v.id as vehicle_id,
                v.make,
                v.model,
                v.year,
                v.status,
                t.state_of_charge_percent,
                t.battery_temperature_celsius,
                b.state_of_health,
                b.predicted_soh_1year,
                b.cell_voltage_imbalance_mv,
                b.report_date,
                -- Calculate a health score from 0-100
                GREATEST(0, LEAST(100, 
                    CASE 
                        WHEN b.state_of_health IS NULL THEN 75
                        ELSE (
                            b.state_of_health * 0.6 +
                            (100 - COALESCE(b.cell_voltage_imbalance_mv, 0) / 5) * 0.2 +
                            (CASE WHEN t.battery_temperature_celsius BETWEEN 15 AND 35 THEN 100 ELSE 70 END) * 0.2
                        )
                    END
                )) as health_score,
                -- Categorize vehicles for quick filtering
                CASE 
                    WHEN b.state_of_health < 70 OR b.cell_voltage_imbalance_mv > 100 THEN 'critical'
                    WHEN b.state_of_health < 80 OR b.cell_voltage_imbalance_mv > 50 THEN 'warning'
                    ELSE 'good'
                END as health_category
            FROM vehicles v
            LEFT JOIN vehicle_latest_telemetry t ON v.id = t.vehicle_id
            LEFT JOIN vehicle_battery_health b ON v.id = b.vehicle_id
            WHERE v.fleet_id = :fleet_id
            ORDER BY health_score ASC
        """)
        
        result = db.execute(sql, {"fleet_id": fleet_id}).fetchall()
        return [dict(row) for row in result]

logger = logging.getLogger(__name__)

def monitor_memory_usage():
    """Monitor and log current memory usage."""
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    memory_usage_mb = memory_info.rss / 1024 / 1024
    logger.info(f"Memory usage: {memory_usage_mb:.2f} MB")
    
    # Force garbage collection if memory usage is high
    if memory_usage_mb > 1024:  # Over 1GB
        logger.warning(f"High memory usage detected: {memory_usage_mb:.2f} MB. Triggering GC.")
        gc.collect()
        
    return memory_usage_mb

def memory_optimized(func):
    """Decorator to monitor and optimize memory usage in functions."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        initial_memory = monitor_memory_usage()
        
        # Call the function
        result = await func(*args, **kwargs)
        
        # Check memory after execution
        final_memory = monitor_memory_usage()
        memory_diff = final_memory - initial_memory
        
        # Log memory increase if significant
        if memory_diff > 50:  # Over 50MB increase
            logger.warning(
                f"Significant memory increase in {func.__name__}: {memory_diff:.2f} MB. "
                f"Consider optimizing this function."
            )
            
        return result
    return wrapper

class DistributedLock:
    """
    Redis-based distributed lock implementation to prevent race conditions
    across multiple application instances.
    """
    
    def __init__(self, redis_client, lock_name, expire_seconds=30, retry_seconds=0.2, max_retries=50):
        self.redis = redis_client
        self.lock_name = f"lock:{lock_name}"
        self.expire_seconds = expire_seconds
        self.retry_seconds = retry_seconds
        self.max_retries = max_retries
        self.lock_id = str(uuid.uuid4())
    
    def acquire(self):
        """Acquire the lock with retry logic."""
        retry_count = 0
        while retry_count < self.max_retries:
            # Try to set the lock with NX (only if it doesn't exist)
            if self.redis.set(self.lock_name, self.lock_id, nx=True, ex=self.expire_seconds):
                logger.debug(f"Lock acquired: {self.lock_name}")
                return True
                
            # Wait before retrying
            time.sleep(self.retry_seconds)
            retry_count += 1
            
        logger.warning(f"Failed to acquire lock after {self.max_retries} retries: {self.lock_name}")
        return False
        
    def release(self):
        """Release the lock using Lua script for atomic operation."""
        release_script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        script = self.redis.register_script(release_script)
        result = script(keys=[self.lock_name], args=[self.lock_id])
        if result:
            logger.debug(f"Lock released: {self.lock_name}")
        else:
            logger.warning(f"Failed to release lock (not owner): {self.lock_name}")
        return result
        
@contextmanager
def distributed_lock(redis_client, lock_name, expire_seconds=30, retry_seconds=0.2, max_retries=50):
    """Context manager for the distributed lock."""
    lock = DistributedLock(
        redis_client, 
        lock_name, 
        expire_seconds=expire_seconds,
        retry_seconds=retry_seconds,
        max_retries=max_retries
    )
    
    acquired = lock.acquire()
    if not acquired:
        raise TimeoutError(f"Failed to acquire lock: {lock_name}")
    
    try:
        yield acquired
    finally:
        lock.release() 