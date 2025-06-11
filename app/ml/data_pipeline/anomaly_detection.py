"""
Real-time Anomaly Detection Pipeline

This module implements a real-time anomaly detection pipeline that integrates
with the BatteryAnomalyDetector to process telemetry data streams and detect
anomalies in EV battery and charging systems.
"""
import os
import sys
import logging
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from pathlib import Path
import pandas as pd
import numpy as np

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.ml.anomaly_detection.battery_anomaly_detector import BatteryAnomalyDetector
from app.ml.data_pipeline.telemetry_ingestion import TelemetryProcessor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class AnomalyDetectionPipeline:
    """
    Real-time anomaly detection pipeline for EV telemetry data
    
    This class integrates with the telemetry ingestion pipeline and applies
    various anomaly detection methods to identify issues with battery health,
    charging patterns, and vehicle operation.
    """
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        detection_methods: List[str] = None,
        buffer_size: int = 100,
        sliding_window: int = 24,  # Hours
        alert_threshold: float = 0.7,
        storage_path: str = 'data/anomalies',
        strict_mode: bool = False,
        notification_callbacks: List[Callable] = None
    ):
        """
        Initialize the anomaly detection pipeline
        
        Args:
            model_path: Path to a trained anomaly detection model
            detection_methods: List of detection methods to use
            buffer_size: Number of data points to buffer for analysis
            sliding_window: Size of the sliding window for detection (hours)
            alert_threshold: Threshold for triggering alerts (0-1)
            storage_path: Path to store detected anomalies
            strict_mode: Whether to use strict detection thresholds
            notification_callbacks: Callbacks for alerts
        """
        # Initialize parameters
        self.buffer_size = buffer_size
        self.sliding_window = sliding_window
        self.alert_threshold = alert_threshold
        self.storage_path = storage_path
        self.notification_callbacks = notification_callbacks or []
        
        # Set default detection methods if not provided
        detection_methods = detection_methods or [
            'statistical', 'isolation_forest', 'dbscan', 'threshold'
        ]
        
        # Initialize the anomaly detector
        self.detector = BatteryAnomalyDetector(
            detection_methods=detection_methods,
            model_path=model_path,
            window_size=sliding_window,
            strict_mode=strict_mode
        )
        
        # Initialize data buffers
        self.telemetry_buffer = {}  # Dict of vehicle_id -> DataFrame
        self.detected_anomalies = {}  # Dict of vehicle_id -> List of anomalies
        
        # Ensure storage directory exists
        os.makedirs(storage_path, exist_ok=True)
        
        logger.info(f"Anomaly detection pipeline initialized with {len(detection_methods)} methods")
    
    def connect_to_telemetry_processor(self, processor: TelemetryProcessor) -> None:
        """
        Connect to a telemetry processor to receive real-time data
        
        Args:
            processor: TelemetryProcessor instance to connect to
        """
        # Register callback for battery telemetry
        processor.register_processing_callback(self._process_telemetry)
        
        # Register callback for anomalies detected by the telemetry processor
        processor.register_anomaly_callback(self._handle_telemetry_anomaly)
        
        logger.info("Connected to telemetry processor")
    
    def _process_telemetry(self, data_type: str, data: Dict) -> None:
        """
        Process incoming telemetry data
        
        Args:
            data_type: Type of data ('battery' or 'vehicle')
            data: Telemetry data
        """
        # Only process battery telemetry
        if data_type != 'battery':
            return
        
        vehicle_id = data.get('vehicle_id')
        if not vehicle_id:
            return
        
        # Add data to buffer
        if vehicle_id not in self.telemetry_buffer:
            self.telemetry_buffer[vehicle_id] = pd.DataFrame([data])
        else:
            self.telemetry_buffer[vehicle_id] = pd.concat([
                self.telemetry_buffer[vehicle_id],
                pd.DataFrame([data])
            ])
        
        # Limit buffer size
        if len(self.telemetry_buffer[vehicle_id]) > self.buffer_size:
            self.telemetry_buffer[vehicle_id] = self.telemetry_buffer[vehicle_id].iloc[-self.buffer_size:]
        
        # Only run detection when we have enough data
        if len(self.telemetry_buffer[vehicle_id]) >= 10:  # Minimum required for statistical methods
            self._detect_anomalies(vehicle_id)
    
    def _handle_telemetry_anomaly(self, anomaly: Dict) -> None:
        """
        Handle anomalies detected by the telemetry processor
        
        Args:
            anomaly: Anomaly information
        """
        vehicle_id = anomaly.get('vehicle_id')
        if not vehicle_id:
            return
        
        # Add to detected anomalies
        if vehicle_id not in self.detected_anomalies:
            self.detected_anomalies[vehicle_id] = []
        
        self.detected_anomalies[vehicle_id].append({
            **anomaly,
            'detection_source': 'telemetry_processor',
            'detection_time': datetime.now().isoformat()
        })
        
        # Send notifications
        self._send_notifications(vehicle_id, anomaly)
    
    def _detect_anomalies(self, vehicle_id: str) -> None:
        """
        Run anomaly detection for a specific vehicle
        
        Args:
            vehicle_id: ID of the vehicle to analyze
        """
        # Get buffer data for the vehicle
        vehicle_data = self.telemetry_buffer[vehicle_id].copy()
        
        # Ensure timestamp is datetime
        if 'timestamp' in vehicle_data.columns and not pd.api.types.is_datetime64_dtype(vehicle_data['timestamp']):
            vehicle_data['timestamp'] = pd.to_datetime(vehicle_data['timestamp'])
        
        # Sort by timestamp
        if 'timestamp' in vehicle_data.columns:
            vehicle_data = vehicle_data.sort_values('timestamp')
        
        # Run detection
        try:
            result = self.detector.detect_anomalies(vehicle_data)
            
            # Extract anomalies
            anomalies = result[result['is_anomaly'] == 1]
            
            if len(anomalies) > 0:
                # Process new anomalies
                self._process_detected_anomalies(vehicle_id, anomalies)
        except Exception as e:
            logger.error(f"Error detecting anomalies for vehicle {vehicle_id}: {str(e)}")
    
    def _process_detected_anomalies(self, vehicle_id: str, anomalies: pd.DataFrame) -> None:
        """
        Process detected anomalies
        
        Args:
            vehicle_id: ID of the vehicle
            anomalies: DataFrame with detected anomalies
        """
        # Initialize anomalies list if needed
        if vehicle_id not in self.detected_anomalies:
            self.detected_anomalies[vehicle_id] = []
        
        # Process each anomaly
        for _, row in anomalies.iterrows():
            # Create anomaly record
            anomaly_record = {
                'vehicle_id': vehicle_id,
                'timestamp': row['timestamp'].isoformat() if 'timestamp' in row else datetime.now().isoformat(),
                'anomaly_type': 'battery_anomaly',
                'severity': row['anomaly_severity'] if 'anomaly_severity' in row else 'medium',
                'detection_methods': [method for method in self.detector.detection_methods
                                     if f'anomaly_{method}' in row and row[f'anomaly_{method}'] == 1],
                'detection_source': 'battery_anomaly_detector',
                'detection_time': datetime.now().isoformat(),
                'metrics': {}
            }
            
            # Add metrics
            for col in ['state_of_charge', 'battery_temp', 'voltage', 'current', 'charging_status']:
                if col in row:
                    anomaly_record['metrics'][col] = float(row[col])
            
            # Add to detected anomalies
            self.detected_anomalies[vehicle_id].append(anomaly_record)
            
            # Save anomaly to storage
            self._save_anomaly(anomaly_record)
            
            # Send notifications
            self._send_notifications(vehicle_id, anomaly_record)
    
    def _save_anomaly(self, anomaly: Dict) -> None:
        """
        Save anomaly to storage
        
        Args:
            anomaly: Anomaly information
        """
        try:
            # Create filename based on timestamp and vehicle
            timestamp = anomaly.get('detection_time', datetime.now().isoformat())
            timestamp = timestamp.replace(':', '-').replace('.', '-')
            vehicle_id = anomaly.get('vehicle_id', 'unknown')
            
            filename = f"{timestamp}_{vehicle_id}.json"
            filepath = os.path.join(self.storage_path, filename)
            
            # Save to file
            with open(filepath, 'w') as f:
                json.dump(anomaly, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving anomaly: {str(e)}")
    
    def _send_notifications(self, vehicle_id: str, anomaly: Dict) -> None:
        """
        Send notifications for an anomaly
        
        Args:
            vehicle_id: ID of the vehicle
            anomaly: Anomaly information
        """
        # Check severity for alert threshold
        severity = anomaly.get('severity', 'medium')
        should_alert = False
        
        if severity == 'high':
            should_alert = True
        elif severity == 'medium' and self.alert_threshold <= 0.5:
            should_alert = True
        elif severity == 'low' and self.alert_threshold <= 0.3:
            should_alert = True
        
        if should_alert:
            # Log the anomaly
            logger.warning(f"Anomaly detected for vehicle {vehicle_id}: {anomaly}")
            
            # Call notification callbacks
            for callback in self.notification_callbacks:
                try:
                    callback(anomaly)
                except Exception as e:
                    logger.error(f"Error in notification callback: {str(e)}")
    
    def register_notification_callback(self, callback: Callable[[Dict], None]) -> None:
        """
        Register a callback for anomaly notifications
        
        Args:
            callback: Function that takes an anomaly dict as parameter
        """
        self.notification_callbacks.append(callback)
    
    def get_vehicle_anomalies(
        self,
        vehicle_id: str,
        time_range: Optional[Tuple[datetime, datetime]] = None,
        severity: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """
        Get anomalies for a specific vehicle
        
        Args:
            vehicle_id: ID of the vehicle
            time_range: Optional tuple of (start_time, end_time)
            severity: Optional severity filter ('high', 'medium', 'low')
            limit: Maximum number of anomalies to return
            
        Returns:
            List of anomaly records
        """
        if vehicle_id not in self.detected_anomalies:
            return []
        
        anomalies = self.detected_anomalies[vehicle_id]
        
        # Apply time range filter
        if time_range:
            start_time, end_time = time_range
            anomalies = [
                a for a in anomalies
                if start_time <= datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')) <= end_time
            ]
        
        # Apply severity filter
        if severity:
            anomalies = [a for a in anomalies if a.get('severity') == severity]
        
        # Sort by timestamp (most recent first)
        anomalies = sorted(
            anomalies,
            key=lambda a: a.get('timestamp', ''),
            reverse=True
        )
        
        # Apply limit
        return anomalies[:limit]
    
    def get_anomaly_stats(self) -> Dict[str, Any]:
        """
        Get statistics about detected anomalies
        
        Returns:
            Dictionary with anomaly statistics
        """
        total_anomalies = sum(len(anomalies) for anomalies in self.detected_anomalies.values())
        
        # Count by severity
        severity_counts = {'high': 0, 'medium': 0, 'low': 0, 'unknown': 0}
        for vehicle_anomalies in self.detected_anomalies.values():
            for anomaly in vehicle_anomalies:
                severity = anomaly.get('severity', 'unknown')
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        # Count by vehicle
        vehicle_counts = {
            vehicle_id: len(anomalies)
            for vehicle_id, anomalies in self.detected_anomalies.items()
        }
        
        # Get recent anomalies (last 24 hours)
        now = datetime.now()
        day_ago = now - timedelta(hours=24)
        
        recent_count = 0
        for vehicle_anomalies in self.detected_anomalies.values():
            for anomaly in vehicle_anomalies:
                try:
                    anomaly_time = datetime.fromisoformat(anomaly['timestamp'].replace('Z', '+00:00'))
                    if anomaly_time >= day_ago:
                        recent_count += 1
                except (ValueError, KeyError):
                    pass
        
        return {
            'total_anomalies': total_anomalies,
            'by_severity': severity_counts,
            'by_vehicle': vehicle_counts,
            'recent_24h': recent_count,
            'vehicle_count': len(self.detected_anomalies)
        }
    
    def analyze_vehicle_anomalies(self, vehicle_id: str) -> Dict[str, Any]:
        """
        Perform in-depth analysis of a vehicle's anomalies
        
        Args:
            vehicle_id: ID of the vehicle to analyze
            
        Returns:
            Dictionary with analysis results
        """
        if vehicle_id not in self.detected_anomalies or not self.detected_anomalies[vehicle_id]:
            return {
                'vehicle_id': vehicle_id,
                'anomaly_count': 0,
                'analysis': 'No anomalies detected for this vehicle'
            }
        
        anomalies = self.detected_anomalies[vehicle_id]
        
        # Count by type
        type_counts = {}
        for anomaly in anomalies:
            anomaly_type = anomaly.get('anomaly_type', 'unknown')
            type_counts[anomaly_type] = type_counts.get(anomaly_type, 0) + 1
        
        # Find most common metrics involved
        metrics_involved = {}
        for anomaly in anomalies:
            metrics = anomaly.get('metrics', {})
            for metric, value in metrics.items():
                if metric not in metrics_involved:
                    metrics_involved[metric] = []
                metrics_involved[metric].append(value)
        
        # Calculate statistics for each metric
        metric_stats = {}
        for metric, values in metrics_involved.items():
            if values:
                metric_stats[metric] = {
                    'mean': np.mean(values),
                    'min': np.min(values),
                    'max': np.max(values),
                    'std': np.std(values) if len(values) > 1 else 0
                }
        
        # Analyze trends over time
        timestamps = []
        for anomaly in anomalies:
            try:
                timestamps.append(datetime.fromisoformat(anomaly['timestamp'].replace('Z', '+00:00')))
            except (ValueError, KeyError):
                pass
        
        timestamp_trend = None
        if timestamps:
            timestamps.sort()
            first_time = timestamps[0]
            last_time = timestamps[-1]
            duration = (last_time - first_time).total_seconds() / 3600  # hours
            
            if duration > 0:
                frequency = len(timestamps) / duration  # anomalies per hour
                timestamp_trend = {
                    'first_anomaly': first_time.isoformat(),
                    'last_anomaly': last_time.isoformat(),
                    'duration_hours': duration,
                    'frequency': frequency
                }
        
        return {
            'vehicle_id': vehicle_id,
            'anomaly_count': len(anomalies),
            'by_type': type_counts,
            'metric_stats': metric_stats,
            'time_trend': timestamp_trend,
            'severity_distribution': {
                severity: len([a for a in anomalies if a.get('severity') == severity])
                for severity in ['high', 'medium', 'low']
            }
        }
    
    def clear_old_anomalies(self, days_to_keep: int = 30) -> int:
        """
        Clear anomalies older than a certain number of days
        
        Args:
            days_to_keep: Number of days of anomalies to keep
            
        Returns:
            Number of anomalies cleared
        """
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        cleared_count = 0
        
        for vehicle_id in self.detected_anomalies:
            old_count = len(self.detected_anomalies[vehicle_id])
            
            self.detected_anomalies[vehicle_id] = [
                a for a in self.detected_anomalies[vehicle_id]
                if 'timestamp' in a and 
                datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')) >= cutoff_date
            ]
            
            cleared_count += old_count - len(self.detected_anomalies[vehicle_id])
        
        return cleared_count


# Example usage
def main():
    """Example usage of the anomaly detection pipeline"""
    
    # Create telemetry processor
    telemetry_processor = TelemetryProcessor(
        batch_size=10,
        buffer_timeout=5,
        storage_path='data/telemetry'
    )
    
    # Create anomaly detection pipeline
    pipeline = AnomalyDetectionPipeline(
        buffer_size=100,
        sliding_window=24,
        alert_threshold=0.5,
        storage_path='data/anomalies'
    )
    
    # Connect to telemetry processor
    pipeline.connect_to_telemetry_processor(telemetry_processor)
    
    # Example notification callback
    def notify_anomaly(anomaly):
        print(f"ALERT: Anomaly detected - {anomaly['severity']} severity for vehicle {anomaly['vehicle_id']}")
        print(f"Metrics: {anomaly.get('metrics', {})}")
        print("---")
    
    # Register notification callback
    pipeline.register_notification_callback(notify_anomaly)
    
    # Example: Process some telemetry data
    for i in range(20):
        telemetry_processor.process_battery_telemetry({
            'vehicle_id': f"TEST-{i % 3 + 1}",
            'timestamp': datetime.now().isoformat(),
            'state_of_charge': 85 - (i % 10),
            'battery_temp': 25 + (i % 10),
            'voltage': 400 - (i % 20),
            'current': 10 if i % 2 == 0 else -5,
            'charging_status': 1 if i % 2 == 0 else 0
        })
    
    # Simulate an anomaly
    telemetry_processor.process_battery_telemetry({
        'vehicle_id': "TEST-1",
        'timestamp': datetime.now().isoformat(),
        'state_of_charge': 85,
        'battery_temp': 65,  # Anomaly: high temperature
        'voltage': 380,
        'current': 15,
        'charging_status': 1
    })
    
    # Print anomaly stats
    print("Anomaly Stats:", pipeline.get_anomaly_stats())
    
    # Print analysis for a vehicle
    print("Vehicle Analysis:", pipeline.analyze_vehicle_anomalies("TEST-1"))


if __name__ == "__main__":
    main() 