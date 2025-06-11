from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.api import deps
from app.schemas.user import User
from app.models.notification import Notification
from app.models.driver_profile import DriverProfile, ChargingSchedule
from app.core.notifications import NotificationService, NotificationChannel
from app.services.driver_profile_service import DriverProfileService

router = APIRouter()

# --- Schemas ---

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    priority: str
    data: Optional[Dict[str, Any]] = None
    read: bool
    created_at: str
    read_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class ChargingScheduleBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_time: str
    end_time: str
    target_soc: int = 80
    charging_preference: str = "balanced"
    location_id: Optional[int] = None
    station_id: Optional[int] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[Dict[str, Any]] = None
    smart_charging_enabled: bool = True
    price_threshold: Optional[float] = None
    notify_on_start: bool = True
    notify_on_complete: bool = True
    notify_on_error: bool = True


class ChargingScheduleCreate(ChargingScheduleBase):
    vehicle_id: int


class ChargingScheduleResponse(ChargingScheduleBase):
    id: int
    driver_profile_id: int
    vehicle_id: int
    is_active: bool
    is_complete: bool
    created_at: str
    updated_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class DriverProfileBase(BaseModel):
    preferred_min_soc: int = 20
    preferred_max_soc: int = 90
    optimal_departure_soc: int = 80
    charging_preference: str = "balanced"
    eco_priority: int = 5
    cost_priority: int = 5
    speed_priority: int = 5
    typical_departure_times: Optional[Dict[str, Any]] = None
    typical_return_times: Optional[Dict[str, Any]] = None
    min_comfortable_range: float = 50.0
    typical_daily_mileage: Optional[float] = None
    custom_parameters: Optional[Dict[str, Any]] = None
    enable_v2g: bool = False
    v2g_min_soc: int = 50
    v2g_max_discharge: int = 30


class DriverProfileCreate(DriverProfileBase):
    pass


class DriverProfileUpdate(DriverProfileBase):
    pass


class DriverProfileResponse(DriverProfileBase):
    id: int
    user_id: int
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class VehicleStatusResponse(BaseModel):
    id: int
    name: str
    model: str
    license_plate: Optional[str] = None
    state_of_charge: float
    estimated_range: float
    charging_status: str
    location: Optional[Dict[str, Any]] = None
    last_updated: str
    
    class Config:
        from_attributes = True


class MobileAppDashboardResponse(BaseModel):
    user: Dict[str, Any]
    vehicles: List[VehicleStatusResponse]
    upcoming_charging_schedules: List[ChargingScheduleResponse]
    recent_notifications: List[NotificationResponse]
    charging_recommendations: List[Dict[str, Any]]
    nearby_charging_stations: List[Dict[str, Any]]


# --- API Endpoints ---

@router.get("/dashboard", response_model=MobileAppDashboardResponse)
async def get_mobile_dashboard(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get dashboard data for the mobile app."""
    # This would be implemented to collect all relevant data
    # for the mobile app dashboard
    profile_service = DriverProfileService(db)
    
    # For demonstration purposes, return a skeleton response
    return {
        "user": current_user,
        "vehicles": [],  # Would be populated with actual vehicle data
        "upcoming_charging_schedules": [],
        "recent_notifications": [],
        "charging_recommendations": [],
        "nearby_charging_stations": []
    }


@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Get user notifications."""
    notifications = await notification_service.get_user_notifications(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
        unread_only=unread_only
    )
    return notifications


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(deps.get_current_user),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Mark a notification as read."""
    success = await notification_service.mark_notification_as_read(
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(deps.get_current_user),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Mark all notifications as read."""
    success = await notification_service.mark_all_notifications_as_read(
        user_id=current_user.id
    )
    return {"success": success}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(deps.get_current_user),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Delete a notification."""
    success = await notification_service.delete_notification(
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}


@router.get("/profile", response_model=DriverProfileResponse)
async def get_driver_profile(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get the user's driver profile."""
    profile_service = DriverProfileService(db)
    profile = profile_service.get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    return profile


@router.post("/profile", response_model=DriverProfileResponse)
async def create_driver_profile(
    profile: DriverProfileCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Create a new driver profile for the user."""
    profile_service = DriverProfileService(db)
    
    # Check if profile already exists
    existing_profile = profile_service.get_profile_by_user_id(current_user.id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="Driver profile already exists")
    
    new_profile = profile_service.create_profile(current_user.id, profile)
    return new_profile


@router.put("/profile", response_model=DriverProfileResponse)
async def update_driver_profile(
    profile: DriverProfileUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Update the user's driver profile."""
    profile_service = DriverProfileService(db)
    
    # Check if profile exists
    existing_profile = profile_service.get_profile_by_user_id(current_user.id)
    if not existing_profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    updated_profile = profile_service.update_profile(existing_profile.id, profile)
    return updated_profile


@router.get("/charging-schedules", response_model=List[ChargingScheduleResponse])
async def get_charging_schedules(
    active_only: bool = Query(True),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get the user's charging schedules."""
    profile_service = DriverProfileService(db)
    profile = profile_service.get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    schedules = profile_service.get_charging_schedules(
        profile_id=profile.id,
        active_only=active_only
    )
    return schedules


@router.post("/charging-schedules", response_model=ChargingScheduleResponse)
async def create_charging_schedule(
    schedule: ChargingScheduleCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Create a new charging schedule."""
    profile_service = DriverProfileService(db)
    profile = profile_service.get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    new_schedule = profile_service.create_charging_schedule(profile.id, schedule)
    
    # Send notification in background
    background_tasks.add_task(
        notification_service.send_notification,
        recipient_id=current_user.id,
        notification_type="charging_schedule_created",
        title="Charging Schedule Created",
        message=f"New charging schedule created: {schedule.name or 'Unnamed'} starting at {schedule.start_time}",
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH]
    )
    
    return new_schedule


@router.put("/charging-schedules/{schedule_id}", response_model=ChargingScheduleResponse)
async def update_charging_schedule(
    schedule_id: int,
    schedule: ChargingScheduleBase,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Update a charging schedule."""
    profile_service = DriverProfileService(db)
    profile = profile_service.get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    # Verify ownership of the schedule
    existing_schedule = profile_service.get_charging_schedule(schedule_id)
    if not existing_schedule or existing_schedule.driver_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Charging schedule not found")
    
    updated_schedule = profile_service.update_charging_schedule(schedule_id, schedule)
    return updated_schedule


@router.delete("/charging-schedules/{schedule_id}")
async def delete_charging_schedule(
    schedule_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Delete a charging schedule."""
    profile_service = DriverProfileService(db)
    profile = profile_service.get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Driver profile not found")
    
    # Verify ownership of the schedule
    existing_schedule = profile_service.get_charging_schedule(schedule_id)
    if not existing_schedule or existing_schedule.driver_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Charging schedule not found")
    
    success = profile_service.delete_charging_schedule(schedule_id)
    return {"success": success}


@router.get("/vehicles", response_model=List[VehicleStatusResponse])
async def get_user_vehicles(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get the vehicles associated with the user."""
    # This would query the database for user's vehicles
    # with their current status
    return []


@router.get("/nearby-stations")
async def get_nearby_charging_stations(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius: float = Query(5.0),  # km or miles
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get charging stations near the provided location."""
    # This would search for nearby charging stations
    # based on the provided coordinates
    return []


@router.post("/register-device")
async def register_mobile_device(
    device_token: str = Query(..., description="Firebase or Apple Push device token"),
    device_type: str = Query(..., description="Device type (ios/android)"),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Register a mobile device for push notifications."""
    # This would store the device token for the user
    # for sending push notifications
    return {"success": True} 