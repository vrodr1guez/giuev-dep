import unittest
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import random

from sqlalchemy.orm import Session
from app.models.battery_health_alert import BatteryHealthAlert, AlertSeverity
from app.services.battery_health_service import BatteryHealthService

from tests.fixtures.telemetry_fixtures import (
    create_vehicle_profile,
    generate_battery_health_report,
    generate_telemetry_sequence
)

class TestBatteryHealthService(unittest.TestCase):
    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.health_service = BatteryHealthService()
        self.now = datetime.now(timezone.utc)
        
        # Create a test vehicle profile for use in multiple tests
        self.test_vehicle = create_vehicle_profile(
            vehicle_id=1,
            make="Tesla",
            model="Model 3",
            year=2020,
            battery_age_years=2.5
        )

    def test_get_battery_health_by_vehicle_id(self):
        """Test retrieving battery health for a specific vehicle."""
        vehicle_id = 1
        
        # Mock the database query results
        mock_health_report = MagicMock()
        mock_health_report.state_of_health = 92.5
        mock_health_report.current_capacity_kwh = 70.2
        mock_health_report.nominal_capacity_kwh = 75.0
        mock_health_report.report_date = self.now
        
        self.db_session_mock.query().filter().order_by().first.return_value = mock_health_report
        
        # Call the method under test
        result = self.health_service.get_battery_health_by_vehicle_id(self.db_session_mock, vehicle_id)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertEqual(result.state_of_health, 92.5)
        self.assertEqual(result.current_capacity_kwh, 70.2)
        
        # Verify the correct query was made
        self.db_session_mock.query().filter().order_by().first.assert_called_once()

    @pytest.mark.parametrize(
        "battery_type, temperature, charging_rate, expected_severity",
        [
            # Normal conditions
            ("NMC", 25.0, 10.0, None),  # Normal temperature, normal charging rate
            
            # Temperature edge cases
            ("NMC", -10.0, 10.0, AlertSeverity.WARNING),  # Very cold temperature
            ("NMC", 45.0, 10.0, AlertSeverity.WARNING),   # Very hot temperature
            ("NMC", 60.0, 10.0, AlertSeverity.CRITICAL),  # Extreme hot temperature
            ("LFP", -15.0, 10.0, AlertSeverity.WARNING),  # LFP handles cold better but still an issue
            ("LFP", 50.0, 10.0, AlertSeverity.WARNING),   # LFP handles heat better but still an issue
            
            # Charging rate edge cases
            ("NMC", 25.0, 150.0, AlertSeverity.WARNING),  # High charging rate
            ("NMC", 35.0, 150.0, AlertSeverity.CRITICAL), # High charging rate at elevated temperature
            ("LFP", 25.0, 200.0, AlertSeverity.WARNING),  # Very high charging rate for LFP
            
            # Combined edge cases
            ("NCA", 40.0, 250.0, AlertSeverity.CRITICAL), # NCA is most sensitive to heat+charging
            ("LFP", -5.0, 150.0, AlertSeverity.WARNING),  # Cold charging is not ideal
        ]
    )
    def test_analyze_battery_temperature_conditions(self, battery_type, temperature, charging_rate, expected_severity):
        """Test analyzing battery temperature conditions for various edge cases."""
        # Setup test vehicle with specific battery type
        vehicle_profile = create_vehicle_profile(
            vehicle_id=1,
            model=next(model for model, data in self.health_service.VEHICLE_MODELS.items() 
                     if data["battery_type"] == battery_type),
            battery_age_years=2.0
        )
        
        # Mock the vehicle data retrieval
        self.health_service.get_vehicle_by_id = MagicMock(return_value=vehicle_profile)
        
        # Mock the telemetry data
        telemetry_data = {
            "battery_temperature_celsius": temperature,
            "is_charging": charging_rate > 0,
            "charging_power_kw": charging_rate if charging_rate > 0 else 0,
            "timestamp": self.now
        }
        
        # Mock previous alerts to empty list
        self.health_service.get_recent_alerts = MagicMock(return_value=[])
        
        # Call the method under test
        result = self.health_service.analyze_battery_temperature_conditions(
            self.db_session_mock, vehicle_profile["id"], telemetry_data
        )
        
        # Assertions
        if expected_severity:
            self.assertIsNotNone(result)
            self.assertEqual(result.severity, expected_severity)
            self.assertIn("temperature", result.alert_message.lower() 
                         if temperature < 0 or temperature > 35 else result.alert_message.lower())
            self.assertIn("charging", result.alert_message.lower() 
                         if charging_rate > 100 else result.alert_message.lower())
        else:
            self.assertIsNone(result)

    @pytest.mark.parametrize(
        "soh, capacity_pct, predicted_degradation, estimated_cycles, cell_imbalance, expected_severity",
        [
            # Normal conditions
            (90.0, 90.0, 2.5, 500, 10.0, None),  # All normal parameters
            
            # SOH edge cases
            (75.0, 75.0, 2.5, 500, 10.0, AlertSeverity.INFO),      # Low SOH but not critical
            (70.0, 70.0, 2.5, 500, 10.0, AlertSeverity.WARNING),   # Warning SOH threshold
            (65.0, 65.0, 2.5, 500, 10.0, AlertSeverity.CRITICAL),  # Critical SOH
            
            # Capacity inconsistency edge cases
            (90.0, 80.0, 2.5, 500, 10.0, AlertSeverity.WARNING),   # 10% discrepancy between SOH and capacity
            (80.0, 65.0, 2.5, 500, 10.0, AlertSeverity.CRITICAL),  # 15% discrepancy between SOH and capacity
            
            # Accelerated degradation edge cases
            (85.0, 85.0, 6.0, 500, 10.0, AlertSeverity.WARNING),   # Fast degradation rate
            (85.0, 85.0, 8.0, 500, 10.0, AlertSeverity.CRITICAL),  # Very fast degradation rate
            
            # High cycle count edge cases
            (85.0, 85.0, 2.5, 1800, 10.0, AlertSeverity.INFO),     # High cycle count for age
            (85.0, 85.0, 2.5, 2300, 10.0, AlertSeverity.WARNING),  # Very high cycle count
            
            # Cell imbalance edge cases
            (85.0, 85.0, 2.5, 500, 60.0, AlertSeverity.WARNING),   # Significant cell imbalance
            (85.0, 85.0, 2.5, 500, 100.0, AlertSeverity.CRITICAL), # Severe cell imbalance
            
            # Combined edge cases
            (75.0, 70.0, 5.0, 1500, 50.0, AlertSeverity.CRITICAL), # Multiple issues present
        ]
    )
    def test_analyze_battery_health_report(self, soh, capacity_pct, predicted_degradation, 
                                         estimated_cycles, cell_imbalance, expected_severity):
        """Test analyzing battery health reports for various edge cases."""
        # Create a vehicle profile
        vehicle_profile = create_vehicle_profile(
            vehicle_id=1,
            make="Tesla",
            model="Model 3",
            year=2020,
            battery_age_years=2.0
        )
        
        # Calculate current capacity from nominal and percentage
        nominal_capacity = vehicle_profile["nominal_capacity_kwh"]
        current_capacity = nominal_capacity * capacity_pct / 100
        
        # Create a health report with the specific test parameters
        health_report = {
            "vehicle_id": vehicle_profile["id"],
            "report_date": self.now,
            "state_of_health": soh,
            "nominal_capacity_kwh": nominal_capacity,
            "current_capacity_kwh": current_capacity,
            "estimated_cycles": estimated_cycles,
            "internal_resistance_increase_percent": (100 - soh) * 0.3,
            "cell_voltage_imbalance_mv": cell_imbalance,
            "predicted_soh_1year": max(60, soh - predicted_degradation),
            "degradation_rate_per_year": predicted_degradation,
            "battery_type": vehicle_profile["battery_type"],
        }
        
        # Mock the vehicle retrieval
        self.health_service.get_vehicle_by_id = MagicMock(return_value=vehicle_profile)
        
        # Mock previous alerts to empty list
        self.health_service.get_recent_alerts = MagicMock(return_value=[])
        
        # Call the method under test
        result = self.health_service.analyze_battery_health_report(
            self.db_session_mock, vehicle_profile["id"], health_report
        )
        
        # Assertions
        if expected_severity:
            self.assertIsNotNone(result)
            self.assertEqual(result.severity, expected_severity)
            
            # Check that alert message contains relevant information based on the issue
            if soh <= 70:
                self.assertIn("health", result.alert_message.lower())
            if abs(soh - capacity_pct) >= 10:
                self.assertIn("capacity", result.alert_message.lower())
            if predicted_degradation >= 5:
                self.assertIn("degradation", result.alert_message.lower())
            if cell_imbalance >= 50:
                self.assertIn("imbalance", result.alert_message.lower())
        else:
            self.assertIsNone(result)

    def test_detect_battery_anomalies_from_telemetry(self):
        """Test detecting battery anomalies from telemetry data."""
        # Create a vehicle profile
        vehicle_profile = create_vehicle_profile(
            vehicle_id=1,
            make="Tesla",
            model="Model 3",
            year=2020,
            battery_age_years=2.0
        )
        
        # Generate telemetry data with anomalies
        start_time = self.now - timedelta(hours=24)
        end_time = self.now
        telemetry_data = generate_telemetry_sequence(
            vehicle_profile=vehicle_profile,
            start_time=start_time,
            end_time=end_time,
            interval_minutes=15,
            include_anomalies=True,
            anomaly_probability=0.2  # High probability to ensure we get anomalies
        )
        
        # Mock the database queries
        self.db_session_mock.query().filter().order_by().all.return_value = telemetry_data
        self.health_service.get_vehicle_by_id = MagicMock(return_value=vehicle_profile)
        self.health_service.get_recent_alerts = MagicMock(return_value=[])
        
        # Call the method under test
        alerts = self.health_service.detect_battery_anomalies_from_telemetry(
            self.db_session_mock, vehicle_profile["id"], hours=24
        )
        
        # We can't assert exact results due to randomness, but we can make some general assertions
        self.assertIsInstance(alerts, list)
        
        # If we got anomalies in our generated data, we should have alerts
        if any(self._contains_anomaly(point) for point in telemetry_data):
            self.assertGreater(len(alerts), 0)
            
            # Check that each alert has the expected properties
            for alert in alerts:
                self.assertEqual(alert.vehicle_id, vehicle_profile["id"])
                self.assertIn(alert.severity, [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL])
                self.assertIsNotNone(alert.alert_message)
                self.assertIsNotNone(alert.detected_at)

    def _contains_anomaly(self, telemetry_point):
        """Helper method to check if a telemetry point contains an anomaly."""
        # Check for some common anomaly patterns in our generated data
        if telemetry_point.get("speed_kmh") is None:
            return True
        if telemetry_point.get("battery_temperature_celsius") is None:
            return True
        if telemetry_point.get("battery_temperature_celsius", 0) > 50:
            return True
        if telemetry_point.get("speed_kmh", 0) > 180:
            return True
        if telemetry_point.get("latitude", 0) > 40 or telemetry_point.get("latitude", 0) < 30:
            return True
        
        return False

    @pytest.mark.parametrize(
        "current_soc, target_soc, time_to_target, battery_age, expected_severity",
        [
            # Normal charging scenarios
            (20, 80, 2.0, 1.0, None),  # Standard charging, new battery
            (20, 80, 2.0, 3.0, None),  # Standard charging, older battery
            
            # Fast charging edge cases
            (20, 80, 0.5, 1.0, AlertSeverity.INFO),      # Fast charging, new battery
            (20, 80, 0.5, 3.0, AlertSeverity.WARNING),   # Fast charging, older battery
            (20, 80, 0.3, 4.0, AlertSeverity.CRITICAL),  # Very fast charging, old battery
            
            # High target SoC edge cases
            (20, 90, 2.0, 1.0, None),                    # High target SoC, new battery
            (20, 90, 2.0, 3.0, AlertSeverity.INFO),      # High target SoC, older battery
            (20, 100, 2.0, 3.0, AlertSeverity.WARNING),  # Full charge, older battery
            (20, 100, 0.5, 3.0, AlertSeverity.CRITICAL), # Fast full charge, older battery
            
            # Frequent charging edge cases
            (70, 90, 1.0, 2.0, AlertSeverity.INFO),      # High SoC narrow range, moderate age
            (70, 90, 0.5, 3.0, AlertSeverity.WARNING),   # Fast charge in high SoC range, older battery
        ]
    )
    def test_evaluate_charging_impact(self, current_soc, target_soc, time_to_target, 
                                     battery_age, expected_severity):
        """Test evaluating the impact of charging patterns on battery health."""
        # Create a vehicle profile with specified battery age
        vehicle_profile = create_vehicle_profile(
            vehicle_id=1,
            make="Tesla",
            model="Model 3",
            year=datetime.now().year - int(battery_age),
            battery_age_years=battery_age
        )
        
        # Create charging parameters
        charging_params = {
            "vehicle_id": vehicle_profile["id"],
            "current_soc_percent": current_soc,
            "target_soc_percent": target_soc,
            "estimated_time_hours": time_to_target,
            "charging_rate_kw": ((target_soc - current_soc) / 100 * vehicle_profile["current_capacity_kwh"]) / time_to_target,
            "timestamp": self.now
        }
        
        # Mock the vehicle retrieval
        self.health_service.get_vehicle_by_id = MagicMock(return_value=vehicle_profile)
        
        # Mock the recent charging events (assume none for simplicity)
        self.health_service.get_recent_charging_events = MagicMock(return_value=[])
        
        # Mock previous alerts to empty list
        self.health_service.get_recent_alerts = MagicMock(return_value=[])
        
        # Call the method under test
        result = self.health_service.evaluate_charging_impact(
            self.db_session_mock, vehicle_profile["id"], charging_params
        )
        
        # Assertions
        if expected_severity:
            self.assertIsNotNone(result)
            self.assertEqual(result.severity, expected_severity)
            
            # Check the alert message contains relevant information
            if time_to_target < 0.6:
                self.assertIn("fast", result.alert_message.lower())
            if target_soc > 90:
                self.assertIn("high", result.alert_message.lower())
        else:
            self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main() 