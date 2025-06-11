from pydantic import BaseModel, Field, field_validator, ValidationInfo, ConfigDict, constr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
from enum import Enum

class EnergySourceType(str, Enum):
    SOLAR = "solar"
    WIND = "wind"
    HYDRO = "hydro"
    GEOTHERMAL = "geothermal"
    BIOMASS = "biomass"
    GRID = "grid"
    EV_BATTERY = "ev_battery"
    HOME_BATTERY = "home_battery"
    MIXED = "mixed"

class EnergyOfferStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class CarbonCreditStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    TRANSFERRED = "transferred"
    REDEEMED = "redeemed"
    EXPIRED = "expired"

class EnergyOfferBase(BaseModel):
    """Base schema for energy marketplace offers."""
    source_type: EnergySourceType
    energy_amount_kwh: float = Field(..., gt=0, description="Amount of energy offered in kWh")
    price_per_kwh: float = Field(..., gt=0, description="Asking price per kWh")
    availability_start: datetime
    availability_end: datetime
    location_latitude: float = Field(..., ge=-90, le=90)
    location_longitude: float = Field(..., ge=-180, le=180)
    min_purchase_kwh: Optional[float] = Field(0.1, gt=0, description="Minimum purchase amount")
    max_distance_km: Optional[float] = Field(10.0, gt=0, description="Maximum distance for delivery")
    carbon_intensity: Optional[float] = Field(None, ge=0, description="Carbon intensity in gCO2/kWh")
    is_renewable: bool = True
    
    @field_validator('availability_end')
    @classmethod
    def validate_time_range(cls, v: datetime, info: ValidationInfo):
        """Validate that end time is after start time."""
        start_time = info.data.get('availability_start')
        if start_time and v <= start_time:
            raise ValueError("End time must be after start time")
        return v

class EnergyOfferCreate(EnergyOfferBase):
    """Schema for creating a new energy offer."""
    seller_id: int
    
    model_config = ConfigDict(extra="forbid")

class EnergyOfferUpdate(BaseModel):
    """Schema for updating an energy offer."""
    energy_amount_kwh: Optional[float] = Field(None, gt=0)
    price_per_kwh: Optional[float] = Field(None, gt=0)
    availability_start: Optional[datetime] = None
    availability_end: Optional[datetime] = None
    min_purchase_kwh: Optional[float] = Field(None, gt=0)
    max_distance_km: Optional[float] = Field(None, gt=0)
    status: Optional[EnergyOfferStatus] = None
    
    model_config = ConfigDict(extra="forbid")

class EnergyOffer(EnergyOfferBase):
    """Schema for energy marketplace offer."""
    id: int
    seller_id: int
    seller_name: Optional[str] = None
    status: EnergyOfferStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_sold_kwh: float = 0
    remaining_kwh: float
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "seller_id": 42,
                "seller_name": "GreenEnergy Home",
                "source_type": "solar",
                "energy_amount_kwh": 10.5,
                "price_per_kwh": 0.12,
                "availability_start": "2024-05-20T10:00:00Z",
                "availability_end": "2024-05-20T16:00:00Z",
                "location_latitude": 45.4215,
                "location_longitude": -75.6972,
                "min_purchase_kwh": 0.5,
                "max_distance_km": 5.0,
                "carbon_intensity": 12.5,
                "is_renewable": True,
                "status": "active",
                "created_at": "2024-05-19T08:00:00Z",
                "updated_at": "2024-05-19T08:00:00Z",
                "total_sold_kwh": 2.5,
                "remaining_kwh": 8.0
            }
        }
    )

class EnergyPurchaseBase(BaseModel):
    """Base schema for energy purchase from marketplace."""
    offer_id: int
    buyer_id: int
    energy_amount_kwh: float = Field(..., gt=0)
    purchase_price_per_kwh: float = Field(..., gt=0)
    delivery_time: datetime
    delivery_location_latitude: float = Field(..., ge=-90, le=90)
    delivery_location_longitude: float = Field(..., ge=-180, le=180)
    vehicle_id: Optional[int] = None
    
    @field_validator('energy_amount_kwh')
    @classmethod
    def validate_energy_amount(cls, v: float, info: ValidationInfo):
        """Validate that energy amount is greater than zero."""
        if v <= 0:
            raise ValueError("Energy amount must be greater than zero")
        return v

class EnergyPurchaseCreate(EnergyPurchaseBase):
    """Schema for creating a new energy purchase."""
    model_config = ConfigDict(extra="forbid")

class EnergyPurchase(EnergyPurchaseBase):
    """Schema for energy purchase."""
    id: int
    offer_source_type: EnergySourceType
    seller_id: int
    carbon_credits_earned: float = 0
    transaction_hash: Optional[str] = None
    is_delivered: bool = False
    created_at: datetime
    delivered_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "offer_id": 2,
                "offer_source_type": "solar",
                "buyer_id": 5,
                "seller_id": 42,
                "energy_amount_kwh": 2.5,
                "purchase_price_per_kwh": 0.12,
                "delivery_time": "2024-05-20T14:00:00Z",
                "delivery_location_latitude": 45.4225,
                "delivery_location_longitude": -75.6950,
                "vehicle_id": 3,
                "carbon_credits_earned": 0.65,
                "transaction_hash": "0x1234567890abcdef",
                "is_delivered": False,
                "created_at": "2024-05-19T10:30:00Z",
                "delivered_at": None
            }
        }
    )

class CarbonCredit(BaseModel):
    """Schema for carbon credits earned from renewable energy use."""
    id: int
    user_id: int
    source_transaction_id: Optional[int] = None
    source_type: str
    amount: float = Field(..., gt=0, description="Amount of carbon credits in kg CO2 equivalent")
    status: CarbonCreditStatus
    certificate_id: Optional[str] = None
    created_at: datetime
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "user_id": 5,
                "source_transaction_id": 1,
                "source_type": "renewable_energy_purchase",
                "amount": 0.65,
                "status": "verified",
                "certificate_id": "CR-20240520-123456",
                "created_at": "2024-05-19T10:30:00Z",
                "verified_at": "2024-05-19T11:00:00Z",
                "expires_at": "2025-05-19T11:00:00Z"
            }
        }
    )

class EnergyMarketplaceStats(BaseModel):
    """Schema for energy marketplace statistics."""
    total_active_offers: int
    total_energy_available_kwh: float
    average_price_per_kwh: float
    renewable_percentage: float
    total_transactions_24h: int
    carbon_credits_generated_24h: float
    peak_trading_hours: List[int]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_active_offers": 120,
                "total_energy_available_kwh": 580.5,
                "average_price_per_kwh": 0.14,
                "renewable_percentage": 87.5,
                "total_transactions_24h": 56,
                "carbon_credits_generated_24h": 28.7,
                "peak_trading_hours": [9, 10, 11, 17, 18, 19]
            }
        }
    )

class EnergyOffersList(BaseModel):
    """Schema for paginated energy offers list response."""
    total: int
    offers: List[EnergyOffer]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 2,
                "offers": [
                    {
                        "id": 1,
                        "seller_name": "GreenEnergy Home",
                        "source_type": "solar",
                        "energy_amount_kwh": 10.5,
                        "price_per_kwh": 0.12,
                        "remaining_kwh": 8.0,
                        "status": "active"
                    },
                    {
                        "id": 2,
                        "seller_name": "WindPower Community",
                        "source_type": "wind",
                        "energy_amount_kwh": 25.0,
                        "price_per_kwh": 0.11,
                        "remaining_kwh": 25.0,
                        "status": "active"
                    }
                ]
            }
        }
    ) 