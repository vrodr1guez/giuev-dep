from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import json
import math
import numpy as np
from scipy import optimize

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.vehicle import Vehicle
from app.models.charging_station import ChargingStation, ChargingConnector
from app.models.user import User
from app.schemas.charging import (
    ChargingOptimizationRequest,
    ChargingOptimizationResponse,
    ChargingSchedulePoint,
    BatteryParameters,
    ChargingConstraints
)
from app.core.logging import logger

router = APIRouter()
logger = logging.getLogger(__name__)

class EnergyPricePredictor:
    """
    Predicts energy prices based on time of day and historical patterns
    """
    def __init__(self):
        # Base prices by hour of day (24-hour format)
        self.base_prices = {
            0: 0.10, 1: 0.09, 2: 0.08, 3: 0.07, 4: 0.07, 5: 0.08,  # Night (cheapest)
            6: 0.11, 7: 0.13, 8: 0.15, 9: 0.16, 10: 0.15, 11: 0.14,  # Morning
            12: 0.13, 13: 0.12, 14: 0.13, 15: 0.14, 16: 0.16, 17: 0.18,  # Afternoon
            18: 0.20, 19: 0.19, 20: 0.17, 21: 0.15, 22: 0.13, 23: 0.11,  # Evening
        }
        
        # Day of week multipliers (0 = Monday, 6 = Sunday)
        self.day_multipliers = {
            0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0,  # Weekdays
            5: 0.9, 6: 0.8,  # Weekends
        }
        
        # Seasonal multipliers
        self.seasonal_multipliers = {
            1: 1.2, 2: 1.1, 3: 1.0,  # Winter
            4: 0.9, 5: 0.9, 6: 1.1,  # Spring
            7: 1.2, 8: 1.3, 9: 1.1,  # Summer
            10: 0.9, 11: 1.0, 12: 1.1,  # Fall
        }
        
        # Renewable energy percentage by hour (simulated)
        self.renewable_percentage = {
            0: 35, 1: 35, 2: 35, 3: 35, 4: 35, 5: 35,
            6: 30, 7: 30, 8: 35, 9: 40, 10: 45, 11: 50,
            12: 55, 13: 60, 14: 60, 15: 55, 16: 50, 17: 45,
            18: 40, 19: 35, 20: 30, 21: 30, 22: 35, 23: 35,
        }
    
    def predict_price(self, target_time: datetime) -> Dict[str, float]:
        """
        Predict energy price at a specific time
        """
        hour = target_time.hour
        day_of_week = target_time.weekday()
        month = target_time.month
        
        # Calculate base price for this hour
        base_price = self.base_prices[hour]
        
        # Apply multipliers
        day_factor = self.day_multipliers[day_of_week]
        seasonal_factor = self.seasonal_multipliers[month]
        
        # Calculate final price
        price = base_price * day_factor * seasonal_factor
        
        # Add some randomness to the prediction (±5%)
        randomness = 1.0 + ((np.random.random() - 0.5) * 0.1)
        price *= randomness
        
        # Get renewable percentage with some variability
        renewable_base = self.renewable_percentage[hour]
        renewable = renewable_base + ((np.random.random() - 0.5) * 10)
        renewable = max(20, min(75, renewable))
        
        return {
            "price": round(price, 4),
            "renewable_percentage": round(renewable, 1)
        }
    
    def get_price_forecast(
        self, 
        start_time: datetime, 
        end_time: datetime, 
        interval_minutes: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Get price forecast for a time window with specified intervals
        """
        forecast = []
        current_time = start_time
        
        while current_time <= end_time:
            prediction = self.predict_price(current_time)
            forecast.append({
                "timestamp": current_time.isoformat(),
                "price": prediction["price"],
                "renewable_percentage": prediction["renewable_percentage"]
            })
            
            current_time += timedelta(minutes=interval_minutes)
        
        return forecast

class ChargingOptimizer:
    """
    Optimizes EV charging schedule based on energy prices and constraints
    """
    def __init__(self):
        self.price_predictor = EnergyPricePredictor()
    
    def optimize_charging(
        self,
        battery_params: BatteryParameters,
        constraints: ChargingConstraints,
        max_charging_power: float
    ) -> ChargingOptimizationResponse:
        """
        Generate optimized charging schedule
        """
        # Get price forecast for the available window
        forecast = self.price_predictor.get_price_forecast(
            constraints.plugin_time,
            constraints.departure_time,
            interval_minutes=15
        )
        
        # Calculate energy needed to reach target SoC
        energy_needed_kwh = (battery_params.target_soc - battery_params.current_soc) / 100 * battery_params.capacity
        
        # Calculate charging parameters
        time_available_minutes = (constraints.departure_time - constraints.plugin_time).total_seconds() / 60
        min_charging_minutes = (energy_needed_kwh / max_charging_power) * 60
        
        if min_charging_minutes > time_available_minutes:
            raise ValueError(f"Not enough time to reach target SoC. Need {min_charging_minutes} minutes, have {time_available_minutes} minutes")
        
        # Perform optimization using price forecast
        # For each 15-minute interval, decide charging power (0 or max)
        charging_schedule = self._optimize_schedule(
            forecast,
            energy_needed_kwh,
            max_charging_power,
            battery_params.current_soc,
            battery_params.capacity,
            constraints
        )
        
        # Calculate total cost and other metrics
        total_cost = sum(p["energy_kwh"] * p["price"] for p in charging_schedule)
        total_energy = sum(p["energy_kwh"] for p in charging_schedule)
        total_duration_minutes = len([p for p in charging_schedule if p["charging_power"] > 0]) * 15
        
        # Calculate reference cost (charging at arrival)
        reference_cost = self._calculate_reference_cost(
            forecast[:int(min_charging_minutes / 15)],
            energy_needed_kwh,
            max_charging_power
        )
        
        savings_percent = ((reference_cost - total_cost) / reference_cost) * 100 if reference_cost > 0 else 0
        
        # Format the response
        schedule_points = []
        current_soc = battery_params.current_soc
        
        for point in charging_schedule:
            soc_delta = (point["energy_kwh"] / battery_params.capacity) * 100
            current_soc += soc_delta
            
            schedule_points.append(ChargingSchedulePoint(
                timestamp=point["timestamp"],
                charging_power=point["charging_power"],
                price=point["price"],
                renewable_percentage=point["renewable_percentage"],
                expected_soc=round(current_soc, 2),
                energy_kwh=round(point["energy_kwh"], 3)
            ))
        
        return ChargingOptimizationResponse(
            schedule=schedule_points,
            total_cost=round(total_cost, 2),
            total_energy_kwh=round(total_energy, 2),
            cost_savings_percent=round(savings_percent, 1),
            total_duration_minutes=total_duration_minutes,
            optimal_plugin_time=constraints.plugin_time.isoformat(),
            optimal_start_time=next((p["timestamp"] for p in charging_schedule if p["charging_power"] > 0), constraints.plugin_time.isoformat())
        )
    
    def _optimize_schedule(
        self,
        forecast: List[Dict[str, Any]],
        energy_needed_kwh: float,
        max_charging_power: float,
        initial_soc: float,
        battery_capacity: float,
        constraints: ChargingConstraints
    ) -> List[Dict[str, Any]]:
        """
        Optimize the charging schedule using a dynamic programming approach
        """
        # Energy that can be added in one interval (15 minutes)
        kwh_per_interval = (max_charging_power * 15) / 60
        
        # How many intervals we need to charge at max power
        intervals_needed = math.ceil(energy_needed_kwh / kwh_per_interval)
        
        if intervals_needed > len(forecast):
            # Not enough time, need to charge continuously
            return self._continuous_charging_schedule(forecast, energy_needed_kwh, max_charging_power)
        
        # Sort intervals by price (cheapest first)
        sorted_intervals = sorted(forecast, key=lambda x: x["price"])
        
        # Select the cheapest intervals
        selected_intervals = sorted_intervals[:intervals_needed]
        
        # Create a map of selected timestamps
        selected_timestamps = {interval["timestamp"] for interval in selected_intervals}
        
        # Create the schedule in chronological order
        schedule = []
        remaining_energy = energy_needed_kwh
        
        for interval in forecast:
            is_charging = interval["timestamp"] in selected_timestamps and remaining_energy > 0
            
            if is_charging:
                # Energy to add in this interval
                energy_to_add = min(kwh_per_interval, remaining_energy)
                remaining_energy -= energy_to_add
                charging_power = max_charging_power
            else:
                energy_to_add = 0
                charging_power = 0
            
            schedule.append({
                "timestamp": interval["timestamp"],
                "charging_power": charging_power,
                "energy_kwh": energy_to_add,
                "price": interval["price"],
                "renewable_percentage": interval["renewable_percentage"]
            })
        
        # Verify if optimization meets constraints
        final_schedule = self._verify_and_adjust_schedule(
            schedule, 
            energy_needed_kwh, 
            initial_soc, 
            battery_capacity, 
            constraints
        )
        
        return final_schedule
    
    def _verify_and_adjust_schedule(
        self,
        schedule: List[Dict[str, Any]],
        energy_needed_kwh: float,
        initial_soc: float,
        battery_capacity: float,
        constraints: ChargingConstraints
    ) -> List[Dict[str, Any]]:
        """
        Verify the schedule meets minimum SoC constraints and adjust if needed
        """
        # Check if minimum SoC constraint exists
        if constraints.minimum_soc is None:
            return schedule
        
        adjusted_schedule = schedule.copy()
        current_soc = initial_soc
        
        # Keep track of required charging to meet min SoC
        for i, interval in enumerate(adjusted_schedule):
            # Update SoC based on energy added
            soc_delta = (interval["energy_kwh"] / battery_capacity) * 100
            current_soc += soc_delta
            
            # If we dip below minimum SoC in the next interval, charge in this one
            next_index = i + 1
            if next_index < len(adjusted_schedule) and constraints.minimum_soc is not None:
                next_interval = adjusted_schedule[next_index]
                
                # Check if next interval is not charging and would keep us below min SoC
                if next_interval["charging_power"] == 0 and current_soc < constraints.minimum_soc:
                    # Force charging in this interval to reach minimum SoC
                    energy_to_add = ((constraints.minimum_soc - current_soc) / 100) * battery_capacity
                    kwh_per_interval = (adjusted_schedule[i]["charging_power"] * 15) / 60
                    
                    # Update this interval
                    adjusted_schedule[i]["energy_kwh"] += energy_to_add
                    adjusted_schedule[i]["charging_power"] = adjusted_schedule[i]["charging_power"]
                    
                    # Update current SoC
                    current_soc += (energy_to_add / battery_capacity) * 100
        
        return adjusted_schedule
    
    def _continuous_charging_schedule(
        self,
        forecast: List[Dict[str, Any]],
        energy_needed_kwh: float,
        max_charging_power: float
    ) -> List[Dict[str, Any]]:
        """
        Create a continuous charging schedule when time is limited
        """
        schedule = []
        remaining_energy = energy_needed_kwh
        
        for interval in forecast:
            # Energy to add in this interval (15 minutes)
            kwh_per_interval = (max_charging_power * 15) / 60
            
            if remaining_energy > 0:
                energy_to_add = min(kwh_per_interval, remaining_energy)
                charging_power = (energy_to_add * 60) / 15  # Convert back to kW
                remaining_energy -= energy_to_add
            else:
                energy_to_add = 0
                charging_power = 0
            
            schedule.append({
                "timestamp": interval["timestamp"],
                "charging_power": charging_power,
                "energy_kwh": energy_to_add,
                "price": interval["price"],
                "renewable_percentage": interval["renewable_percentage"]
            })
        
        return schedule
    
    def _calculate_reference_cost(
        self,
        forecast: List[Dict[str, Any]],
        energy_needed_kwh: float,
        max_charging_power: float
    ) -> float:
        """
        Calculate the cost of charging immediately without optimization
        """
        total_cost = 0
        remaining_energy = energy_needed_kwh
        
        for interval in forecast:
            if remaining_energy <= 0:
                break
                
            # Energy to add in this interval (15 minutes)
            kwh_per_interval = (max_charging_power * 15) / 60
            energy_to_add = min(kwh_per_interval, remaining_energy)
            
            total_cost += energy_to_add * interval["price"]
            remaining_energy -= energy_to_add
        
        return total_cost

# Create optimizer instance
charging_optimizer = ChargingOptimizer()

@router.post("/", response_model=ChargingOptimizationResponse)
async def optimize_charging(
    *,
    db: Session = Depends(get_db),
    optimization_request: ChargingOptimizationRequest,
    current_user: User = Depends(get_current_active_user),
):
    """
    Optimize charging schedule based on energy prices, vehicle parameters, and user constraints
    """
    try:
        # Verify the vehicle exists and user has access
        vehicle = db.query(Vehicle).filter(Vehicle.id == optimization_request.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Check if the user has access to this vehicle
        if not current_user.is_superuser and vehicle.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to access this vehicle"
            )
        
        # Verify the charging station exists
        station = db.query(ChargingStation).filter(
            ChargingStation.id == optimization_request.station_id
        ).first()
        if not station:
            raise HTTPException(status_code=404, detail="Charging station not found")
        
        # Check if the station belongs to user's organization or is public
        if not station.is_public and station.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to access this charging station"
            )
        
        # Get available connectors at the station
        connectors = db.query(ChargingConnector).filter(
            ChargingConnector.charging_station_id == station.id
        ).all()
        
        if not connectors:
            raise HTTPException(status_code=404, detail="No connectors available at this station")
        
        # Find the maximum charging power available
        max_charging_power = max([c.power_kw for c in connectors])
        
        # Limit to user-specified max charging power if provided
        if optimization_request.max_charging_power_kw:
            max_charging_power = min(max_charging_power, optimization_request.max_charging_power_kw)
        
        # Set default departure time if not provided (8 hours from now)
        departure_time = optimization_request.departure_time or (datetime.now() + timedelta(hours=8))
        
        # Set default plugin time to now if not provided
        plugin_time = optimization_request.plugin_time or datetime.now()
        
        # Prepare battery parameters
        battery_params = BatteryParameters(
            current_soc=optimization_request.current_soc,
            target_soc=optimization_request.target_soc,
            capacity=vehicle.battery_capacity_kwh
        )
        
        # Prepare charging constraints
        constraints = ChargingConstraints(
            plugin_time=plugin_time,
            departure_time=departure_time,
            minimum_soc=optimization_request.minimum_soc,
            prioritize_battery_health=optimization_request.prioritize_battery_health,
            prioritize_renewable=optimization_request.prioritize_renewable
        )
        
        # Generate optimized charging schedule
        optimized_schedule = charging_optimizer.optimize_charging(
            battery_params,
            constraints,
            max_charging_power
        )
        
        return optimized_schedule
        
    except ValueError as e:
        logger.warning(f"Validation error in charging optimization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error optimizing charging schedule: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error optimizing charging schedule"
        ) 