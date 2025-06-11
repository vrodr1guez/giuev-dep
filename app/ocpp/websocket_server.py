import asyncio
import logging
import websockets
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK
from typing import Set, Dict
import signal
import os
import functools

from app.ocpp.central_system import central_system
from app.core.logging import logger

class OCPPWebSocketServer:
    """
    WebSocket server for OCPP connections
    Handles incoming connections from charging stations
    """
    
    def __init__(self, host: str = "0.0.0.0", port: int = 9000):
        self.host = host
        self.port = port
        self.server = None
        self.running = False
        self.logger = logging.getLogger(__name__)
        
    async def start(self):
        """Start the OCPP WebSocket server"""
        try:
            self.logger.info(f"Starting OCPP WebSocket server on {self.host}:{self.port}")
            
            # Create a handler that websockets.serve can call correctly
            server_instance = self
            
            async def websocket_handler(websocket, path):
                """Handler function for websockets.serve"""
                await server_instance.handle_connection(websocket, path)
            
            # Start WebSocket server with proper handler binding
            self.server = await websockets.serve(
                websocket_handler,
                self.host,
                self.port,
                subprotocols=["ocpp1.6", "ocpp2.0", "ocpp2.0.1"],
                ping_interval=60,  # Send ping every 60 seconds
                ping_timeout=30,   # Wait 30 seconds for pong
                close_timeout=10   # Wait 10 seconds for close
            )
            
            self.running = True
            self.logger.info(f"OCPP WebSocket server started successfully")
            
            # Set up signal handlers for graceful shutdown
            for sig in [signal.SIGTERM, signal.SIGINT]:
                signal.signal(sig, self._signal_handler)
            
        except Exception as e:
            self.logger.error(f"Failed to start OCPP WebSocket server: {str(e)}")
            raise

    async def run_forever(self):
        """Keep the server running - separate from start for non-blocking startup"""
        if self.server and self.running:
            await self.server.wait_closed()
    
    async def stop(self):
        """Stop the OCPP WebSocket server"""
        if self.server and self.running:
            self.logger.info("Stopping OCPP WebSocket server...")
            self.running = False
            self.server.close()
            await self.server.wait_closed()
            self.logger.info("OCPP WebSocket server stopped")
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        self.logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        asyncio.create_task(self.stop())
    
    async def handle_connection(self, websocket, path):
        """
        Handle incoming WebSocket connection from a charge point
        
        Args:
            websocket: WebSocket connection
            path: URL path (e.g., /ocpp/CP001)
        """
        charge_point_id = None
        
        try:
            # Extract charge point ID from path
            path_parts = path.strip('/').split('/')
            if len(path_parts) < 2 or path_parts[0] != 'ocpp':
                await websocket.close(code=1008, reason="Invalid path. Use /ocpp/{charge_point_id}")
                return
            
            charge_point_id = path_parts[1]
            
            # Validate charge point ID format
            if not self._is_valid_charge_point_id(charge_point_id):
                await websocket.close(code=1008, reason="Invalid charge point ID format")
                return
            
            self.logger.info(f"New connection from charge point {charge_point_id} at {websocket.remote_address}")
            
            # Log connection details
            self.logger.debug(f"Connection details - Subprotocol: {websocket.subprotocol}, "
                            f"Headers: {dict(websocket.request_headers)}")
            
            # Let central system handle the connection
            await central_system.on_connect(websocket, path)
            
        except ConnectionClosedError:
            self.logger.info(f"Connection closed unexpectedly for charge point {charge_point_id}")
        except ConnectionClosedOK:
            self.logger.info(f"Connection closed normally for charge point {charge_point_id}")
        except websockets.exceptions.InvalidStatusCode as e:
            self.logger.error(f"Invalid status code during connection: {str(e)}")
        except Exception as e:
            self.logger.error(f"Error handling connection for {path}: {str(e)}")
        finally:
            # Ensure cleanup happens
            if charge_point_id:
                await central_system.on_disconnect(charge_point_id)
    
    def _is_valid_charge_point_id(self, charge_point_id: str) -> bool:
        """
        Validate charge point ID format
        
        Args:
            charge_point_id: The charge point identifier
            
        Returns:
            bool: True if valid, False otherwise
        """
        # Basic validation - alphanumeric plus hyphens/underscores, 1-50 chars
        if not charge_point_id or len(charge_point_id) > 50:
            return False
        
        # Allow alphanumeric characters, hyphens, and underscores
        return charge_point_id.replace('-', '').replace('_', '').isalnum()

# OCPP Server instance
ocpp_server = OCPPWebSocketServer(
    host=os.getenv("OCPP_HOST", "0.0.0.0"),
    port=int(os.getenv("OCPP_PORT", "9000"))
)

async def start_ocpp_server():
    """Start the OCPP server (non-blocking)"""
    await ocpp_server.start()

async def run_ocpp_server_forever():
    """Run the OCPP server forever (blocking)"""
    await ocpp_server.run_forever()

async def stop_ocpp_server():
    """Stop the OCPP server"""
    await ocpp_server.stop()

# For standalone execution
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        asyncio.run(start_ocpp_server())
    except KeyboardInterrupt:
        logger.info("OCPP server stopped by user")
    except Exception as e:
        logger.error(f"OCPP server error: {str(e)}")
        raise 