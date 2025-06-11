from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

# from datetime import date, datetime # Commenting out as datetime is unused
from datetime import datetime

from app.db.session import get_db
from app.schemas.battery_health_alert import (
    BatteryHealthReport, BatteryHealthReportCreate, BatteryHealthReportUpdate,
    Alert, AlertCreate, AlertUpdate
)
from app.services.battery_health_alert import battery_health_service, alert_service
from app.core.logging import logger

router = APIRouter()

# --- Battery Health Report Endpoints ---


@router.post("/vehicles/{vehicle_id}/battery-health-reports",
             response_model=BatteryHealthReport)
async def create_battery_health_report(
    vehicle_id: int,
    report_in: BatteryHealthReportCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new battery health report for a vehicle.

    Parameters:
    - vehicle_id: The ID of the vehicle
    - report_in: The battery health report data

    Returns:
    - The created battery health report
    """
    if report_in.vehicle_id != vehicle_id:
        raise HTTPException(
            status_code=400,
            detail="Vehicle ID in path must match vehicle ID in request body"
        )

    try:
        return battery_health_service.create_battery_health_report(
            db=db, obj_in=report_in)
    except Exception as e:
        logger.error(f"Error creating battery health report: {str(e)}")
        raise HTTPException(status_code=500,
                            detail="Failed to create battery health report")


@router.get("/vehicles/{vehicle_id}/battery-health-reports",
            response_model=List[BatteryHealthReport])
async def get_vehicle_battery_health_reports(
    vehicle_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get battery health reports for a specific vehicle.

    Parameters:
    - vehicle_id: The ID of the vehicle
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return

    Returns:
    - List of battery health reports
    """
    try:
        return battery_health_service.get_battery_health_reports_for_vehicle(
            db=db, vehicle_id=vehicle_id, skip=skip, limit=limit
        )
    except Exception as e:
        logger.error(f"Error fetching battery health reports: {str(e)}")
        raise HTTPException(status_code=500,
                            detail="Failed to fetch battery health reports")


@router.get("/battery-health-reports/{report_id}",
            response_model=BatteryHealthReport)
async def get_battery_health_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific battery health report by ID.

    Parameters:
    - report_id: The ID of the battery health report

    Returns:
    - The requested battery health report
    """
    report = battery_health_service.get_battery_health_report(
        db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404,
                            detail="Battery health report not found")
    return report


@router.put("/battery-health-reports/{report_id}",
            response_model=BatteryHealthReport)
async def update_battery_health_report(
    report_id: int,
    report_in: BatteryHealthReportUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a battery health report.

    Parameters:
    - report_id: The ID of the battery health report to update
    - report_in: The updated battery health report data

    Returns:
    - The updated battery health report
    """
    report = battery_health_service.get_battery_health_report(
        db=db, report_id=report_id)
    if not report:
        raise HTTPException(status_code=404,
                            detail="Battery health report not found")

    try:
        return battery_health_service.update_battery_health_report(
            db=db, db_obj=report, obj_in=report_in
        )
    except Exception as e:
        logger.error(f"Error updating battery health report: {str(e)}")
        raise HTTPException(status_code=500,
                            detail="Failed to update battery health report")


@router.post("/vehicles/{vehicle_id}/battery-health/predict")
async def predict_battery_degradation(
    vehicle_id: int,
    db: Session = Depends(get_db)
):
    """
    Predict battery degradation for a specific vehicle.

    Parameters:
    - vehicle_id: The ID of the vehicle

    Returns:
    - Prediction results including estimated future SoH
    """
    try:
        return battery_health_service.predict_battery_degradation(
            db=db, vehicle_id=vehicle_id)
    except Exception as e:
        logger.error(f"Error predicting battery degradation: {str(e)}")
        raise HTTPException(status_code=500,
                            detail="Failed to predict battery degradation")


@router.post("/vehicles/{vehicle_id}/battery-health/check-alerts")
async def check_battery_health_alerts(
    vehicle_id: int,
    db: Session = Depends(get_db)
):
    """
    Check battery health and create alerts if necessary.

    Parameters:
    - vehicle_id: The ID of the vehicle

    Returns:
    - Confirmation message
    """
    try:
        battery_health_service.check_battery_health_and_create_alerts(
            db=db, vehicle_id=vehicle_id)
        return {"message": "Battery health check completed successfully"}
    except Exception as e:
        logger.error(f"Error checking battery health alerts: {str(e)}")
        raise HTTPException(status_code=500,
                            detail="Failed to check battery health alerts")

# --- Alert Endpoints ---


@router.post("/alerts", response_model=Alert)
async def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new alert.

    Parameters:
    - alert_in: The alert data

    Returns:
    - The created alert
    """
    try:
        return alert_service.create_alert(db=db, obj_in=alert_in)
    except Exception as e:
        logger.error(f"Error creating alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create alert")


@router.get("/organizations/{organization_id}/alerts",
            response_model=List[Alert])
async def get_organization_alerts(
    organization_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get alerts for an organization with optional filters.

    Parameters:
    - organization_id: The ID of the organization
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - status: Filter by alert status
    - vehicle_id: Filter by vehicle ID
    - severity: Filter by alert severity

    Returns:
    - List of alerts matching the criteria
    """
    try:
        return alert_service.get_alerts_for_organization(
            db=db,
            organization_id=organization_id,
            skip=skip,
            limit=limit,
            status=status,
            vehicle_id=vehicle_id,
            severity=severity
        )
    except Exception as e:
        logger.error(f"Error fetching organization alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")


@router.get("/alerts/{alert_id}", response_model=Alert)
async def get_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific alert by ID.

    Parameters:
    - alert_id: The ID of the alert

    Returns:
    - The requested alert
    """
    alert = alert_service.get_alert(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.put("/alerts/{alert_id}", response_model=Alert)
async def update_alert(
    alert_id: int,
    alert_in: AlertUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an alert.

    Parameters:
    - alert_id: The ID of the alert to update
    - alert_in: The updated alert data

    Returns:
    - The updated alert
    """
    alert = alert_service.get_alert(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    try:
        return alert_service.update_alert(db=db, db_obj=alert, obj_in=alert_in)
    except Exception as e:
        logger.error(f"Error updating alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update alert")
