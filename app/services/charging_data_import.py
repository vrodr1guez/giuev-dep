import csv
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.charging_network import ChargingNetwork
from app.models.charging_station import ChargingStation, ChargingConnector, ChargingConnectorType
from app.core.logging import logger


class ChargingDataImporter:
    """Service for importing charging station data from external sources."""
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_or_create_network(self, network_name: str) -> Tuple[ChargingNetwork, bool]:
        """Get an existing network or create a new one if it doesn't exist."""
        network = self.db.query(ChargingNetwork).filter(ChargingNetwork.name == network_name).first()
        
        if network:
            return network, False
        
        # Create network with default values
        network = ChargingNetwork(
            name=network_name,
            description=f"{network_name} charging network",
        )
        
        self.db.add(network)
        try:
            self.db.flush()
            return network, True
        except IntegrityError:
            self.db.rollback()
            # Race condition - someone else created it
            network = self.db.query(ChargingNetwork).filter(ChargingNetwork.name == network_name).first()
            if network:
                return network, False
            else:
                raise ValueError(f"Failed to create network: {network_name}")
    
    def map_connector_type(self, connector_str: str) -> ChargingConnectorType:
        """Map connector string from dataset to enum value."""
        connector_mapping = {
            "J1772": ChargingConnectorType.TYPE_1,
            "Type 1": ChargingConnectorType.TYPE_1,
            "Type 2": ChargingConnectorType.TYPE_2,
            "Mennekes": ChargingConnectorType.TYPE_2,
            "CCS1": ChargingConnectorType.CCS1,
            "CCS Combo 1": ChargingConnectorType.CCS1,
            "CCS2": ChargingConnectorType.CCS2,
            "CCS Combo 2": ChargingConnectorType.CCS2,
            "CHAdeMO": ChargingConnectorType.CHADEMO,
            "CHADEMO": ChargingConnectorType.CHADEMO,
            "Tesla": ChargingConnectorType.TESLA,
            "Tesla Supercharger": ChargingConnectorType.TESLA,
            "GB/T DC": ChargingConnectorType.GBDC,
            "GB/T AC": ChargingConnectorType.GBAC
        }
        
        for key, value in connector_mapping.items():
            if key.lower() in connector_str.lower():
                return value
        
        # Default to Type 2 if unknown
        logger.warning(f"Unknown connector type: {connector_str}, defaulting to Type 2")
        return ChargingConnectorType.TYPE_2
    
    def import_from_csv(self, csv_file_path: str, organization_id: int) -> Dict:
        """Import charging stations from a CSV file."""
        stats = {
            "stations_created": 0,
            "stations_updated": 0,
            "connectors_created": 0,
            "networks_created": 0,
            "errors": 0
        }
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    try:
                        # Extract network info
                        network_name = row.get('Network', 'Unknown')
                        network, created = self.get_or_create_network(network_name)
                        if created:
                            stats["networks_created"] += 1
                        
                        # Check if station already exists by external ID
                        external_id = row.get('ID') or row.get('Station ID')
                        existing_station = None
                        if external_id:
                            existing_station = self.db.query(ChargingStation).filter(
                                ChargingStation.external_id == external_id
                            ).first()
                        
                        # Extract station data
                        try:
                            latitude = float(row.get('Latitude', 0))
                            longitude = float(row.get('Longitude', 0))
                        except ValueError:
                            logger.error(f"Invalid coordinates for station: {external_id}")
                            stats["errors"] += 1
                            continue
                            
                        station_data = {
                            "name": row.get('Station Name', f"Station {external_id}"),
                            "description": row.get('Description', ''),
                            "latitude": latitude,
                            "longitude": longitude,
                            "address": row.get('Street Address', ''),
                            "city": row.get('City', ''),
                            "state": row.get('State', 'NY'),
                            "country": row.get('Country', 'USA'),
                            "zip_code": row.get('ZIP', ''),
                            "organization_id": organization_id,
                            "network_id": network.id,
                            "is_public": True,  # Assume public by default
                            "external_id": external_id,
                            "is_hpc": True,  # Since we're focusing on HPC chargers
                            "last_confirmed_date": datetime.now()
                        }
                        
                        # Check for additional amenities
                        amenities = row.get('Amenities', '').lower()
                        station_data["has_restroom"] = 'restroom' in amenities
                        station_data["has_convenience_store"] = 'store' in amenities or 'shop' in amenities
                        station_data["has_restaurant"] = 'restaurant' in amenities or 'food' in amenities
                        station_data["open_24_hours"] = '24' in amenities or '24/7' in amenities
                        
                        if existing_station:
                            # Update existing station
                            for key, value in station_data.items():
                                setattr(existing_station, key, value)
                            stats["stations_updated"] += 1
                            station = existing_station
                        else:
                            # Create new station
                            station = ChargingStation(**station_data)
                            self.db.add(station)
                            stats["stations_created"] += 1
                            
                        self.db.flush()  # Get the ID without committing
                        
                        # Extract connector data
                        connector_types = row.get('Connector Types', '')
                        power_levels = row.get('Power Levels (kW)', '')
                        num_ports = int(row.get('Number of Ports', 1))
                        
                        # Split connector types and power levels
                        connector_types = [ct.strip() for ct in connector_types.split(',') if ct.strip()]
                        power_levels = [float(pl.strip()) for pl in power_levels.split(',') if pl.strip() and pl.replace('.', '', 1).isdigit()]
                        
                        # Ensure we have at least one connector
                        if not connector_types:
                            connector_types = ['Type 2']  # Default
                        
                        if not power_levels:
                            power_levels = [50.0]  # Default
                            
                        # Ensure matching lengths
                        while len(power_levels) < len(connector_types):
                            power_levels.append(power_levels[-1] if power_levels else 50.0)
                            
                        while len(connector_types) < len(power_levels):
                            connector_types.append(connector_types[-1] if connector_types else 'Type 2')
                        
                        # Distribute ports among connector types
                        ports_per_type = max(1, num_ports // len(connector_types))
                        remainder = num_ports % len(connector_types)
                        
                        # Remove existing connectors if updating
                        if existing_station:
                            for conn in existing_station.connectors:
                                self.db.delete(conn)
                            
                        # Create connectors
                        for i, (conn_type, power_kw) in enumerate(zip(connector_types, power_levels)):
                            # Add extra port to first connectors if remainder
                            ports = ports_per_type + (1 if i < remainder else 0)
                            
                            for port_num in range(1, ports + 1):
                                connector = ChargingConnector(
                                    charging_station_id=station.id,
                                    connector_type=self.map_connector_type(conn_type),
                                    power_kw=power_kw,
                                    voltage=400.0,  # Default
                                    amperage=power_kw * 1000 / 400.0,  # Estimate amperage
                                    connector_number=port_num + (i * ports_per_type)
                                )
                                self.db.add(connector)
                                stats["connectors_created"] += 1
                        
                        self.db.flush()
                        
                    except Exception as e:
                        logger.error(f"Error importing station: {str(e)}")
                        self.db.rollback()
                        stats["errors"] += 1
                        continue
                
                # Commit all changes
                self.db.commit()
                return stats
                
        except Exception as e:
            logger.error(f"Error importing CSV: {str(e)}")
            self.db.rollback()
            raise
    
    def import_from_json(self, json_file_path: str, organization_id: int) -> Dict:
        """Import charging stations from a JSON file."""
        stats = {
            "stations_created": 0,
            "stations_updated": 0,
            "connectors_created": 0,
            "networks_created": 0,
            "errors": 0
        }
        
        try:
            with open(json_file_path, 'r', encoding='utf-8') as jsonfile:
                data = json.load(jsonfile)
                stations = data if isinstance(data, list) else data.get('features', [])
                
                for station in stations:
                    try:
                        # Handle GeoJSON format
                        if 'properties' in station and 'geometry' in station:
                            props = station['properties']
                            geom = station['geometry']
                            
                            # Extract network info
                            network_name = props.get('network', 'Unknown')
                            network, created = self.get_or_create_network(network_name)
                            if created:
                                stats["networks_created"] += 1
                            
                            # Check if station already exists
                            external_id = props.get('id') or props.get('station_id')
                            existing_station = None
                            if external_id:
                                existing_station = self.db.query(ChargingStation).filter(
                                    ChargingStation.external_id == str(external_id)
                                ).first()
                            
                            # Extract coordinates from geometry
                            coordinates = geom.get('coordinates', [0, 0])
                            latitude = coordinates[1] if len(coordinates) >= 2 else 0
                            longitude = coordinates[0] if len(coordinates) >= 1 else 0
                                
                            station_data = {
                                "name": props.get('name', f"Station {external_id}"),
                                "description": props.get('description', ''),
                                "latitude": latitude,
                                "longitude": longitude,
                                "address": props.get('address', props.get('street_address', '')),
                                "city": props.get('city', ''),
                                "state": props.get('state', 'NY'),
                                "country": props.get('country', 'USA'),
                                "zip_code": props.get('zip', props.get('postal_code', '')),
                                "organization_id": organization_id,
                                "network_id": network.id,
                                "is_public": props.get('is_public', True),
                                "external_id": str(external_id) if external_id else None,
                                "is_hpc": True,  # HPC chargers
                                "last_confirmed_date": datetime.now()
                            }
                            
                            # Check for amenities
                            amenities = props.get('amenities', '').lower()
                            station_data["has_restroom"] = props.get('has_restroom', 'restroom' in amenities)
                            station_data["has_convenience_store"] = props.get('has_store', 'store' in amenities)
                            station_data["has_restaurant"] = props.get('has_restaurant', 'restaurant' in amenities)
                            station_data["open_24_hours"] = props.get('open_24_hours', '24' in amenities)
                            
                            if existing_station:
                                # Update existing station
                                for key, value in station_data.items():
                                    setattr(existing_station, key, value)
                                stats["stations_updated"] += 1
                                station_obj = existing_station
                            else:
                                # Create new station
                                station_obj = ChargingStation(**station_data)
                                self.db.add(station_obj)
                                stats["stations_created"] += 1
                                
                            self.db.flush()  # Get the ID without committing
                            
                            # Extract connector data
                            connectors = props.get('connectors', [])
                            if not connectors:
                                # Create default connector if none specified
                                connector = ChargingConnector(
                                    charging_station_id=station_obj.id,
                                    connector_type=ChargingConnectorType.CCS2,  # Default for HPC
                                    power_kw=150.0,  # Default for HPC
                                    voltage=400.0,
                                    amperage=375.0,
                                    connector_number=1
                                )
                                self.db.add(connector)
                                stats["connectors_created"] += 1
                            else:
                                # Remove existing connectors if updating
                                if existing_station:
                                    for conn in existing_station.connectors:
                                        self.db.delete(conn)
                                
                                # Create connectors from the data
                                for i, conn in enumerate(connectors, 1):
                                    if isinstance(conn, str):
                                        # Simple string connector type
                                        connector = ChargingConnector(
                                            charging_station_id=station_obj.id,
                                            connector_type=self.map_connector_type(conn),
                                            power_kw=150.0,  # Default for HPC
                                            voltage=400.0,
                                            amperage=375.0,
                                            connector_number=i
                                        )
                                    else:
                                        # Dict with detailed connector info
                                        connector = ChargingConnector(
                                            charging_station_id=station_obj.id,
                                            connector_type=self.map_connector_type(conn.get('type', 'CCS2')),
                                            power_kw=float(conn.get('power_kw', 150.0)),
                                            voltage=float(conn.get('voltage', 400.0)),
                                            amperage=float(conn.get('amperage', 375.0)),
                                            connector_number=conn.get('number', i)
                                        )
                                    
                                    self.db.add(connector)
                                    stats["connectors_created"] += 1
                            
                            self.db.flush()
                        
                        else:
                            # Handle flat JSON format
                            # Similar implementation as above but for flat JSON
                            # This is a simplified implementation - extend as needed
                            logger.warning("Non-GeoJSON format detected. Using limited parsing.")
                            
                            # Extract network info
                            network_name = station.get('network', 'Unknown')
                            network, created = self.get_or_create_network(network_name)
                            if created:
                                stats["networks_created"] += 1
                            
                            # Check if station already exists
                            external_id = station.get('id') or station.get('station_id')
                            existing_station = None
                            if external_id:
                                existing_station = self.db.query(ChargingStation).filter(
                                    ChargingStation.external_id == str(external_id)
                                ).first()
                            
                            # Create or update station with flat JSON format
                            # Implementation similar to above
                            # ...
                            
                    except Exception as e:
                        logger.error(f"Error importing station from JSON: {str(e)}")
                        self.db.rollback()
                        stats["errors"] += 1
                        continue
                
                # Commit all changes
                self.db.commit()
                return stats
                
        except Exception as e:
            logger.error(f"Error importing JSON: {str(e)}")
            self.db.rollback()
            raise 