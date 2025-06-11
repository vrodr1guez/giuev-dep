"""
Grid Integration API Endpoints

Provides interfaces for vehicle-to-grid (V2G) capabilities,
grid status information, and demand response coordination.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.services.GridIntegrationService import get_grid_integration_service
from app.models.user import User
from app.schemas.grid_integration import (
    GridStatusResponse,
    PriceForecastResponse,
    V2GPotentialResponse,
    FleetGridImpactResponse,
    V2GTransactionCreate,
    V2GTransactionResponse
)

router = APIRouter()

@router.get("/grid-status", response_model=GridStatusResponse)
async def get_grid_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current grid status including demand, capacity, and pricing.
    
    Returns information about current grid conditions and V2G opportunities.
    """
    grid_integration_service = get_grid_integration_service()
    return await grid_integration_service.get_grid_status()

@router.get("/price-forecast", response_model=PriceForecastResponse)
async def get_price_forecast(
    hours_ahead: int = Query(24, description="Number of hours to forecast"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get energy price forecast for specified hours ahead.
    
    Provides predicted electricity prices to inform charging and V2G decisions.
    """
    grid_integration_service = get_grid_integration_service()
    return await grid_integration_service.get_price_forecast(hours_ahead=hours_ahead)

@router.get("/v2g-potential/{vehicle_id}", response_model=V2GPotentialResponse)
async def get_v2g_potential(
    vehicle_id: str = Path(..., description="Vehicle ID"),
    discharge_limit_pct: int = Query(30, 
                                   description="Minimum battery state of charge to maintain during V2G"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Calculate V2G potential for a specific vehicle.
    
    Determines how much energy the vehicle could provide to the grid,
    potential earnings, and impact on battery health.
    """
    grid_integration_service = get_grid_integration_service()
    result = await grid_integration_service.calculate_v2g_potential(
        vehicle_id=vehicle_id,
        discharge_limit_pct=discharge_limit_pct
    )
    
    if "error" in result and "v2g_potential" not in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/fleet-grid-impact", response_model=FleetGridImpactResponse)
async def get_fleet_grid_impact(
    vehicle_ids: List[str] = Query(None, description="List of vehicle IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Calculate potential grid impact of a fleet of vehicles.
    
    Aggregates V2G potential across multiple vehicles to determine
    total available energy and grid impact.
    """
    # In a real implementation, we would:
    # 1. If no vehicle_ids provided, get all accessible vehicles for current user
    # 2. Check permissions for each vehicle
    
    if not vehicle_ids:
        # Demo implementation with sample IDs
        vehicle_ids = ["v1", "v2", "v3", "v4", "v5"]
    
    grid_integration_service = get_grid_integration_service()
    result = await grid_integration_service.get_fleet_grid_impact(vehicle_ids=vehicle_ids)
    
    if "error" in result and "grid_contribution" not in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/v2g-transactions", response_model=V2GTransactionResponse)
async def create_v2g_transaction(
    transaction: V2GTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create a new V2G transaction.
    
    Initiates a vehicle-to-grid energy transfer based on current
    grid conditions and vehicle availability.
    """
    # In a real implementation, this would:
    # 1. Validate that the vehicle is available for V2G
    # 2. Create a transaction record in the database
    # 3. Send commands to the vehicle to begin energy discharge
    # 4. Monitor the transaction until completion
    
    # For demo purposes, return a simulated transaction
    return {
        "transaction_id": "v2g_tx_12345",
        "vehicle_id": transaction.vehicle_id,
        "timestamp_start": "2023-10-01T14:30:00Z",
        "energy_kwh": transaction.max_energy_kwh,
        "status": "initiated",
        "message": "V2G transaction initiated successfully"
    }

@router.get("/v2g-transactions/{transaction_id}", response_model=V2GTransactionResponse)
async def get_v2g_transaction(
    transaction_id: str = Path(..., description="V2G transaction ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get V2G transaction status.
    
    Retrieves current status of an ongoing or completed V2G transaction.
    """
    # In a real implementation, this would query the database for the transaction
    
    # For demo purposes, return a simulated transaction
    return {
        "transaction_id": transaction_id,
        "vehicle_id": "v1",
        "timestamp_start": "2023-10-01T14:30:00Z",
        "timestamp_end": "2023-10-01T15:45:00Z",
        "energy_kwh": 8.5,
        "compensation_amount": 1.02,
        "carbon_offset_kg": 3.4,
        "battery_soc_start": 85,
        "battery_soc_end": 73,
        "status": "completed",
        "message": "V2G transaction completed successfully"
    } 