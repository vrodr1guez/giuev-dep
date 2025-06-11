from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChargingOptimizationRequest(BaseModel):
    """
    Request model for optimizing EV charging schedule.
    """
    vehicle_id: int = Field(...,
                            description="Unique identifier of the vehicle")
    target_soc_percent: Optional[float] = Field(
        100.0,
        ge=0.0,
        le=100.0,
        description="Target state of charge in percentage"
    )
    departure_time: datetime = Field(
        ...,
        description="Planned departure time when the target SoC should be achieved")
    electricity_tariffs: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="List of time-based electricity rates. Format: [{'start_time': '00:00', 'end_time': '06:00', 'rate': 0.05}]"
    )
    max_charging_power_kw: Optional[float] = Field(
        None,
        gt=0.0,
        description="Maximum charging power in kilowatts, limited by vehicle or charging station"
    )

    class Config:
        schema_extra = {
            "example": {
                "vehicle_id": 123,
                "target_soc_percent": 90.0,
                "departure_time": "2024-03-21T08:00:00",
                "electricity_tariffs": [
                    {"start_time": "00:00", "end_time": "06:00", "rate": 0.05},
                    {"start_time": "06:00", "end_time": "22:00", "rate": 0.15},
                    {"start_time": "22:00", "end_time": "00:00", "rate": 0.08}
                ],
                "max_charging_power_kw": 11.0
            }
        }


class ChargingScheduleSlot(BaseModel):
    """
    Model representing a single time slot in the charging schedule.
    """
    start_time: datetime = Field(
        ...,
        description="Start time of the charging slot"
    )
    end_time: datetime = Field(
        ...,
        description="End time of the charging slot"
    )
    charging_power_kw: float = Field(
        ...,
        gt=0.0,
        description="Charging power in kilowatts during this slot"
    )
    estimated_soc_achieved_percent: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Estimated state of charge achieved by the end of this slot"
    )

    class Config:
        schema_extra = {
            "example": {
                "start_time": "2024-03-21T01:00:00",
                "end_time": "2024-03-21T03:00:00",
                "charging_power_kw": 7.4,
                "estimated_soc_achieved_percent": 75.5
            }
        }


class ChargingOptimizationResponse(BaseModel):
    """
    Response model containing the optimized charging schedule.
    """
    vehicle_id: int = Field(..., description="Vehicle ID from the request")
    optimized_schedule: List[ChargingScheduleSlot] = Field(
        ...,
        description="List of optimized charging time slots"
    )
    total_estimated_cost: Optional[float] = Field(
        None,
        ge=0.0,
        description="Total estimated cost of charging based on electricity tariffs"
    )
    warnings: Optional[List[str]] = Field(
        None,
        description="List of warnings or important notices about the optimization"
    )

    class Config:
        schema_extra = {
            "example": {
                "vehicle_id": 123,
                "optimized_schedule": [
                    {
                        "start_time": "2024-03-21T01:00:00",
                        "end_time": "2024-03-21T03:00:00",
                        "charging_power_kw": 7.4,
                        "estimated_soc_achieved_percent": 75.5
                    },
                    {
                        "start_time": "2024-03-21T03:00:00",
                        "end_time": "2024-03-21T05:00:00",
                        "charging_power_kw": 5.5,
                        "estimated_soc_achieved_percent": 90.0
                    }
                ],
                "total_estimated_cost": 4.25,
                "warnings": [
                    "Charging schedule optimized for lowest cost during off-peak hours",
                    "Target SoC will be achieved before departure time"
                ]
            }
        }
