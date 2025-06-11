from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime

class TelematicsData(BaseModel):
    """
    Schema for telematics data from a vehicle
    """
    vehicle_id: str
    timestamp: datetime
    state_of_charge_percent: float = Field(..., ge=0, le=100)
    state_of_health_percent: float = Field(..., ge=0, le=100)
    estimated_range_km: float = Field(..., ge=0)
    latitude: float
    longitude: float
    speed_kmh: float = Field(..., ge=0)
    is_charging: bool
    charging_power_kw: Optional[float] = Field(0, ge=0)
    power_output_kw: Optional[float] = 0
    odometer_km: float = Field(..., ge=0)
    battery_temperature_c: Optional[float] = None
    outside_temperature_c: Optional[float] = None
    energy_consumption_kwh_per_100km: Optional[float] = None
    regenerated_energy_kwh: Optional[float] = Field(0, ge=0)

    class Config:
        from_attributes = True

    @validator('charging_power_kw')
    def charging_power_when_charging(cls, v, values):
        """Ensure charging power is 0 when not charging"""
        if 'is_charging' in values and not values['is_charging'] and v > 0:
            return 0
        return v

class TelematicsHistoryItem(TelematicsData):
    """
    Schema for a historical telematics data point
    """
    energy_consumed_kwh_since_last: Optional[float] = Field(0, ge=0)
    diagnostic_trouble_codes: Optional[List[str]] = []
    trip_id: Optional[str] = None

class TelematicsHistoryResponse(BaseModel):
    """
    Schema for a response containing historical telematics data
    """
    total: int
    data: List[Dict[str, Any]]

class TelemetryUpdateRequest(BaseModel):
    """
    Schema for updating telematics data for a vehicle
    """
    vehicle_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    state_of_charge_percent: Optional[float] = Field(None, ge=0, le=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed_kmh: Optional[float] = Field(None, ge=0)
    is_charging: Optional[bool] = None
    charging_power_kw: Optional[float] = Field(None, ge=0)
    odometer_km: Optional[float] = Field(None, ge=0)
    battery_temperature_c: Optional[float] = None
    outside_temperature_c: Optional[float] = None 