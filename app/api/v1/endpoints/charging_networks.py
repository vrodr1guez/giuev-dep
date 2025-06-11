from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from typing import List, Optional, Dict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_user, get_current_active_superuser
from app.models.user import User
from app.models.charging_network import ChargingNetwork as ChargingNetworkModel
from app.schemas.charging_network import (
    ChargingNetwork, 
    ChargingNetworkCreate, 
    ChargingNetworkUpdate, 
    ChargingNetworkList
)
from app.core.logging import logger

router = APIRouter()


@router.get("/", response_model=ChargingNetworkList)
async def get_charging_networks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
):
    """
    Get all charging networks.
    """
    try:
        total = db.query(ChargingNetworkModel).count()
        networks = db.query(ChargingNetworkModel).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "networks": networks
        }
    except Exception as e:
        logger.error(f"Error in get_charging_networks: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/", response_model=ChargingNetwork, status_code=status.HTTP_201_CREATED)
async def create_charging_network(
    *,
    db: Session = Depends(get_db),
    network_in: ChargingNetworkCreate,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can create networks
):
    """
    Create a new charging network.
    """
    try:
        # Check if a network with the same name already exists
        existing_network = db.query(ChargingNetworkModel).filter(
            ChargingNetworkModel.name == network_in.name
        ).first()
        
        if existing_network:
            raise HTTPException(
                status_code=400,
                detail=f"A charging network with the name '{network_in.name}' already exists"
            )
        
        # Create new network
        db_network = ChargingNetworkModel(**network_in.model_dump())
        db.add(db_network)
        db.commit()
        db.refresh(db_network)
        
        return db_network
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_charging_network: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{network_id}", response_model=ChargingNetwork)
async def get_charging_network(
    network_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific charging network by ID.
    """
    try:
        network = db.query(ChargingNetworkModel).filter(ChargingNetworkModel.id == network_id).first()
        
        if not network:
            raise HTTPException(status_code=404, detail="Charging network not found")
        
        return network
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_charging_network: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/{network_id}", response_model=ChargingNetwork)
async def update_charging_network(
    *,
    db: Session = Depends(get_db),
    network_id: int,
    network_in: ChargingNetworkUpdate,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can update networks
):
    """
    Update a charging network.
    """
    try:
        db_network = db.query(ChargingNetworkModel).filter(ChargingNetworkModel.id == network_id).first()
        
        if not db_network:
            raise HTTPException(status_code=404, detail="Charging network not found")
        
        # Update fields if they are provided
        update_data = network_in.model_dump(exclude_unset=True)
        
        # If name is being updated, check for duplicates
        if "name" in update_data and update_data["name"] != db_network.name:
            existing_network = db.query(ChargingNetworkModel).filter(
                ChargingNetworkModel.name == update_data["name"]
            ).first()
            
            if existing_network:
                raise HTTPException(
                    status_code=400,
                    detail=f"A charging network with the name '{update_data['name']}' already exists"
                )
        
        for field, value in update_data.items():
            setattr(db_network, field, value)
        
        db.commit()
        db.refresh(db_network)
        
        return db_network
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_charging_network: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/{network_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_charging_network(
    *,
    db: Session = Depends(get_db),
    network_id: int,
    current_user: User = Depends(get_current_active_superuser),  # Only admins can delete networks
):
    """
    Delete a charging network.
    """
    try:
        db_network = db.query(ChargingNetworkModel).filter(ChargingNetworkModel.id == network_id).first()
        
        if not db_network:
            raise HTTPException(status_code=404, detail="Charging network not found")
        
        db.delete(db_network)
        db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_charging_network: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 