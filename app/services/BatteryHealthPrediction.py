"""
Battery Health Prediction Service

Uses machine learning and telemetry data to predict battery health,
detect anomalies, and optimize maintenance scheduling.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import math
import logging
import json
import os

logger = logging.getLogger(__name__)

class BatteryHealthMetrics:
    """Represents battery health metrics and predictions"""
    def __init__(self, 
                 vehicle_id: str,
                 state_of_health: float,
                 estimated_capacity: float,
                 nominal_capacity: float,
                 cycle_count: int,
                 predicted_degradation_rate: float,
                 estimated_replacement_date: Optional[datetime] = None,
                 anomalies: List[Dict[str, Any]] = None,
                 confidence: float = 0.0):
        self.vehicle_id = vehicle_id
        self.state_of_health = state_of_health  # Percentage of original capacity
        self.estimated_capacity = estimated_capacity  # Current capacity in kWh
        self.nominal_capacity = nominal_capacity  # Original capacity in kWh
        self.cycle_count = cycle_count
        self.predicted_degradation_rate = predicted_degradation_rate  # % per month
        self.estimated_replacement_date = estimated_replacement_date
        self.anomalies = anomalies or []
        self.confidence = confidence
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "vehicle_id": self.vehicle_id,
            "state_of_health": self.state_of_health,
            "estimated_capacity": self.estimated_capacity,
            "nominal_capacity": self.nominal_capacity,
            "cycle_count": self.cycle_count,
            "predicted_degradation_rate": self.predicted_degradation_rate,
            "estimated_replacement_date": self.estimated_replacement_date.isoformat() if self.estimated_replacement_date else None,
            "anomalies": self.anomalies,
            "confidence": self.confidence
        }

class BatteryHealthPrediction:
    """
    Predicts battery health metrics using machine learning models
    and telemetry data analysis.
    """
    
    def __init__(self):
        # In a production environment, this would load trained models
        # self.degradation_model = self._load_degradation_model()
        # self.anomaly_detection_model = self._load_anomaly_detection_model()
        
        # For this demonstration, we'll use simulated data
        self.battery_data = self._load_demo_battery_data()
        self.charging_history = self._load_demo_charging_history()
        self.temperature_data = self._load_demo_temperature_data()
        
    def _load_demo_battery_data(self) -> Dict[str, Dict[str, Any]]:
        """Load demonstration battery data for vehicles"""
        battery_data = {
            "v1": {
                "nominal_capacity": 75.0,  # kWh
                "current_capacity": 70.5,   # kWh
                "manufacture_date": datetime(2021, 5, 15),
                "initial_cycles": 20,
                "current_cycles": 142,
                "chemistry": "NMC",
                "thermal_management": "liquid",
                "degradation_factor": 0.15  # Lower is better
            },
            "v2": {
                "nominal_capacity": 131.0,
                "current_capacity": 125.8,
                "manufacture_date": datetime(2022, 1, 10),
                "initial_cycles": 5,
                "current_cycles": 87,
                "chemistry": "LFP",
                "thermal_management": "liquid",
                "degradation_factor": 0.08
            },
            "v3": {
                "nominal_capacity": 65.0,
                "current_capacity": 58.2,
                "manufacture_date": datetime(2020, 11, 22),
                "initial_cycles": 15,
                "current_cycles": 312,
                "chemistry": "NMC",
                "thermal_management": "air",
                "degradation_factor": 0.28
            },
            "v4": {
                "nominal_capacity": 135.0,
                "current_capacity": 130.7,
                "manufacture_date": datetime(2022, 8, 5),
                "initial_cycles": 8,
                "current_cycles": 53,
                "chemistry": "NMC/LFP",
                "thermal_management": "liquid",
                "degradation_factor": 0.09
            },
            "v5": {
                "nominal_capacity": 77.0,
                "current_capacity": 73.9,
                "manufacture_date": datetime(2021, 9, 18),
                "initial_cycles": 12,
                "current_cycles": 132,
                "chemistry": "NMC",
                "thermal_management": "liquid",
                "degradation_factor": 0.12
            }
        }
        return battery_data
    
    def _load_demo_charging_history(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load demonstration charging history for vehicles"""
        charging_history = {}
        
        # Generate synthetic charging history
        for vehicle_id, battery_info in self.battery_data.items():
            vehicle_history = []
            cycles = battery_info["current_cycles"]
            
            # Generate data points for each charging cycle
            for i in range(cycles):
                # Randomize charging patterns
                max_charge = 90 + np.random.normal(0, 5)
                min_charge = 20 + np.random.normal(0, 10)
                
                # Occasionally simulate a deep discharge
                if np.random.random() < 0.05:
                    min_charge = max(5, min_charge - 15)
                
                # Occasionally simulate a full charge
                if np.random.random() < 0.1:
                    max_charge = min(100, max_charge + 8)
                
                # Calculate dates - start from today and go backwards
                days_ago = int((cycles - i) * np.random.uniform(1, 3))
                charge_date = datetime.now() - timedelta(days=days_ago)
                
                # Average charging rate in kW
                avg_charge_rate = np.random.uniform(20, 50)
                if battery_info["nominal_capacity"] > 100:
                    avg_charge_rate += 20
                
                # Maximum charging rate (occasional fast charging)
                max_charge_rate = avg_charge_rate * (1.0 + np.random.uniform(0.5, 1.5))
                
                # Duration in hours
                energy_added = battery_info["nominal_capacity"] * (max_charge - min_charge) / 100
                duration_hours = energy_added / avg_charge_rate
                
                # Cell temperature during charging
                avg_temperature = 25 + np.random.normal(0, 3)  # Celsius
                max_temperature = avg_temperature + np.random.uniform(5, 15)
                
                # Create charging session record
                session = {
                    "date": charge_date.isoformat(),
                    "start_soc": min_charge,
                    "end_soc": max_charge,
                    "energy_added": energy_added,
                    "duration_hours": duration_hours,
                    "avg_charge_rate": avg_charge_rate,
                    "max_charge_rate": max_charge_rate,
                    "avg_temperature": avg_temperature,
                    "max_temperature": max_temperature,
                    # Add anomalies for some sessions
                    "voltage_drop_detected": np.random.random() < 0.03,
                    "charge_rate_anomaly": np.random.random() < 0.04,
                    "temperature_anomaly": np.random.random() < 0.05,
                }
                
                vehicle_history.append(session)
            
            # Sort by date
            vehicle_history.sort(key=lambda x: x["date"])
            charging_history[vehicle_id] = vehicle_history
        
        return charging_history
    
    def _load_demo_temperature_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load demonstration temperature data for vehicles"""
        temperature_data = {}
        
        for vehicle_id, battery_info in self.battery_data.items():
            # Generate 90 days of temperature data
            vehicle_temps = []
            for days_ago in range(90, 0, -1):
                date = datetime.now() - timedelta(days=days_ago)
                
                # Simulate ambient temperature with seasonal variation
                month = date.month
                season_factor = math.sin((month - 1) * math.pi / 6)  # Peak in July, lowest in January
                ambient_temp = 20 + 15 * season_factor + np.random.normal(0, 3)
                
                # Simulate battery temperature (ambient + operation heat)
                min_temp = ambient_temp - 2 + np.random.normal(0, 1)
                avg_temp = ambient_temp + 5 + np.random.normal(0, 2)
                max_temp = avg_temp + np.random.uniform(5, 15)
                
                # Higher temperature for older batteries or less efficient thermal management
                if battery_info["thermal_management"] == "air":
                    max_temp += 5
                
                # Extreme temperature events
                if np.random.random() < 0.02:  # 2% chance of extreme event
                    max_temp += np.random.uniform(10, 20)
                
                vehicle_temps.append({
                    "date": date.isoformat(),
                    "ambient_temperature": ambient_temp,
                    "min_battery_temperature": min_temp,
                    "avg_battery_temperature": avg_temp,
                    "max_battery_temperature": max_temp,
                    "temperature_cycles": np.random.randint(1, 5)  # Number of significant temperature cycles
                })
            
            temperature_data[vehicle_id] = vehicle_temps
        
        return temperature_data
    
    def get_battery_health(self, vehicle_id: str) -> BatteryHealthMetrics:
        """
        Get current battery health metrics for a vehicle
        
        Returns comprehensive battery health information including:
        - State of health (percentage of original capacity)
        - Estimated current capacity
        - Cycle count
        - Degradation rate
        - Anomalies detected
        """
        try:
            # Get vehicle battery data
            battery_info = self.battery_data.get(vehicle_id)
            if not battery_info:
                logger.warning(f"No battery data found for vehicle {vehicle_id}")
                return BatteryHealthMetrics(
                    vehicle_id=vehicle_id,
                    state_of_health=0.0,
                    estimated_capacity=0.0,
                    nominal_capacity=0.0,
                    cycle_count=0,
                    predicted_degradation_rate=0.0,
                    confidence=0.0
                )
            
            # Calculate basic health metrics
            state_of_health = (battery_info["current_capacity"] / battery_info["nominal_capacity"]) * 100
            cycle_count = battery_info["current_cycles"]
            
            # Calculate age in months
            manufacture_date = battery_info["manufacture_date"]
            age_months = (datetime.now().year - manufacture_date.year) * 12 + \
                         (datetime.now().month - manufacture_date.month)
            
            # Calculate degradation rate (% per month)
            capacity_loss = 100 - state_of_health
            degradation_rate = capacity_loss / max(1, age_months)
            
            # Predict replacement date based on degradation trend
            # Assume replacement at 70% SoH
            if state_of_health > 70:
                remaining_health = state_of_health - 70
                months_to_replacement = remaining_health / degradation_rate if degradation_rate > 0 else 120
                replacement_date = datetime.now() + timedelta(days=int(months_to_replacement * 30.5))
            else:
                replacement_date = datetime.now()  # Immediate replacement
            
            # Get charging history for anomaly detection
            charging_sessions = self.charging_history.get(vehicle_id, [])
            temperature_history = self.temperature_data.get(vehicle_id, [])
            
            # Detect anomalies
            anomalies = self._detect_anomalies(vehicle_id, charging_sessions, temperature_history)
            
            # Calculate confidence based on data quality and model performance
            # In a real system, this would be based on model confidence scores
            data_points = len(charging_sessions) + len(temperature_history)
            confidence = min(0.95, 0.5 + (data_points / 1000))
            
            return BatteryHealthMetrics(
                vehicle_id=vehicle_id,
                state_of_health=round(state_of_health, 1),
                estimated_capacity=round(battery_info["current_capacity"], 1),
                nominal_capacity=battery_info["nominal_capacity"],
                cycle_count=cycle_count,
                predicted_degradation_rate=round(degradation_rate, 4),
                estimated_replacement_date=replacement_date,
                anomalies=anomalies,
                confidence=round(confidence, 2)
            )
        
        except Exception as e:
            logger.error(f"Error calculating battery health for vehicle {vehicle_id}: {str(e)}")
            raise
    
    def _detect_anomalies(self, vehicle_id: str, charging_sessions: List[Dict[str, Any]], 
                          temperature_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect anomalies in battery behavior based on charging and temperature data
        
        In a production system, this would use more sophisticated anomaly detection algorithms.
        """
        anomalies = []
        
        # Skip if not enough data
        if len(charging_sessions) < 5:
            return anomalies
        
        # Get the most recent 20 charging sessions
        recent_sessions = charging_sessions[-20:]
        
        # Check for charging rate anomalies
        charge_rates = [session["avg_charge_rate"] for session in recent_sessions]
        avg_charge_rate = np.mean(charge_rates)
        std_charge_rate = np.std(charge_rates)
        
        for i, session in enumerate(recent_sessions):
            # Check if charging rate is unusually low (potential indicator of issues)
            if session["avg_charge_rate"] < avg_charge_rate - 2 * std_charge_rate:
                anomalies.append({
                    "type": "charging_rate_low",
                    "severity": "medium",
                    "date": session["date"],
                    "description": f"Unusually low charging rate ({session['avg_charge_rate']:.1f} kW vs typical {avg_charge_rate:.1f} kW)",
                    "recommended_action": "Monitor charging performance and check charging equipment"
                })
        
        # Check for voltage drop issues (simulated in our demo data)
        voltage_drops = [session for session in recent_sessions if session.get("voltage_drop_detected")]
        if voltage_drops:
            anomalies.append({
                "type": "voltage_drop",
                "severity": "high",
                "date": voltage_drops[-1]["date"],
                "description": f"Voltage drop detected during charging, possible cell degradation",
                "recommended_action": "Schedule diagnostic scan"
            })
        
        # Check for temperature anomalies
        if temperature_data:
            recent_temps = temperature_data[-30:]  # Last 30 days
            max_temps = [day["max_battery_temperature"] for day in recent_temps]
            avg_max_temp = np.mean(max_temps)
            
            # High temperature exposure
            extreme_temp_days = [day for day in recent_temps if day["max_battery_temperature"] > 45]
            if extreme_temp_days:
                anomalies.append({
                    "type": "high_temperature_exposure",
                    "severity": "medium",
                    "date": extreme_temp_days[-1]["date"],
                    "description": f"Battery exposed to high temperature ({extreme_temp_days[-1]['max_battery_temperature']:.1f}°C)",
                    "recommended_action": "Check thermal management system"
                })
        
        # Check for unusual SOC patterns
        deep_discharges = [s for s in recent_sessions if s["start_soc"] < 10]
        if len(deep_discharges) >= 3:
            anomalies.append({
                "type": "frequent_deep_discharge",
                "severity": "medium",
                "date": deep_discharges[-1]["date"],
                "description": f"Frequent deep discharges detected ({len(deep_discharges)} in recent history)",
                "recommended_action": "Advise driver to avoid frequent deep discharges"
            })
        
        # Check for rapid degradation
        battery_info = self.battery_data.get(vehicle_id)
        if battery_info:
            soh = (battery_info["current_capacity"] / battery_info["nominal_capacity"]) * 100
            age_months = (datetime.now().year - battery_info["manufacture_date"].year) * 12 + \
                        (datetime.now().month - battery_info["manufacture_date"].month)
            
            # Expected degradation based on typical degradation curves
            expected_degradation = age_months * 0.2  # Typical 0.2% per month
            actual_degradation = 100 - soh
            
            if actual_degradation > expected_degradation * 1.5:
                anomalies.append({
                    "type": "accelerated_degradation",
                    "severity": "high",
                    "date": datetime.now().isoformat(),
                    "description": f"Battery degrading faster than expected ({actual_degradation:.1f}% vs {expected_degradation:.1f}%)",
                    "recommended_action": "Schedule comprehensive battery diagnostic"
                })
        
        return anomalies
    
    def get_maintenance_schedule(self, vehicle_id: str) -> Dict[str, Any]:
        """
        Generate a recommended maintenance schedule based on battery health
        
        Returns a dictionary with:
        - Next recommended maintenance date
        - Maintenance type (routine, diagnostic, etc.)
        - Reason for maintenance
        - Priority level
        """
        battery_health = self.get_battery_health(vehicle_id)
        
        # Default schedule (routine checkup)
        maintenance_schedule = {
            "vehicle_id": vehicle_id,
            "next_maintenance_date": (datetime.now() + timedelta(days=90)).isoformat(),
            "maintenance_type": "routine",
            "reason": "Regular battery health checkup",
            "priority": "low",
            "estimated_downtime_hours": 1,
            "recommended_actions": ["Battery capacity test", "Thermal management system check"]
        }
        
        # Adjust based on anomalies and health metrics
        if battery_health.anomalies:
            # Sort by severity
            critical_anomalies = [a for a in battery_health.anomalies if a["severity"] == "high"]
            medium_anomalies = [a for a in battery_health.anomalies if a["severity"] == "medium"]
            
            if critical_anomalies:
                # Critical issues need immediate attention
                maintenance_schedule["next_maintenance_date"] = (datetime.now() + timedelta(days=7)).isoformat()
                maintenance_schedule["maintenance_type"] = "diagnostic"
                maintenance_schedule["reason"] = critical_anomalies[0]["description"]
                maintenance_schedule["priority"] = "high"
                maintenance_schedule["estimated_downtime_hours"] = 4
                maintenance_schedule["recommended_actions"] = [
                    a["recommended_action"] for a in critical_anomalies
                ] + ["Full battery diagnostic", "Cell balancing check"]
            
            elif medium_anomalies:
                # Medium issues need attention soon
                maintenance_schedule["next_maintenance_date"] = (datetime.now() + timedelta(days=30)).isoformat()
                maintenance_schedule["maintenance_type"] = "preventive"
                maintenance_schedule["reason"] = medium_anomalies[0]["description"]
                maintenance_schedule["priority"] = "medium"
                maintenance_schedule["estimated_downtime_hours"] = 2
                maintenance_schedule["recommended_actions"] = [
                    a["recommended_action"] for a in medium_anomalies
                ] + ["Battery capacity test"]
        
        # Adjust based on state of health
        if battery_health.state_of_health < 75:
            # Battery nearing end of life needs more monitoring
            next_date = datetime.fromisoformat(maintenance_schedule["next_maintenance_date"])
            new_date = min(next_date, datetime.now() + timedelta(days=30))
            
            maintenance_schedule["next_maintenance_date"] = new_date.isoformat()
            maintenance_schedule["priority"] = "high"
            maintenance_schedule["maintenance_type"] = "diagnostic"
            maintenance_schedule["reason"] = "Battery state of health below 75%"
            maintenance_schedule["recommended_actions"].append("Evaluate for replacement")
        
        # Add predicted remaining useful life
        if battery_health.estimated_replacement_date:
            days_to_replacement = (battery_health.estimated_replacement_date - datetime.now()).days
            maintenance_schedule["predicted_days_to_replacement"] = max(0, days_to_replacement)
        
        return maintenance_schedule
    
    def predict_fleet_maintenance(self, vehicle_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Generate maintenance schedules for multiple vehicles and identify priorities
        
        Returns a dictionary mapping vehicle IDs to their maintenance schedules,
        sorted by priority.
        """
        fleet_schedule = {}
        
        for vehicle_id in vehicle_ids:
            try:
                schedule = self.get_maintenance_schedule(vehicle_id)
                fleet_schedule[vehicle_id] = schedule
            except Exception as e:
                logger.error(f"Error generating maintenance schedule for vehicle {vehicle_id}: {str(e)}")
                continue
        
        # Sort by priority and date
        return fleet_schedule
    
    def get_fleet_health_report(self, vehicle_ids: List[str]) -> Dict[str, Any]:
        """
        Generate a comprehensive fleet health report
        
        Returns a summary of fleet battery health status
        """
        report = {
            "timestamp": datetime.now().isoformat(),
            "fleet_size": len(vehicle_ids),
            "vehicles_analyzed": 0,
            "fleet_avg_soh": 0,
            "health_distribution": {
                "excellent": 0,  # >90%
                "good": 0,       # 80-90%
                "fair": 0,       # 70-80%
                "poor": 0,       # <70%
            },
            "anomalies_detected": 0,
            "maintenance_required_count": 0,
            "critical_issues_count": 0,
            "total_predicted_replacement_cost": 0,
            "vehicles_by_priority": {
                "high": [],
                "medium": [],
                "low": []
            }
        }
        
        total_soh = 0
        replacement_cost_per_kwh = 150  # Estimated cost per kWh for battery replacement
        
        for vehicle_id in vehicle_ids:
            try:
                health = self.get_battery_health(vehicle_id)
                maintenance = self.get_maintenance_schedule(vehicle_id)
                
                # Update counters
                report["vehicles_analyzed"] += 1
                total_soh += health.state_of_health
                
                # Update health distribution
                if health.state_of_health > 90:
                    report["health_distribution"]["excellent"] += 1
                elif health.state_of_health > 80:
                    report["health_distribution"]["good"] += 1
                elif health.state_of_health > 70:
                    report["health_distribution"]["fair"] += 1
                else:
                    report["health_distribution"]["poor"] += 1
                
                # Count anomalies
                report["anomalies_detected"] += len(health.anomalies)
                
                # Count maintenance
                if maintenance["priority"] != "low":
                    report["maintenance_required_count"] += 1
                
                # Count critical issues
                if maintenance["priority"] == "high":
                    report["critical_issues_count"] += 1
                
                # Add to priority lists
                report["vehicles_by_priority"][maintenance["priority"]].append(vehicle_id)
                
                # Add replacement cost if battery is nearing end of life
                if health.state_of_health < 75:
                    report["total_predicted_replacement_cost"] += health.nominal_capacity * replacement_cost_per_kwh
                
            except Exception as e:
                logger.error(f"Error including vehicle {vehicle_id} in fleet report: {str(e)}")
                continue
        
        # Calculate average SoH
        if report["vehicles_analyzed"] > 0:
            report["fleet_avg_soh"] = round(total_soh / report["vehicles_analyzed"], 1)
        
        # Round the replacement cost
        report["total_predicted_replacement_cost"] = round(report["total_predicted_replacement_cost"], 2)
        
        return report

# Singleton instance
_battery_health_instance = None

def get_battery_health_prediction() -> BatteryHealthPrediction:
    """Get the battery health prediction service instance"""
    global _battery_health_instance
    if _battery_health_instance is None:
        _battery_health_instance = BatteryHealthPrediction()
    return _battery_health_instance 