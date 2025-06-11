from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- Battery Health Report Schemas ---


class BatteryHealthReportBase(BaseModel):
    vehicle_id: int
    report_date: date
    state_of_health_percent: Optional[float] = None
    estimated_remaining_capacity_kwh: Optional[float] = None
    cycle_count_estimate: Optional[int] = None
    average_cell_temperature_celsius: Optional[float] = None
    notes: Optional[str] = None
    raw_diagnostic_data: Optional[Dict[str, Any]] = None


class BatteryHealthReportCreate(BatteryHealthReportBase):
    pass


class BatteryHealthReportUpdate(BatteryHealthReportBase):
    # Allow partial updates, so all fields are optional
    vehicle_id: Optional[int] = None
    report_date: Optional[date] = None


class BatteryHealthReportInDBBase(BatteryHealthReportBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BatteryHealthReport(BatteryHealthReportInDBBase):
    pass

# --- Alert Schemas ---


class AlertBase(BaseModel):
    organization_id: int
    vehicle_id: Optional[int] = None
    user_id: Optional[int] = None  # User who triggered or is target
    # e.g., low_soc, battery_fault, geofence_breach, maintenance_due,
    # soh_critical
    alert_type: str
    severity: str  # e.g., info, warning, critical
    message: str
    status: Optional[str] = "active"  # e.g., active, acknowledged, resolved


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    status: Optional[str] = None
    acknowledged_by_user_id: Optional[int] = None
    notes: Optional[str] = None  # For adding resolution notes etc.


class AlertInDBBase(AlertBase):
    id: int
    acknowledged_by_user_id: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Alert(AlertInDBBase):
    pass
