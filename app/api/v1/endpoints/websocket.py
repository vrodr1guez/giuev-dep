from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from typing import Optional
import json
import logging
from sqlalchemy.orm import Session

from app.core.websocket import connection_manager
from app.api import deps
from app.core.auth import get_current_user_ws
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/telematics")
async def websocket_telematics(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(deps.get_db_websocket)
):
    """
    WebSocket endpoint for real-time telematics data
    """
    try:
        # Authenticate the user
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=1008)  # Policy violation
            return
            
        # Connect to the telematics topic
        await connection_manager.connect(websocket, "telematics", str(user.id))
        
        try:
            # Process incoming messages
            while True:
                data = await websocket.receive_json()
                
                # Handle subscription requests
                if data.get("action") == "subscribe":
                    vehicle_id = data.get("vehicle_id")
                    if vehicle_id:
                        await connection_manager.subscribe_to_vehicle(websocket, vehicle_id)
                        
                # Handle unsubscribe requests
                elif data.get("action") == "unsubscribe":
                    vehicle_id = data.get("vehicle_id")
                    if vehicle_id:
                        await connection_manager.unsubscribe_from_vehicle(websocket, vehicle_id)
                
                # Add more message types as needed
                
        except WebSocketDisconnect:
            # Handle disconnection
            connection_manager.disconnect(websocket, "telematics")
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close(code=1011)  # Internal error
        except:
            pass

@router.websocket("/charging-stations")
async def websocket_charging_stations(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(deps.get_db_websocket)
):
    """
    WebSocket endpoint for real-time charging station updates
    """
    try:
        # Authenticate the user
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=1008)  # Policy violation
            return
            
        # Connect to the charging stations topic
        await connection_manager.connect(websocket, "charging_stations", str(user.id))
        
        try:
            # Process incoming messages
            while True:
                data = await websocket.receive_json()
                # Process specific actions if needed
                
        except WebSocketDisconnect:
            # Handle disconnection
            connection_manager.disconnect(websocket, "charging_stations")
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close(code=1011)  # Internal error
        except:
            pass

@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(deps.get_db_websocket)
):
    """
    WebSocket endpoint for real-time notifications
    """
    try:
        # Authenticate the user
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=1008)  # Policy violation
            return
            
        # Connect to the notifications topic
        await connection_manager.connect(websocket, "notifications", str(user.id))
        
        try:
            # Keep the connection alive and process any client messages
            while True:
                await websocket.receive_text()  # Simple ping/pong
                
        except WebSocketDisconnect:
            # Handle disconnection
            connection_manager.disconnect(websocket, "notifications")
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close(code=1011)  # Internal error
        except:
            pass 