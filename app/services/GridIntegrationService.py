"""
Grid Integration Service

Handles integration between EV battery systems and power grid,
including V2G (Vehicle-to-Grid) capabilities, demand response,
and grid stability support.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from app.services.TelemetryDataService import get_telemetry_processor
from app.services.EnhancedBatteryHealthPredictor import get_enhanced_battery_predictor

logger = logging.getLogger(__name__)

class GridIntegrationService:
    """Service to manage EV-grid integration capabilities"""
    
    def __init__(self):
        # Initialize connections to grid management services
        self._grid_api_configs = {
            "utility_api": {
                "base_url": "https://api.utilitycompany.com/v1",
                "api_key": "utility_api_key_placeholder"
            },
            "grid_operator": {
                "base_url": "https://gridoperator.com/api",
                "api_key": "grid_operator_key_placeholder"
            },
            "energy_market": {
                "base_url": "https://energymarket.com/api/v2",
                "api_key": "energy_market_key_placeholder"
            }
        }
        
        # Get telemetry and battery health services
        self.telemetry_processor = get_telemetry_processor()
        self.battery_predictor = get_enhanced_battery_predictor()
        
        # Grid price and demand data cache
        self._price_cache = {}
        self._demand_cache = {}
        self._last_cache_update = None
    
    async def get_grid_status(self) -> Dict[str, Any]:
        """Get current grid status including demand, capacity, and pricing"""
        try:
            # In a real implementation, this would make API calls to grid operator
            # For demo purposes, we'll generate synthetic data
            
            # Update cache if needed
            await self._update_cache_if_needed()
            
            current_time = datetime.now()
            hour_key = current_time.strftime("%Y-%m-%d %H:00")
            
            # Get data from cache or generate if not available
            if hour_key in self._price_cache:
                price = self._price_cache[hour_key]
                demand = self._demand_cache[hour_key]
            else:
                # Generate synthetic data if not in cache
                price = 0.10 + 0.05 * np.random.random()  # $0.10-0.15 per kWh
                
                # Higher demand during peak hours (8-10am, 6-8pm)
                hour = current_time.hour
                if (8 <= hour <= 10) or (18 <= hour <= 20):
                    demand_factor = 0.8 + 0.2 * np.random.random()  # 80-100% of capacity
                else:
                    demand_factor = 0.4 + 0.3 * np.random.random()  # 40-70% of capacity
                
                demand = demand_factor * 100  # Percentage of capacity
                
                # Update cache
                self._price_cache[hour_key] = price
                self._demand_cache[hour_key] = demand
            
            # Determine if grid is under stress
            grid_stress = "high" if demand > 80 else "medium" if demand > 60 else "low"
            
            # V2G opportunity is higher when grid stress is higher or price is higher
            v2g_opportunity = "high" if (grid_stress == "high" or price > 0.13) else "medium" if (grid_stress == "medium" or price > 0.11) else "low"
            
            return {
                "timestamp": current_time.isoformat(),
                "grid_status": {
                    "demand_percentage": round(demand, 1),
                    "capacity_available": 100 - round(demand, 1),
                    "grid_stress_level": grid_stress,
                    "current_price_kwh": round(price, 4),
                    "price_tier": "peak" if price > 0.13 else "mid" if price > 0.11 else "off-peak"
                },
                "v2g_opportunity": {
                    "level": v2g_opportunity,
                    "estimated_return_per_kwh": round(price * 0.9, 4) if v2g_opportunity == "high" else round(price * 0.7, 4),
                    "recommended_action": "discharge" if v2g_opportunity == "high" else "standby" if v2g_opportunity == "medium" else "charge"
                }
            }
        except Exception as e:
            logger.exception(f"Error getting grid status: {str(e)}")
            return {
                "timestamp": datetime.now().isoformat(),
                "grid_status": {
                    "demand_percentage": 50.0,
                    "capacity_available": 50.0,
                    "grid_stress_level": "medium",
                    "current_price_kwh": 0.12,
                    "price_tier": "mid"
                },
                "v2g_opportunity": {
                    "level": "medium",
                    "estimated_return_per_kwh": 0.084,
                    "recommended_action": "standby"
                },
                "error": str(e)
            }
    
    async def _update_cache_if_needed(self):
        """Update the cache if it's old or missing"""
        current_time = datetime.now()
        
        if not self._last_cache_update or (current_time - self._last_cache_update) > timedelta(minutes=15):
            # In a real implementation, this would fetch real data from APIs
            # For demo purposes, generate 24 hours of synthetic data
            
            base_date = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
            
            for hour in range(24):
                hour_time = base_date + timedelta(hours=hour)
                hour_key = hour_time.strftime("%Y-%m-%d %H:00")
                
                # Generate price based on time of day (higher during peak hours)
                if (8 <= hour <= 10) or (18 <= hour <= 20):  # Peak hours
                    price = 0.13 + 0.02 * np.random.random()
                elif (7 <= hour <= 12) or (17 <= hour <= 22):  # Mid-peak
                    price = 0.11 + 0.02 * np.random.random()
                else:  # Off-peak
                    price = 0.08 + 0.02 * np.random.random()
                
                # Generate demand based on time of day
                if (8 <= hour <= 10):  # Morning peak
                    demand = 75 + 15 * np.random.random()
                elif (18 <= hour <= 20):  # Evening peak
                    demand = 85 + 15 * np.random.random()
                elif (23 <= hour <= 5):  # Night (low demand)
                    demand = 30 + 10 * np.random.random()
                else:  # Regular hours
                    demand = 50 + 20 * np.random.random()
                
                # Update caches
                self._price_cache[hour_key] = price
                self._demand_cache[hour_key] = demand
            
            self._last_cache_update = current_time
    
    async def get_price_forecast(self, hours_ahead: int = 24) -> Dict[str, Any]:
        """Get energy price forecast for the specified number of hours ahead"""
        try:
            # Update cache if needed
            await self._update_cache_if_needed()
            
            current_time = datetime.now()
            base_hour = current_time.replace(minute=0, second=0, microsecond=0)
            
            forecast_data = []
            for hour in range(hours_ahead):
                forecast_time = base_hour + timedelta(hours=hour)
                hour_key = forecast_time.strftime("%Y-%m-%d %H:00")
                
                # Get price from cache or generate if not available
                if hour_key in self._price_cache:
                    price = self._price_cache[hour_key]
                else:
                    # Generate synthetic price if not in cache
                    forecast_hour = forecast_time.hour
                    if (8 <= forecast_hour <= 10) or (18 <= forecast_hour <= 20):  # Peak
                        price = 0.13 + 0.02 * np.random.random()
                    elif (7 <= forecast_hour <= 12) or (17 <= forecast_hour <= 22):  # Mid
                        price = 0.11 + 0.02 * np.random.random()
                    else:  # Off-peak
                        price = 0.08 + 0.02 * np.random.random()
                    
                    # Store in cache
                    self._price_cache[hour_key] = price
                
                # Determine price tier
                price_tier = "peak" if price > 0.13 else "mid" if price > 0.11 else "off-peak"
                
                # Add to forecast data
                forecast_data.append({
                    "timestamp": forecast_time.isoformat(),
                    "price_kwh": round(price, 4),
                    "price_tier": price_tier
                })
            
            return {
                "generated_at": current_time.isoformat(),
                "forecast": forecast_data
            }
        except Exception as e:
            logger.exception(f"Error getting price forecast: {str(e)}")
            return {
                "generated_at": datetime.now().isoformat(),
                "forecast": [],
                "error": str(e)
            }
    
    async def calculate_v2g_potential(self, vehicle_id: str, discharge_limit_pct: int = 30) -> Dict[str, Any]:
        """
        Calculate the V2G (Vehicle-to-Grid) potential for a specific vehicle
        
        Args:
            vehicle_id: Vehicle identifier
            discharge_limit_pct: Maximum battery discharge percentage (e.g. 30% means don't go below 30% SoC)
            
        Returns:
            Dict with V2G potential data
        """
        try:
            # Get vehicle's battery telemetry data (most recent)
            # In a real implementation, this would query the actual database
            vehicle_data = {
                "v1": {"capacity": 75.0, "soc": 85, "chemistry": "NMC"},
                "v2": {"capacity": 131.0, "soc": 72, "chemistry": "LFP"},
                "v3": {"capacity": 65.0, "soc": 92, "chemistry": "NMC"},
                "v4": {"capacity": 135.0, "soc": 67, "chemistry": "NCA"},
                "v5": {"capacity": 77.0, "soc": 54, "chemistry": "NMC"}
            }.get(vehicle_id, {"capacity": 75.0, "soc": 80, "chemistry": "NMC"})
            
            # Get current grid status for price information
            grid_status = await self.get_grid_status()
            current_price = grid_status["grid_status"]["current_price_kwh"]
            
            # Calculate available energy for V2G
            current_soc = vehicle_data["soc"]
            available_pct = max(0, current_soc - discharge_limit_pct)
            available_kwh = (available_pct / 100) * vehicle_data["capacity"]
            
            # Calculate potential earnings based on current price
            earnings_potential = available_kwh * current_price * 0.9  # 90% of retail price
            
            # Calculate carbon offset (rough estimate: 0.4 kg CO2 per kWh for grid electricity)
            carbon_offset_kg = available_kwh * 0.4
            
            # Get grid stress level to determine V2G priority
            grid_stress = grid_status["grid_status"]["grid_stress_level"]
            
            # Calculate V2G priority score (0-100)
            if grid_stress == "high":
                priority_score = 80 + 20 * (available_kwh / vehicle_data["capacity"])
            elif grid_stress == "medium":
                priority_score = 50 + 30 * (available_kwh / vehicle_data["capacity"])
            else:
                priority_score = 30 * (available_kwh / vehicle_data["capacity"])
            
            # Determine impact on battery health based on chemistry
            chemistry = vehicle_data["chemistry"]
            if chemistry == "LFP":
                # LFP batteries have minimal V2G impact
                health_impact = "minimal"
                health_impact_pct = 0.001 * available_pct
            elif chemistry == "NCA":
                # NCA batteries have higher V2G impact
                health_impact = "moderate"
                health_impact_pct = 0.004 * available_pct
            else:  # NMC default
                health_impact = "low"
                health_impact_pct = 0.002 * available_pct
            
            return {
                "vehicle_id": vehicle_id,
                "timestamp": datetime.now().isoformat(),
                "v2g_potential": {
                    "available_energy_kwh": round(available_kwh, 2),
                    "available_percentage": available_pct,
                    "earnings_potential": round(earnings_potential, 2),
                    "carbon_offset_kg": round(carbon_offset_kg, 2)
                },
                "grid_contribution": {
                    "grid_stress_level": grid_stress,
                    "priority_score": round(priority_score, 1),
                    "recommended_action": 
                        "discharge_full" if priority_score > 80 else
                        "discharge_partial" if priority_score > 50 else
                        "standby"
                },
                "battery_impact": {
                    "chemistry": chemistry,
                    "health_impact_level": health_impact,
                    "estimated_health_impact_pct": round(health_impact_pct, 3)
                },
                "price_data": {
                    "current_price_kwh": current_price,
                    "compensation_rate_kwh": round(current_price * 0.9, 4)
                }
            }
        except Exception as e:
            logger.exception(f"Error calculating V2G potential: {str(e)}")
            return {
                "vehicle_id": vehicle_id,
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
    
    async def get_fleet_grid_impact(self, vehicle_ids: List[str]) -> Dict[str, Any]:
        """
        Calculate the potential grid impact of an entire fleet
        
        Args:
            vehicle_ids: List of vehicle identifiers
            
        Returns:
            Dict with fleet grid impact data
        """
        try:
            # Calculate V2G potential for each vehicle
            v2g_potentials = []
            for vehicle_id in vehicle_ids:
                potential = await self.calculate_v2g_potential(vehicle_id)
                v2g_potentials.append(potential)
            
            # Sum up total available energy
            total_available_kwh = sum(p["v2g_potential"]["available_energy_kwh"] 
                                    for p in v2g_potentials if "v2g_potential" in p)
            
            # Sum up total earnings potential
            total_earnings = sum(p["v2g_potential"]["earnings_potential"] 
                               for p in v2g_potentials if "v2g_potential" in p)
            
            # Sum up total carbon offset
            total_carbon_offset = sum(p["v2g_potential"]["carbon_offset_kg"] 
                                    for p in v2g_potentials if "v2g_potential" in p)
            
            # Get grid status
            grid_status = await self.get_grid_status()
            grid_capacity = grid_status["grid_status"]["capacity_available"]
            
            # Calculate grid impact percentage (rough estimate)
            # Assuming 1MW = 1000kW of grid capacity per percentage point
            grid_impact_pct = (total_available_kwh / 1000) * (100 / grid_capacity) if grid_capacity > 0 else 0
            
            # Count vehicles by recommended action
            action_counts = {}
            for p in v2g_potentials:
                if "grid_contribution" in p:
                    action = p["grid_contribution"]["recommended_action"]
                    action_counts[action] = action_counts.get(action, 0) + 1
            
            return {
                "timestamp": datetime.now().isoformat(),
                "fleet_size": len(vehicle_ids),
                "grid_contribution": {
                    "total_available_energy_kwh": round(total_available_kwh, 2),
                    "grid_impact_percentage": round(min(grid_impact_pct, 100), 2),
                    "total_earnings_potential": round(total_earnings, 2),
                    "total_carbon_offset_kg": round(total_carbon_offset, 2)
                },
                "recommended_actions": action_counts,
                "grid_status": grid_status["grid_status"],
                "detailed_vehicles": v2g_potentials
            }
        except Exception as e:
            logger.exception(f"Error calculating fleet grid impact: {str(e)}")
            return {
                "timestamp": datetime.now().isoformat(),
                "fleet_size": len(vehicle_ids),
                "error": str(e)
            }

# Singleton instance
_grid_integration_service = None

def get_grid_integration_service() -> GridIntegrationService:
    """Get the grid integration service instance"""
    global _grid_integration_service
    if _grid_integration_service is None:
        _grid_integration_service = GridIntegrationService()
    return _grid_integration_service 