import logging
import json
import requests
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple, Union
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.integration import (
    ExternalIntegration, ApiKey, IntegrationDataSync, 
    WeatherForecast, FleetVehicleSync, IntegrationType, IntegrationStatus
)
from app.schemas.integration import (
    IntegrationTestResponse, WeatherDataRequest, 
    ChargingNetworkStationSyncRequest, FleetVehicleSyncRequest
)
from app.crud.integration import integration as integration_crud
from app.models.vehicle import Vehicle
from app.models.charging_station import ChargingStation, ChargingConnector

logger = logging.getLogger(__name__)

class IntegrationException(Exception):
    """Exception raised for integration errors."""
    pass

class IntegrationService:
    """
    Service to handle integration with external systems
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_integration(self, integration_id: int) -> ExternalIntegration:
        """Get integration by ID"""
        integration = integration_crud.get(self.db, id=integration_id)
        if not integration:
            raise IntegrationException(f"Integration with ID {integration_id} not found")
        return integration
    
    def test_integration(self, integration_id: int) -> IntegrationTestResponse:
        """Test connectivity to an external integration"""
        integration = self.get_integration(integration_id)
        
        start_time = time.time()
        success = False
        message = "Test failed"
        details = {}
        
        try:
            if integration.integration_type == IntegrationType.CHARGING_NETWORK:
                success, message, details = self._test_charging_network(integration)
            elif integration.integration_type == IntegrationType.FLEET_MANAGEMENT:
                success, message, details = self._test_fleet_management(integration)
            elif integration.integration_type == IntegrationType.WEATHER_SERVICE:
                success, message, details = self._test_weather_service(integration)
            else:
                message = f"Testing not implemented for integration type: {integration.integration_type.value}"
        except Exception as e:
            logger.exception(f"Error testing integration {integration_id}")
            message = f"Error: {str(e)}"
        
        latency = int((time.time() - start_time) * 1000)  # in milliseconds
        
        # Update integration status based on test result
        if success:
            integration.status = IntegrationStatus.ACTIVE
        else:
            integration.status = IntegrationStatus.ERROR
            integration.last_error = message
        
        self.db.commit()
        
        return IntegrationTestResponse(
            success=success,
            message=message,
            details=details,
            latency_ms=latency
        )
    
    def _test_charging_network(self, integration: ExternalIntegration) -> Tuple[bool, str, Dict[str, Any]]:
        """Test connectivity to a charging network"""
        if not integration.api_base_url:
            return False, "API base URL not configured", {}
        
        # This would depend on the specific charging network API
        # We're implementing a generic test here
        try:
            headers = self._get_headers_for_integration(integration)
            # Try to access a common endpoint like station status
            response = requests.get(
                f"{integration.api_base_url}/status", 
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return True, "Successfully connected to charging network API", response.json()
            else:
                return False, f"API returned status code {response.status_code}", {"response": response.text}
                
        except requests.RequestException as e:
            return False, f"Connection error: {str(e)}", {}
    
    def _test_fleet_management(self, integration: ExternalIntegration) -> Tuple[bool, str, Dict[str, Any]]:
        """Test connectivity to a fleet management system"""
        if not integration.api_base_url:
            return False, "API base URL not configured", {}
        
        try:
            headers = self._get_headers_for_integration(integration)
            # Try to access a common endpoint like fleet status
            response = requests.get(
                f"{integration.api_base_url}/fleet/status", 
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return True, "Successfully connected to fleet management API", response.json()
            else:
                return False, f"API returned status code {response.status_code}", {"response": response.text}
                
        except requests.RequestException as e:
            return False, f"Connection error: {str(e)}", {}
    
    def _test_weather_service(self, integration: ExternalIntegration) -> Tuple[bool, str, Dict[str, Any]]:
        """Test connectivity to a weather service"""
        if not integration.api_base_url:
            return False, "API base URL not configured", {}
        
        try:
            headers = self._get_headers_for_integration(integration)
            # Use a test location (New York)
            params = {
                "lat": 40.7128,
                "lon": -74.0060,
                "units": "metric"
            }
            
            response = requests.get(
                f"{integration.api_base_url}/forecast", 
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return True, "Successfully connected to weather service API", response.json()
            else:
                return False, f"API returned status code {response.status_code}", {"response": response.text}
                
        except requests.RequestException as e:
            return False, f"Connection error: {str(e)}", {}
    
    def _get_headers_for_integration(self, integration: ExternalIntegration) -> Dict[str, str]:
        """Get authentication headers for an integration"""
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        if integration.auth_type == "API_KEY":
            # Get the active API key
            api_key = self.db.query(ApiKey).filter(
                ApiKey.integration_id == integration.id,
                ApiKey.is_active == True
            ).first()
            
            if api_key:
                # Different APIs might use different header names
                if integration.configuration and integration.configuration.get("api_key_header"):
                    headers[integration.configuration["api_key_header"]] = api_key.key_value
                else:
                    headers["X-API-Key"] = api_key.key_value
        
        elif integration.auth_type == "OAUTH2" and integration.credentials:
            # Assume we have a valid access token
            headers["Authorization"] = f"Bearer {integration.credentials.get('access_token')}"
            
        elif integration.auth_type == "BASIC" and integration.credentials:
            import base64
            username = integration.credentials.get("username", "")
            password = integration.credentials.get("password", "")
            auth_string = base64.b64encode(f"{username}:{password}".encode()).decode()
            headers["Authorization"] = f"Basic {auth_string}"
        
        return headers
    
    def sync_charging_network_stations(self, request: ChargingNetworkStationSyncRequest) -> IntegrationDataSync:
        """Sync charging stations from a charging network"""
        integration = self.get_integration(request.integration_id)
        
        if integration.integration_type != IntegrationType.CHARGING_NETWORK:
            raise IntegrationException("Integration is not a charging network")
        
        # Create a data sync record
        sync_record = IntegrationDataSync(
            integration_id=integration.id,
            sync_type="CHARGING_STATIONS",
            status="in_progress"
        )
        self.db.add(sync_record)
        self.db.commit()
        
        try:
            headers = self._get_headers_for_integration(integration)
            
            # Determine the endpoint
            endpoint = "/stations"
            params = {}
            
            if not request.sync_all and request.specific_stations:
                # Handle specific station IDs if API supports it
                if len(request.specific_stations) == 1:
                    # Single station - many APIs use a different endpoint
                    endpoint = f"/stations/{request.specific_stations[0]}"
                else:
                    # Some APIs support comma-separated IDs or query parameters
                    params["ids"] = ",".join(request.specific_stations)
            
            # Make the API request
            response = requests.get(
                f"{integration.api_base_url}{endpoint}", 
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code != 200:
                raise IntegrationException(f"API returned status code {response.status_code}: {response.text}")
            
            stations_data = response.json()
            
            # This would need to be adapted to each specific API's response format
            stations = stations_data.get("stations", [])
            
            # Process each station
            for station_data in stations:
                self._process_station_data(integration, station_data)
                sync_record.records_processed += 1
                sync_record.records_succeeded += 1
            
            # Update integration
            integration.last_sync_at = datetime.utcnow()
            self.db.commit()
            
            # Update sync record
            sync_record.status = "success"
            sync_record.completed_at = datetime.utcnow()
            sync_record.sync_details = {
                "total_stations": len(stations)
            }
            self.db.commit()
            
        except Exception as e:
            logger.exception(f"Error syncing charging stations from integration {integration.id}")
            sync_record.status = "failed"
            sync_record.error_message = str(e)
            sync_record.completed_at = datetime.utcnow()
            self.db.commit()
            
            raise IntegrationException(f"Error syncing charging stations: {str(e)}")
        
        return sync_record
    
    def _process_station_data(self, integration: ExternalIntegration, station_data: Dict[str, Any]) -> None:
        """Process and save charging station data from external network"""
        # This is a simplified implementation that would need to be adapted
        # to match the specific format of each charging network's API
        
        # Check if station already exists by external ID
        external_id = station_data.get("id")
        if not external_id:
            logger.warning(f"Skipping station without external ID: {station_data}")
            return
        
        existing_station = self.db.query(ChargingStation).filter(
            ChargingStation.external_station_id == external_id,
            ChargingStation.station_provider == integration.provider
        ).first()
        
        if existing_station:
            # Update existing station
            existing_station.name = station_data.get("name", existing_station.name)
            existing_station.latitude = station_data.get("latitude", existing_station.latitude)
            existing_station.longitude = station_data.get("longitude", existing_station.longitude)
            existing_station.status = station_data.get("status", existing_station.status)
            
            # Update connectors if provided
            if "connectors" in station_data:
                self._update_connectors(existing_station, station_data["connectors"])
        else:
            # Create new station
            new_station = ChargingStation(
                name=station_data.get("name", "Unknown Station"),
                address=station_data.get("address", ""),
                latitude=station_data.get("latitude", 0),
                longitude=station_data.get("longitude", 0),
                external_station_id=external_id,
                station_provider=integration.provider,
                status=station_data.get("status", "available"),
                is_public=station_data.get("public", True)
            )
            self.db.add(new_station)
            self.db.flush()  # Get the new ID
            
            # Add connectors if provided
            if "connectors" in station_data:
                self._add_connectors(new_station, station_data["connectors"])
        
        self.db.commit()
    
    def _add_connectors(self, station: ChargingStation, connectors_data: List[Dict[str, Any]]) -> None:
        """Add connectors to a charging station"""
        for connector_data in connectors_data:
            connector = ChargingConnector(
                station_id=station.id,
                connector_type=connector_data.get("type", "unknown"),
                power_output_kw=connector_data.get("power", 0),
                status=connector_data.get("status", "available"),
                external_connector_id=connector_data.get("id"),
                pricing_info_raw=connector_data.get("pricing")
            )
            self.db.add(connector)
    
    def _update_connectors(self, station: ChargingStation, connectors_data: List[Dict[str, Any]]) -> None:
        """Update connectors for an existing charging station"""
        # Get external IDs of connectors in the data
        external_ids = [c.get("id") for c in connectors_data if c.get("id")]
        
        # First update existing connectors
        for connector_data in connectors_data:
            external_id = connector_data.get("id")
            if not external_id:
                continue
                
            existing_connector = self.db.query(ChargingConnector).filter(
                ChargingConnector.station_id == station.id,
                ChargingConnector.external_connector_id == external_id
            ).first()
            
            if existing_connector:
                existing_connector.connector_type = connector_data.get("type", existing_connector.connector_type)
                existing_connector.power_output_kw = connector_data.get("power", existing_connector.power_output_kw)
                existing_connector.status = connector_data.get("status", existing_connector.status)
                existing_connector.pricing_info_raw = connector_data.get("pricing", existing_connector.pricing_info_raw)
            else:
                # New connector
                self._add_connectors(station, [connector_data])
        
        # Optionally: mark connectors as unavailable if they're not in the latest data
        existing_connectors = self.db.query(ChargingConnector).filter(
            ChargingConnector.station_id == station.id,
            ChargingConnector.external_connector_id.notin_(external_ids)
        ).all()
        
        for connector in existing_connectors:
            connector.status = "unavailable"
    
    def get_weather_forecast(self, request: WeatherDataRequest) -> List[WeatherForecast]:
        """Get weather forecast from a weather service"""
        integration = self.get_integration(request.integration_id)
        
        if integration.integration_type != IntegrationType.WEATHER_SERVICE:
            raise IntegrationException("Integration is not a weather service")
        
        try:
            headers = self._get_headers_for_integration(integration)
            
            # Compose request parameters based on the weather service
            params = {
                "lat": request.latitude,
                "lon": request.longitude,
                "days": request.forecast_days,
                "units": "metric"
            }
            
            # Add API key as query parameter if configured that way
            if integration.auth_type == "API_KEY" and integration.configuration:
                if integration.configuration.get("api_key_param"):
                    api_key = self.db.query(ApiKey).filter(
                        ApiKey.integration_id == integration.id,
                        ApiKey.is_active == True
                    ).first()
                    
                    if api_key:
                        params[integration.configuration["api_key_param"]] = api_key.key_value
            
            response = requests.get(
                f"{integration.api_base_url}/forecast", 
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code != 200:
                raise IntegrationException(f"API returned status code {response.status_code}: {response.text}")
            
            forecast_data = response.json()
            
            # Process the forecast data (this would need to be adapted to each API)
            forecasts = self._process_weather_forecast(integration, forecast_data, request)
            
            # Update integration
            integration.last_sync_at = datetime.utcnow()
            self.db.commit()
            
            return forecasts
            
        except Exception as e:
            logger.exception(f"Error fetching weather forecast from integration {integration.id}")
            integration.last_error = str(e)
            self.db.commit()
            
            raise IntegrationException(f"Error fetching weather forecast: {str(e)}")
    
    def _process_weather_forecast(
        self, 
        integration: ExternalIntegration, 
        forecast_data: Dict[str, Any],
        request: WeatherDataRequest
    ) -> List[WeatherForecast]:
        """Process and save weather forecast data"""
        forecasts = []
        
        # This is a simplified implementation that needs to be adapted
        # to each specific weather API format
        
        # Find forecast items
        forecast_items = forecast_data.get("forecast", {}).get("forecastday", [])
        if not forecast_items:
            forecast_items = forecast_data.get("daily", [])
        
        location_name = forecast_data.get("location", {}).get("name", "Unknown Location")
        
        for item in forecast_items:
            forecast_time = None
            
            # Different APIs have different date formats
            if "date" in item:
                try:
                    forecast_time = datetime.strptime(item["date"], "%Y-%m-%d")
                except ValueError:
                    logger.error(f"Invalid date format: {item['date']}")
                    continue
            elif "dt" in item:
                # Unix timestamp
                forecast_time = datetime.fromtimestamp(item["dt"])
            
            if not forecast_time:
                logger.warning(f"Skipping forecast item without date: {item}")
                continue
            
            # Create or update forecast record
            existing_forecast = self.db.query(WeatherForecast).filter(
                WeatherForecast.integration_id == integration.id,
                WeatherForecast.latitude == request.latitude,
                WeatherForecast.longitude == request.longitude,
                WeatherForecast.forecast_time == forecast_time
            ).first()
            
            data = {
                "integration_id": integration.id,
                "latitude": request.latitude,
                "longitude": request.longitude,
                "location_name": location_name,
                "forecast_time": forecast_time,
                "temperature": self._extract_temperature(item),
                "humidity": self._extract_value(item, ["humidity", "relative_humidity"]),
                "wind_speed": self._extract_value(item, ["wind_speed", "wind", "wind_kph"]),
                "wind_direction": self._extract_value(item, ["wind_degree", "wind_direction"]),
                "cloud_cover": self._extract_value(item, ["cloud", "cloud_cover"]),
                "precipitation": self._extract_value(item, ["precip_mm", "precipitation"]),
                "solar_radiation": self._extract_value(item, ["solar_rad", "radiation"]),
                "weather_condition": self._extract_weather_condition(item),
                "raw_data": item
            }
            
            # Add renewable energy forecasts if requested
            if request.include_renewables_forecast:
                data.update(self._calculate_renewable_forecast(item, request))
            
            if existing_forecast:
                # Update existing record
                for key, value in data.items():
                    if value is not None:
                        setattr(existing_forecast, key, value)
                forecasts.append(existing_forecast)
            else:
                # Create new record
                new_forecast = WeatherForecast(**data)
                self.db.add(new_forecast)
                forecasts.append(new_forecast)
        
        self.db.commit()
        return forecasts
    
    def _extract_temperature(self, data: Dict[str, Any]) -> Optional[float]:
        """Extract temperature from weather data"""
        if "temp_c" in data:
            return data["temp_c"]
        elif "temp" in data:
            return data["temp"]
        elif "day" in data and "temp" in data["day"]:
            return data["day"]["temp"]
        elif "main" in data and "temp" in data["main"]:
            return data["main"]["temp"]
        return None
    
    def _extract_value(self, data: Dict[str, Any], keys: List[str]) -> Optional[float]:
        """Try to extract a value using multiple possible keys"""
        for key in keys:
            if key in data:
                return data[key]
            
            # Check nested structures
            if "day" in data and key in data["day"]:
                return data["day"][key]
            elif "main" in data and key in data["main"]:
                return data["main"][key]
        
        return None
    
    def _extract_weather_condition(self, data: Dict[str, Any]) -> Optional[str]:
        """Extract weather condition from forecast data"""
        if "condition" in data and "text" in data["condition"]:
            return data["condition"]["text"]
        elif "weather" in data and data["weather"] and "description" in data["weather"][0]:
            return data["weather"][0]["description"]
        return None
    
    def _calculate_renewable_forecast(
        self, 
        weather_data: Dict[str, Any],
        request: WeatherDataRequest
    ) -> Dict[str, float]:
        """
        Calculate renewable energy generation forecast based on weather data
        
        This is a simplified model and would need to be enhanced based on
        specific renewable energy sources and their characteristics.
        """
        # Extract relevant weather conditions
        solar_rad = self._extract_value(weather_data, ["solar_rad", "radiation", "uv"]) or 0
        wind_speed = self._extract_value(weather_data, ["wind_speed", "wind", "wind_kph"]) or 0
        cloud_cover = self._extract_value(weather_data, ["cloud", "cloud_cover"]) or 0
        
        # Simplified solar generation model
        # Assuming 1000 W/m² = 100% efficiency
        max_solar_capacity = 5.0  # kWh per day for a typical area
        solar_efficiency = max(0, min(1, solar_rad / 1000 * (1 - cloud_cover / 100)))
        solar_forecast = max_solar_capacity * solar_efficiency
        
        # Simplified wind generation model
        # Typical wind turbines start generating at 3-4 m/s and reach rated power at ~12 m/s
        max_wind_capacity = 10.0  # kWh per day for a typical area
        wind_threshold = 3.0  # m/s
        wind_rated = 12.0  # m/s
        
        if wind_speed < wind_threshold:
            wind_efficiency = 0
        elif wind_speed > wind_rated:
            wind_efficiency = 1
        else:
            wind_efficiency = (wind_speed - wind_threshold) / (wind_rated - wind_threshold)
        
        wind_forecast = max_wind_capacity * wind_efficiency
        
        # Calculate total renewable percentage (assuming a base load)
        total_energy = 50.0  # kWh per day assumed base demand
        renewable_energy = solar_forecast + wind_forecast
        renewable_percentage = (renewable_energy / total_energy) * 100
        
        return {
            "solar_generation_forecast": solar_forecast,
            "wind_generation_forecast": wind_forecast,
            "renewable_percentage_forecast": renewable_percentage
        }
    
    def sync_fleet_vehicles(self, request: FleetVehicleSyncRequest) -> IntegrationDataSync:
        """Sync vehicle data from a fleet management system"""
        integration = self.get_integration(request.integration_id)
        
        if integration.integration_type != IntegrationType.FLEET_MANAGEMENT:
            raise IntegrationException("Integration is not a fleet management system")
        
        # Create a data sync record
        sync_record = IntegrationDataSync(
            integration_id=integration.id,
            sync_type="FLEET_VEHICLES",
            status="in_progress"
        )
        self.db.add(sync_record)
        self.db.commit()
        
        try:
            headers = self._get_headers_for_integration(integration)
            
            # Determine the endpoint
            endpoint = "/vehicles"
            params = {}
            
            if not request.sync_all and request.specific_vehicles:
                # Different APIs might handle this differently
                vehicle_ids = [str(v) for v in request.specific_vehicles]
                params["ids"] = ",".join(vehicle_ids)
            
            # Make the API request
            response = requests.get(
                f"{integration.api_base_url}{endpoint}", 
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code != 200:
                raise IntegrationException(f"API returned status code {response.status_code}: {response.text}")
            
            vehicles_data = response.json()
            
            # This would need to be adapted to each specific API's response format
            vehicles = vehicles_data.get("vehicles", [])
            
            # Process each vehicle
            for vehicle_data in vehicles:
                self._process_fleet_vehicle(integration, vehicle_data)
                sync_record.records_processed += 1
                sync_record.records_succeeded += 1
            
            # Update integration
            integration.last_sync_at = datetime.utcnow()
            
            # Update sync record
            sync_record.status = "success"
            sync_record.completed_at = datetime.utcnow()
            sync_record.sync_details = {
                "total_vehicles": len(vehicles)
            }
            self.db.commit()
            
        except Exception as e:
            logger.exception(f"Error syncing fleet vehicles from integration {integration.id}")
            sync_record.status = "failed"
            sync_record.error_message = str(e)
            sync_record.completed_at = datetime.utcnow()
            self.db.commit()
            
            raise IntegrationException(f"Error syncing fleet vehicles: {str(e)}")
        
        return sync_record
    
    def _process_fleet_vehicle(self, integration: ExternalIntegration, vehicle_data: Dict[str, Any]) -> None:
        """Process and save fleet vehicle data"""
        # This is a simplified implementation
        external_id = vehicle_data.get("id")
        if not external_id:
            logger.warning(f"Skipping vehicle without external ID: {vehicle_data}")
            return
        
        # Check if we already have this vehicle mapped to our system
        vehicle_sync = self.db.query(FleetVehicleSync).filter(
            FleetVehicleSync.integration_id == integration.id,
            FleetVehicleSync.external_vehicle_id == external_id
        ).first()
        
        # If we've linked this external vehicle to our vehicle, get the vehicle
        vehicle = None
        if vehicle_sync and vehicle_sync.vehicle_id:
            vehicle = self.db.query(Vehicle).get(vehicle_sync.vehicle_id)
        
        # If not already synced, try to match by VIN if available
        vin = vehicle_data.get("vin")
        if not vehicle_sync and vin:
            vehicle = self.db.query(Vehicle).filter(Vehicle.vin == vin).first()
            
            if vehicle:
                # Create new sync record if we found a matching vehicle
                vehicle_sync = FleetVehicleSync(
                    integration_id=integration.id,
                    external_vehicle_id=external_id,
                    vehicle_id=vehicle.id
                )
                self.db.add(vehicle_sync)
        
        # Data to update
        update_data = {
            "last_sync_at": datetime.utcnow(),
            "last_location_lat": vehicle_data.get("latitude"),
            "last_location_lon": vehicle_data.get("longitude"),
            "last_battery_level": vehicle_data.get("battery_level"),
            "odometer": vehicle_data.get("odometer"),
            "status": vehicle_data.get("status"),
            "driver_id": vehicle_data.get("driver_id"),
            "scheduled_destination": vehicle_data.get("destination"),
            "estimated_arrival": self._parse_datetime(vehicle_data.get("estimated_arrival")),
            "sync_data": vehicle_data
        }
        
        if vehicle_sync:
            # Update existing sync record
            for key, value in update_data.items():
                if value is not None:
                    setattr(vehicle_sync, key, value)
        else:
            # Create new sync record without vehicle link
            update_data["integration_id"] = integration.id
            update_data["external_vehicle_id"] = external_id
            vehicle_sync = FleetVehicleSync(**update_data)
            self.db.add(vehicle_sync)
        
        # If we have a linked vehicle, update its data too
        if vehicle:
            if update_data["last_battery_level"] is not None:
                vehicle.battery_level = update_data["last_battery_level"]
            
            if update_data["odometer"] is not None:
                vehicle.odometer = update_data["odometer"]
        
        self.db.commit()
    
    def _parse_datetime(self, datetime_str: Optional[str]) -> Optional[datetime]:
        """Parse a datetime string in various formats"""
        if not datetime_str:
            return None
            
        formats = [
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S.%fZ",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(datetime_str, fmt)
            except ValueError:
                continue
        
        logger.warning(f"Could not parse datetime: {datetime_str}")
        return None 