from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, cast, Float, extract
from datetime import datetime, timedelta
import math
import logging
import random
import json

from app.db.session import get_db
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.charging_station import ChargingSession, ChargingStation, ChargingConnector
from app.core.logging import logger

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/charging-summary")
async def get_charging_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    organization_id: Optional[int] = None,
    fleet_id: Optional[int] = None,
):
    """
    Get a summary of charging statistics.
    
    This endpoint provides aggregate statistics about charging sessions,
    including total energy delivered, average session duration, and cost metrics.
    """
    try:
        # Default date range: last 30 days
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        # Filter query by organization access
        if not current_user.is_superuser:
            # Regular users can only access their organization's data
            organization_id = current_user.organization_id
        
        # Base query filters
        base_filters = [
            ChargingSession.start_time >= start_date,
            ChargingSession.start_time <= end_date,
            ChargingSession.is_completed == True,
        ]
        
        # Add organization filter if specified
        if organization_id:
            base_filters.append(Vehicle.organization_id == organization_id)
        
        # Add fleet filter if specified
        if fleet_id:
            base_filters.append(Vehicle.fleet_id == fleet_id)
        
        # Query for total energy delivered
        energy_query = (
            db.query(func.sum(ChargingSession.energy_delivered_kwh).label("total_energy_kwh"))
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
        )
        
        energy_result = energy_query.first()
        total_energy_kwh = energy_result.total_energy_kwh if energy_result and energy_result.total_energy_kwh else 0
        
        # Query for total cost
        cost_query = (
            db.query(func.sum(ChargingSession.total_cost).label("total_cost"))
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
        )
        
        cost_result = cost_query.first()
        total_cost = cost_result.total_cost if cost_result and cost_result.total_cost else 0
        
        # Query for average cost per kWh
        avg_cost_query = (
            db.query(
                (func.sum(ChargingSession.total_cost) / func.sum(ChargingSession.energy_delivered_kwh))
                .label("avg_cost_per_kwh")
            )
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
            .filter(ChargingSession.energy_delivered_kwh > 0)  # Avoid division by zero
        )
        
        avg_cost_result = avg_cost_query.first()
        avg_cost_per_kwh = (
            avg_cost_result.avg_cost_per_kwh 
            if avg_cost_result and avg_cost_result.avg_cost_per_kwh 
            else 0
        )
        
        # Query for session counts
        session_count_query = (
            db.query(func.count(ChargingSession.id).label("session_count"))
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
        )
        
        session_count_result = session_count_query.first()
        session_count = (
            session_count_result.session_count 
            if session_count_result 
            else 0
        )
        
        # Query for average session duration
        duration_query = (
            db.query(
                func.avg(
                    func.extract('epoch', ChargingSession.end_time) - 
                    func.extract('epoch', ChargingSession.start_time)
                ).label("avg_duration_seconds")
            )
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
            .filter(ChargingSession.end_time != None)  # Ensure end time exists
        )
        
        duration_result = duration_query.first()
        avg_duration_minutes = (
            duration_result.avg_duration_seconds / 60 
            if duration_result and duration_result.avg_duration_seconds 
            else 0
        )
        
        # Query for average energy per session
        avg_energy_query = (
            db.query(
                func.avg(ChargingSession.energy_delivered_kwh).label("avg_energy_kwh")
            )
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
        )
        
        avg_energy_result = avg_energy_query.first()
        avg_energy_kwh = (
            avg_energy_result.avg_energy_kwh 
            if avg_energy_result and avg_energy_result.avg_energy_kwh 
            else 0
        )
        
        # Return compiled statistics
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
            },
            "charging": {
                "total_sessions": session_count,
                "total_energy_kwh": round(total_energy_kwh, 2) if total_energy_kwh else 0,
                "avg_session_duration_minutes": round(avg_duration_minutes, 0) if avg_duration_minutes else 0,
                "avg_energy_per_session_kwh": round(avg_energy_kwh, 2) if avg_energy_kwh else 0,
            },
            "cost": {
                "total_cost": round(total_cost, 2) if total_cost else 0,
                "avg_cost_per_kwh": round(avg_cost_per_kwh, 3) if avg_cost_per_kwh else 0,
                "avg_cost_per_session": round(total_cost / session_count, 2) if session_count > 0 else 0,
            }
        }
    except Exception as e:
        logger.error(f"Error in get_charging_summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/energy-consumption-by-day")
async def get_energy_consumption_by_day(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    days: int = Query(30, ge=1, le=365),
    organization_id: Optional[int] = None,
    fleet_id: Optional[int] = None,
):
    """
    Get energy consumption aggregated by day for the specified period.
    """
    try:
        # Set date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Filter by organization access
        if not current_user.is_superuser:
            organization_id = current_user.organization_id
        
        # Base query filters
        base_filters = [
            ChargingSession.start_time >= start_date,
            ChargingSession.start_time <= end_date,
            ChargingSession.is_completed == True,
        ]
        
        # Add organization filter if specified
        if organization_id:
            base_filters.append(Vehicle.organization_id == organization_id)
        
        # Add fleet filter if specified
        if fleet_id:
            base_filters.append(Vehicle.fleet_id == fleet_id)
        
        # Query for energy by day
        energy_by_day_query = (
            db.query(
                func.date(ChargingSession.start_time).label("date"),
                func.sum(ChargingSession.energy_delivered_kwh).label("energy_kwh"),
                func.count(ChargingSession.id).label("session_count")
            )
            .join(Vehicle, ChargingSession.vehicle_id == Vehicle.id)
            .filter(*base_filters)
            .group_by(func.date(ChargingSession.start_time))
            .order_by(func.date(ChargingSession.start_time))
        )
        
        results = energy_by_day_query.all()
        
        # Format the results
        daily_data = []
        for result in results:
            daily_data.append({
                "date": result.date.isoformat(),
                "energy_kwh": round(result.energy_kwh, 2) if result.energy_kwh else 0,
                "session_count": result.session_count
            })
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
            },
            "daily_data": daily_data
        }
    except Exception as e:
        logger.error(f"Error in get_energy_consumption_by_day: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/station-utilization")
async def get_station_utilization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    days: int = Query(30, ge=1, le=365),
    organization_id: Optional[int] = None,
):
    """
    Get utilization statistics for charging stations.
    """
    try:
        # Set date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Filter by organization access
        if not current_user.is_superuser:
            organization_id = current_user.organization_id
        
        # Base station filters
        station_filters = []
        if organization_id:
            station_filters.append(ChargingStation.organization_id == organization_id)
        
        # Query all relevant charging stations
        stations_query = db.query(ChargingStation).filter(*station_filters)
        stations = stations_query.all()
        
        # For each station, calculate utilization metrics
        station_metrics = []
        for station in stations:
            # Count total sessions
            sessions_query = (
                db.query(func.count(ChargingSession.id).label("session_count"))
                .filter(
                    ChargingSession.charging_station_id == station.id,
                    ChargingSession.start_time >= start_date,
                    ChargingSession.start_time <= end_date
                )
            )
            sessions_result = sessions_query.first()
            session_count = sessions_result.session_count if sessions_result else 0
            
            # Calculate total energy delivered
            energy_query = (
                db.query(func.sum(ChargingSession.energy_delivered_kwh).label("total_energy"))
                .filter(
                    ChargingSession.charging_station_id == station.id,
                    ChargingSession.start_time >= start_date,
                    ChargingSession.start_time <= end_date,
                    ChargingSession.is_completed == True
                )
            )
            energy_result = energy_query.first()
            total_energy = energy_result.total_energy if energy_result and energy_result.total_energy else 0
            
            # Calculate total duration of sessions
            duration_query = (
                db.query(
                    func.sum(
                        func.extract('epoch', ChargingSession.end_time) - 
                        func.extract('epoch', ChargingSession.start_time)
                    ).label("total_duration_seconds")
                )
                .filter(
                    ChargingSession.charging_station_id == station.id,
                    ChargingSession.start_time >= start_date,
                    ChargingSession.end_time <= end_date,
                    ChargingSession.is_completed == True
                )
            )
            duration_result = duration_query.first()
            total_duration_hours = (
                duration_result.total_duration_seconds / 3600 
                if duration_result and duration_result.total_duration_seconds 
                else 0
            )
            
            # Calculate utilization percentage (occupied hours / total available hours)
            total_period_hours = days * 24  # Total hours in the period
            connectors_count = len(station.connectors)
            total_connector_hours = total_period_hours * connectors_count  # Total available connector-hours
            
            utilization_percent = (total_duration_hours / total_connector_hours) * 100 if total_connector_hours > 0 else 0
            
            # Add metrics for this station
            station_metrics.append({
                "station_id": station.id,
                "station_name": station.name,
                "connector_count": connectors_count,
                "session_count": session_count,
                "total_energy_delivered_kwh": round(total_energy, 2),
                "total_charging_hours": round(total_duration_hours, 1),
                "utilization_percent": round(utilization_percent, 1),
            })
        
        # Sort by utilization (descending)
        station_metrics.sort(key=lambda x: x["utilization_percent"], reverse=True)
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "days": days
            },
            "stations": station_metrics
        }
    except Exception as e:
        logger.error(f"Error in get_station_utilization: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/vehicle-efficiency")
async def get_vehicle_efficiency(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    days: int = Query(30, ge=1, le=365),
    organization_id: Optional[int] = None,
    fleet_id: Optional[int] = None,
):
    """
    Get energy efficiency metrics for vehicles.
    """
    try:
        # Set date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Filter by organization access
        if not current_user.is_superuser:
            organization_id = current_user.organization_id
        
        # Base vehicle filters
        vehicle_filters = []
        if organization_id:
            vehicle_filters.append(Vehicle.organization_id == organization_id)
        if fleet_id:
            vehicle_filters.append(Vehicle.fleet_id == fleet_id)
        
        # Query relevant vehicles
        vehicles_query = db.query(Vehicle).filter(*vehicle_filters)
        vehicles = vehicles_query.all()
        
        # For each vehicle, calculate efficiency metrics
        vehicle_metrics = []
        for vehicle in vehicles:
            # Get all telematics history entries in the period
            telematics_history = (
                db.query(
                    "VehicleTelematicsHistory"  # Assuming this is the correct model name
                )
                .filter(
                    "VehicleTelematicsHistory.vehicle_id" == vehicle.id,
                    "VehicleTelematicsHistory.timestamp" >= start_date,
                    "VehicleTelematicsHistory.timestamp" <= end_date,
                    "VehicleTelematicsHistory.energy_consumed_kwh_since_last" != None,
                    "VehicleTelematicsHistory.odometer_km" != None
                )
                .order_by("VehicleTelematicsHistory.timestamp")
                .all()
            )
            
            # Simplified calculation for this demo
            # In a real implementation, we would properly account for distance traveled
            total_energy = 0
            total_distance = 0
            
            # Get total energy consumed from charging sessions
            energy_query = (
                db.query(func.sum(ChargingSession.energy_delivered_kwh).label("total_energy"))
                .filter(
                    ChargingSession.vehicle_id == vehicle.id,
                    ChargingSession.start_time >= start_date,
                    ChargingSession.start_time <= end_date,
                    ChargingSession.is_completed == True
                )
            )
            energy_result = energy_query.first()
            total_energy = energy_result.total_energy if energy_result and energy_result.total_energy else 0
            
            # For simplicity, use a fixed estimate of distance driven
            # In a real implementation, we would calculate this from odometer readings
            efficiency_kwh_per_100km = 20.0  # Default/placeholder value
            total_distance = (total_energy / efficiency_kwh_per_100km) * 100 if total_energy > 0 else 0
            
            # Add metrics for this vehicle
            vehicle_metrics.append({
                "vehicle_id": vehicle.id,
                "vin": vehicle.vin,
                "make": vehicle.make,
                "model": vehicle.model,
                "total_energy_consumed_kwh": round(total_energy, 2),
                "estimated_distance_km": round(total_distance, 1),
                "efficiency_kwh_per_100km": efficiency_kwh_per_100km,
            })
        
        # Sort by energy consumption (descending)
        vehicle_metrics.sort(key=lambda x: x["total_energy_consumed_kwh"], reverse=True)
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "days": days
            },
            "vehicles": vehicle_metrics
        }
    except Exception as e:
        logger.error(f"Error in get_vehicle_efficiency: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/demo-data", response_model=Dict[str, Any])
async def get_demo_data(
    demo_type: str = Query(..., description="Type of demo data to fetch (charging, fleet, energy, v2g, analytics, api)"),
):
    """
    Get demo data for the EV Management demo page
    """
    try:
        demo_data = {
            "charging": {
                "live_data": {
                    "active_sessions": random.randint(8, 15),
                    "power_utilization": random.uniform(55.0, 85.0),
                    "energy_delivered": random.uniform(450.0, 650.0),
                    "current_load": random.uniform(70.0, 120.0),
                    "price_signals": [
                        {"time": "Now", "price": random.uniform(0.08, 0.12)},
                        {"time": "1h", "price": random.uniform(0.10, 0.15)},
                        {"time": "2h", "price": random.uniform(0.12, 0.18)},
                        {"time": "3h", "price": random.uniform(0.15, 0.22)},
                        {"time": "4h", "price": random.uniform(0.14, 0.19)},
                    ],
                    "charging_stations": [
                        {"id": "CS01", "status": "active", "utilization": random.uniform(75.0, 95.0), "power": random.uniform(7.0, 11.0)},
                        {"id": "CS02", "status": "active", "utilization": random.uniform(65.0, 85.0), "power": random.uniform(6.0, 10.0)},
                        {"id": "CS03", "status": "active", "utilization": random.uniform(70.0, 90.0), "power": random.uniform(6.5, 10.5)},
                        {"id": "CS04", "status": "idle", "utilization": 0, "power": 0},
                        {"id": "CS05", "status": "active", "utilization": random.uniform(80.0, 100.0), "power": random.uniform(8.0, 12.0)},
                        {"id": "CS06", "status": "maintenance", "utilization": 0, "power": 0},
                    ]
                }
            },
            "fleet": {
                "stats": {
                    "total_vehicles": 23,
                    "available": 8,
                    "in_use": 12,
                    "charging": 2,
                    "maintenance": 1,
                    "avg_soc": random.uniform(65.0, 75.0),
                    "total_miles_today": random.uniform(1200, 1800),
                    "utilization_rate": random.uniform(75.0, 85.0)
                },
                "vehicles": [
                    {"id": "V001", "model": "Tesla Model Y", "status": "charging", "soc": random.uniform(45.0, 65.0), "range": random.uniform(120, 180), "location": "HQ"},
                    {"id": "V002", "model": "Ford Mustang Mach-E", "status": "in_use", "soc": random.uniform(30.0, 50.0), "range": random.uniform(80, 130), "location": "Route 7"},
                    {"id": "V003", "model": "Hyundai Ioniq 5", "status": "available", "soc": random.uniform(85.0, 95.0), "range": random.uniform(220, 280), "location": "HQ"},
                    {"id": "V004", "model": "Rivian R1T", "status": "maintenance", "soc": random.uniform(5.0, 15.0), "range": random.uniform(20, 40), "location": "Service Center"},
                    {"id": "V005", "model": "Tesla Model 3", "status": "charging", "soc": random.uniform(25.0, 40.0), "range": random.uniform(60, 110), "location": "Satellite Office"},
                    {"id": "V006", "model": "Chevrolet Bolt", "status": "in_use", "soc": random.uniform(40.0, 60.0), "range": random.uniform(100, 150), "location": "Downtown"},
                ],
            },
            "energy": {
                "sources": [
                    {"type": "Grid", "percentage": random.uniform(30.0, 45.0), "cost": random.uniform(0.12, 0.17)},
                    {"type": "Solar", "percentage": random.uniform(20.0, 35.0), "cost": random.uniform(0.04, 0.06)},
                    {"type": "Wind", "percentage": random.uniform(10.0, 20.0), "cost": random.uniform(0.05, 0.08)},
                    {"type": "Storage", "percentage": random.uniform(5.0, 15.0), "cost": random.uniform(0.08, 0.11)},
                ],
                "demand_forecast": [
                    {"hour": "Now", "demand": random.uniform(80.0, 110.0)},
                    {"hour": "+1h", "demand": random.uniform(85.0, 115.0)},
                    {"hour": "+2h", "demand": random.uniform(95.0, 125.0)},
                    {"hour": "+3h", "demand": random.uniform(100.0, 130.0)},
                    {"hour": "+4h", "demand": random.uniform(90.0, 120.0)},
                    {"hour": "+5h", "demand": random.uniform(70.0, 100.0)},
                ],
                "storage_status": {
                    "capacity": 500,
                    "current_level": random.uniform(280.0, 380.0),
                    "charging_rate": random.uniform(15.0, 25.0) if random.random() > 0.3 else random.uniform(-20.0, -10.0),
                    "estimated_available_hours": random.uniform(3.5, 5.5)
                }
            },
            "v2g": {
                "grid_services": [
                    {"service": "Frequency Regulation", "status": "Active", "vehicles": random.randint(2, 5), "power": random.uniform(20.0, 35.0), "revenue": random.uniform(12.0, 18.0)},
                    {"service": "Peak Shaving", "status": "Scheduled", "vehicles": random.randint(4, 8), "power": random.uniform(40.0, 60.0), "revenue": random.uniform(25.0, 40.0)},
                    {"service": "Demand Response", "status": "Idle", "vehicles": 0, "power": 0, "revenue": 0}
                ],
                "v2g_capable_vehicles": [
                    {"id": "V001", "model": "Tesla Model Y", "available": True, "max_discharge": random.uniform(7.0, 11.0), "soc": random.uniform(70.0, 90.0)},
                    {"id": "V003", "model": "Hyundai Ioniq 5", "available": True, "max_discharge": random.uniform(5.0, 8.0), "soc": random.uniform(75.0, 95.0)},
                    {"id": "V005", "model": "Tesla Model 3", "available": False, "max_discharge": random.uniform(6.0, 9.0), "soc": random.uniform(45.0, 65.0)},
                    {"id": "V008", "model": "Ford F-150 Lightning", "available": True, "max_discharge": random.uniform(9.0, 15.0), "soc": random.uniform(80.0, 95.0)},
                ],
                "revenue_stats": {
                    "today": random.uniform(75.0, 120.0),
                    "this_week": random.uniform(450.0, 650.0),
                    "this_month": random.uniform(1800.0, 2400.0),
                    "projected_annual": random.uniform(20000.0, 30000.0)
                }
            },
            "analytics": {
                "energy_usage": [
                    {"day": "Mon", "amount": random.uniform(180.0, 240.0)},
                    {"day": "Tue", "amount": random.uniform(190.0, 250.0)},
                    {"day": "Wed", "amount": random.uniform(200.0, 260.0)},
                    {"day": "Thu", "amount": random.uniform(195.0, 255.0)},
                    {"day": "Fri", "amount": random.uniform(210.0, 270.0)},
                    {"day": "Sat", "amount": random.uniform(150.0, 200.0)},
                    {"day": "Sun", "amount": random.uniform(130.0, 180.0)},
                ],
                "carbon_savings": {
                    "daily": random.uniform(180.0, 240.0),
                    "monthly": random.uniform(5000.0, 7000.0),
                    "yearly": random.uniform(60000.0, 80000.0),
                    "equivalent_trees": random.randint(2800, 3600)
                },
                "efficiency_trends": [
                    {"month": "Jan", "efficiency": random.uniform(85.0, 92.0)},
                    {"month": "Feb", "efficiency": random.uniform(86.0, 93.0)},
                    {"month": "Mar", "efficiency": random.uniform(87.0, 94.0)},
                    {"month": "Apr", "efficiency": random.uniform(88.0, 95.0)},
                    {"month": "May", "efficiency": random.uniform(89.0, 96.0)},
                    {"month": "Jun", "efficiency": random.uniform(90.0, 97.0)},
                ]
            },
            "api": {
                "endpoints": [
                    {"path": "/v1/charging", "calls_today": random.randint(1200, 2500), "success_rate": random.uniform(98.5, 99.9), "avg_response_time": random.uniform(65.0, 120.0)},
                    {"path": "/v1/vehicles", "calls_today": random.randint(800, 1800), "success_rate": random.uniform(98.0, 99.8), "avg_response_time": random.uniform(70.0, 130.0)},
                    {"path": "/v1/energy", "calls_today": random.randint(600, 1200), "success_rate": random.uniform(97.5, 99.7), "avg_response_time": random.uniform(80.0, 140.0)},
                    {"path": "/v1/grid", "calls_today": random.randint(400, 900), "success_rate": random.uniform(97.0, 99.6), "avg_response_time": random.uniform(90.0, 150.0)},
                    {"path": "/v1/analytics", "calls_today": random.randint(500, 1000), "success_rate": random.uniform(98.2, 99.8), "avg_response_time": random.uniform(85.0, 145.0)},
                ],
                "integration_status": [
                    {"partner": "Fleet Management System", "status": "Connected", "last_sync": "10 minutes ago"},
                    {"partner": "Energy Management Platform", "status": "Connected", "last_sync": "5 minutes ago"},
                    {"partner": "Payment Processor", "status": "Connected", "last_sync": "2 minutes ago"},
                    {"partner": "Maintenance System", "status": "Connected", "last_sync": "15 minutes ago"},
                    {"partner": "Route Optimization", "status": "Connected", "last_sync": "8 minutes ago"},
                ]
            }
        }
        
        if demo_type not in demo_data:
            raise HTTPException(status_code=400, detail=f"Invalid demo type: {demo_type}")
            
        return demo_data[demo_type]
        
    except Exception as e:
        logger.error(f"Error getting demo data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get demo data") 