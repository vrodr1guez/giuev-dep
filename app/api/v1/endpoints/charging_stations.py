from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import time

from app.db.session import get_db
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.models.charging_station import ChargingStation as ChargingStationModel, ChargingConnector as ChargingConnectorModel, ChargingStationStatus
from app.models.user import User
from app.schemas.charging import (
    ChargingStation,
    ChargingStationCreate,
    ChargingStationUpdate,
    ChargingStationList,
    ChargingConnector,
    ChargingConnectorCreate,
    ChargingConnectorUpdate,
)
from app.core.logging import logger

router = APIRouter()


@router.get("/demo", response_model=Dict[str, Any])
async def get_demo_charging_stations():
    """
    Get demo charging stations data for testing without authentication.
    Returns realistic sample data for development and demonstration purposes.
    """
    try:
        demo_stations = [
            {
                "id": 1,
                "name": "Downtown Charging Hub",
                "description": "High-speed charging station in downtown business district",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "address": "123 Main Street",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "zip_code": "10001",
                "status": "active",
                "is_public": True,
                "hourly_rate": 0.35,
                "has_restroom": True,
                "has_convenience_store": False,
                "has_restaurant": True,
                "open_24_hours": True,
                "connectors": [
                    {
                        "id": 1,
                        "connector_type": "CCS",
                        "power_kw": 150.0,
                        "voltage": 400,
                        "amperage": 375,
                        "connector_number": 1,
                        "status": "available"
                    },
                    {
                        "id": 2,
                        "connector_type": "CHAdeMO",
                        "power_kw": 100.0,
                        "voltage": 400,
                        "amperage": 250,
                        "connector_number": 2,
                        "status": "occupied"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Highway Rest Stop Charging",
                "description": "Fast charging for highway travelers",
                "latitude": 40.7831,
                "longitude": -73.9712,
                "address": "456 Highway 101",
                "city": "New York",
                "state": "NY", 
                "country": "USA",
                "zip_code": "10002",
                "status": "active",
                "is_public": True,
                "hourly_rate": 0.42,
                "has_restroom": True,
                "has_convenience_store": True,
                "has_restaurant": False,
                "open_24_hours": True,
                "connectors": [
                    {
                        "id": 3,
                        "connector_type": "Tesla Supercharger",
                        "power_kw": 250.0,
                        "voltage": 400,
                        "amperage": 625,
                        "connector_number": 1,
                        "status": "available"
                    },
                    {
                        "id": 4,
                        "connector_type": "CCS",
                        "power_kw": 150.0,
                        "voltage": 400,
                        "amperage": 375,
                        "connector_number": 2,
                        "status": "maintenance"
                    }
                ]
            },
            {
                "id": 3,
                "name": "Shopping Mall Charging Plaza",
                "description": "Convenient charging while shopping",
                "latitude": 40.7589,
                "longitude": -73.9851,
                "address": "789 Mall Drive",
                "city": "New York",
                "state": "NY",
                "country": "USA", 
                "zip_code": "10003",
                "status": "active",
                "is_public": True,
                "hourly_rate": 0.28,
                "has_restroom": True,
                "has_convenience_store": False,
                "has_restaurant": True,
                "open_24_hours": False,
                "connectors": [
                    {
                        "id": 5,
                        "connector_type": "Level 2",
                        "power_kw": 7.2,
                        "voltage": 240,
                        "amperage": 30,
                        "connector_number": 1,
                        "status": "available"
                    },
                    {
                        "id": 6,
                        "connector_type": "Level 2",
                        "power_kw": 7.2,
                        "voltage": 240,
                        "amperage": 30,
                        "connector_number": 2,
                        "status": "available"
                    }
                ]
            }
        ]
        
        return {
            "status": "success",
            "message": "Demo charging stations data",
            "timestamp": int(time.time()),
            "total": len(demo_stations),
            "stations": demo_stations,
            "metadata": {
                "demo_mode": True,
                "authentication_required": False,
                "federated_learning_ready": True,
                "v2g_capable": True,
                "digital_twin_integration": True
            }
        }
    except Exception as e:
        logger.error(f"Error in get_demo_charging_stations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/", response_model=ChargingStationList)
async def get_charging_stations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[ChargingStationStatus] = None,
    is_public: Optional[bool] = None,
    organization_id: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: Optional[float] = None,
):
    """
    Get all charging stations with optional filtering.
    """
    try:
        query = db.query(ChargingStationModel)
        
        # Apply filters
        if status:
            query = query.filter(ChargingStationModel.status == status)
        
        if is_public is not None:
            query = query.filter(ChargingStationModel.is_public == is_public)
        
        if organization_id:
            query = query.filter(ChargingStationModel.organization_id == organization_id)
        
        # Filter by location if lat, long, and radius are provided
        if latitude is not None and longitude is not None and radius_km is not None:
            # Simple distance calculation
            # For more accurate results, you would use PostGIS or similar
            # This is a simplified approximation using Euclidean distance
            earth_radius = 6371  # km
            lat_scale = func.cos(func.radians(latitude))
            
            distance = func.sqrt(
                func.pow((func.radians(ChargingStationModel.latitude) - func.radians(latitude)) * earth_radius, 2) +
                func.pow((func.radians(ChargingStationModel.longitude) - func.radians(longitude)) * lat_scale * earth_radius, 2)
            )
            
            query = query.filter(distance <= radius_km)
        
        total = query.count()
        stations = query.offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "stations": stations
        }
    except Exception as e:
        logger.error(f"Error in get_charging_stations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/", response_model=ChargingStation, status_code=status.HTTP_201_CREATED)
async def create_charging_station(
    *,
    db: Session = Depends(get_db),
    station_in: ChargingStationCreate,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can create stations
):
    """
    Create a new charging station with connectors.
    """
    try:
        # Create the station
        db_station = ChargingStationModel(
            name=station_in.name,
            description=station_in.description,
            latitude=station_in.latitude,
            longitude=station_in.longitude,
            address=station_in.address,
            city=station_in.city,
            state=station_in.state,
            country=station_in.country,
            zip_code=station_in.zip_code,
            status=station_in.status,
            organization_id=station_in.organization_id,
            is_public=station_in.is_public,
            hourly_rate=station_in.hourly_rate,
            has_restroom=station_in.has_restroom,
            has_convenience_store=station_in.has_convenience_store,
            has_restaurant=station_in.has_restaurant,
            open_24_hours=station_in.open_24_hours,
        )
        
        db.add(db_station)
        db.flush()  # Get the ID without committing
        
        # Create the connectors
        for connector_in in station_in.connectors:
            db_connector = ChargingConnectorModel(
                charging_station_id=db_station.id,
                connector_type=connector_in.connector_type,
                power_kw=connector_in.power_kw,
                voltage=connector_in.voltage,
                amperage=connector_in.amperage,
                connector_number=connector_in.connector_number,
                status=connector_in.status,
            )
            db.add(db_connector)
        
        db.commit()
        db.refresh(db_station)
        
        return db_station
    except Exception as e:
        db.rollback()
        logger.error(f"Error in create_charging_station: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{station_id}", response_model=ChargingStation)
async def get_charging_station(
    station_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific charging station by ID.
    """
    try:
        station = db.query(ChargingStationModel).filter(ChargingStationModel.id == station_id).first()
        
        if not station:
            raise HTTPException(status_code=404, detail="Charging station not found")
        
        # Private stations are only visible to users from the same organization
        if not station.is_public and station.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this charging station")
        
        return station
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_charging_station: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/{station_id}", response_model=ChargingStation)
async def update_charging_station(
    *,
    db: Session = Depends(get_db),
    station_id: int,
    station_in: ChargingStationUpdate,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can update stations
):
    """
    Update a charging station.
    """
    try:
        db_station = db.query(ChargingStationModel).filter(ChargingStationModel.id == station_id).first()
        
        if not db_station:
            raise HTTPException(status_code=404, detail="Charging station not found")
        
        # Update fields if they are provided
        update_data = station_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_station, field, value)
        
        db.commit()
        db.refresh(db_station)
        
        return db_station
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in update_charging_station: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/{station_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_charging_station(
    *,
    db: Session = Depends(get_db),
    station_id: int,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can delete stations
):
    """
    Delete a charging station.
    """
    try:
        db_station = db.query(ChargingStationModel).filter(ChargingStationModel.id == station_id).first()
        
        if not db_station:
            raise HTTPException(status_code=404, detail="Charging station not found")
        
        db.delete(db_station)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in delete_charging_station: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# CRUD operations for connectors

@router.post("/{station_id}/connectors", response_model=ChargingConnector, status_code=status.HTTP_201_CREATED)
async def create_connector(
    *,
    db: Session = Depends(get_db),
    station_id: int,
    connector_in: ChargingConnectorCreate,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can add connectors
):
    """
    Add a new connector to an existing charging station.
    """
    try:
        # Verify the station exists
        station = db.query(ChargingStationModel).filter(ChargingStationModel.id == station_id).first()
        
        if not station:
            raise HTTPException(status_code=404, detail="Charging station not found")
        
        # Create the connector
        db_connector = ChargingConnectorModel(
            charging_station_id=station_id,
            connector_type=connector_in.connector_type,
            power_kw=connector_in.power_kw,
            voltage=connector_in.voltage,
            amperage=connector_in.amperage,
            connector_number=connector_in.connector_number,
            status=connector_in.status,
        )
        
        db.add(db_connector)
        db.commit()
        db.refresh(db_connector)
        
        return db_connector
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in create_connector: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/{station_id}/connectors/{connector_id}", response_model=ChargingConnector)
async def update_connector(
    *,
    db: Session = Depends(get_db),
    station_id: int,
    connector_id: int,
    connector_in: ChargingConnectorUpdate,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can update connectors
):
    """
    Update a connector.
    """
    try:
        db_connector = (
            db.query(ChargingConnectorModel)
            .filter(
                ChargingConnectorModel.id == connector_id,
                ChargingConnectorModel.charging_station_id == station_id
            )
            .first()
        )
        
        if not db_connector:
            raise HTTPException(status_code=404, detail="Connector not found")
        
        # Update fields if they are provided
        update_data = connector_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_connector, field, value)
        
        db.commit()
        db.refresh(db_connector)
        
        return db_connector
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in update_connector: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/{station_id}/connectors/{connector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connector(
    *,
    db: Session = Depends(get_db),
    station_id: int,
    connector_id: int,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can delete connectors
):
    """
    Delete a connector.
    """
    try:
        db_connector = (
            db.query(ChargingConnectorModel)
            .filter(
                ChargingConnectorModel.id == connector_id,
                ChargingConnectorModel.charging_station_id == station_id
            )
            .first()
        )
        
        if not db_connector:
            raise HTTPException(status_code=404, detail="Connector not found")
        
        db.delete(db_connector)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in delete_connector: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 