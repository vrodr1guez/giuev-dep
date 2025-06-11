from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import asyncio
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics() -> Dict[str, Any]:
    """
    Get dashboard metrics for routes and fleet management
    """
    try:
        # Simulate real-time data generation
        return {
            "totalRoutes": random.randint(4, 8),
            "activeRoutes": random.randint(1, 3),
            "scheduledRoutes": random.randint(1, 4),
            "completedRoutes": random.randint(1, 3),
            "totalDistance": f"{random.randint(120, 180)}.{random.randint(0, 9)} km",
            "avgEfficiency": round(random.uniform(3.5, 4.5), 1),
            "totalConsumption": round(random.uniform(45, 65), 1),
            "costOptimization": round(random.uniform(20, 30), 1),
            "carbonSaved": round(random.uniform(8, 15), 1),
            "timestamp": datetime.now().isoformat(),
            "status": "healthy"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard metrics: {str(e)}")

@router.get("/summary")
async def get_dashboard_summary() -> Dict[str, Any]:
    """
    Get dashboard summary statistics
    """
    try:
        return {
            "overview": {
                "totalVehicles": random.randint(15, 25),
                "activeVehicles": random.randint(8, 15),
                "totalStations": random.randint(12, 20),
                "activeStations": random.randint(10, 18),
                "dailyEnergy": round(random.uniform(850, 1200), 1),
                "monthlyEnergy": round(random.uniform(25000, 35000), 1)
            },
            "performance": {
                "avgEfficiency": round(random.uniform(3.8, 4.2), 1),
                "peakPowerUsage": round(random.uniform(450, 650), 1),
                "costPerKwh": round(random.uniform(0.12, 0.18), 3),
                "carbonReduction": round(random.uniform(35, 45), 1)
            },
            "alerts": [
                {
                    "id": 1,
                    "type": "maintenance",
                    "message": "Station CS-003 requires routine maintenance",
                    "severity": "medium",
                    "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
                },
                {
                    "id": 2,
                    "type": "efficiency",
                    "message": "Route optimization saved 15% energy today",
                    "severity": "info",
                    "timestamp": (datetime.now() - timedelta(hours=1)).isoformat()
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard summary: {str(e)}")

@router.get("/live-data")
async def get_live_dashboard_data() -> Dict[str, Any]:
    """
    Get real-time dashboard data for live updates
    """
    try:
        current_time = datetime.now()
        
        return {
            "realTime": {
                "activeCharging": random.randint(3, 8),
                "powerDemand": round(random.uniform(250, 450), 1),
                "gridLoad": round(random.uniform(65, 85), 1),
                "renewablePercent": round(random.uniform(40, 60), 1),
                "timestamp": current_time.isoformat()
            },
            "trends": {
                "hourly": [
                    {
                        "hour": (current_time - timedelta(hours=i)).strftime("%H:00"),
                        "energy": round(random.uniform(30, 80), 1),
                        "efficiency": round(random.uniform(3.5, 4.5), 1)
                    }
                    for i in range(24, 0, -1)
                ],
                "efficiency": {
                    "current": round(random.uniform(3.8, 4.2), 1),
                    "target": 4.0,
                    "trend": "increasing" if random.random() > 0.5 else "stable"
                }
            },
            "fleet": {
                "vehicles": [
                    {
                        "id": f"EV-{str(i).zfill(3)}",
                        "status": random.choice(["charging", "driving", "idle"]),
                        "battery": random.randint(20, 95),
                        "location": f"Zone {random.choice(['A', 'B', 'C', 'D'])}"
                    }
                    for i in range(1, 6)
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live dashboard data: {str(e)}") 