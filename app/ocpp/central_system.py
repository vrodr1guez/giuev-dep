import asyncio
import logging
import websockets
from datetime import datetime, timezone
from typing import Dict, Set, Optional, Any
import uuid
import json

from ocpp.routing import on
from ocpp.v16 import ChargePoint as CP16, call_result, call
from ocpp.v201 import ChargePoint as CP201
from ocpp.v16.enums import Action as Action16, ChargePointStatus, AuthorizationStatus
from ocpp.v201.enums import Action as Action201

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.ocpp_models import (
    OCPPChargePoint, OCPPConnector, OCPPTransaction, OCPPRFIDCard,
    OCPPMeterValue, OCPPConfiguration, OCPPFirmwareStatus,
    ChargePointStatus as DBChargePointStatus,
    TransactionStatus, AuthorizationStatus as DBAuthorizationStatus
)
from app.core.logging import logger

class OCPPCentralSystem:
    """
    Central System for managing OCPP connections and message routing.
    Handles multiple charge points and OCPP protocol versions.
    """
    
    def __init__(self):
        self.charge_points: Dict[str, Any] = {}
        self.connected_clients: Set[str] = set()
        self.logger = logging.getLogger(__name__)
        
    async def on_connect(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """Handle new WebSocket connection from charge point"""
        try:
            # Extract charge point ID from path (e.g., /ocpp/CP001)
            charge_point_id = path.split('/')[-1] if '/' in path else path
            
            if not charge_point_id or charge_point_id == '':
                self.logger.error("Invalid charge point ID in connection path")
                await websocket.close(code=1008, reason="Invalid charge point ID")
                return
            
            self.logger.info(f"Charge point {charge_point_id} attempting to connect")
            
            # Detect OCPP version from subprotocol
            ocpp_version = await self._detect_ocpp_version(websocket)
            
            # Ensure charge point exists in database
            await self._ensure_charge_point_in_db(charge_point_id, ocpp_version)
            
            # Create appropriate handler based on OCPP version
            handler = await self._create_charge_point_handler(charge_point_id, websocket)
            if not handler:
                await websocket.close(code=1008, reason="Unsupported OCPP version")
                return
            
            # Register charge point
            self.charge_points[charge_point_id] = handler
            self.connected_clients.add(charge_point_id)
            
            # Update online status in database
            await self._update_charge_point_online_status(charge_point_id, True)
            
            self.logger.info(f"Charge point {charge_point_id} connected successfully")
            
            # Start handling messages
            await handler.start()
            
        except Exception as e:
            self.logger.error(f"Error handling connection: {str(e)}")
            await websocket.close(code=1011, reason="Internal server error")
    
    async def on_disconnect(self, charge_point_id: str):
        """Handle charge point disconnection"""
        try:
            if charge_point_id in self.charge_points:
                del self.charge_points[charge_point_id]
            
            if charge_point_id in self.connected_clients:
                self.connected_clients.remove(charge_point_id)
            
            # Update offline status in database
            await self._update_charge_point_online_status(charge_point_id, False)
            
            self.logger.info(f"Charge point {charge_point_id} disconnected")
            
        except Exception as e:
            self.logger.error(f"Error handling disconnection: {str(e)}")
    
    async def _create_charge_point_handler(self, charge_point_id: str, websocket):
        """Create charge point handler based on OCPP version"""
        try:
            # For now, default to OCPP 1.6
            return ChargePointHandler16(charge_point_id, websocket, self)
        except Exception as e:
            self.logger.error(f"Error creating handler: {str(e)}")
            return None
    
    async def _detect_ocpp_version(self, websocket) -> str:
        """Detect OCPP version from WebSocket subprotocol"""
        subprotocol = websocket.subprotocol
        if subprotocol and "ocpp" in subprotocol.lower():
            return subprotocol
        return "ocpp1.6"  # Default fallback
    
    async def _ensure_charge_point_in_db(self, charge_point_id: str, ocpp_version: str):
        """Ensure charge point exists in database"""
        db = SessionLocal()
        try:
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == charge_point_id
            ).first()
            
            if not charge_point:
                charge_point = OCPPChargePoint(
                    charge_point_id=charge_point_id,
                    ocpp_version=ocpp_version,
                    status=DBChargePointStatus.UNAVAILABLE,
                    number_of_connectors=1
                )
                db.add(charge_point)
                db.commit()
                
                # Create default connector
                connector = OCPPConnector(
                    charge_point_id=charge_point.id,
                    connector_id=1,
                    status=DBChargePointStatus.AVAILABLE
                )
                db.add(connector)
                db.commit()
                
                self.logger.info(f"Created new charge point {charge_point_id} in database")
                
        except Exception as e:
            self.logger.error(f"Error ensuring charge point in DB: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    async def _update_charge_point_online_status(self, charge_point_id: str, is_online: bool):
        """Update charge point online status in database"""
        db = SessionLocal()
        try:
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == charge_point_id
            ).first()
            
            if charge_point:
                charge_point.is_online = is_online
                charge_point.last_seen = datetime.now(timezone.utc)
                if not is_online:
                    charge_point.status = DBChargePointStatus.UNAVAILABLE
                db.commit()
                
        except Exception as e:
            self.logger.error(f"Error updating online status: {str(e)}")
            db.rollback()
        finally:
            db.close()

    # Public API methods for external control
    
    async def start_transaction(self, charge_point_id: str, connector_id: int, id_tag: str) -> Dict[str, Any]:
        """Remotely start a transaction"""
        if charge_point_id not in self.charge_points:
            return {"success": False, "error": "Charge point not connected"}
        
        handler = self.charge_points[charge_point_id]
        return await handler.remote_start_transaction(connector_id, id_tag)
    
    async def stop_transaction(self, charge_point_id: str, transaction_id: str) -> Dict[str, Any]:
        """Remotely stop a transaction"""
        if charge_point_id not in self.charge_points:
            return {"success": False, "error": "Charge point not connected"}
        
        handler = self.charge_points[charge_point_id]
        return await handler.remote_stop_transaction(transaction_id)
    
    async def get_configuration(self, charge_point_id: str, keys: Optional[list] = None) -> Dict[str, Any]:
        """Get configuration from charge point"""
        if charge_point_id not in self.charge_points:
            return {"success": False, "error": "Charge point not connected"}
        
        handler = self.charge_points[charge_point_id]
        return await handler.get_configuration(keys)
    
    async def change_configuration(self, charge_point_id: str, key: str, value: str) -> Dict[str, Any]:
        """Change configuration on charge point"""
        if charge_point_id not in self.charge_points:
            return {"success": False, "error": "Charge point not connected"}
        
        handler = self.charge_points[charge_point_id]
        return await handler.change_configuration(key, value)
    
    async def update_firmware(self, charge_point_id: str, location: str, retrieve_date: datetime) -> Dict[str, Any]:
        """Trigger firmware update on charge point"""
        if charge_point_id not in self.charge_points:
            return {"success": False, "error": "Charge point not connected"}
        
        handler = self.charge_points[charge_point_id]
        return await handler.update_firmware(location, retrieve_date)

class ChargePointHandler16(CP16):
    """OCPP 1.6 Charge Point Handler"""
    
    def __init__(self, id: str, connection, central_system: OCPPCentralSystem):
        super().__init__(id, connection)
        self.central_system = central_system
        self.logger = logging.getLogger(f"{__name__}.{id}")
    
    @on(Action16.boot_notification)
    def on_boot_notification(self, charge_point_vendor: str, charge_point_model: str, **kwargs):
        """Handle BootNotification from charge point"""
        self.logger.info(f"Boot notification: {charge_point_vendor} {charge_point_model}")
        
        # Update database with boot information
        asyncio.create_task(self._update_boot_info(charge_point_vendor, charge_point_model, kwargs))
        
        return call_result.BootNotification(
            current_time=datetime.now(timezone.utc).isoformat(),
            interval=300,  # Heartbeat interval in seconds
            status="Accepted"
        )
    
    @on(Action16.status_notification)
    def on_status_notification(self, connector_id: int, error_code: str, status: str, **kwargs):
        """Handle StatusNotification from charge point"""
        self.logger.info(f"Status notification: Connector {connector_id} - {status}")
        
        # Update database
        asyncio.create_task(self._update_connector_status(connector_id, status, error_code, kwargs))
        
        return call_result.StatusNotification()
    
    @on(Action16.authorize)
    def on_authorize(self, id_tag: str):
        """Handle Authorize request from charge point"""
        self.logger.info(f"Authorization request for ID tag: {id_tag}")
        
        # Check authorization in database
        auth_status = asyncio.create_task(self._check_authorization(id_tag))
        
        return call_result.Authorize(
            id_tag_info={"status": "Accepted"}  # Simplified for now
        )
    
    @on(Action16.start_transaction)
    def on_start_transaction(self, connector_id: int, id_tag: str, meter_start: int, timestamp: str, **kwargs):
        """Handle StartTransaction from charge point"""
        self.logger.info(f"Start transaction: Connector {connector_id}, ID tag: {id_tag}")
        
        # Create transaction in database
        transaction_id = asyncio.create_task(
            self._create_transaction(connector_id, id_tag, meter_start, timestamp, kwargs)
        )
        
        return call_result.StartTransaction(
            id_tag_info={"status": "Accepted"},
            transaction_id=int(datetime.now().timestamp())  # Simplified transaction ID
        )
    
    @on(Action16.stop_transaction)
    def on_stop_transaction(self, meter_stop: int, timestamp: str, transaction_id: int, **kwargs):
        """Handle StopTransaction from charge point"""
        self.logger.info(f"Stop transaction: {transaction_id}")
        
        # Update transaction in database
        asyncio.create_task(self._stop_transaction(transaction_id, meter_stop, timestamp, kwargs))
        
        return call_result.StopTransaction()
    
    @on(Action16.meter_values)
    def on_meter_values(self, connector_id: int, meter_value: list, **kwargs):
        """Handle MeterValues from charge point"""
        self.logger.debug(f"Meter values: Connector {connector_id}")
        
        # Store meter values in database
        asyncio.create_task(self._store_meter_values(connector_id, meter_value, kwargs))
        
        return call_result.MeterValues()
    
    @on(Action16.heartbeat)
    def on_heartbeat(self):
        """Handle Heartbeat from charge point"""
        self.logger.debug("Heartbeat received")
        
        # Update last seen timestamp
        asyncio.create_task(self._update_last_seen())
        
        return call_result.Heartbeat(
            current_time=datetime.now(timezone.utc).isoformat()
        )
    
    # Remote command methods
    
    async def remote_start_transaction(self, connector_id: int, id_tag: str) -> Dict[str, Any]:
        """Send RemoteStartTransaction command"""
        try:
            request = call.RemoteStartTransaction(
                connector_id=connector_id,
                id_tag=id_tag
            )
            response = await self.call(request)
            return {"success": True, "status": response.status}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def remote_stop_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """Send RemoteStopTransaction command"""
        try:
            request = call.RemoteStopTransaction(transaction_id=int(transaction_id))
            response = await self.call(request)
            return {"success": True, "status": response.status}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_configuration(self, keys: Optional[list] = None) -> Dict[str, Any]:
        """Send GetConfiguration command"""
        try:
            request = call.GetConfiguration(key=keys)
            response = await self.call(request)
            return {
                "success": True,
                "configuration_key": response.configuration_key,
                "unknown_key": response.unknown_key
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def change_configuration(self, key: str, value: str) -> Dict[str, Any]:
        """Send ChangeConfiguration command"""
        try:
            request = call.ChangeConfiguration(key=key, value=value)
            response = await self.call(request)
            return {"success": True, "status": response.status}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def update_firmware(self, location: str, retrieve_date: datetime) -> Dict[str, Any]:
        """Send UpdateFirmware command"""
        try:
            request = call.UpdateFirmware(
                location=location,
                retrieve_date=retrieve_date.isoformat()
            )
            response = await self.call(request)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Database helper methods
    
    async def _update_boot_info(self, vendor: str, model: str, kwargs: Dict[str, Any]):
        """Update charge point boot information in database"""
        db = SessionLocal()
        try:
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == self.id
            ).first()
            
            if charge_point:
                charge_point.vendor = vendor
                charge_point.model = model
                charge_point.serial_number = kwargs.get('charge_point_serial_number')
                charge_point.firmware_version = kwargs.get('firmware_version')
                charge_point.status = DBChargePointStatus.AVAILABLE
                charge_point.last_seen = datetime.now(timezone.utc)
                db.commit()
                
        except Exception as e:
            self.logger.error(f"Error updating boot info: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    async def _update_connector_status(self, connector_id: int, status: str, error_code: str, kwargs: Dict[str, Any]):
        """Update connector status in database"""
        db = SessionLocal()
        try:
            # Get charge point
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == self.id
            ).first()
            
            if not charge_point:
                return
            
            # Get or create connector
            connector = db.query(OCPPConnector).filter(
                OCPPConnector.charge_point_id == charge_point.id,
                OCPPConnector.connector_id == connector_id
            ).first()
            
            if not connector:
                connector = OCPPConnector(
                    charge_point_id=charge_point.id,
                    connector_id=connector_id
                )
                db.add(connector)
            
            # Map OCPP status to DB status
            status_mapping = {
                "Available": DBChargePointStatus.AVAILABLE,
                "Occupied": DBChargePointStatus.OCCUPIED,
                "Charging": DBChargePointStatus.CHARGING,
                "SuspendedEV": DBChargePointStatus.SUSPENDED_EV,
                "SuspendedEVSE": DBChargePointStatus.SUSPENDED_EVSE,
                "Finishing": DBChargePointStatus.FINISHING,
                "Reserved": DBChargePointStatus.RESERVED,
                "Unavailable": DBChargePointStatus.UNAVAILABLE,
                "Faulted": DBChargePointStatus.FAULTED
            }
            
            connector.status = status_mapping.get(status, DBChargePointStatus.UNAVAILABLE)
            connector.error_code = error_code if error_code != "NoError" else None
            
            db.commit()
            
        except Exception as e:
            self.logger.error(f"Error updating connector status: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    async def _check_authorization(self, id_tag: str) -> str:
        """Check if ID tag is authorized"""
        db = SessionLocal()
        try:
            rfid_card = db.query(OCPPRFIDCard).filter(
                OCPPRFIDCard.id_tag == id_tag
            ).first()
            
            if not rfid_card:
                return "Invalid"
            
            if rfid_card.status == DBAuthorizationStatus.BLOCKED:
                return "Blocked"
            
            if rfid_card.expiry_date and rfid_card.expiry_date < datetime.now(timezone.utc):
                return "Expired"
            
            # Update last used
            rfid_card.last_used = datetime.now(timezone.utc)
            db.commit()
            
            return "Accepted"
            
        except Exception as e:
            self.logger.error(f"Error checking authorization: {str(e)}")
            return "Invalid"
        finally:
            db.close()
    
    async def _create_transaction(self, connector_id: int, id_tag: str, meter_start: int, timestamp: str, kwargs: Dict[str, Any]) -> int:
        """Create new transaction in database"""
        db = SessionLocal()
        try:
            # Get charge point and connector
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == self.id
            ).first()
            
            if not charge_point:
                return 0
            
            connector = db.query(OCPPConnector).filter(
                OCPPConnector.charge_point_id == charge_point.id,
                OCPPConnector.connector_id == connector_id
            ).first()
            
            if not connector:
                return 0
            
            # Create transaction
            transaction_id = str(uuid.uuid4())
            transaction = OCPPTransaction(
                transaction_id=transaction_id,
                charge_point_id=charge_point.id,
                connector_id=connector.id,
                id_tag=id_tag,
                start_timestamp=datetime.fromisoformat(timestamp.replace('Z', '+00:00')),
                meter_start=meter_start,
                status=TransactionStatus.ACTIVE
            )
            
            db.add(transaction)
            
            # Update connector
            connector.current_transaction_id = transaction.id
            connector.status = DBChargePointStatus.OCCUPIED
            
            db.commit()
            
            return transaction.id
            
        except Exception as e:
            self.logger.error(f"Error creating transaction: {str(e)}")
            db.rollback()
            return 0
        finally:
            db.close()
    
    async def _stop_transaction(self, transaction_id: int, meter_stop: int, timestamp: str, kwargs: Dict[str, Any]):
        """Stop transaction in database"""
        db = SessionLocal()
        try:
            transaction = db.query(OCPPTransaction).filter(
                OCPPTransaction.id == transaction_id
            ).first()
            
            if transaction:
                transaction.end_timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                transaction.meter_stop = meter_stop
                transaction.status = TransactionStatus.COMPLETED
                
                # Calculate energy delivered
                if transaction.meter_start:
                    transaction.energy_delivered = (meter_stop - transaction.meter_start) / 1000.0  # Convert Wh to kWh
                
                # Update connector
                connector = db.query(OCPPConnector).filter(
                    OCPPConnector.id == transaction.connector_id
                ).first()
                
                if connector:
                    connector.current_transaction_id = None
                    connector.status = DBChargePointStatus.AVAILABLE
                
                db.commit()
                
        except Exception as e:
            self.logger.error(f"Error stopping transaction: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    async def _store_meter_values(self, connector_id: int, meter_values: list, kwargs: Dict[str, Any]):
        """Store meter values in database"""
        db = SessionLocal()
        try:
            # Get charge point and connector
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == self.id
            ).first()
            
            if not charge_point:
                return
            
            connector = db.query(OCPPConnector).filter(
                OCPPConnector.charge_point_id == charge_point.id,
                OCPPConnector.connector_id == connector_id
            ).first()
            
            if not connector:
                return
            
            # Process meter values
            for meter_value in meter_values:
                timestamp = meter_value.get('timestamp')
                sampled_values = meter_value.get('sampled_value', [])
                
                for sampled_value in sampled_values:
                    meter_val = OCPPMeterValue(
                        charge_point_id=charge_point.id,
                        connector_id=connector.id,
                        transaction_id=connector.current_transaction_id,
                        timestamp=datetime.fromisoformat(timestamp.replace('Z', '+00:00')),
                        value=float(sampled_value.get('value', 0)),
                        context=sampled_value.get('context', 'Sample.Periodic'),
                        format=sampled_value.get('format', 'Raw'),
                        measurand=sampled_value.get('measurand', 'Energy.Active.Import.Register'),
                        phase=sampled_value.get('phase'),
                        location=sampled_value.get('location', 'Outlet'),
                        unit=sampled_value.get('unit', 'Wh')
                    )
                    db.add(meter_val)
            
            db.commit()
            
        except Exception as e:
            self.logger.error(f"Error storing meter values: {str(e)}")
            db.rollback()
        finally:
            db.close()
    
    async def _update_last_seen(self):
        """Update last seen timestamp for charge point"""
        db = SessionLocal()
        try:
            charge_point = db.query(OCPPChargePoint).filter(
                OCPPChargePoint.charge_point_id == self.id
            ).first()
            
            if charge_point:
                charge_point.last_seen = datetime.now(timezone.utc)
                db.commit()
                
        except Exception as e:
            self.logger.error(f"Error updating last seen: {str(e)}")
            db.rollback()
        finally:
            db.close()

class ChargePointHandler201(CP201):
    """OCPP 2.0.1 Charge Point Handler (placeholder for future implementation)"""
    
    def __init__(self, id: str, connection, central_system: OCPPCentralSystem):
        super().__init__(id, connection)
        self.central_system = central_system
        self.logger = logging.getLogger(f"{__name__}.{id}")
        
    # TODO: Implement OCPP 2.0.1 message handlers
    pass

# Global central system instance
central_system = OCPPCentralSystem() 