from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging
import asyncio
import json
import random
import math

from app.db.session import get_db
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.models.telematics import VehicleTelematicsLive, VehicleTelematicsHistory
from app.models.vehicle import Vehicle
from app.core.logging import logger
from app.core.websocket import connection_manager
from app.schemas.telematics import TelematicsData, TelematicsHistoryResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory cache of vehicle telemetry simulators
# In a production app, this would be replaced with actual telematics providers
vehicle_simulators: Dict[str, Any] = {}

# Background task to periodically update and broadcast vehicle telemetry data
async def simulate_and_broadcast_telemetry():
    """
    Simulate and broadcast vehicle telemetry data for all active vehicles
    """
    logger.info("Starting telemetry simulation and broadcasting")
    
    while True:
        try:
            for vehicle_id, simulator in vehicle_simulators.items():
                # Generate new telemetry data
                telemetry_data = generate_telemetry_update(vehicle_id)
                
                # Broadcast to all subscribers via WebSocket
                await connection_manager.broadcast_vehicle_telemetry(vehicle_id, telemetry_data)
            
            # Wait for next update interval
            await asyncio.sleep(2)  # 2 seconds between updates
        except Exception as e:
            logger.error(f"Error in telemetry simulation: {str(e)}")
            await asyncio.sleep(5)  # Wait longer if there's an error

def generate_telemetry_update(vehicle_id: str) -> Dict[str, Any]:
    """
    Generate a simulated telemetry update for a vehicle
    """
    # Either use the existing simulator or create a new one
    if vehicle_id not in vehicle_simulators:
        # Create a new simulator with default values
        vehicle_simulators[vehicle_id] = {
            "vehicle_id": vehicle_id,
            "state_of_charge_percent": random.uniform(60, 90),
            "state_of_health_percent": random.uniform(92, 98),
            "estimated_range_km": random.uniform(250, 350),
            "latitude": 40.7128 + random.uniform(-0.1, 0.1),
            "longitude": -74.0060 + random.uniform(-0.1, 0.1),
            "speed_kmh": random.uniform(0, 60),
            "is_charging": random.choice([True, False]),
            "charging_power_kw": 0,
            "odometer_km": random.uniform(5000, 50000),
            "battery_temperature_c": random.uniform(20, 30),
            "outside_temperature_c": random.uniform(15, 25),
            "power_output_kw": 0,
            "energy_consumption_kwh_per_100km": random.uniform(15, 20),
            "regenerated_energy_kwh": random.uniform(0, 5),
            "timestamp": datetime.now().isoformat()
        }
        
        # Initialize charging power if charging
        if vehicle_simulators[vehicle_id]["is_charging"]:
            vehicle_simulators[vehicle_id]["charging_power_kw"] = random.uniform(7, 22)
            vehicle_simulators[vehicle_id]["speed_kmh"] = 0
        else:
            vehicle_simulators[vehicle_id]["power_output_kw"] = vehicle_simulators[vehicle_id]["speed_kmh"] * 0.5
    
    # Get the current simulator state
    sim_data = vehicle_simulators[vehicle_id]
    
    # Update the state based on current mode (charging vs driving)
    if sim_data["is_charging"]:
        # Charging simulation
        sim_data["speed_kmh"] = 0
        sim_data["power_output_kw"] = 0
        
        # Charging increases battery by small amount each update
        battery_capacity_kwh = 75  # Example capacity in kWh
        time_factor = 2 / 3600  # 2 seconds in hours
        energy_added = sim_data["charging_power_kw"] * time_factor
        soc_increase = (energy_added / battery_capacity_kwh) * 100
        
        sim_data["state_of_charge_percent"] += soc_increase
        
        # Taper charging as battery fills
        if sim_data["state_of_charge_percent"] > 80:
            taper_factor = 1 - ((sim_data["state_of_charge_percent"] - 80) / 30)
            sim_data["charging_power_kw"] *= max(0.1, taper_factor)
    else:
        # Driving simulation
        sim_data["charging_power_kw"] = 0
        
        # Random speed changes
        speed_change = random.uniform(-5, 5)
        sim_data["speed_kmh"] = max(0, min(120, sim_data["speed_kmh"] + speed_change))
        
        # Battery drain based on speed
        consumption_factor = 1 + (sim_data["speed_kmh"] / 100)
        drain_rate = 0.05 * consumption_factor
        sim_data["state_of_charge_percent"] -= drain_rate
        
        # Update power output based on speed
        sim_data["power_output_kw"] = sim_data["speed_kmh"] * 0.5 * random.uniform(0.9, 1.1)
        
        # Update odometer
        distance = (sim_data["speed_kmh"] / 3600) * 2  # km traveled in 2 seconds
        sim_data["odometer_km"] += distance
    
    # Ensure state of charge stays within bounds
    sim_data["state_of_charge_percent"] = max(0, min(100, sim_data["state_of_charge_percent"]))
    
    # Update range based on state of charge
    max_range = 400  # km at 100% charge
    sim_data["estimated_range_km"] = (sim_data["state_of_charge_percent"] / 100) * max_range
    
    # Small random changes to temperature
    sim_data["battery_temperature_c"] += random.uniform(-0.2, 0.2)
    sim_data["outside_temperature_c"] += random.uniform(-0.1, 0.1)
    
    # Random location drift (if moving)
    if sim_data["speed_kmh"] > 0:
        direction = random.uniform(0, 2 * 3.14159)  # Random direction in radians
        distance_factor = sim_data["speed_kmh"] / 100000  # Convert to rough lat/lon change
        sim_data["latitude"] += distance_factor * math.cos(direction)
        sim_data["longitude"] += distance_factor * math.sin(direction)
    
    # Update timestamp
    sim_data["timestamp"] = datetime.now().isoformat()
    
    # Round values for cleaner data
    for key in ["state_of_charge_percent", "state_of_health_percent", "estimated_range_km", 
                "speed_kmh", "charging_power_kw", "power_output_kw", "battery_temperature_c", 
                "outside_temperature_c", "energy_consumption_kwh_per_100km", "regenerated_energy_kwh"]:
        if key in sim_data:
            sim_data[key] = round(sim_data[key], 1)
    
    # Save the updated simulator data
    vehicle_simulators[vehicle_id] = sim_data
    
    return sim_data

@router.get("/live/{vehicle_id}", response_model=TelematicsData)
async def get_live_telemetry(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Get the latest telemetry data for a vehicle
    """
    # In a real application, you would:
    # 1. Check if the user has access to this vehicle
    # 2. Retrieve the data from the telematics provider
    
    # For our demo, generate a new telematics update
    telemetry_data = generate_telemetry_update(vehicle_id)
    
    return telemetry_data

@router.get("/history/{vehicle_id}", response_model=TelematicsHistoryResponse)
async def get_telemetry_history(
    vehicle_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Get historical telemetry data for a vehicle within a time range
    """
    # Here we would normally query the database for historical records
    # Instead, we'll generate some fake historical data
    
    history = []
    current_time = datetime.now()
    
    # Generate fake history data at 5-minute intervals
    for i in range(min(limit, 100)):
        # Start with current data and modify it for historical points
        base_data = generate_telemetry_update(vehicle_id)
        
        # Adjust timestamp to go back in time
        minutes_ago = i * 5
        timestamp = current_time - timedelta(minutes=minutes_ago)
        base_data["timestamp"] = timestamp.isoformat()
        
        # Adjust other values to make sense historically
        # For example, SoC typically decreases over time when driving
        soc_change = random.uniform(0.2, 0.7) * i
        base_data["state_of_charge_percent"] = min(100, base_data["state_of_charge_percent"] + soc_change)
        
        # Randomly vary other parameters
        base_data["speed_kmh"] = random.uniform(0, 100)
        base_data["battery_temperature_c"] = random.uniform(20, 35)
        
        history.append(base_data)
    
    return {"total": len(history), "data": history}

@router.post("/start-simulation")
async def start_telematics_simulation(
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_superuser)
):
    """
    Start the telemetry simulation background task (admin only)
    """
    # This would normally be started with the application
    # But we provide an endpoint for testing purposes
    background_tasks.add_task(simulate_and_broadcast_telemetry)
    
    return {"status": "Telemetry simulation started"}
