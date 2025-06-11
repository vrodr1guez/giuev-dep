"""
Pydantic schemas for grid integration API endpoints.
These define the data structures for API requests and responses.
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

# Grid status schemas
class GridStatusInfo(BaseModel):
    """Grid status information"""
    demand_percentage: float = Field(..., description="Current grid demand as percentage of total capacity")
    capacity_available: float = Field(..., description="Available grid capacity as percentage")
    grid_stress_level: str = Field(..., description="Current stress level of the grid (low, medium, high)")
    current_price_kwh: float = Field(..., description="Current electricity price per kWh")
    price_tier: str = Field(..., description="Current price tier (off-peak, mid, peak)")

class V2GOpportunityInfo(BaseModel):
    """Vehicle-to-grid opportunity information"""
    level: str = Field(..., description="Level of V2G opportunity (low, medium, high)")
    estimated_return_per_kwh: float = Field(..., description="Estimated financial return per kWh")
    recommended_action: str = Field(..., description="Recommended action (charge, standby, discharge)")

class GridStatusResponse(BaseModel):
    """Grid status response"""
    timestamp: str = Field(..., description="Timestamp of status data")
    grid_status: GridStatusInfo
    v2g_opportunity: V2GOpportunityInfo
    error: Optional[str] = Field(None, description="Error message if applicable")

# Price forecast schemas
class PriceForecastEntry(BaseModel):
    """Price forecast for a specific time"""
    timestamp: str = Field(..., description="Forecast timestamp")
    price_kwh: float = Field(..., description="Forecasted price per kWh")
    price_tier: str = Field(..., description="Price tier (off-peak, mid, peak)")

class PriceForecastResponse(BaseModel):
    """Price forecast response"""
    generated_at: str = Field(..., description="Timestamp when forecast was generated")
    forecast: List[PriceForecastEntry] = Field(..., description="Hourly price forecast")
    error: Optional[str] = Field(None, description="Error message if applicable")

# V2G potential schemas
class V2GPotentialInfo(BaseModel):
    """V2G potential information for a vehicle"""
    available_energy_kwh: float = Field(..., description="Available energy for V2G in kWh")
    available_percentage: float = Field(..., description="Available energy as percentage of battery")
    earnings_potential: float = Field(..., description="Potential earnings from V2G")
    carbon_offset_kg: float = Field(..., description="Potential carbon offset in kg")

class GridContributionInfo(BaseModel):
    """Grid contribution information"""
    grid_stress_level: str = Field(..., description="Current grid stress level")
    priority_score: float = Field(..., description="Priority score for V2G (0-100)")
    recommended_action: str = Field(..., description="Recommended action for V2G")

class BatteryImpactInfo(BaseModel):
    """Battery impact information"""
    chemistry: str = Field(..., description="Battery chemistry")
    health_impact_level: str = Field(..., description="Impact level on battery health")
    estimated_health_impact_pct: float = Field(..., description="Estimated health impact percentage")

class PriceDataInfo(BaseModel):
    """Price data information"""
    current_price_kwh: float = Field(..., description="Current electricity price per kWh")
    compensation_rate_kwh: float = Field(..., description="Compensation rate per kWh for V2G")

class V2GPotentialResponse(BaseModel):
    """V2G potential response"""
    vehicle_id: str = Field(..., description="Vehicle identifier")
    timestamp: str = Field(..., description="Timestamp of assessment")
    v2g_potential: Optional[V2GPotentialInfo] = None
    grid_contribution: Optional[GridContributionInfo] = None
    battery_impact: Optional[BatteryImpactInfo] = None
    price_data: Optional[PriceDataInfo] = None
    error: Optional[str] = Field(None, description="Error message if applicable")

# Fleet grid impact schemas
class FleetGridContribution(BaseModel):
    """Fleet-wide grid contribution information"""
    total_available_energy_kwh: float = Field(..., description="Total available energy across fleet in kWh")
    grid_impact_percentage: float = Field(..., description="Percentage impact on grid capacity")
    total_earnings_potential: float = Field(..., description="Total potential earnings across fleet")
    total_carbon_offset_kg: float = Field(..., description="Total potential carbon offset in kg")

class FleetGridImpactResponse(BaseModel):
    """Fleet grid impact response"""
    timestamp: str = Field(..., description="Timestamp of assessment")
    fleet_size: int = Field(..., description="Number of vehicles in fleet")
    grid_contribution: Optional[FleetGridContribution] = None
    recommended_actions: Optional[Dict[str, int]] = Field(None, description="Count of vehicles by recommended action")
    grid_status: Optional[GridStatusInfo] = None
    detailed_vehicles: Optional[List[V2GPotentialResponse]] = Field(None, description="Detailed V2G potential for each vehicle")
    error: Optional[str] = Field(None, description="Error message if applicable")

# V2G transaction schemas
class V2GTransactionCreate(BaseModel):
    """V2G transaction creation request"""
    vehicle_id: str = Field(..., description="Vehicle identifier")
    max_energy_kwh: Optional[float] = Field(None, description="Maximum energy to provide in kWh")
    min_soc_limit: Optional[int] = Field(30, description="Minimum SoC to maintain")
    max_duration_minutes: Optional[int] = Field(120, description="Maximum duration in minutes")
    price_threshold: Optional[float] = Field(None, description="Minimum price per kWh to accept")

class V2GTransactionResponse(BaseModel):
    """V2G transaction response"""
    transaction_id: str = Field(..., description="Transaction identifier")
    vehicle_id: str = Field(..., description="Vehicle identifier")
    timestamp_start: str = Field(..., description="Start timestamp")
    timestamp_end: Optional[str] = Field(None, description="End timestamp")
    energy_kwh: Optional[float] = Field(None, description="Energy provided in kWh")
    compensation_amount: Optional[float] = Field(None, description="Compensation amount")
    carbon_offset_kg: Optional[float] = Field(None, description="Carbon offset in kg")
    battery_soc_start: Optional[int] = Field(None, description="Battery SoC at start")
    battery_soc_end: Optional[int] = Field(None, description="Battery SoC at end")
    status: str = Field(..., description="Transaction status")
    message: Optional[str] = Field(None, description="Status message") 