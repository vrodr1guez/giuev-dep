"""
Telemetry Data Service

Handles fetching, processing, and validating battery telemetry data
from various sources for use in health prediction and anomaly detection.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
import logging
import json
import os
import aiohttp
import asyncio
from datetime import datetime, timedelta

from app.core.config import settings
from app.db.session import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class TelemetryDataProcessor:
    """Processes telemetry data for battery health analysis"""
    
    def __init__(self):
        # API configuration - would be loaded from settings in production
        self._api_config = {
            "tesla": {
                "base_url": settings.TESLA_API_URL,
                "api_key": settings.TESLA_API_KEY,
                "endpoint": "/api/1/vehicles/{vehicle_id}/battery_data"
            },
            "ford": {
                "base_url": settings.FORD_API_URL,
                "api_key": settings.FORD_API_KEY,
                "endpoint": "/api/fordpass/v1/vehicles/{vehicle_id}/battery"
            },
            "generic_oem": {
                "base_url": settings.GENERIC_OEM_API_URL,
                "api_key": settings.GENERIC_OEM_API_KEY,
                "endpoint": "/api/vehicles/{vehicle_id}/telemetry/battery"
            }
        }
        
        # Data validation rules
        self._validation_rules = {
            "voltage": {
                "min": 200.0,  # Minimum plausible voltage (V)
                "max": 500.0   # Maximum plausible voltage (V)
            },
            "current": {
                "min": -500.0,  # Minimum plausible current (discharge) (A)
                "max": 500.0    # Maximum plausible current (charge) (A)
            },
            "temperature": {
                "min": -20.0,   # Minimum plausible temperature (C)
                "max": 80.0     # Maximum plausible temperature (C)
            },
            "soc": {
                "min": 0.0,     # Minimum state of charge (%)
                "max": 100.0    # Maximum state of charge (%)
            }
        }
    
    async def fetch_telemetry_data(self, vehicle_id: str, provider: str) -> Dict[str, Any]:
        """
        Fetch telemetry data from vehicle API provider
        
        Args:
            vehicle_id: The vehicle identifier
            provider: API provider (tesla, ford, generic_oem)
            
        Returns:
            Dictionary containing telemetry data
        """
        if provider not in self._api_config:
            logger.error(f"Unsupported API provider: {provider}")
            return {}
        
        config = self._api_config[provider]
        url = f"{config['base_url']}{config['endpoint']}".format(vehicle_id=vehicle_id)
        
        try:
            headers = {
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"API request failed with status {response.status}: {await response.text()}")
                        return {}
        except Exception as e:
            logger.exception(f"Error fetching telemetry data: {str(e)}")
            return {}
    
    def validate_telemetry_data(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
        """
        Validate telemetry data to ensure it's within expected ranges
        
        Args:
            data: Raw telemetry data
            
        Returns:
            Tuple of (cleaned_data, list_of_validation_messages)
        """
        cleaned_data = {}
        validation_messages = []
        
        # Extract the main battery metrics
        try:
            if 'battery' in data:
                battery_data = data['battery']
                
                # Validate and clean voltage
                if 'voltage' in battery_data:
                    voltage = float(battery_data['voltage'])
                    if self._validation_rules['voltage']['min'] <= voltage <= self._validation_rules['voltage']['max']:
                        cleaned_data['voltage'] = voltage
                    else:
                        validation_messages.append(f"Voltage out of range: {voltage}V")
                
                # Validate and clean current
                if 'current' in battery_data:
                    current = float(battery_data['current'])
                    if self._validation_rules['current']['min'] <= current <= self._validation_rules['current']['max']:
                        cleaned_data['current'] = current
                    else:
                        validation_messages.append(f"Current out of range: {current}A")
                
                # Validate and clean temperature
                if 'temperature' in battery_data:
                    if isinstance(battery_data['temperature'], list):
                        # Multiple temperature sensors
                        temperatures = [float(t) for t in battery_data['temperature']]
                        valid_temps = [t for t in temperatures 
                                      if self._validation_rules['temperature']['min'] <= t <= self._validation_rules['temperature']['max']]
                        
                        if valid_temps:
                            cleaned_data['temperature'] = valid_temps
                            if len(valid_temps) != len(temperatures):
                                validation_messages.append(f"Some temperature readings filtered: {len(temperatures) - len(valid_temps)}")
                        else:
                            validation_messages.append(f"All temperature readings out of range")
                    else:
                        # Single temperature value
                        temperature = float(battery_data['temperature'])
                        if self._validation_rules['temperature']['min'] <= temperature <= self._validation_rules['temperature']['max']:
                            cleaned_data['temperature'] = temperature
                        else:
                            validation_messages.append(f"Temperature out of range: {temperature}°C")
                
                # Validate state of charge
                if 'soc' in battery_data:
                    soc = float(battery_data['soc'])
                    if self._validation_rules['soc']['min'] <= soc <= self._validation_rules['soc']['max']:
                        cleaned_data['soc'] = soc
                    else:
                        validation_messages.append(f"State of charge out of range: {soc}%")
                        
                # Copy other relevant fields
                for field in ['health', 'capacity', 'cycle_count', 'last_charged']:
                    if field in battery_data:
                        cleaned_data[field] = battery_data[field]
            
            # Add timestamp if not present
            if 'timestamp' not in cleaned_data:
                cleaned_data['timestamp'] = datetime.now().isoformat()
                
            # Add metadata
            cleaned_data['validation_status'] = "valid" if not validation_messages else "warnings"
                
            return cleaned_data, validation_messages
            
        except Exception as e:
            logger.exception(f"Error validating telemetry data: {str(e)}")
            return {}, [f"Validation error: {str(e)}"]
    
    async def process_and_store_telemetry(self, vehicle_id: str, provider: str, db: Session) -> Dict[str, Any]:
        """
        End-to-end process to fetch, validate, and store telemetry data
        
        Args:
            vehicle_id: The vehicle identifier
            provider: API provider name
            db: Database session
            
        Returns:
            Dictionary with processing results and status
        """
        # Fetch raw data
        raw_data = await self.fetch_telemetry_data(vehicle_id, provider)
        
        if not raw_data:
            return {"status": "error", "message": "Failed to fetch telemetry data"}
        
        # Validate and clean data
        cleaned_data, validation_messages = self.validate_telemetry_data(raw_data)
        
        if not cleaned_data:
            return {"status": "error", "message": "Failed to validate telemetry data", "details": validation_messages}
        
        try:
            # Store in database - in production this would use SQLAlchemy models
            # For this demo, we'll just log it
            logger.info(f"Storing telemetry data for vehicle {vehicle_id}: {json.dumps(cleaned_data)}")
            
            # TODO: Implement actual database storage
            # telemetry_record = TelemetryRecord(
            #    vehicle_id=vehicle_id,
            #    data=cleaned_data,
            #    timestamp=datetime.now(),
            #    validation_status=cleaned_data['validation_status']
            # )
            # db.add(telemetry_record)
            # db.commit()
            
            return {
                "status": "success",
                "message": "Telemetry data processed and stored",
                "validation_messages": validation_messages,
                "data": cleaned_data
            }
            
        except Exception as e:
            logger.exception(f"Error storing telemetry data: {str(e)}")
            return {"status": "error", "message": f"Failed to store telemetry data: {str(e)}"}
    
    def get_historical_telemetry(self, vehicle_id: str, start_date: datetime, 
                                end_date: datetime, db: Session) -> pd.DataFrame:
        """
        Retrieve historical telemetry data for analysis
        
        Args:
            vehicle_id: The vehicle identifier
            start_date: Start date for data retrieval
            end_date: End date for data retrieval
            db: Database session
            
        Returns:
            DataFrame containing historical telemetry data
        """
        try:
            # In production, this would query the database
            # For this demo, we'll generate synthetic data
            
            # Calculate number of days in range
            days = (end_date - start_date).days + 1
            
            # Generate timestamps
            timestamps = [start_date + timedelta(days=i) for i in range(days)]
            
            # Generate synthetic data
            data = []
            for ts in timestamps:
                # Create random variations
                voltage = 350 + np.random.normal(0, 5)
                soc = 50 + np.random.normal(0, 20)
                soc = max(min(soc, 100), 0)  # Clamp between 0-100
                temperature = 25 + np.random.normal(0, 8)
                
                data.append({
                    "vehicle_id": vehicle_id,
                    "timestamp": ts,
                    "voltage": voltage,
                    "soc": soc,
                    "temperature": temperature,
                    "health": max(60, 100 - (0.01 * (datetime.now() - ts).days)),
                    "capacity": 75 - (0.01 * (datetime.now() - ts).days)
                })
            
            return pd.DataFrame(data)
            
        except Exception as e:
            logger.exception(f"Error retrieving historical telemetry: {str(e)}")
            return pd.DataFrame()

# Singleton instance
_telemetry_processor = None

def get_telemetry_processor() -> TelemetryDataProcessor:
    """Get the telemetry data processor instance"""
    global _telemetry_processor
    if _telemetry_processor is None:
        _telemetry_processor = TelemetryDataProcessor()
    return _telemetry_processor 