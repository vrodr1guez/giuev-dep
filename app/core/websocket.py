import logging
from typing import Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    WebSocket connection manager for handling real-time connections
    """
    def __init__(self):
        # Active connections per topic
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Maps websocket connections to user_ids
        self.connection_user_map: Dict[WebSocket, str] = {}
        # Maps vehicle_ids to set of users monitoring them
        self.vehicle_subscribers: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, topic: str, user_id: str) -> None:
        """
        Connect a client to a specific topic
        """
        await websocket.accept()
        if topic not in self.active_connections:
            self.active_connections[topic] = []
        self.active_connections[topic].append(websocket)
        self.connection_user_map[websocket] = user_id
        logger.info(f"Client {user_id} connected to {topic}")
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "message": f"Connected to {topic}"
        })

    def disconnect(self, websocket: WebSocket, topic: str) -> None:
        """
        Disconnect a client from a topic
        """
        if topic in self.active_connections:
            if websocket in self.active_connections[topic]:
                self.active_connections[topic].remove(websocket)
        
        if websocket in self.connection_user_map:
            user_id = self.connection_user_map[websocket]
            del self.connection_user_map[websocket]
            logger.info(f"Client {user_id} disconnected from {topic}")

    async def subscribe_to_vehicle(self, websocket: WebSocket, vehicle_id: str) -> None:
        """
        Subscribe a client to vehicle telemetry updates
        """
        if websocket not in self.connection_user_map:
            logger.warning("Cannot subscribe: client not connected")
            return
            
        user_id = self.connection_user_map[websocket]
        if vehicle_id not in self.vehicle_subscribers:
            self.vehicle_subscribers[vehicle_id] = set()
        
        self.vehicle_subscribers[vehicle_id].add(user_id)
        logger.info(f"User {user_id} subscribed to vehicle {vehicle_id}")
        
        await websocket.send_json({
            "type": "subscription_confirmed",
            "vehicle_id": vehicle_id,
            "timestamp": datetime.now().isoformat()
        })

    async def unsubscribe_from_vehicle(self, websocket: WebSocket, vehicle_id: str) -> None:
        """
        Unsubscribe a client from vehicle telemetry updates
        """
        if websocket not in self.connection_user_map:
            return
            
        user_id = self.connection_user_map[websocket]
        if vehicle_id in self.vehicle_subscribers and user_id in self.vehicle_subscribers[vehicle_id]:
            self.vehicle_subscribers[vehicle_id].remove(user_id)
            logger.info(f"User {user_id} unsubscribed from vehicle {vehicle_id}")
            
            await websocket.send_json({
                "type": "unsubscription_confirmed",
                "vehicle_id": vehicle_id,
                "timestamp": datetime.now().isoformat()
            })

    async def broadcast_vehicle_telemetry(self, vehicle_id: str, data: dict) -> None:
        """
        Broadcast vehicle telemetry to all subscribed clients
        """
        if vehicle_id not in self.vehicle_subscribers:
            return
            
        # Add timestamp to data
        data["timestamp"] = datetime.now().isoformat()
        data["type"] = "telemetry_update"
        
        subscribers = self.vehicle_subscribers[vehicle_id]
        connections_to_notify = []
        
        # Find all connections for the subscribed users
        for websocket, user_id in self.connection_user_map.items():
            if user_id in subscribers and "telematics" in self.active_connections:
                if websocket in self.active_connections["telematics"]:
                    connections_to_notify.append(websocket)
        
        disconnected = []
        for websocket in connections_to_notify:
            try:
                await websocket.send_json(data)
            except RuntimeError:
                # Connection already closed
                disconnected.append(websocket)
                
        # Clean up any disconnected websockets
        for websocket in disconnected:
            if "telematics" in self.active_connections and websocket in self.active_connections["telematics"]:
                self.disconnect(websocket, "telematics")

    async def broadcast_charging_station_update(self, station_id: str, data: dict) -> None:
        """
        Broadcast charging station updates to all clients monitoring charging stations
        """
        if "charging_stations" not in self.active_connections:
            return
            
        # Add timestamp and metadata to data
        data["timestamp"] = datetime.now().isoformat()
        data["type"] = "station_update"
        data["station_id"] = station_id
        
        disconnected = []
        for websocket in self.active_connections["charging_stations"]:
            try:
                await websocket.send_json(data)
            except RuntimeError:
                # Connection already closed
                disconnected.append(websocket)
                
        # Clean up any disconnected websockets
        for websocket in disconnected:
            self.disconnect(websocket, "charging_stations")

    async def send_personal_notification(self, user_id: str, notification: dict) -> None:
        """
        Send a notification to a specific user
        """
        notification["timestamp"] = datetime.now().isoformat()
        notification["type"] = "notification"
        
        targets = []
        for websocket, ws_user_id in self.connection_user_map.items():
            if ws_user_id == user_id and "notifications" in self.active_connections:
                if websocket in self.active_connections["notifications"]:
                    targets.append(websocket)
        
        for websocket in targets:
            try:
                await websocket.send_json(notification)
            except RuntimeError:
                # Connection already closed
                self.disconnect(websocket, "notifications")

# Create global instance
connection_manager = ConnectionManager() 