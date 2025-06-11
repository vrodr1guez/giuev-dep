from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
import time
import asyncio
from datetime import datetime, timedelta
import uuid

from app.core.logging import logger

router = APIRouter()


@router.get("/demo/partnerships", response_model=Dict[str, Any])
async def get_demo_grid_partnerships():
    """
    Get demo grid partnerships for development and testing.
    Shows available revenue opportunities with utility partners.
    """
    try:
        partnerships = [
            {
                "id": "pgne-01",
                "utility_name": "Pacific Gas & Electric (PG&E)",
                "partnership_type": "V2G Energy Trading",
                "status": "active",
                "region": "Northern California",
                "revenue_share": 12.5,  # percentage
                "services": [
                    {
                        "service_type": "demand_response",
                        "rate_per_kw_month": 85.0,
                        "active_programs": 3,
                        "annual_revenue_potential": 850000
                    },
                    {
                        "service_type": "frequency_regulation",
                        "rate_per_kw_month": 65.0,
                        "active_programs": 2,
                        "annual_revenue_potential": 520000
                    },
                    {
                        "service_type": "peak_shaving",
                        "rate_per_kw_month": 45.0,
                        "active_programs": 4,
                        "annual_revenue_potential": 680000
                    }
                ],
                "contract_details": {
                    "start_date": "2024-01-01",
                    "end_date": "2026-12-31",
                    "auto_renewal": True,
                    "minimum_capacity_mw": 50,
                    "maximum_capacity_mw": 500
                },
                "performance_metrics": {
                    "current_capacity_mw": 125.5,
                    "availability_percentage": 98.2,
                    "response_time_seconds": 2.1,
                    "revenue_ytd": 1245000
                }
            },
            {
                "id": "coned-01", 
                "utility_name": "Consolidated Edison (ConEd)",
                "partnership_type": "Grid Stabilization",
                "status": "pilot",
                "region": "New York City",
                "revenue_share": 15.0,
                "services": [
                    {
                        "service_type": "voltage_support",
                        "rate_per_kw_month": 75.0,
                        "active_programs": 1,
                        "annual_revenue_potential": 450000
                    },
                    {
                        "service_type": "reactive_power",
                        "rate_per_kw_month": 55.0,
                        "active_programs": 2,
                        "annual_revenue_potential": 330000
                    }
                ],
                "contract_details": {
                    "start_date": "2024-03-01", 
                    "end_date": "2024-09-01",
                    "pilot_phase": True,
                    "minimum_capacity_mw": 25,
                    "maximum_capacity_mw": 100
                },
                "performance_metrics": {
                    "current_capacity_mw": 45.2,
                    "availability_percentage": 95.8,
                    "response_time_seconds": 1.8,
                    "revenue_ytd": 285000
                }
            },
            {
                "id": "ercot-01",
                "utility_name": "ERCOT (Texas Grid)",
                "partnership_type": "Wholesale Energy Market",
                "status": "negotiating",
                "region": "Texas",
                "revenue_share": 18.0,
                "services": [
                    {
                        "service_type": "energy_arbitrage",
                        "rate_per_mwh": 45.0,
                        "active_programs": 0,
                        "annual_revenue_potential": 2100000
                    },
                    {
                        "service_type": "ancillary_services",
                        "rate_per_kw_month": 95.0,
                        "active_programs": 0,
                        "annual_revenue_potential": 1250000
                    }
                ],
                "contract_details": {
                    "start_date": "2024-06-01",
                    "end_date": "2027-05-31",
                    "negotiation_phase": True,
                    "minimum_capacity_mw": 100,
                    "maximum_capacity_mw": 1000
                },
                "performance_metrics": {
                    "current_capacity_mw": 0,
                    "availability_percentage": 0,
                    "response_time_seconds": 0,
                    "revenue_ytd": 0
                }
            }
        ]
        
        # Calculate total revenue metrics
        total_active_revenue = sum(
            p["performance_metrics"]["revenue_ytd"] 
            for p in partnerships 
            if p["status"] == "active"
        )
        
        total_potential_revenue = sum(
            sum(s["annual_revenue_potential"] for s in p["services"])
            for p in partnerships
        )
        
        return {
            "status": "success",
            "message": "Grid partnerships data",
            "timestamp": int(time.time()),
            "summary": {
                "total_partnerships": len(partnerships),
                "active_partnerships": len([p for p in partnerships if p["status"] == "active"]),
                "pilot_partnerships": len([p for p in partnerships if p["status"] == "pilot"]),
                "negotiating_partnerships": len([p for p in partnerships if p["status"] == "negotiating"]),
                "total_active_revenue_ytd": total_active_revenue,
                "total_potential_annual_revenue": total_potential_revenue,
                "average_revenue_share": sum(p["revenue_share"] for p in partnerships) / len(partnerships)
            },
            "partnerships": partnerships,
            "expansion_opportunities": {
                "california_iso": {
                    "market": "CAISO",
                    "potential_revenue": 3500000,
                    "status": "assessment"
                },
                "new_england_iso": {
                    "market": "ISO-NE",
                    "potential_revenue": 2800000,
                    "status": "interested"
                },
                "pjm_interconnection": {
                    "market": "PJM",
                    "potential_revenue": 4200000,
                    "status": "planning"
                }
            }
        }
    except Exception as e:
        logger.error(f"Error in get_demo_grid_partnerships: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/v2g/energy-flow", response_model=Dict[str, Any])
async def get_v2g_energy_flow():
    """
    Get real-time V2G energy flow data for grid partnership optimization.
    """
    try:
        # Simulate real-time V2G energy flow data
        current_time = datetime.utcnow()
        
        energy_flows = []
        for i in range(24):  # 24-hour data
            hour_time = current_time - timedelta(hours=23-i)
            
            # Simulate energy flow patterns
            base_flow = 100 + (i * 20) if i < 12 else 100 + ((24-i) * 20)
            to_grid = base_flow * (1.2 if 18 <= i <= 22 else 0.8)  # Peak hours
            from_grid = base_flow * (0.6 if 2 <= i <= 6 else 1.1)  # Off-peak hours
            
            energy_flows.append({
                "timestamp": hour_time.isoformat(),
                "hour": i,
                "energy_to_grid_mwh": round(to_grid, 2),
                "energy_from_grid_mwh": round(from_grid, 2),
                "net_energy_mwh": round(to_grid - from_grid, 2),
                "grid_price_per_mwh": 35.0 + (i * 2.5) if i < 12 else 35.0 + ((24-i) * 2.5),
                "revenue_generated": round((to_grid - from_grid) * (35.0 + (i * 2.5)), 2),
                "participating_vehicles": 150 + (i * 10),
                "grid_stress_level": "low" if i < 6 or i > 22 else "medium" if i < 18 else "high"
            })
        
        total_revenue = sum(flow["revenue_generated"] for flow in energy_flows)
        total_net_energy = sum(flow["net_energy_mwh"] for flow in energy_flows)
        
        return {
            "status": "success",
            "message": "V2G energy flow data",
            "timestamp": int(time.time()),
            "summary": {
                "total_net_energy_mwh": round(total_net_energy, 2),
                "total_revenue_24h": round(total_revenue, 2),
                "average_grid_price": round(sum(flow["grid_price_per_mwh"] for flow in energy_flows) / len(energy_flows), 2),
                "peak_participating_vehicles": max(flow["participating_vehicles"] for flow in energy_flows),
                "grid_stability_contribution": "high"
            },
            "energy_flows": energy_flows,
            "optimization_insights": {
                "peak_revenue_hours": [18, 19, 20, 21, 22],
                "optimal_charging_hours": [2, 3, 4, 5, 6],
                "grid_stress_periods": [17, 18, 19, 20, 21],
                "recommended_actions": [
                    "Increase V2G participation during peak hours (6-10 PM)",
                    "Schedule charging during low-cost hours (2-6 AM)",
                    "Expand demand response programs",
                    "Negotiate higher peak-hour rates with utilities"
                ]
            }
        }
    except Exception as e:
        logger.error(f"Error in get_v2g_energy_flow: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/partnerships/revenue-forecast", response_model=Dict[str, Any])
async def forecast_partnership_revenue(
    partnership_id: str,
    forecast_months: int = Query(12, ge=1, le=60),
    capacity_growth_rate: float = Query(0.15, ge=0.0, le=1.0)
):
    """
    Generate revenue forecasts for grid partnerships based on capacity growth and market conditions.
    """
    try:
        # Base revenue data (would normally come from database)
        base_revenues = {
            "pgne-01": {"monthly_base": 125000, "growth_factor": 1.08},
            "coned-01": {"monthly_base": 65000, "growth_factor": 1.12},
            "ercot-01": {"monthly_base": 0, "growth_factor": 1.25}  # Not active yet
        }
        
        if partnership_id not in base_revenues:
            raise HTTPException(status_code=404, detail="Partnership not found")
        
        base_data = base_revenues[partnership_id]
        monthly_base = base_data["monthly_base"]
        growth_factor = base_data["growth_factor"]
        
        # Generate forecast
        forecast = []
        cumulative_revenue = 0
        
        for month in range(1, forecast_months + 1):
            # Apply compound growth
            monthly_revenue = monthly_base * (growth_factor ** (month / 12)) * (1 + capacity_growth_rate) ** (month / 12)
            cumulative_revenue += monthly_revenue
            
            forecast.append({
                "month": month,
                "date": (datetime.utcnow() + timedelta(days=30*month)).strftime("%Y-%m"),
                "monthly_revenue": round(monthly_revenue, 2),
                "cumulative_revenue": round(cumulative_revenue, 2),
                "capacity_utilization": min(95.0, 60.0 + (month * 2.5)),
                "market_conditions": "favorable" if month <= 24 else "stable"
            })
        
        return {
            "status": "success",
            "message": f"Revenue forecast for partnership {partnership_id}",
            "timestamp": int(time.time()),
            "partnership_id": partnership_id,
            "forecast_parameters": {
                "forecast_months": forecast_months,
                "capacity_growth_rate": capacity_growth_rate,
                "base_monthly_revenue": monthly_base,
                "growth_factor": growth_factor
            },
            "summary": {
                "total_forecast_revenue": round(cumulative_revenue, 2),
                "average_monthly_revenue": round(cumulative_revenue / forecast_months, 2),
                "peak_monthly_revenue": round(max(f["monthly_revenue"] for f in forecast), 2),
                "revenue_growth_percentage": round(((forecast[-1]["monthly_revenue"] / monthly_base) - 1) * 100, 2)
            },
            "forecast": forecast,
            "risk_assessment": {
                "market_risk": "low" if forecast_months <= 12 else "medium",
                "regulatory_risk": "low",
                "technology_risk": "very_low",
                "competitive_risk": "medium",
                "overall_risk": "low-medium"
            }
        }
    except Exception as e:
        logger.error(f"Error in forecast_partnership_revenue: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/market-opportunities", response_model=Dict[str, Any])
async def get_grid_market_opportunities():
    """
    Get comprehensive grid market opportunities for expansion.
    """
    try:
        opportunities = [
            {
                "market_name": "California ISO (CAISO)",
                "region": "California",
                "market_size_billion": 4.2,
                "opportunity_score": 95,
                "entry_barriers": "medium",
                "regulatory_support": "very_high",
                "competition_level": "high",
                "estimated_timeline_months": 8,
                "investment_required": 2500000,
                "projected_annual_revenue": 3500000,
                "roi_percentage": 140,
                "key_services": [
                    "Energy arbitrage",
                    "Frequency regulation",
                    "Demand response",
                    "Resource adequacy"
                ],
                "strategic_importance": "critical"
            },
            {
                "market_name": "PJM Interconnection",
                "region": "Mid-Atlantic/Midwest",
                "market_size_billion": 6.8,
                "opportunity_score": 88,
                "entry_barriers": "medium-high",
                "regulatory_support": "high",
                "competition_level": "very_high",
                "estimated_timeline_months": 12,
                "investment_required": 4200000,
                "projected_annual_revenue": 4200000,
                "roi_percentage": 100,
                "key_services": [
                    "Capacity market",
                    "Energy market",
                    "Ancillary services",
                    "Demand response"
                ],
                "strategic_importance": "high"
            },
            {
                "market_name": "ISO New England",
                "region": "Northeast",
                "market_size_billion": 2.1,
                "opportunity_score": 78,
                "entry_barriers": "high",
                "regulatory_support": "medium-high",
                "competition_level": "medium",
                "estimated_timeline_months": 15,
                "investment_required": 1800000,
                "projected_annual_revenue": 2800000,
                "roi_percentage": 156,
                "key_services": [
                    "Forward capacity market",
                    "Energy market",
                    "Reserves market"
                ],
                "strategic_importance": "medium-high"
            },
            {
                "market_name": "Electric Reliability Council of Texas (ERCOT)",
                "region": "Texas",
                "market_size_billion": 5.5,
                "opportunity_score": 92,
                "entry_barriers": "low-medium",
                "regulatory_support": "high",
                "competition_level": "medium-high",
                "estimated_timeline_months": 6,
                "investment_required": 3000000,
                "projected_annual_revenue": 5200000,
                "roi_percentage": 173,
                "key_services": [
                    "Energy-only market",
                    "Ancillary services",
                    "Real-time market",
                    "Emergency response"
                ],
                "strategic_importance": "critical"
            }
        ]
        
        # Calculate summary metrics
        total_investment = sum(op["investment_required"] for op in opportunities)
        total_projected_revenue = sum(op["projected_annual_revenue"] for op in opportunities)
        weighted_roi = sum(op["roi_percentage"] * op["projected_annual_revenue"] for op in opportunities) / total_projected_revenue
        
        return {
            "status": "success",
            "message": "Grid market opportunities analysis",
            "timestamp": int(time.time()),
            "summary": {
                "total_markets_analyzed": len(opportunities),
                "high_priority_markets": len([op for op in opportunities if op["opportunity_score"] >= 85]),
                "total_investment_required": total_investment,
                "total_projected_annual_revenue": total_projected_revenue,
                "weighted_average_roi": round(weighted_roi, 2),
                "fastest_entry_timeline_months": min(op["estimated_timeline_months"] for op in opportunities),
                "total_addressable_market_billion": sum(op["market_size_billion"] for op in opportunities)
            },
            "opportunities": sorted(opportunities, key=lambda x: x["opportunity_score"], reverse=True),
            "strategic_recommendations": [
                "Prioritize CAISO entry due to high regulatory support and market maturity",
                "Texas ERCOT offers fastest entry timeline and strong ROI potential", 
                "PJM provides largest market size but requires significant investment",
                "Consider ISO-NE for regional diversification strategy",
                "Develop phased rollout plan starting with highest-score markets"
            ],
            "next_steps": [
                "Initiate regulatory compliance assessment for top 2 markets",
                "Develop detailed business cases for CAISO and ERCOT",
                "Begin stakeholder engagement with target utilities",
                "Prepare technology demonstrations for market entry",
                "Secure necessary certifications and approvals"
            ]
        }
    except Exception as e:
        logger.error(f"Error in get_grid_market_opportunities: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 