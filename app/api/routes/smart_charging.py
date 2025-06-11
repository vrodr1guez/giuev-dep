from app.core.logging import logger
from app.services.smart_charging import smart_charging_service
from app.schemas.charging import ChargingOptimizationRequest, ChargingOptimizationResponse
from app.database.session import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
import os
import logging

# Try/except block to handle missing opencensus
try:
    from opencensus.ext.azure.log_exporter import AzureLogHandler
    has_opencensus = True
except ImportError:
    has_opencensus = False
    logger.warning("OpenCensus not installed. Azure Application Insights logging disabled.")

router = APIRouter()

def setup_application_insights():
    """Setup Application Insights logging if connection string is available"""
    connection_string = os.environ.get('APPLICATION_INSIGHTS_CONNECTION_STRING')
    if connection_string and has_opencensus:
        # Add Azure Log Handler to the Python logger
        logger.addHandler(
            AzureLogHandler(
                connection_string=connection_string
            )
        )
        logger.info("Application Insights initialized")

@router.post("/optimize-charging", response_model=ChargingOptimizationResponse)
async def optimize_vehicle_charging_schedule(
    request_data: ChargingOptimizationRequest,
    db: Session = Depends(get_db)
):
    """
    Optimizes the charging schedule for a specific EV based on various constraints including:
    - Vehicle battery characteristics and current state
    - Grid load and capacity constraints
    - Dynamic electricity pricing
    - Time constraints and user preferences

    Returns an optimized charging schedule with cost estimates and any relevant warnings.

    Raises:
        404: Vehicle not found
        400: Invalid request parameters
        500: Internal server error during optimization
    """
    try:
        response = await smart_charging_service.optimize_charging_schedule(
            db=db,
            request=request_data
        )
        return response

    except ValueError as e:
        # Handle validation errors
        logger.warning(
            f"Validation error in charging optimization request: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        # Log unexpected errors
        logger.error(f"Error optimizing charging schedule: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while optimizing the charging schedule"
        )

# Setup Application Insights on module import
setup_application_insights()
