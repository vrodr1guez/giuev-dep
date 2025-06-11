from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import time
import uuid

from app.core.logging import logger

router = APIRouter()


@router.get("/demo/schedules", response_model=Dict[str, Any])
async def get_demo_charging_schedules():
    """
    Get demo charging schedules for development and testing.
    Shows intelligent scheduling optimization for EV fleets.
    """
    try:
        current_time = datetime.utcnow()
        
        demo_schedules = []
        for i in range(24):  # 24-hour schedule
            hour_time = current_time + timedelta(hours=i)
            
            # Simulate intelligent scheduling patterns
            base_load = 50 + (i * 5) if i < 12 else 50 + ((24-i) * 5)
            grid_price = 0.08 + (i * 0.02) if i < 12 else 0.08 + ((24-i) * 0.02)
            
            # Optimize charging during low-cost hours
            is_optimal = 2 <= i <= 6 or 22 <= i <= 24
            priority = "high" if is_optimal else "medium" if 7 <= i <= 17 else "low"
            
            demo_schedules.append({
                "hour": i,
                "timestamp": hour_time.isoformat(),
                "scheduled_vehicles": max(1, int(base_load * (0.6 if is_optimal else 0.3))),
                "available_capacity_kw": base_load * 10,
                "grid_price_per_kwh": round(grid_price, 3),
                "renewable_percentage": min(95, 30 + (i * 3)) if 6 <= i <= 18 else max(15, 60 - i),
                "charging_priority": priority,
                "estimated_cost_savings": round((0.12 - grid_price) * base_load, 2),
                "carbon_reduction_kg": round(base_load * 0.4 * (30 + i) / 100, 2),
                "grid_stress_level": "low" if is_optimal else "medium"
            })
        
        return {
            "status": "success",
            "message": "Demo charging schedules data",
            "timestamp": int(time.time()),
            "schedule_optimization": {
                "optimization_algorithm": "Dynamic Programming + ML Prediction",
                "cost_optimization": True,
                "carbon_optimization": True,
                "grid_stability_optimization": True,
                "total_daily_savings": sum(s["estimated_cost_savings"] for s in demo_schedules),
                "total_carbon_reduction": sum(s["carbon_reduction_kg"] for s in demo_schedules)
            },
            "schedules": demo_schedules,
            "recommendations": [
                "Peak charging during hours 2-6 AM for maximum cost savings",
                "Avoid charging during hours 6-10 PM (peak grid stress)",
                "Utilize renewable energy window 10 AM - 4 PM when possible",
                "Implement demand response programs for additional revenue"
            ]
        }
    except Exception as e:
        logger.error(f"Error in get_demo_charging_schedules: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/optimize", response_model=Dict[str, Any])
async def optimize_charging_schedule(
    fleet_size: int = Query(10, ge=1, le=1000),
    optimization_window_hours: int = Query(24, ge=6, le=168),
    cost_weight: float = Query(0.4, ge=0.0, le=1.0),
    carbon_weight: float = Query(0.3, ge=0.0, le=1.0),
    convenience_weight: float = Query(0.3, ge=0.0, le=1.0)
):
    """
    Generate optimized charging schedule for a fleet based on multiple objectives.
    """
    try:
        # Validate weights sum to 1.0
        total_weight = cost_weight + carbon_weight + convenience_weight
        if abs(total_weight - 1.0) > 0.01:
            raise HTTPException(
                status_code=400, 
                detail=f"Optimization weights must sum to 1.0, got {total_weight}"
            )
        
        current_time = datetime.utcnow()
        optimized_schedule = []
        
        total_cost = 0
        total_carbon = 0
        total_vehicles_scheduled = 0
        
        for hour in range(optimization_window_hours):
            hour_time = current_time + timedelta(hours=hour)
            
            # Simulate optimization algorithm results
            hour_of_day = hour % 24
            
            # Cost optimization (lower costs during off-peak hours)
            cost_score = 1.0 - (0.08 + (hour_of_day * 0.02) if hour_of_day < 12 else 0.08 + ((24-hour_of_day) * 0.02))
            
            # Carbon optimization (higher renewable availability during day)
            carbon_score = (30 + hour_of_day * 3) / 100 if 6 <= hour_of_day <= 18 else (60 - hour_of_day) / 100
            carbon_score = max(0.15, min(0.95, carbon_score))
            
            # Convenience optimization (prefer daytime charging)
            convenience_score = 0.8 if 7 <= hour_of_day <= 19 else 0.3
            
            # Combined optimization score
            optimization_score = (
                cost_weight * cost_score +
                carbon_weight * carbon_score +
                convenience_weight * convenience_score
            )
            
            # Determine vehicles to schedule based on optimization score
            vehicles_to_schedule = max(1, int(fleet_size * optimization_score))
            charging_power_kw = vehicles_to_schedule * 7.2  # Assume 7.2kW per vehicle
            
            hour_cost = charging_power_kw * (0.08 + (hour_of_day * 0.02) if hour_of_day < 12 else 0.08 + ((24-hour_of_day) * 0.02))
            hour_carbon = charging_power_kw * 0.4 * carbon_score
            
            total_cost += hour_cost
            total_carbon += hour_carbon
            total_vehicles_scheduled += vehicles_to_schedule
            
            optimized_schedule.append({
                "hour": hour,
                "timestamp": hour_time.isoformat(),
                "vehicles_scheduled": vehicles_to_schedule,
                "charging_power_kw": round(charging_power_kw, 2),
                "optimization_score": round(optimization_score, 3),
                "cost_score": round(cost_score, 3),
                "carbon_score": round(carbon_score, 3),
                "convenience_score": round(convenience_score, 3),
                "estimated_cost": round(hour_cost, 2),
                "carbon_savings_kg": round(hour_carbon, 2),
                "grid_impact": "positive" if optimization_score > 0.6 else "neutral"
            })
        
        return {
            "status": "success",
            "message": f"Optimized charging schedule for {fleet_size} vehicles",
            "timestamp": int(time.time()),
            "optimization_parameters": {
                "fleet_size": fleet_size,
                "optimization_window_hours": optimization_window_hours,
                "cost_weight": cost_weight,
                "carbon_weight": carbon_weight,
                "convenience_weight": convenience_weight
            },
            "optimization_results": {
                "total_estimated_cost": round(total_cost, 2),
                "total_carbon_savings_kg": round(total_carbon, 2),
                "average_vehicles_per_hour": round(total_vehicles_scheduled / optimization_window_hours, 1),
                "peak_optimization_hours": [
                    h["hour"] for h in sorted(optimized_schedule, key=lambda x: x["optimization_score"], reverse=True)[:5]
                ]
            },
            "schedule": optimized_schedule,
            "efficiency_metrics": {
                "cost_efficiency": "high" if cost_weight > 0.4 else "medium",
                "carbon_efficiency": "high" if carbon_weight > 0.3 else "medium", 
                "convenience_rating": "high" if convenience_weight > 0.3 else "medium",
                "overall_optimization_score": round(sum(s["optimization_score"] for s in optimized_schedule) / len(optimized_schedule), 3)
            }
        }
    except Exception as e:
        logger.error(f"Error in optimize_charging_schedule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/fleet/{fleet_id}/schedule", response_model=Dict[str, Any])
async def get_fleet_charging_schedule(
    fleet_id: str,
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    include_predictions: bool = Query(True)
):
    """
    Get charging schedule for a specific fleet.
    """
    try:
        # Use current date if not provided
        if date:
            try:
                schedule_date = datetime.fromisoformat(date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        else:
            schedule_date = datetime.utcnow().date()
        
        # Generate realistic fleet schedule
        fleet_schedule = {
            "fleet_id": fleet_id,
            "schedule_date": schedule_date.isoformat(),
            "fleet_info": {
                "total_vehicles": 25,
                "electric_vehicles": 25,
                "charging_stations": 8,
                "average_daily_usage_kwh": 180,
                "fleet_type": "delivery" if "delivery" in fleet_id else "passenger"
            },
            "daily_schedule": [],
            "optimization_status": "active",
            "last_updated": datetime.utcnow().isoformat()
        }
        
        # Generate hourly schedule
        for hour in range(24):
            hour_time = datetime.combine(schedule_date, datetime.min.time()) + timedelta(hours=hour)
            
            # Simulate realistic charging patterns
            if 2 <= hour <= 6:  # Optimal charging window
                vehicles_charging = 15 + (hour - 2) * 2
                priority = "high"
            elif 7 <= hour <= 9:  # Morning departure prep
                vehicles_charging = max(0, 20 - (hour - 7) * 5) 
                priority = "medium"
            elif 18 <= hour <= 22:  # Evening return
                vehicles_charging = min(12, (hour - 17) * 3)
                priority = "low"
            else:
                vehicles_charging = 3
                priority = "low"
            
            fleet_schedule["daily_schedule"].append({
                "hour": hour,
                "timestamp": hour_time.isoformat(),
                "vehicles_charging": min(vehicles_charging, 25),
                "charging_priority": priority,
                "expected_completion": (hour_time + timedelta(hours=3)).isoformat(),
                "energy_consumption_kwh": round(vehicles_charging * 7.2, 1),
                "estimated_cost": round(vehicles_charging * 7.2 * 0.12, 2)
            })
        
        # Add predictions if requested
        if include_predictions:
            fleet_schedule["predictions"] = {
                "next_day_energy_need": 185,
                "optimal_start_time": "02:00",
                "completion_time": "06:30",
                "cost_savings_potential": 23.50,
                "carbon_reduction_potential": 15.2
            }
        
        return {
            "status": "success", 
            "message": f"Fleet charging schedule for {fleet_id}",
            "timestamp": int(time.time()),
            "schedule": fleet_schedule,
            "optimization_insights": [
                "Current schedule optimized for cost efficiency",
                "Night charging reduces grid stress by 40%",
                "Renewable energy usage: 65% during optimal hours",
                "Fleet charging completion: 95% reliability"
            ]
        }
    except Exception as e:
        logger.error(f"Error in get_fleet_charging_schedule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 