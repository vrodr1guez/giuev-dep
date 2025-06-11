from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

router = APIRouter()

# Dashboard Metrics
@router.get("/dashboard/metrics")
async def get_dashboard_metrics():
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

# Billing Endpoints
@router.get("/billing/summary")
async def get_billing_summary():
    return {
        "currentMonth": {
            "totalCost": round(random.uniform(2500, 4500), 2),
            "energyUsed": round(random.uniform(850, 1200), 1),
            "sessionsCount": random.randint(45, 85),
            "avgCostPerSession": round(random.uniform(35, 65), 2)
        },
        "comparison": {
            "previousMonth": round(random.uniform(2200, 4000), 2),
            "percentChange": round(random.uniform(-15, 25), 1)
        }
    }

@router.get("/billing/invoices")
async def get_billing_invoices():
    invoices = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30 * i)
        invoices.append({
            "id": f"INV-{date.strftime('%Y%m')}-{str(i+1).zfill(3)}",
            "month": date.strftime("%B %Y"),
            "amount": round(random.uniform(2000, 5000), 2),
            "status": random.choice(["paid", "pending", "overdue"]),
            "dueDate": (date + timedelta(days=30)).strftime("%Y-%m-%d"),
            "energyUsed": round(random.uniform(800, 1500), 1)
        })
    return {"invoices": invoices}

@router.get("/billing/usage/current-month")
async def get_current_month_usage():
    return {
        "daily": [
            {
                "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                "energy": round(random.uniform(25, 85), 1),
                "cost": round(random.uniform(15, 50), 2),
                "sessions": random.randint(1, 8)
            }
            for i in range(30, 0, -1)
        ],
        "totals": {
            "energy": round(random.uniform(950, 1350), 1),
            "cost": round(random.uniform(650, 1200), 2),
            "sessions": random.randint(35, 75)
        }
    }

@router.get("/billing/payment-breakdown")
async def get_payment_breakdown():
    return {
        "categories": [
            {"name": "DC Fast Charging", "amount": round(random.uniform(800, 1200), 2), "percentage": 45},
            {"name": "AC Level 2", "amount": round(random.uniform(400, 800), 2), "percentage": 30},
            {"name": "Network Fees", "amount": round(random.uniform(100, 200), 2), "percentage": 15},
            {"name": "Subscription", "amount": round(random.uniform(50, 150), 2), "percentage": 10}
        ],
        "total": round(random.uniform(1350, 2350), 2)
    }

@router.get("/billing/reimbursements")
async def get_reimbursements():
    return {
        "pending": [
            {
                "id": f"REIMB-{str(i+1).zfill(4)}",
                "employee": f"Employee {i+1}",
                "amount": round(random.uniform(50, 300), 2),
                "date": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "status": "pending"
            }
            for i in range(3)
        ],
        "approved": [
            {
                "id": f"REIMB-{str(i+10).zfill(4)}",
                "employee": f"Employee {i+10}",
                "amount": round(random.uniform(100, 400), 2),
                "date": (datetime.now() - timedelta(days=random.randint(5, 60))).strftime("%Y-%m-%d"),
                "status": "approved"
            }
            for i in range(5)
        ]
    }

# Charging Station Endpoints
@router.get("/charging/stations")
async def get_charging_stations():
    stations = []
    statuses = ["available", "in-use", "maintenance", "offline"]
    
    for i in range(12):
        stations.append({
            "id": f"CS-{str(i+1).zfill(3)}",
            "name": f"Station {chr(65 + i//4)}-{i%4 + 1}",
            "location": f"Zone {chr(65 + i//3)} - Bay {i%3 + 1}",
            "status": random.choice(statuses),
            "power": random.choice([50, 100, 150, 350]),
            "connectorType": random.choice(["CCS", "CHAdeMO", "Type 2"]),
            "utilization": round(random.uniform(0, 100), 1),
            "lastMaintenance": (datetime.now() - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d"),
            "energyDelivered": round(random.uniform(100, 2000), 1)
        })
    
    return {"stations": stations}

@router.get("/charging/sessions")
async def get_charging_sessions():
    sessions = []
    
    for i in range(20):
        start_time = datetime.now() - timedelta(hours=random.randint(1, 72))
        duration = timedelta(minutes=random.randint(15, 240))
        
        sessions.append({
            "id": f"SESSION-{str(i+1).zfill(6)}",
            "stationId": f"CS-{str(random.randint(1, 12)).zfill(3)}",
            "vehicleId": f"EV-{str(random.randint(1, 25)).zfill(3)}",
            "startTime": start_time.isoformat(),
            "endTime": (start_time + duration).isoformat() if random.random() > 0.3 else None,
            "energyDelivered": round(random.uniform(10, 80), 1),
            "cost": round(random.uniform(8, 65), 2),
            "status": random.choice(["completed", "in_progress", "interrupted"])
        })
    
    return {"sessions": sessions}

# Fleet Analytics
@router.get("/analytics/fleet-efficiency")
async def get_fleet_efficiency():
    return {
        "overall": {
            "efficiency": round(random.uniform(3.8, 4.2), 1),
            "target": 4.0,
            "improvement": round(random.uniform(5, 15), 1)
        },
        "vehicles": [
            {
                "id": f"EV-{str(i+1).zfill(3)}",
                "efficiency": round(random.uniform(3.2, 4.5), 1),
                "miles": random.randint(15000, 45000),
                "score": random.randint(75, 98)
            }
            for i in range(8)
        ]
    }

# Energy Cost Optimization
@router.get("/analytics/cost-optimization")
async def get_cost_optimization():
    return {
        "potential_savings": {
            "annual": round(random.uniform(100000, 200000), 2),
            "monthly": round(random.uniform(8000, 16000), 2),
            "percentage": round(random.uniform(15, 25), 1)
        },
        "recommendations": [
            {
                "category": "Time-of-Use Optimization",
                "savings": round(random.uniform(30000, 60000), 2),
                "implementation": "Shift 60% of charging to off-peak hours"
            },
            {
                "category": "Demand Response",
                "savings": round(random.uniform(20000, 40000), 2),
                "implementation": "Participate in grid demand response programs"
            },
            {
                "category": "Route Optimization",
                "savings": round(random.uniform(15000, 30000), 2),
                "implementation": "AI-powered route planning"
            }
        ]
    } 