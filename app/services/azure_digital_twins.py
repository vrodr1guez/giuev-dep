"""
Azure Digital Twins Integration Service
Syncs local digital twin data with Azure Digital Twins service
"""

from azure.digitaltwins.core import DigitalTwinsClient
from azure.identity import DefaultAzureCredential
from azure.core.exceptions import ResourceNotFoundError
from typing import Dict, List, Any, Optional
import json
import logging
import asyncio
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class AzureDigitalTwinsService:
    """Service to integrate with Azure Digital Twins"""
    
    def __init__(self):
        self.url = os.getenv("AZURE_DIGITAL_TWINS_URL", "https://ev-charging-twins.api.eus.digitaltwins.azure.net")
        self.credential = DefaultAzureCredential()
        self.client = None
        self.is_available = False
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Azure Digital Twins client"""
        try:
            self.client = DigitalTwinsClient(self.url, self.credential)
            self.is_available = True
            logger.info(f"Azure Digital Twins client initialized: {self.url}")
        except Exception as e:
            logger.warning(f"Azure Digital Twins not available: {e}")
            self.is_available = False
    
    async def create_vehicle_twin(self, vehicle_id: str, vehicle_data: Dict[str, Any]) -> bool:
        """Create a vehicle digital twin in Azure"""
        if not self.is_available:
            logger.warning("Azure Digital Twins not available")
            return False
            
        try:
            twin_data = {
                "vehicleId": vehicle_id,
                "make": vehicle_data.get("make", "Unknown"),
                "model": vehicle_data.get("model", "Unknown"),
                "year": vehicle_data.get("year", 2024),
                "batteryCapacity": vehicle_data.get("nominal_battery_capacity", 75.0),
                "v2gCapable": vehicle_data.get("v2g_capable", False),
                "isActive": vehicle_data.get("is_active", True),
                "createdAt": datetime.utcnow().isoformat()
            }
            
            # Create vehicle twin
            self.client.upsert_digital_twin(vehicle_id, twin_data)
            
            # Create battery twin
            battery_twin_id = f"{vehicle_id}-Battery"
            battery_data = {
                "vehicleId": vehicle_id,
                "batteryType": vehicle_data.get("battery_type", "Li-ion"),
                "chemistry": vehicle_data.get("battery_chemistry", "NMC"),
                "nominalCapacity": vehicle_data.get("nominal_battery_capacity", 75.0),
                "thermalManagement": vehicle_data.get("battery_thermal_management", "Liquid"),
                "manufactureDate": vehicle_data.get("battery_manufacture_date", datetime.utcnow().isoformat())
            }
            
            self.client.upsert_digital_twin(battery_twin_id, battery_data)
            
            # Create relationship
            await self._create_relationship(vehicle_id, battery_twin_id, "hasBattery")
            
            logger.info(f"Created Azure Digital Twin for vehicle: {vehicle_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create vehicle twin {vehicle_id}: {e}")
            return False
    
    async def update_battery_twin(self, vehicle_id: str, telemetry_data: Dict[str, Any]) -> bool:
        """Update Azure Digital Twin with battery telemetry data"""
        if not self.is_available:
            return False
            
        try:
            twin_id = f"{vehicle_id}-Battery"
            
            # Update properties
            patch = [
                {
                    "op": "replace",
                    "path": "/voltage",
                    "value": telemetry_data.get("battery_voltage", 400.0)
                },
                {
                    "op": "replace", 
                    "path": "/current",
                    "value": telemetry_data.get("battery_current", 0.0)
                },
                {
                    "op": "replace",
                    "path": "/temperature",
                    "value": telemetry_data.get("temperature", 25.0)
                },
                {
                    "op": "replace",
                    "path": "/soc",
                    "value": telemetry_data.get("soc", 50.0)
                },
                {
                    "op": "replace",
                    "path": "/soh", 
                    "value": telemetry_data.get("soh", 100.0)
                },
                {
                    "op": "replace",
                    "path": "/lastUpdated",
                    "value": datetime.utcnow().isoformat()
                }
            ]
            
            # Update the digital twin
            self.client.update_digital_twin(twin_id, patch)
            
            # Send telemetry for real-time streaming data
            telemetry = {
                "thermalRunawayRisk": telemetry_data.get("thermal_runaway_risk", 0.0),
                "dendriteGrowth": telemetry_data.get("dendrite_growth", 0.0),
                "electrolyteDegaradation": telemetry_data.get("electrolyte_degradation", 0.0),
                "internalResistance": telemetry_data.get("internal_resistance", 0.1),
                "powerCapability": telemetry_data.get("power_capability", 50.0),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.client.publish_telemetry(twin_id, telemetry)
            
            logger.debug(f"Updated Azure Digital Twin for battery: {twin_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update battery twin {vehicle_id}: {e}")
            return False
    
    async def update_charging_station_twin(self, station_id: str, station_data: Dict[str, Any]) -> bool:
        """Update charging station digital twin"""
        if not self.is_available:
            return False
            
        try:
            # Update charging station properties
            patch = [
                {
                    "op": "replace",
                    "path": "/status",
                    "value": station_data.get("status", "Unavailable")
                },
                {
                    "op": "replace",
                    "path": "/isOnline", 
                    "value": station_data.get("is_online", False)
                },
                {
                    "op": "replace",
                    "path": "/connectedVehicles",
                    "value": station_data.get("connected_vehicles", 0)
                },
                {
                    "op": "replace",
                    "path": "/totalEnergyDelivered",
                    "value": station_data.get("total_energy_delivered", 0.0)
                },
                {
                    "op": "replace",
                    "path": "/lastSeen",
                    "value": station_data.get("last_seen", datetime.utcnow().isoformat())
                }
            ]
            
            self.client.update_digital_twin(station_id, patch)
            
            # Send telemetry
            telemetry = {
                "powerOutput": station_data.get("current_power_output", 0.0),
                "energyDelivered": station_data.get("energy_delivered", 0.0),
                "efficiency": station_data.get("efficiency", 0.95),
                "temperature": station_data.get("ambient_temperature", 25.0)
            }
            
            self.client.publish_telemetry(station_id, telemetry)
            
            logger.debug(f"Updated Azure Digital Twin for charging station: {station_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update charging station twin {station_id}: {e}")
            return False
    
    async def _create_relationship(self, source_id: str, target_id: str, relationship_name: str) -> bool:
        """Create relationship between digital twins"""
        try:
            relationship = {
                "$targetId": target_id,
                "$relationshipName": relationship_name
            }
            
            relationship_id = f"{source_id}-{relationship_name}-{target_id}"
            self.client.upsert_relationship(source_id, relationship_id, relationship)
            
            logger.info(f"Created relationship: {source_id} -> {relationship_name} -> {target_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create relationship {source_id} -> {target_id}: {e}")
            return False
    
    async def query_twins(self, query: str) -> List[Dict[str, Any]]:
        """Query digital twins using SQL-like syntax"""
        if not self.is_available:
            return []
            
        try:
            query_result = self.client.query_twins(query)
            twins = []
            
            for twin in query_result:
                twins.append(twin)
            
            logger.debug(f"Query returned {len(twins)} twins")
            return twins
            
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return []
    
    async def get_fleet_insights(self, fleet_id: str) -> Dict[str, Any]:
        """Get fleet-wide insights from Azure Digital Twins"""
        if not self.is_available:
            return {}
            
        try:
            # Query all vehicles in fleet
            query = f"""
            SELECT *
            FROM DIGITALTWINS DT
            WHERE DT.$dtId LIKE '{fleet_id}%'
            AND IS_OF_MODEL(DT, 'dtmi:evcharging:Vehicle;1')
            """
            
            vehicles = await self.query_twins(query)
            
            # Query all batteries
            battery_query = """
            SELECT AVG(DT.soh) as avgSOH, 
                   AVG(DT.temperature) as avgTemp,
                   COUNT() as totalBatteries
            FROM DIGITALTWINS DT
            WHERE IS_OF_MODEL(DT, 'dtmi:evcharging:Battery;1')
            """
            
            battery_stats = await self.query_twins(battery_query)
            
            insights = {
                "fleetSize": len(vehicles),
                "averageSOH": battery_stats[0].get("avgSOH", 0) if battery_stats else 0,
                "averageTemperature": battery_stats[0].get("avgTemp", 0) if battery_stats else 0,
                "totalBatteries": battery_stats[0].get("totalBatteries", 0) if battery_stats else 0,
                "queryTimestamp": datetime.utcnow().isoformat()
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to get fleet insights: {e}")
            return {}
    
    async def create_charging_station_twin(self, station_data: Dict[str, Any]) -> bool:
        """Create charging station digital twin"""
        if not self.is_available:
            return False
            
        try:
            station_id = station_data.get("charge_point_id")
            if not station_id:
                return False
            
            twin_data = {
                "chargePointId": station_id,
                "vendor": station_data.get("vendor", "Unknown"),
                "model": station_data.get("model", "Unknown"), 
                "serialNumber": station_data.get("serial_number", "Unknown"),
                "firmwareVersion": station_data.get("firmware_version", "1.0.0"),
                "ocppVersion": station_data.get("ocpp_version", "1.6"),
                "maxPowerKW": station_data.get("max_power_kw", 50.0),
                "numberOfConnectors": station_data.get("number_of_connectors", 1),
                "latitude": station_data.get("latitude", 0.0),
                "longitude": station_data.get("longitude", 0.0),
                "address": station_data.get("address", "Unknown"),
                "status": station_data.get("status", "Unavailable"),
                "isOnline": station_data.get("is_online", False),
                "createdAt": datetime.utcnow().isoformat()
            }
            
            self.client.upsert_digital_twin(station_id, twin_data)
            
            # Create connector twins
            for i in range(twin_data["numberOfConnectors"]):
                connector_id = f"{station_id}-Connector-{i+1}"
                connector_data = {
                    "connectorId": i + 1,
                    "stationId": station_id,
                    "connectorType": "Type2",
                    "maxPowerKW": twin_data["maxPowerKW"],
                    "status": "Available",
                    "createdAt": datetime.utcnow().isoformat()
                }
                
                self.client.upsert_digital_twin(connector_id, connector_data)
                await self._create_relationship(station_id, connector_id, "hasConnector")
            
            logger.info(f"Created Azure Digital Twin for charging station: {station_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create charging station twin: {e}")
            return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Azure Digital Twins service health"""
        if not self.is_available:
            return {
                "status": "unavailable",
                "message": "Azure Digital Twins client not initialized"
            }
        
        try:
            # Try a simple query to test connectivity
            test_query = "SELECT TOP 1 * FROM DIGITALTWINS"
            result = await self.query_twins(test_query)
            
            return {
                "status": "healthy",
                "url": self.url,
                "connectivity": "ok",
                "totalTwins": len(result) if result else 0
            }
            
        except Exception as e:
            return {
                "status": "unhealthy", 
                "url": self.url,
                "error": str(e)
            }

# Global instance
azure_dt_service = AzureDigitalTwinsService() 