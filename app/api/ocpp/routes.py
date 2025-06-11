from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

from app.db.session import get_db
from app.models.ocpp_models import (
    OCPPChargePoint, OCPPConnector, OCPPTransaction, OCPPRFIDCard,
    OCPPMeterValue, OCPPConfiguration, OCPPFirmwareStatus,
    ChargePointStatus, TransactionStatus, AuthorizationStatus
)
from app.ocpp.central_system import central_system
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/ocpp", tags=["OCPP"])

# Pydantic models for API requests/responses

class ChargePointResponse(BaseModel):
    id: int
    charge_point_id: str
    vendor: Optional[str]
    model: Optional[str]
    serial_number: Optional[str]
    firmware_version: Optional[str]
    ocpp_version: str
    is_online: bool
    status: str
    number_of_connectors: int
    max_power_kw: Optional[float]
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]
    last_seen: datetime
    created_at: datetime

class ConnectorResponse(BaseModel):
    id: int
    connector_id: int
    connector_type: Optional[str]
    max_power_kw: Optional[float]
    status: str
    error_code: Optional[str]
    current_transaction_id: Optional[int]

class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    id_tag: str
    start_timestamp: datetime
    end_timestamp: Optional[datetime]
    meter_start: int
    meter_stop: Optional[int]
    energy_delivered: Optional[float]
    status: str
    stop_reason: Optional[str]
    total_cost: Optional[float]
    session_duration_minutes: Optional[int]

class RFIDCardResponse(BaseModel):
    id: int
    id_tag: str
    user_name: Optional[str]
    user_email: Optional[str]
    status: str
    expiry_date: Optional[datetime]
    last_used: Optional[datetime]

class StartTransactionRequest(BaseModel):
    connector_id: int = Field(..., ge=1, description="Connector ID (1-based)")
    id_tag: str = Field(..., min_length=1, max_length=20, description="RFID tag or authorization token")

class StopTransactionRequest(BaseModel):
    transaction_id: str = Field(..., description="Transaction ID to stop")

class ChangeConfigurationRequest(BaseModel):
    key: str = Field(..., description="Configuration key")
    value: str = Field(..., description="Configuration value")

class UpdateFirmwareRequest(BaseModel):
    location: str = Field(..., description="Firmware download URL")
    retrieve_date: datetime = Field(..., description="When to start the update")

class CreateRFIDCardRequest(BaseModel):
    id_tag: str = Field(..., min_length=1, max_length=20)
    user_name: Optional[str] = Field(None, max_length=255)
    user_email: Optional[str] = Field(None, max_length=255)
    expiry_date: Optional[datetime] = None
    max_daily_energy_kwh: Optional[float] = Field(None, ge=0)
    max_daily_cost: Optional[float] = Field(None, ge=0)

# Charge Point Management Routes

@router.get("/charge-points", response_model=List[ChargePointResponse])
async def get_charge_points(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    online_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get list of all charge points"""
    query = db.query(OCPPChargePoint)
    
    if online_only:
        query = query.filter(OCPPChargePoint.is_online == True)
    
    charge_points = query.offset(skip).limit(limit).all()
    return charge_points

@router.get("/charge-points/{charge_point_id}", response_model=ChargePointResponse)
async def get_charge_point(
    charge_point_id: str,
    db: Session = Depends(get_db)
):
    """Get specific charge point details"""
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    return charge_point

@router.get("/charge-points/{charge_point_id}/connectors", response_model=List[ConnectorResponse])
async def get_connectors(
    charge_point_id: str,
    db: Session = Depends(get_db)
):
    """Get connectors for a specific charge point"""
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    connectors = db.query(OCPPConnector).filter(
        OCPPConnector.charge_point_id == charge_point.id
    ).all()
    
    return connectors

@router.get("/charge-points/{charge_point_id}/status")
async def get_charge_point_status(
    charge_point_id: str,
    db: Session = Depends(get_db)
):
    """Get real-time status of charge point"""
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    connectors = db.query(OCPPConnector).filter(
        OCPPConnector.charge_point_id == charge_point.id
    ).all()
    
    return {
        "charge_point": {
            "id": charge_point.charge_point_id,
            "is_online": charge_point.is_online,
            "status": charge_point.status.value,
            "last_seen": charge_point.last_seen
        },
        "connectors": [
            {
                "connector_id": conn.connector_id,
                "status": conn.status.value,
                "error_code": conn.error_code,
                "has_active_transaction": conn.current_transaction_id is not None
            }
            for conn in connectors
        ]
    }

# Transaction Management Routes

@router.post("/charge-points/{charge_point_id}/start-transaction")
async def start_transaction(
    charge_point_id: str,
    request: StartTransactionRequest,
    db: Session = Depends(get_db)
):
    """Remotely start a charging transaction"""
    # Verify charge point exists
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    if not charge_point.is_online:
        raise HTTPException(status_code=400, detail="Charge point is offline")
    
    # Verify connector exists and is available
    connector = db.query(OCPPConnector).filter(
        OCPPConnector.charge_point_id == charge_point.id,
        OCPPConnector.connector_id == request.connector_id
    ).first()
    
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    if connector.current_transaction_id:
        raise HTTPException(status_code=400, detail="Connector is already in use")
    
    # Verify RFID card is valid
    rfid_card = db.query(OCPPRFIDCard).filter(
        OCPPRFIDCard.id_tag == request.id_tag
    ).first()
    
    if not rfid_card:
        raise HTTPException(status_code=400, detail="Invalid ID tag")
    
    if rfid_card.status != AuthorizationStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="ID tag is not authorized")
    
    # Send remote start command to charge point
    result = await central_system.start_transaction(
        charge_point_id, request.connector_id, request.id_tag
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to start transaction"))
    
    return {"message": "Transaction start command sent", "status": result.get("status")}

@router.post("/charge-points/{charge_point_id}/stop-transaction")
async def stop_transaction(
    charge_point_id: str,
    request: StopTransactionRequest,
    db: Session = Depends(get_db)
):
    """Remotely stop a charging transaction"""
    # Verify charge point exists and is online
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    if not charge_point.is_online:
        raise HTTPException(status_code=400, detail="Charge point is offline")
    
    # Verify transaction exists and is active
    transaction = db.query(OCPPTransaction).filter(
        OCPPTransaction.transaction_id == request.transaction_id,
        OCPPTransaction.charge_point_id == charge_point.id,
        OCPPTransaction.status == TransactionStatus.ACTIVE
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Active transaction not found")
    
    # Send remote stop command to charge point
    result = await central_system.stop_transaction(charge_point_id, request.transaction_id)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to stop transaction"))
    
    return {"message": "Transaction stop command sent", "status": result.get("status")}

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    charge_point_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of transactions"""
    query = db.query(OCPPTransaction)
    
    if charge_point_id:
        charge_point = db.query(OCPPChargePoint).filter(
            OCPPChargePoint.charge_point_id == charge_point_id
        ).first()
        if charge_point:
            query = query.filter(OCPPTransaction.charge_point_id == charge_point.id)
    
    if status:
        query = query.filter(OCPPTransaction.status == status)
    
    transactions = query.order_by(OCPPTransaction.start_timestamp.desc()).offset(skip).limit(limit).all()
    return transactions

@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """Get specific transaction details"""
    transaction = db.query(OCPPTransaction).filter(
        OCPPTransaction.transaction_id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction

# Configuration Management Routes

@router.get("/charge-points/{charge_point_id}/configuration")
async def get_configuration(
    charge_point_id: str,
    keys: Optional[str] = Query(None, description="Comma-separated list of configuration keys"),
    db: Session = Depends(get_db)
):
    """Get configuration from charge point"""
    # Verify charge point exists and is online
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    if not charge_point.is_online:
        raise HTTPException(status_code=400, detail="Charge point is offline")
    
    # Parse keys if provided
    key_list = keys.split(',') if keys else None
    
    # Get configuration from charge point
    result = await central_system.get_configuration(charge_point_id, key_list)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to get configuration"))
    
    return result

@router.post("/charge-points/{charge_point_id}/configuration")
async def change_configuration(
    charge_point_id: str,
    request: ChangeConfigurationRequest,
    db: Session = Depends(get_db)
):
    """Change configuration on charge point"""
    # Verify charge point exists and is online
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    if not charge_point.is_online:
        raise HTTPException(status_code=400, detail="Charge point is offline")
    
    # Send configuration change to charge point
    result = await central_system.change_configuration(
        charge_point_id, request.key, request.value
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to change configuration"))
    
    return {"message": "Configuration change sent", "status": result.get("status")}

# Firmware Management Routes

@router.post("/charge-points/{charge_point_id}/firmware/update")
async def update_firmware(
    charge_point_id: str,
    request: UpdateFirmwareRequest,
    db: Session = Depends(get_db)
):
    """Trigger firmware update on charge point"""
    # Verify charge point exists and is online
    charge_point = db.query(OCPPChargePoint).filter(
        OCPPChargePoint.charge_point_id == charge_point_id
    ).first()
    
    if not charge_point:
        raise HTTPException(status_code=404, detail="Charge point not found")
    
    if not charge_point.is_online:
        raise HTTPException(status_code=400, detail="Charge point is offline")
    
    # Send firmware update command
    result = await central_system.update_firmware(
        charge_point_id, request.location, request.retrieve_date
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to trigger firmware update"))
    
    return {"message": "Firmware update triggered"}

# RFID Card Management Routes

@router.get("/rfid-cards", response_model=List[RFIDCardResponse])
async def get_rfid_cards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of RFID cards"""
    query = db.query(OCPPRFIDCard)
    
    if status:
        query = query.filter(OCPPRFIDCard.status == status)
    
    cards = query.offset(skip).limit(limit).all()
    return cards

@router.post("/rfid-cards", response_model=RFIDCardResponse)
async def create_rfid_card(
    request: CreateRFIDCardRequest,
    db: Session = Depends(get_db)
):
    """Create new RFID card"""
    # Check if ID tag already exists
    existing_card = db.query(OCPPRFIDCard).filter(
        OCPPRFIDCard.id_tag == request.id_tag
    ).first()
    
    if existing_card:
        raise HTTPException(status_code=400, detail="ID tag already exists")
    
    # Create new RFID card
    rfid_card = OCPPRFIDCard(
        id_tag=request.id_tag,
        user_name=request.user_name,
        user_email=request.user_email,
        expiry_date=request.expiry_date,
        max_daily_energy_kwh=request.max_daily_energy_kwh,
        max_daily_cost=request.max_daily_cost,
        status=AuthorizationStatus.ACCEPTED
    )
    
    db.add(rfid_card)
    db.commit()
    db.refresh(rfid_card)
    
    return rfid_card

@router.put("/rfid-cards/{id_tag}/status")
async def update_rfid_card_status(
    id_tag: str,
    status: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Update RFID card status"""
    rfid_card = db.query(OCPPRFIDCard).filter(
        OCPPRFIDCard.id_tag == id_tag
    ).first()
    
    if not rfid_card:
        raise HTTPException(status_code=404, detail="RFID card not found")
    
    try:
        rfid_card.status = AuthorizationStatus(status)
        db.commit()
        return {"message": "RFID card status updated"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status value")

@router.delete("/rfid-cards/{id_tag}")
async def delete_rfid_card(
    id_tag: str,
    db: Session = Depends(get_db)
):
    """Delete RFID card"""
    rfid_card = db.query(OCPPRFIDCard).filter(
        OCPPRFIDCard.id_tag == id_tag
    ).first()
    
    if not rfid_card:
        raise HTTPException(status_code=404, detail="RFID card not found")
    
    db.delete(rfid_card)
    db.commit()
    
    return {"message": "RFID card deleted"}

# Statistics and Analytics Routes

@router.get("/statistics/overview")
async def get_statistics_overview(db: Session = Depends(get_db)):
    """Get OCPP system overview statistics"""
    total_charge_points = db.query(OCPPChargePoint).count()
    online_charge_points = db.query(OCPPChargePoint).filter(OCPPChargePoint.is_online == True).count()
    active_transactions = db.query(OCPPTransaction).filter(OCPPTransaction.status == TransactionStatus.ACTIVE).count()
    total_rfid_cards = db.query(OCPPRFIDCard).count()
    
    # Energy statistics (last 30 days)
    from sqlalchemy import func
    from datetime import timedelta
    
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    total_energy = db.query(func.sum(OCPPTransaction.energy_delivered)).filter(
        OCPPTransaction.end_timestamp >= thirty_days_ago,
        OCPPTransaction.energy_delivered.isnot(None)
    ).scalar() or 0
    
    completed_sessions = db.query(OCPPTransaction).filter(
        OCPPTransaction.end_timestamp >= thirty_days_ago,
        OCPPTransaction.status == TransactionStatus.COMPLETED
    ).count()
    
    return {
        "charge_points": {
            "total": total_charge_points,
            "online": online_charge_points,
            "offline": total_charge_points - online_charge_points
        },
        "transactions": {
            "active": active_transactions,
            "completed_last_30_days": completed_sessions
        },
        "energy": {
            "total_kwh_last_30_days": round(total_energy, 2)
        },
        "rfid_cards": {
            "total": total_rfid_cards
        }
    } 