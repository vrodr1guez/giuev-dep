from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.api import deps
from app.schemas.charging import (
    ChargingOptimizationRequest,
    ChargingOptimizationResponse
)
from app.services.charging_optimizer import charging_optimizer
from app.services.fleet_charging_optimizer import fleet_charging_optimizer
from app.services.dynamic_pricing import dynamic_pricing_service
from app.core.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/optimize",
    response_model=ChargingOptimizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimize vehicle charging schedule",
    description="""
    Optimize the charging schedule for a vehicle based on various constraints:
    - Target state of charge
    - Departure time
    - Electricity tariffs
    - Maximum charging power

    The optimization considers:
    - Current vehicle state
    - Electricity costs
    - Vehicle and charging station capabilities
    - Time constraints

    Returns an optimized charging schedule with time slots and power levels.
    """
)
async def optimize_charging(
    request: ChargingOptimizationRequest,
    db: Session = Depends(deps.get_db),
    current_user: Optional[Any] = Depends(get_current_user)
) -> ChargingOptimizationResponse:
    """
    Optimize charging schedule for a vehicle.
    """
    try:
        result = await charging_optimizer.optimize_charging_schedule(db, request)
        return result
    except ValueError as e:
        logger.warning(f"Validation error in charging optimization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(
            f"Error optimizing charging schedule: {str(e)}",
            exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error optimizing charging schedule"
        )


@router.post(
    "/optimize/fleet",
    response_model=Dict[int, ChargingOptimizationResponse],
    status_code=status.HTTP_200_OK,
    summary="Optimize charging schedules for multiple vehicles",
    description="""
    Optimize charging schedules for a fleet of vehicles considering:
    - Grid capacity constraints
    - Charging station availability
    - Vehicle priorities
    - Load balancing

    Returns optimized schedules for all vehicles in the fleet.
    """
)
async def optimize_fleet_charging(
    vehicle_ids: List[int] = Query([], description="List of vehicle IDs to optimize"),
    station_id: int = Query(..., description="ID of the charging station"),
    optimization_window: int = Query(
        24,
        description="Optimization window in hours",
        ge=1,
        le=168
    ),
    db: Session = Depends(deps.get_db),
    current_user: Optional[Any] = Depends(get_current_user)
) -> Dict[int, ChargingOptimizationResponse]:
    """
    Optimize charging schedules for multiple vehicles.
    """
    if not vehicle_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one vehicle ID must be provided"
        )

    try:
        result = await fleet_charging_optimizer.optimize_fleet_charging(
            db,
            vehicle_ids,
            station_id,
            timedelta(hours=optimization_window)
        )
        return result
    except ValueError as e:
        logger.warning(
            f"Validation error in fleet charging optimization: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(
            f"Error optimizing fleet charging schedules: {str(e)}",
            exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error optimizing fleet charging schedules"
        )


@router.get(
    "/tariffs/{station_id}",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get dynamic tariffs for a charging station",
    description="""
    Get dynamic electricity tariffs for a charging station considering:
    - Current grid load
    - Demand patterns
    - Renewable energy availability
    - Time of day

    Returns a list of tariffs with time slots and rates.
    """
)
async def get_dynamic_tariffs(
    station_id: int,
    start_time: datetime = Query(..., description="Start time for tariff calculation"),
    end_time: datetime = Query(..., description="End time for tariff calculation"),
    db: Session = Depends(deps.get_db),
    current_user: Optional[Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Get dynamic tariffs for a charging station.
    """
    # Validate time parameters
    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time"
        )

    try:
        # Get base rate from configuration or database
        base_rate = 0.15  # Example base rate

        # Get renewable energy percentage (could be from external service)
        renewable_percentage = 30.0  # Example value

        tariffs = await dynamic_pricing_service.calculate_dynamic_tariffs(
            db,
            station_id,
            start_time,
            end_time,
            base_rate,
            renewable_percentage
        )

        # Convert to response format
        return [
            {
                "start_time": t.start_time,
                "end_time": t.end_time,
                "base_rate": t.base_rate,
                "demand_multiplier": t.demand_multiplier,
                "renewable_discount": t.renewable_discount,
                "final_rate": t.base_rate * t.demand_multiplier * (1 - t.renewable_discount)
            }
            for t in tariffs
        ]

    except ValueError as e:
        logger.warning(f"Validation error in tariff calculation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(
            f"Error calculating dynamic tariffs: {str(e)}",
            exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error calculating dynamic tariffs"
        )


@router.get("/status")
async def charging_status():
    return {"status": "operational"}
