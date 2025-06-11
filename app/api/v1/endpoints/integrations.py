from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.integration import (
    ExternalIntegration, IntegrationType, IntegrationStatus,
    ApiKey, IntegrationDataSync, WeatherForecast, FleetVehicleSync 
)
from app.schemas.integration import (
    ExternalIntegration as ExternalIntegrationSchema,
    ExternalIntegrationCreate, ExternalIntegrationUpdate, 
    ApiKey as ApiKeySchema, ApiKeyCreate, ApiKeyUpdate,
    IntegrationDataSync as IntegrationDataSyncSchema,
    WeatherForecast as WeatherForecastSchema, WeatherDataRequest,
    FleetVehicleSync as FleetVehicleSyncSchema,
    IntegrationTestResponse, 
    ChargingNetworkStationSyncRequest, FleetVehicleSyncRequest,
    ChargingNetworkAuthRequest
)
from app.crud.integration import (
    integration as integration_crud,
    api_key as api_key_crud,
    integration_data_sync as sync_crud,
    weather_forecast as weather_crud,
    fleet_vehicle_sync as fleet_sync_crud
)
from app.services.integration_service import IntegrationService, IntegrationException

router = APIRouter()

# External Integration CRUD operations
@router.post("/", response_model=ExternalIntegrationSchema, status_code=status.HTTP_201_CREATED)
def create_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_in: ExternalIntegrationCreate,
    api_key_in: Optional[ApiKeyCreate] = None
) -> Any:
    """
    Create a new external integration with optional API key.
    """
    # Check if integration of same type and provider already exists
    existing = integration_crud.get_by_provider(
        db, provider=integration_in.provider, integration_type=integration_in.integration_type.value
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Integration with provider {integration_in.provider} and type {integration_in.integration_type} already exists"
        )
    
    return integration_crud.create_with_api_key(db, integration_in=integration_in, api_key_in=api_key_in)


@router.get("/", response_model=List[ExternalIntegrationSchema])
def get_integrations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    integration_type: Optional[str] = None
) -> Any:
    """
    Retrieve all integrations, optionally filtered by type.
    """
    if integration_type:
        try:
            type_enum = IntegrationType(integration_type)
            integrations = integration_crud.get_active_by_type(db, integration_type=type_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid integration type: {integration_type}"
            )
    else:
        integrations = integration_crud.get_multi(db, skip=skip, limit=limit)
    
    return integrations


@router.get("/{integration_id}", response_model=ExternalIntegrationSchema)
def get_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0)
) -> Any:
    """
    Get integration by ID.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    return integration


@router.put("/{integration_id}", response_model=ExternalIntegrationSchema)
def update_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    integration_in: ExternalIntegrationUpdate
) -> Any:
    """
    Update an integration.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    return integration_crud.update(db, db_obj=integration, obj_in=integration_in)


@router.delete("/{integration_id}", response_model=ExternalIntegrationSchema)
def delete_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0)
) -> Any:
    """
    Delete an integration.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    return integration_crud.remove(db, id=integration_id)


# API Key management
@router.post("/{integration_id}/api-keys", response_model=ApiKeySchema)
def create_api_key(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    api_key_in: ApiKeyCreate
) -> Any:
    """
    Create a new API key for an integration.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    api_key_data = jsonable_encoder(api_key_in)
    db_api_key = ApiKey(**api_key_data, integration_id=integration_id)
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key


@router.get("/{integration_id}/api-keys", response_model=List[ApiKeySchema])
def get_api_keys(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    active_only: bool = False
) -> Any:
    """
    Get API keys for an integration.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    return api_key_crud.get_by_integration(db, integration_id=integration_id, active_only=active_only)


@router.put("/{integration_id}/api-keys/{api_key_id}", response_model=ApiKeySchema)
def update_api_key(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    api_key_id: int = Path(..., gt=0),
    api_key_in: ApiKeyUpdate
) -> Any:
    """
    Update an API key.
    """
    api_key = api_key_crud.get(db, id=api_key_id)
    if not api_key or api_key.integration_id != integration_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key with ID {api_key_id} not found for integration {integration_id}"
        )
    
    return api_key_crud.update(db, db_obj=api_key, obj_in=api_key_in)


@router.delete("/{integration_id}/api-keys/{api_key_id}", response_model=ApiKeySchema)
def delete_api_key(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    api_key_id: int = Path(..., gt=0)
) -> Any:
    """
    Delete an API key.
    """
    api_key = api_key_crud.get(db, id=api_key_id)
    if not api_key or api_key.integration_id != integration_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key with ID {api_key_id} not found for integration {integration_id}"
        )
    
    return api_key_crud.remove(db, id=api_key_id)


# Integration testing and operations
@router.post("/{integration_id}/test", response_model=IntegrationTestResponse)
def test_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0)
) -> Any:
    """
    Test connectivity to an external integration.
    """
    integration_service = IntegrationService(db)
    
    try:
        test_result = integration_service.test_integration(integration_id)
        return test_result
    except IntegrationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Charging Network Integration Endpoints
@router.post("/charging-network/sync-stations", response_model=IntegrationDataSyncSchema)
def sync_charging_stations(
    *,
    db: Session = Depends(deps.get_db),
    request: ChargingNetworkStationSyncRequest
) -> Any:
    """
    Sync charging stations from an external charging network.
    """
    integration_service = IntegrationService(db)
    
    try:
        sync_result = integration_service.sync_charging_network_stations(request)
        return sync_result
    except IntegrationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/charging-network/authorize", status_code=status.HTTP_202_ACCEPTED)
def authorize_charging_network(
    *,
    db: Session = Depends(deps.get_db),
    request: ChargingNetworkAuthRequest
) -> Any:
    """
    Authorize a user with a charging network provider.
    
    This would typically involve OAuth2 authorization flow or similar.
    """
    # This is a placeholder - implementation would depend on the specific
    # charging network's authorization flow.
    integration = integration_crud.get(db, id=request.integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {request.integration_id} not found"
        )
    
    if integration.integration_type != IntegrationType.CHARGING_NETWORK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified integration is not a charging network"
        )
    
    # Return a status response
    # In a real implementation, this would likely redirect to the provider's auth page
    # or process an authorization code to obtain tokens
    return {
        "status": "authorization_initiated",
        "message": "Authorization process initiated with charging network",
        "next_steps": "Follow provider-specific authorization flow"
    }


# Weather Service Integration Endpoints
@router.post("/weather/forecast", response_model=List[WeatherForecastSchema])
def get_weather_forecast(
    *,
    db: Session = Depends(deps.get_db),
    request: WeatherDataRequest
) -> Any:
    """
    Get weather forecast data from a weather service integration.
    """
    integration_service = IntegrationService(db)
    
    try:
        forecasts = integration_service.get_weather_forecast(request)
        return forecasts
    except IntegrationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/weather/forecast/{latitude}/{longitude}", response_model=List[WeatherForecastSchema])
def get_latest_weather_forecast(
    *,
    db: Session = Depends(deps.get_db),
    latitude: float = Path(..., ge=-90, le=90),
    longitude: float = Path(..., ge=-180, le=180),
    integration_id: Optional[int] = Query(None)
) -> Any:
    """
    Get the latest weather forecast for a specific location.
    
    This uses cached data from previous forecasts rather than making a new API call.
    """
    forecasts = weather_crud.get_by_location(
        db, latitude=latitude, longitude=longitude, 
        integration_id=integration_id, limit=10
    )
    
    if not forecasts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No weather forecast data found for location ({latitude}, {longitude})"
        )
    
    return forecasts


# Fleet Management Integration Endpoints
@router.post("/fleet/sync-vehicles", response_model=IntegrationDataSyncSchema)
def sync_fleet_vehicles(
    *,
    db: Session = Depends(deps.get_db),
    request: FleetVehicleSyncRequest
) -> Any:
    """
    Sync vehicle data from a fleet management system.
    """
    integration_service = IntegrationService(db)
    
    try:
        sync_result = integration_service.sync_fleet_vehicles(request)
        return sync_result
    except IntegrationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/fleet/vehicles/{integration_id}", response_model=List[FleetVehicleSyncSchema])
def get_fleet_vehicles(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all vehicles synced with a fleet management system.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    if integration.integration_type != IntegrationType.FLEET_MANAGEMENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified integration is not a fleet management system"
        )
    
    return fleet_sync_crud.get_by_integration(
        db, integration_id=integration_id, skip=skip, limit=limit
    )


@router.get("/fleet/vehicle/{vehicle_id}/syncs", response_model=List[FleetVehicleSyncSchema])
def get_vehicle_fleet_syncs(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_id: int = Path(..., gt=0)
) -> Any:
    """
    Get all fleet integrations for a specific vehicle.
    """
    syncs = fleet_sync_crud.get_by_vehicle(db, vehicle_id=vehicle_id)
    if not syncs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No fleet syncs found for vehicle with ID {vehicle_id}"
        )
    
    return syncs


# Integration sync history
@router.get("/{integration_id}/syncs", response_model=List[IntegrationDataSyncSchema])
def get_integration_syncs(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    limit: int = Query(10, ge=1, le=100)
) -> Any:
    """
    Get synchronization history for an integration.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    return sync_crud.get_by_integration(db, integration_id=integration_id, limit=limit)


@router.get("/{integration_id}/syncs/{sync_type}", response_model=List[IntegrationDataSyncSchema])
def get_integration_syncs_by_type(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int = Path(..., gt=0),
    sync_type: str = Path(...),
    limit: int = Query(5, ge=1, le=50)
) -> Any:
    """
    Get synchronization history for an integration by sync type.
    """
    integration = integration_crud.get(db, id=integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration with ID {integration_id} not found"
        )
    
    return sync_crud.get_by_type(
        db, integration_id=integration_id, sync_type=sync_type, limit=limit
    ) 