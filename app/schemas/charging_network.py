from pydantic import BaseModel, HttpUrl, ConfigDict, Field, constr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Charging Station Schemas ---


class ChargingStationBase(BaseModel):
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    # e.g., ChargePoint, Tesla, GIU_Private, OCPI_Network_X
    station_provider: Optional[str] = None
    external_station_id: Optional[str] = None  # ID from the provider network
    # e.g., available, in_use, out_of_service, unknown
    status: Optional[str] = "available"
    is_public: Optional[bool] = True
    access_notes: Optional[str] = None
    # If it's a private station tied to an org
    organization_id: Optional[int] = None


class ChargingStationCreate(ChargingStationBase):
    pass


class ChargingStationUpdate(ChargingStationBase):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ChargingStationInDBBase(ChargingStationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChargingStation(ChargingStationInDBBase):
    connectors: List["ChargingConnector"] = []  # Forward reference

# --- Charging Connector Schemas ---


class ChargingConnectorBase(BaseModel):
    station_id: int
    connector_type: str  # e.g., CCS, CHAdeMO, Type2, Tesla_NACS
    power_output_kw: float
    # e.g., available, in_use, faulted, unknown
    status: Optional[str] = "available"
    # Raw pricing data from network
    pricing_info_raw: Optional[Dict[str, Any]] = None
    external_connector_id: Optional[str] = None  # ID from the provider network


class ChargingConnectorCreate(ChargingConnectorBase):
    pass


class ChargingConnectorUpdate(ChargingConnectorBase):
    station_id: Optional[int] = None
    connector_type: Optional[str] = None
    power_output_kw: Optional[float] = None


class ChargingConnectorInDBBase(ChargingConnectorBase):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChargingConnector(ChargingConnectorInDBBase):
    pass


# Update ChargingStation to resolve forward reference
ChargingStation.model_rebuild()

# --- Charging Session Schemas ---


class ChargingSessionBase(BaseModel):
    vehicle_id: int
    connector_id: int
    user_id: Optional[int] = None  # User who initiated
    start_time: datetime
    end_time: Optional[datetime] = None
    energy_delivered_kwh: Optional[float] = None
    start_soc_percent: Optional[float] = None
    end_soc_percent: Optional[float] = None
    cost: Optional[float] = None
    # e.g., pending, authorized, paid, failed
    payment_status: Optional[str] = "pending"
    transaction_id: Optional[str] = None  # From payment gateway
    v2g_energy_discharged_kwh: Optional[float] = 0
    notes: Optional[str] = None
    # Session ID from external network
    external_session_id: Optional[str] = None


class ChargingSessionCreate(ChargingSessionBase):
    pass


class ChargingSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    energy_delivered_kwh: Optional[float] = None
    end_soc_percent: Optional[float] = None
    cost: Optional[float] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    v2g_energy_discharged_kwh: Optional[float] = None
    notes: Optional[str] = None


class ChargingSessionInDBBase(ChargingSessionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChargingSession(ChargingSessionInDBBase):
    pass

# --- External Network Integration Schemas ---


class ExternalChargeRequest(BaseModel):
    vehicle_id: int
    external_station_id: str  # From the public network
    # Specific connector if station has multiple
    external_connector_id: Optional[str] = None
    # Auth token for the specific network
    user_network_token: Optional[str] = None

# --- Payment Processing Schemas ---


class PaymentProcessRequest(BaseModel):
    session_id: int
    payment_method_token: str  # Token from payment gateway
    amount: float
    currency: str = "USD"


class PaymentProcessResponse(BaseModel):
    session_id: int
    transaction_id: str
    payment_status: str  # e.g., success, failed, pending
    message: Optional[str] = None


class ChargingNetworkBase(BaseModel):
    """Base schema for charging network data."""
    name: constr(min_length=1, max_length=100)
    description: Optional[constr(max_length=500)] = None
    website: Optional[constr(max_length=255)] = None
    api_endpoint: Optional[constr(max_length=255)] = None
    logo_url: Optional[constr(max_length=255)] = None
    supports_payment_cards: bool = True
    supports_app_payment: bool = True
    supports_rfid: bool = False
    supports_plug_and_charge: bool = False
    has_subscription_model: bool = False
    base_charging_rate: Optional[float] = Field(default=None, ge=0)


class ChargingNetworkCreate(ChargingNetworkBase):
    """Schema for creating a charging network."""
    model_config = ConfigDict(extra="forbid")


class ChargingNetworkUpdate(BaseModel):
    """Schema for updating a charging network."""
    name: Optional[constr(min_length=1, max_length=100)] = None
    description: Optional[constr(max_length=500)] = None
    website: Optional[constr(max_length=255)] = None
    api_endpoint: Optional[constr(max_length=255)] = None
    logo_url: Optional[constr(max_length=255)] = None
    supports_payment_cards: Optional[bool] = None
    supports_app_payment: Optional[bool] = None
    supports_rfid: Optional[bool] = None
    supports_plug_and_charge: Optional[bool] = None
    has_subscription_model: Optional[bool] = None
    base_charging_rate: Optional[float] = Field(default=None, ge=0)
    
    model_config = ConfigDict(extra="forbid")


class ChargingNetwork(ChargingNetworkBase):
    """Schema for reading charging network data."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Tesla Supercharger",
                "description": "Tesla's proprietary fast charging network",
                "website": "https://www.tesla.com/supercharger",
                "api_endpoint": "https://api.tesla.com/supercharger",
                "logo_url": "https://example.com/tesla_logo.png",
                "supports_payment_cards": True,
                "supports_app_payment": True,
                "supports_rfid": False,
                "supports_plug_and_charge": True,
                "has_subscription_model": False,
                "base_charging_rate": 0.28,
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T10:00:00Z",
            }
        }
    )


class ChargingNetworkList(BaseModel):
    """Schema for paginated charging network list response."""
    total: int
    networks: List[ChargingNetwork]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 2,
                "networks": [
                    {
                        "id": 1,
                        "name": "Tesla Supercharger",
                        "description": "Tesla's proprietary fast charging network",
                        "website": "https://www.tesla.com/supercharger",
                        "api_endpoint": "https://api.tesla.com/supercharger",
                        "logo_url": "https://example.com/tesla_logo.png",
                        "supports_payment_cards": True,
                        "supports_app_payment": True,
                        "supports_rfid": False,
                        "supports_plug_and_charge": True,
                        "has_subscription_model": False,
                        "base_charging_rate": 0.28,
                        "created_at": "2024-03-20T10:00:00Z",
                        "updated_at": "2024-03-20T10:00:00Z",
                    },
                    {
                        "id": 2,
                        "name": "Electrify America",
                        "description": "Volkswagen Group's charging network",
                        "website": "https://www.electrifyamerica.com",
                        "api_endpoint": "https://api.electrifyamerica.com",
                        "logo_url": "https://example.com/electrify_america_logo.png",
                        "supports_payment_cards": True,
                        "supports_app_payment": True,
                        "supports_rfid": True,
                        "supports_plug_and_charge": True,
                        "has_subscription_model": True,
                        "base_charging_rate": 0.43,
                        "created_at": "2024-03-21T10:00:00Z",
                        "updated_at": "2024-03-21T10:00:00Z",
                    }
                ]
            }
        }
    )
