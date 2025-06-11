"""
Vehicle Usage Prediction Service

Uses machine learning to predict vehicle usage patterns based on historical data,
enabling more intelligent charging scheduling.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import math
import logging
import json
import os
from collections import defaultdict

# In a production environment, these would be replaced with actual ML libraries
# import tensorflow as tf
# from sklearn.ensemble import RandomForestRegressor
# from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class UsagePattern:
    """Represents a predicted usage pattern for a vehicle"""
    def __init__(self, 
                 vehicle_id: str,
                 next_trip_time: Optional[datetime] = None,
                 next_trip_distance: Optional[float] = None,
                 expected_return_time: Optional[datetime] = None,
                 confidence: float = 0.0,
                 minimum_required_soc: float = 0.0):
        self.vehicle_id = vehicle_id
        self.next_trip_time = next_trip_time
        self.next_trip_distance = next_trip_distance
        self.expected_return_time = expected_return_time
        self.confidence = confidence
        self.minimum_required_soc = minimum_required_soc
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "vehicle_id": self.vehicle_id,
            "next_trip_time": self.next_trip_time.isoformat() if self.next_trip_time else None,
            "next_trip_distance": self.next_trip_distance,
            "expected_return_time": self.expected_return_time.isoformat() if self.expected_return_time else None,
            "confidence": self.confidence,
            "minimum_required_soc": self.minimum_required_soc
        }

class VehicleUsagePrediction:
    """
    Predicts vehicle usage patterns using machine learning models
    and historical data analysis.
    """
    
    def __init__(self):
        # This would load trained models in a production environment
        # self.trip_prediction_model = self._load_trip_prediction_model()
        # self.distance_prediction_model = self._load_distance_prediction_model()
        # self.feature_scaler = self._load_feature_scaler()
        
        # In this demonstration, we'll use simulated patterns instead
        self.usage_patterns = self._load_demo_usage_patterns()
        self.vehicle_history = self._load_demo_vehicle_history()
        
    def _load_demo_usage_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Load demonstration usage patterns for vehicles"""
        patterns = {
            # Delivery vehicle with regular schedule
            "v1": {
                "type": "delivery",
                "weekday_start": [8, 0],  # 8:00 AM
                "weekday_end": [17, 0],   # 5:00 PM
                "weekend_start": None,
                "weekend_end": None,
                "typical_distance": 120.0, # km
                "variation": 0.1,         # 10% variation
                "regularity": 0.9         # 90% regular pattern
            },
            
            # Commuter vehicle
            "v2": {
                "type": "commuter",
                "weekday_start": [7, 30],  # 7:30 AM
                "weekday_end": [18, 0],    # 6:00 PM
                "weekend_start": [10, 0],  # 10:00 AM occasional weekend use
                "weekend_end": [16, 0],    # 4:00 PM
                "typical_distance": 45.0,  # km
                "variation": 0.2,          # 20% variation
                "regularity": 0.7          # 70% regular pattern
            },
            
            # Service vehicle with irregular schedule
            "v3": {
                "type": "service",
                "weekday_start": [6, 0],   # 6:00 AM
                "weekday_end": [20, 0],    # 8:00 PM
                "weekend_start": [8, 0],   # 8:00 AM
                "weekend_end": [17, 0],    # 5:00 PM
                "typical_distance": 80.0,  # km
                "variation": 0.4,          # 40% variation
                "regularity": 0.5          # 50% regular pattern
            },
            
            # Executive vehicle with unpredictable usage
            "v4": {
                "type": "executive",
                "weekday_start": [9, 0],   # 9:00 AM
                "weekday_end": [19, 0],    # 7:00 PM
                "weekend_start": [10, 0],  # 10:00 AM
                "weekend_end": [22, 0],    # 10:00 PM
                "typical_distance": 60.0,  # km
                "variation": 0.5,          # 50% variation
                "regularity": 0.3          # 30% regular pattern (very unpredictable)
            },
            
            # Fleet pool vehicle
            "v5": {
                "type": "pool",
                "weekday_start": [7, 0],   # 7:00 AM
                "weekday_end": [19, 0],    # 7:00 PM
                "weekend_start": None,
                "weekend_end": None,
                "typical_distance": 50.0,  # km
                "variation": 0.3,          # 30% variation
                "regularity": 0.6          # 60% regular pattern
            }
        }
        
        return patterns
    
    def _load_demo_vehicle_history(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Load demonstration vehicle usage history
        In a real application, this would be loaded from a database
        """
        history = defaultdict(list)
        
        # Generate synthetic historical data
        now = datetime.now()
        day_of_week = now.weekday()  # 0 = Monday, 6 = Sunday
        
        for vehicle_id, pattern in self.usage_patterns.items():
            # Generate 14 days of historical data
            for day_offset in range(-14, 0):
                history_date = now.date() + timedelta(days=day_offset)
                history_day_of_week = history_date.weekday()
                
                # Check if the vehicle operates on this day
                is_weekend = history_day_of_week >= 5
                operates_today = not is_weekend or pattern['weekend_start'] is not None
                
                if operates_today and np.random.random() < pattern['regularity']:
                    # Regular operation day
                    if is_weekend and pattern['weekend_start']:
                        start_hour, start_minute = pattern['weekend_start']
                        end_hour, end_minute = pattern['weekend_end']
                    else:
                        start_hour, start_minute = pattern['weekday_start']
                        end_hour, end_minute = pattern['weekday_end']
                    
                    # Add some variation
                    start_variation_minutes = int(np.random.normal(0, 30))
                    end_variation_minutes = int(np.random.normal(0, 60))
                    
                    start_time = datetime(
                        history_date.year, 
                        history_date.month, 
                        history_date.day,
                        start_hour, 
                        start_minute
                    ) + timedelta(minutes=start_variation_minutes)
                    
                    end_time = datetime(
                        history_date.year, 
                        history_date.month, 
                        history_date.day,
                        end_hour, 
                        end_minute
                    ) + timedelta(minutes=end_variation_minutes)
                    
                    # Ensure end time is after start time
                    if end_time <= start_time:
                        end_time = start_time + timedelta(hours=1)
                    
                    # Randomize distance within the pattern's typical range
                    distance_variation = 1.0 + np.random.normal(0, pattern['variation'])
                    distance = pattern['typical_distance'] * max(0.1, distance_variation)
                    
                    history[vehicle_id].append({
                        "start_time": start_time.isoformat(),
                        "end_time": end_time.isoformat(),
                        "distance_km": round(distance, 1),
                        "energy_used_kwh": round(distance * 0.2, 1),  # Approx 0.2 kWh/km
                        "start_soc": round(min(95, max(50, np.random.normal(80, 10))), 1),
                        "end_soc": round(min(80, max(10, np.random.normal(40, 15))), 1)
                    })
                else:
                    # Random or no usage
                    rand = np.random.random()
                    if rand < 0.3:  # 30% chance of irregular usage if not regular
                        # Random times
                        start_hour = np.random.randint(7, 19)
                        start_time = datetime(
                            history_date.year, 
                            history_date.month, 
                            history_date.day,
                            start_hour, 
                            np.random.randint(0, 59)
                        )
                        
                        trip_duration_hours = max(0.5, np.random.normal(2, 1))
                        end_time = start_time + timedelta(hours=trip_duration_hours)
                        
                        # Random distance
                        distance = max(5, np.random.normal(pattern['typical_distance'] * 0.6, 20))
                        
                        history[vehicle_id].append({
                            "start_time": start_time.isoformat(),
                            "end_time": end_time.isoformat(),
                            "distance_km": round(distance, 1),
                            "energy_used_kwh": round(distance * 0.2, 1),
                            "start_soc": round(min(95, max(50, np.random.normal(80, 10))), 1),
                            "end_soc": round(min(80, max(10, np.random.normal(40, 15))), 1)
                        })
        
        return history
    
    def predict_next_usage(self, vehicle_id: str, current_time: Optional[datetime] = None) -> UsagePattern:
        """
        Predict when a vehicle will next be used and for how long/far
        
        In a real implementation, this would use the trained ML models.
        For this demonstration, we'll use the simulated patterns.
        """
        if current_time is None:
            current_time = datetime.now()
        
        pattern = self.usage_patterns.get(vehicle_id)
        if not pattern:
            logger.warning(f"No usage pattern found for vehicle {vehicle_id}")
            return UsagePattern(vehicle_id)
        
        # Get vehicle-specific history
        vehicle_history = self.vehicle_history.get(vehicle_id, [])
        
        # Calculate prediction
        day_of_week = current_time.weekday()  # 0 = Monday, 6 = Sunday
        is_weekend = day_of_week >= 5
        
        # In a real ML implementation, we would:
        # 1. Extract features from current time, history, etc.
        # 2. Normalize features using the scaler
        # 3. Run prediction through models
        # 4. Post-process results
        
        # For demonstration, we'll use the patterns with some randomization
        if is_weekend and pattern['weekend_start']:
            next_trip_hour, next_trip_minute = pattern['weekend_start']
            return_hour, return_minute = pattern['weekend_end']
            confidence = pattern['regularity'] * 0.7  # Less confident on weekends
        elif not is_weekend and pattern['weekday_start']:
            next_trip_hour, next_trip_minute = pattern['weekday_start']
            return_hour, return_minute = pattern['weekday_end']
            confidence = pattern['regularity']
        else:
            # No scheduled usage for this day
            return UsagePattern(
                vehicle_id, 
                confidence=0.2,
                minimum_required_soc=30.0  # Default minimum SoC
            )
        
        # Check if the next trip is tomorrow
        if current_time.hour >= next_trip_hour and current_time.minute > next_trip_minute:
            next_trip_date = current_time.date() + timedelta(days=1)
            # Check if tomorrow is weekend/weekday and if vehicle operates then
            tomorrow_is_weekend = (day_of_week + 1) % 7 >= 5
            if tomorrow_is_weekend and not pattern['weekend_start']:
                # No weekend operation, skip to Monday
                days_to_add = 8 - ((day_of_week + 1) % 7)  # Days until Monday
                next_trip_date = current_time.date() + timedelta(days=days_to_add)
                next_trip_hour, next_trip_minute = pattern['weekday_start']
                return_hour, return_minute = pattern['weekday_end']
        else:
            next_trip_date = current_time.date()
        
        # Create datetime objects for next trip and return
        next_trip_datetime = datetime(
            next_trip_date.year,
            next_trip_date.month,
            next_trip_date.day,
            next_trip_hour,
            next_trip_minute
        )
        
        return_datetime = datetime(
            next_trip_date.year,
            next_trip_date.month,
            next_trip_date.day,
            return_hour,
            return_minute
        )
        
        # Add some randomness based on pattern variation
        variation_minutes = int(np.random.normal(0, 30 * pattern['variation']))
        next_trip_datetime += timedelta(minutes=variation_minutes)
        
        variation_minutes = int(np.random.normal(0, 60 * pattern['variation']))
        return_datetime += timedelta(minutes=variation_minutes)
        
        # Ensure return time is after trip time
        if return_datetime <= next_trip_datetime:
            return_datetime = next_trip_datetime + timedelta(hours=1)
        
        # Predict trip distance based on typical patterns
        distance_variation = max(0.5, min(1.5, np.random.normal(1.0, pattern['variation'])))
        next_trip_distance = pattern['typical_distance'] * distance_variation
        
        # Calculate minimum required SoC based on trip distance and energy usage
        # Assume 0.2 kWh/km and add 30% safety margin
        energy_needed = next_trip_distance * 0.2 * 1.3
        
        # Get battery capacity from historical data or use default
        battery_capacity = 100.0  # Default
        if vehicle_history:
            # Estimate from the difference between start and end SoC and energy used
            for trip in vehicle_history[-5:]:  # Use last 5 trips
                if 'start_soc' in trip and 'end_soc' in trip and 'energy_used_kwh' in trip:
                    soc_diff = trip['start_soc'] - trip['end_soc']
                    if soc_diff > 0:
                        estimated_capacity = trip['energy_used_kwh'] / (soc_diff / 100)
                        if 30 < estimated_capacity < 200:  # Sanity check
                            battery_capacity = estimated_capacity
        
        minimum_required_soc = min(95, max(20, (energy_needed / battery_capacity) * 100 + 10))
        
        return UsagePattern(
            vehicle_id=vehicle_id,
            next_trip_time=next_trip_datetime,
            next_trip_distance=round(next_trip_distance, 1),
            expected_return_time=return_datetime,
            confidence=round(confidence, 2),
            minimum_required_soc=round(minimum_required_soc, 1)
        )
    
    def predict_fleet_usage(self, vehicle_ids: List[str], prediction_window: int = 24) -> Dict[str, UsagePattern]:
        """
        Predict usage patterns for multiple vehicles over a specified time window (hours)
        
        Returns a dictionary mapping vehicle IDs to their predicted usage patterns
        """
        current_time = datetime.now()
        end_time = current_time + timedelta(hours=prediction_window)
        
        usage_predictions = {}
        
        for vehicle_id in vehicle_ids:
            # Get the next predicted usage
            next_usage = self.predict_next_usage(vehicle_id, current_time)
            
            # Check if the predicted usage is within our window
            if next_usage.next_trip_time and next_usage.next_trip_time <= end_time:
                usage_predictions[vehicle_id] = next_usage
            else:
                # No usage predicted in window, but still return pattern with minimum SoC
                usage_predictions[vehicle_id] = UsagePattern(
                    vehicle_id=vehicle_id,
                    confidence=0.9,  # High confidence it won't be used
                    minimum_required_soc=30.0  # Default minimum SoC
                )
        
        return usage_predictions
    
    def get_charging_constraints(self, vehicle_id: str) -> Dict[str, Any]:
        """
        Generate charging constraints based on predicted usage patterns
        
        Returns a dictionary with constraints for charging optimization:
        - plugin_time: When vehicle is plugged in (now)
        - departure_time: When vehicle needs to be ready
        - minimum_soc: Minimum state of charge to maintain
        - target_soc: Target state of charge for the next trip
        """
        current_time = datetime.now()
        usage_pattern = self.predict_next_usage(vehicle_id, current_time)
        
        # Default values
        plugin_time = current_time
        departure_time = current_time + timedelta(hours=8)  # Default 8 hours
        minimum_soc = 30.0
        target_soc = 80.0
        
        if usage_pattern.next_trip_time:
            departure_time = usage_pattern.next_trip_time
            minimum_soc = usage_pattern.minimum_required_soc
            
            # Set target SoC based on predicted distance and confidence
            if usage_pattern.next_trip_distance and usage_pattern.confidence > 0.5:
                # Higher target SoC for longer trips
                if usage_pattern.next_trip_distance > 100:
                    target_soc = 90.0
                elif usage_pattern.next_trip_distance > 50:
                    target_soc = 85.0
                else:
                    target_soc = 80.0
            
            # Adjust based on confidence level
            if usage_pattern.confidence < 0.7:
                # Add buffer for less confident predictions
                target_soc = min(95, target_soc + (1 - usage_pattern.confidence) * 15)
        
        return {
            "plugin_time": plugin_time.isoformat(),
            "departure_time": departure_time.isoformat(),
            "minimum_soc": round(minimum_soc, 1),
            "target_soc": round(target_soc, 1),
            "confidence": usage_pattern.confidence
        }

# Singleton instance for convenience
usage_prediction_instance = None

def get_vehicle_usage_prediction() -> VehicleUsagePrediction:
    """Get or create a singleton instance of the vehicle usage prediction service"""
    global usage_prediction_instance
    if usage_prediction_instance is None:
        usage_prediction_instance = VehicleUsagePrediction()
    return usage_prediction_instance 