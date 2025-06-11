"""
Telemetry Data Ingestion Pipeline

This module implements a real-time data ingestion pipeline for EV telemetry data
with validation, storage, and streaming capabilities.
"""
import os
import sys
import json
import logging
import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any, Callable
from pathlib import Path
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field, validator

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# Data validation models
class BatteryTelemetry(BaseModel):
    """Schema for battery telemetry data"""
    vehicle_id: str
    timestamp: datetime
    state_of_charge: float = Field(..., ge=0, le=100)
    battery_temp: float = Field(..., ge=-20, le=80)
    voltage: float = Field(..., ge=0)
    current: float = Field(...)
    charging_status: int = Field(..., ge=0, le=1)
    
    @validator('state_of_charge')
    def validate_soc(cls, v):
        """Ensure SoC is within valid range"""
        if v > 100 or v < 0:
            raise ValueError(f"State of charge must be between 0 and 100, got {v}")
        return v
    
    @validator('battery_temp')
    def validate_temp(cls, v):
        """Check for extreme temperatures"""
        if v > 60:
            logger.warning(f"Extreme high temperature detected: {v}°C")
        elif v < -10:
            logger.warning(f"Extreme low temperature detected: {v}°C")
        return v


class VehicleTelemetry(BaseModel):
    """Schema for vehicle telemetry data"""
    vehicle_id: str
    timestamp: datetime
    odometer: float = Field(..., ge=0)
    speed: float = Field(..., ge=0)
    location_lat: Optional[float] = Field(None, ge=-90, le=90)
    location_lon: Optional[float] = Field(None, ge=-180, le=180)
    tire_pressure_fl: Optional[float] = Field(None, ge=0)
    tire_pressure_fr: Optional[float] = Field(None, ge=0)
    tire_pressure_rl: Optional[float] = Field(None, ge=0)
    tire_pressure_rr: Optional[float] = Field(None, ge=0)
    ambient_temp: Optional[float] = None
    
    @validator('speed')
    def validate_speed(cls, v):
        """Flag unrealistic speeds"""
        if v > 200:  # km/h or mph
            logger.warning(f"Unrealistic speed detected: {v}")
        return v


class TelemetryProcessor:
    """
    Processes telemetry data from various sources
    
    This class handles the ingestion, validation, transformation, and storage of 
    telemetry data in real-time, with capabilities for batch processing and 
    streaming to various destinations.
    """
    
    def __init__(
        self,
        batch_size: int = 100,
        buffer_timeout: int = 30,  # seconds
        storage_path: str = 'data/telemetry',
        db_connection_string: Optional[str] = None,
        enable_streaming: bool = False,
        enable_anomaly_detection: bool = True
    ):
        """
        Initialize the telemetry processor
        
        Args:
            batch_size: Number of records to accumulate before writing to storage
            buffer_timeout: Maximum time to wait before writing buffered data
            storage_path: Path for file-based storage
            db_connection_string: Connection string for database storage
            enable_streaming: Whether to enable real-time data streaming
            enable_anomaly_detection: Whether to enable anomaly detection
        """
        self.batch_size = batch_size
        self.buffer_timeout = buffer_timeout
        self.storage_path = storage_path
        self.db_connection_string = db_connection_string
        self.enable_streaming = enable_streaming
        self.enable_anomaly_detection = enable_anomaly_detection
        
        # Data buffers
        self.battery_data_buffer = []
        self.vehicle_data_buffer = []
        
        # Tracking
        self.last_flush_time = time.time()
        self.processed_count = 0
        self.error_count = 0
        
        # Callbacks
        self.anomaly_callbacks = []
        self.processing_callbacks = []
        
        # Ensure storage directory exists
        os.makedirs(storage_path, exist_ok=True)
        
        logger.info(f"Telemetry processor initialized with batch size {batch_size}, "
                   f"buffer timeout {buffer_timeout}s")
    
    def process_battery_telemetry(self, data: Dict) -> Optional[BatteryTelemetry]:
        """
        Process and validate battery telemetry data
        
        Args:
            data: Raw battery telemetry data
            
        Returns:
            Validated BatteryTelemetry object or None if validation fails
        """
        try:
            # Ensure timestamp is datetime
            if 'timestamp' in data and isinstance(data['timestamp'], str):
                data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            
            # Validate data using the schema
            validated_data = BatteryTelemetry(**data)
            
            # Add to buffer
            self.battery_data_buffer.append(validated_data.dict())
            self.processed_count += 1
            
            # Check if buffer needs to be flushed
            self._check_flush_buffers()
            
            # Run processing callbacks
            for callback in self.processing_callbacks:
                callback('battery', validated_data.dict())
            
            # Check for anomalies
            if self.enable_anomaly_detection:
                self._check_for_battery_anomalies(validated_data)
            
            return validated_data
            
        except Exception as e:
            logger.error(f"Error processing battery telemetry: {str(e)}, data: {data}")
            self.error_count += 1
            return None
    
    def process_vehicle_telemetry(self, data: Dict) -> Optional[VehicleTelemetry]:
        """
        Process and validate vehicle telemetry data
        
        Args:
            data: Raw vehicle telemetry data
            
        Returns:
            Validated VehicleTelemetry object or None if validation fails
        """
        try:
            # Ensure timestamp is datetime
            if 'timestamp' in data and isinstance(data['timestamp'], str):
                data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            
            # Validate data using the schema
            validated_data = VehicleTelemetry(**data)
            
            # Add to buffer
            self.vehicle_data_buffer.append(validated_data.dict())
            self.processed_count += 1
            
            # Check if buffer needs to be flushed
            self._check_flush_buffers()
            
            # Run processing callbacks
            for callback in self.processing_callbacks:
                callback('vehicle', validated_data.dict())
            
            return validated_data
            
        except Exception as e:
            logger.error(f"Error processing vehicle telemetry: {str(e)}, data: {data}")
            self.error_count += 1
            return None
    
    def _check_flush_buffers(self) -> None:
        """Check if buffers need to be flushed based on size or timeout"""
        current_time = time.time()
        battery_buffer_size = len(self.battery_data_buffer)
        vehicle_buffer_size = len(self.vehicle_data_buffer)
        
        # Flush if batch size reached
        if battery_buffer_size >= self.batch_size:
            self._flush_battery_data()
        
        if vehicle_buffer_size >= self.batch_size:
            self._flush_vehicle_data()
        
        # Flush if timeout reached
        if current_time - self.last_flush_time >= self.buffer_timeout:
            if battery_buffer_size > 0:
                self._flush_battery_data()
            
            if vehicle_buffer_size > 0:
                self._flush_vehicle_data()
            
            self.last_flush_time = current_time
    
    def _flush_battery_data(self) -> None:
        """Flush battery data buffer to storage"""
        if not self.battery_data_buffer:
            return
        
        try:
            # Convert to DataFrame for easier processing
            df = pd.DataFrame(self.battery_data_buffer)
            
            # Store data
            self._store_data('battery', df)
            
            # Clear buffer
            buffer_size = len(self.battery_data_buffer)
            self.battery_data_buffer = []
            
            logger.info(f"Flushed {buffer_size} battery telemetry records")
            
        except Exception as e:
            logger.error(f"Error flushing battery data: {str(e)}")
    
    def _flush_vehicle_data(self) -> None:
        """Flush vehicle data buffer to storage"""
        if not self.vehicle_data_buffer:
            return
        
        try:
            # Convert to DataFrame for easier processing
            df = pd.DataFrame(self.vehicle_data_buffer)
            
            # Store data
            self._store_data('vehicle', df)
            
            # Clear buffer
            buffer_size = len(self.vehicle_data_buffer)
            self.vehicle_data_buffer = []
            
            logger.info(f"Flushed {buffer_size} vehicle telemetry records")
            
        except Exception as e:
            logger.error(f"Error flushing vehicle data: {str(e)}")
    
    def _store_data(self, data_type: str, df: pd.DataFrame) -> None:
        """
        Store data to file and/or database
        
        Args:
            data_type: Type of data ('battery' or 'vehicle')
            df: DataFrame containing the data
        """
        # File storage
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_path = os.path.join(self.storage_path, f"{data_type}_{timestamp}.parquet")
        
        # Ensure timestamp is in the correct format for Parquet
        if 'timestamp' in df.columns:
            if not pd.api.types.is_datetime64_dtype(df['timestamp']):
                df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Write to Parquet file
        df.to_parquet(file_path, index=False)
        
        # Database storage
        if self.db_connection_string:
            try:
                # Import here to avoid dependency issues if not using DB
                from sqlalchemy import create_engine
                
                engine = create_engine(self.db_connection_string)
                table_name = f"{data_type}_telemetry"
                
                # Write to database
                df.to_sql(table_name, engine, if_exists='append', index=False)
                
            except Exception as e:
                logger.error(f"Error writing to database: {str(e)}")
    
    def _check_for_battery_anomalies(self, data: BatteryTelemetry) -> None:
        """
        Check for anomalies in battery telemetry data
        
        Args:
            data: Validated battery telemetry data
        """
        anomalies = []
        
        # Temperature anomalies
        if data.battery_temp > 50:
            anomalies.append({
                'vehicle_id': data.vehicle_id,
                'timestamp': data.timestamp,
                'anomaly_type': 'high_temperature',
                'value': data.battery_temp,
                'threshold': 50,
                'severity': 'high' if data.battery_temp > 60 else 'medium'
            })
        elif data.battery_temp < 0:
            anomalies.append({
                'vehicle_id': data.vehicle_id,
                'timestamp': data.timestamp,
                'anomaly_type': 'low_temperature',
                'value': data.battery_temp,
                'threshold': 0,
                'severity': 'high' if data.battery_temp < -10 else 'medium'
            })
        
        # Voltage anomalies
        if data.voltage < 300:  # Depends on battery configuration
            anomalies.append({
                'vehicle_id': data.vehicle_id,
                'timestamp': data.timestamp,
                'anomaly_type': 'low_voltage',
                'value': data.voltage,
                'threshold': 300,
                'severity': 'medium'
            })
        
        # Current anomalies (depends on whether charging or discharging)
        if data.charging_status == 1 and data.current < 0:
            anomalies.append({
                'vehicle_id': data.vehicle_id,
                'timestamp': data.timestamp,
                'anomaly_type': 'negative_charging_current',
                'value': data.current,
                'threshold': 0,
                'severity': 'high'
            })
        elif data.charging_status == 0 and data.current > 0:
            anomalies.append({
                'vehicle_id': data.vehicle_id,
                'timestamp': data.timestamp,
                'anomaly_type': 'positive_discharging_current',
                'value': data.current,
                'threshold': 0,
                'severity': 'high'
            })
        
        # Process anomalies
        for anomaly in anomalies:
            logger.warning(f"Anomaly detected: {anomaly}")
            # Trigger callbacks
            for callback in self.anomaly_callbacks:
                callback(anomaly)
    
    def register_anomaly_callback(self, callback: Callable[[Dict], None]) -> None:
        """
        Register a callback function for anomaly detection
        
        Args:
            callback: Function that takes an anomaly dict as parameter
        """
        self.anomaly_callbacks.append(callback)
    
    def register_processing_callback(self, callback: Callable[[str, Dict], None]) -> None:
        """
        Register a callback function for processing
        
        Args:
            callback: Function that takes data_type and data dict as parameters
        """
        self.processing_callbacks.append(callback)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get processing statistics
        
        Returns:
            Dictionary with processing statistics
        """
        return {
            'processed_count': self.processed_count,
            'error_count': self.error_count,
            'battery_buffer_size': len(self.battery_data_buffer),
            'vehicle_buffer_size': len(self.vehicle_data_buffer),
            'last_flush_time': datetime.fromtimestamp(self.last_flush_time).isoformat()
        }
    
    def flush_all(self) -> None:
        """Force flush all buffers"""
        self._flush_battery_data()
        self._flush_vehicle_data()
        self.last_flush_time = time.time()


class AsyncTelemetryProcessor(TelemetryProcessor):
    """
    Asynchronous version of the telemetry processor
    
    Extends the base TelemetryProcessor with async capabilities for 
    high-throughput data ingestion.
    """
    
    def __init__(self, *args, **kwargs):
        """Initialize the async telemetry processor"""
        super().__init__(*args, **kwargs)
        self.processing_queue = asyncio.Queue()
        self.is_running = False
    
    async def process_battery_telemetry_async(self, data: Dict) -> Optional[BatteryTelemetry]:
        """
        Process battery telemetry data asynchronously
        
        Args:
            data: Raw battery telemetry data
            
        Returns:
            Validated BatteryTelemetry object or None if validation fails
        """
        # Put data in queue for processing
        await self.processing_queue.put(('battery', data))
        return None  # Actual processing happens in the worker
    
    async def process_vehicle_telemetry_async(self, data: Dict) -> Optional[VehicleTelemetry]:
        """
        Process vehicle telemetry data asynchronously
        
        Args:
            data: Raw vehicle telemetry data
            
        Returns:
            Validated VehicleTelemetry object or None if validation fails
        """
        # Put data in queue for processing
        await self.processing_queue.put(('vehicle', data))
        return None  # Actual processing happens in the worker
    
    async def start_processing(self) -> None:
        """Start asynchronous processing worker"""
        self.is_running = True
        
        # Start worker task
        asyncio.create_task(self._processing_worker())
        
        # Start periodic flush task
        asyncio.create_task(self._periodic_flush())
        
        logger.info("Async telemetry processor started")
    
    async def stop_processing(self) -> None:
        """Stop asynchronous processing"""
        self.is_running = False
        await asyncio.sleep(0.1)  # Allow workers to finish
        
        # Flush remaining data
        self.flush_all()
        
        logger.info("Async telemetry processor stopped")
    
    async def _processing_worker(self) -> None:
        """Worker function to process queued telemetry data"""
        while self.is_running:
            try:
                # Get data from queue with timeout
                try:
                    data_type, data = await asyncio.wait_for(
                        self.processing_queue.get(), timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                # Process data based on type
                if data_type == 'battery':
                    super().process_battery_telemetry(data)
                elif data_type == 'vehicle':
                    super().process_vehicle_telemetry(data)
                
                # Mark task as done
                self.processing_queue.task_done()
                
            except Exception as e:
                logger.error(f"Error in processing worker: {str(e)}")
                await asyncio.sleep(1)  # Prevent tight loop on persistent errors
    
    async def _periodic_flush(self) -> None:
        """Periodically flush data buffers"""
        while self.is_running:
            await asyncio.sleep(self.buffer_timeout)
            
            # Current time check is done in the method
            self._check_flush_buffers()


# Example implementation of database storage and testing
async def main():
    """Example usage of the telemetry processor"""
    
    # Create processor
    processor = AsyncTelemetryProcessor(
        batch_size=10,
        buffer_timeout=5,
        storage_path='data/telemetry'
    )
    
    # Register anomaly callback
    def anomaly_handler(anomaly):
        print(f"ANOMALY ALERT: {anomaly}")
    
    processor.register_anomaly_callback(anomaly_handler)
    
    # Start processor
    await processor.start_processing()
    
    # Generate some test data
    for i in range(20):
        vehicle_id = f"TEST-{i % 3 + 1}"
        
        # Battery telemetry
        battery_data = {
            'vehicle_id': vehicle_id,
            'timestamp': datetime.now().isoformat(),
            'state_of_charge': 85 - (i % 10),
            'battery_temp': 25 + (i % 10),
            'voltage': 400 - (i % 20),
            'current': 10 if i % 2 == 0 else -5,
            'charging_status': 1 if i % 2 == 0 else 0
        }
        
        # Simulate anomaly
        if i == 15:
            battery_data['battery_temp'] = 55  # Anomaly: high temp
        
        await processor.process_battery_telemetry_async(battery_data)
        
        # Vehicle telemetry
        vehicle_data = {
            'vehicle_id': vehicle_id,
            'timestamp': datetime.now().isoformat(),
            'odometer': 10000 + i * 10,
            'speed': 65 if i % 3 == 0 else 0,
            'location_lat': 37.7749 + (i * 0.01 % 1),
            'location_lon': -122.4194 + (i * 0.01 % 1),
            'ambient_temp': 20 + (i % 5)
        }
        
        await processor.process_vehicle_telemetry_async(vehicle_data)
        
        await asyncio.sleep(0.5)
    
    # Wait for processing to complete
    await asyncio.sleep(2)
    
    # Print stats
    print(f"Processing stats: {processor.get_stats()}")
    
    # Stop processor
    await processor.stop_processing()


if __name__ == "__main__":
    asyncio.run(main()) 