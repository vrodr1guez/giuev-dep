import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.services.smart_charging_service import CRUDSmartCharging, smart_charging_service
from app.models.vehicle import Vehicle
from app.schemas.charging import (
    ChargingOptimizationRequest, 
    ChargingOptimizationResponse,
    ChargingScheduleSlot
)

class TestCRUDSmartCharging(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_smart_charging = CRUDSmartCharging()

    def test_optimize_charging_schedule_success(self):
        # Create test request
        future_time = datetime.now(timezone.utc) + timedelta(hours=8)
        request = ChargingOptimizationRequest(
            vehicle_id=1,
            station_id=2,
            target_soc_percent=85.0,
            departure_time=future_time,
            electricity_tariffs=[
                {"start_time": "22:00", "end_time": "06:00", "rate": 0.10},
                {"start_time": "06:00", "end_time": "22:00", "rate": 0.25}
            ],
            max_charging_power_kw=11.0
        )
        
        # Mock the vehicle that needs charging
        mock_vehicle = Vehicle(
            id=1,
            vin="TESTVIN123",
            current_soc_percent=Decimal("30.0"),
            battery_capacity_kwh=Decimal("75.0")
        )
        
        # Mock vehicle service to return our mock vehicle
        with patch("app.services.vehicle_service.vehicle_service.get_vehicle", return_value=mock_vehicle):
            # Call the service method
            result = self.crud_smart_charging.optimize_charging_schedule(
                self.db_session_mock, 
                optimization_request=request
            )
            
            # Verify response
            self.assertIsInstance(result, ChargingOptimizationResponse)
            self.assertEqual(result.vehicle_id, 1)
            self.assertGreater(len(result.optimized_schedule), 0)
            
            # Check schedule validity
            for slot in result.optimized_schedule:
                self.assertIsInstance(slot, ChargingScheduleSlot)
                self.assertLessEqual(slot.charging_power_kw, 11.0)  # Power less than max
                
            # Check that end time of schedule is before departure time
            last_slot = result.optimized_schedule[-1]
            self.assertLessEqual(last_slot.end_time, request.departure_time)
            
            # Check that target SoC is reached
            self.assertGreaterEqual(last_slot.estimated_soc_achieved_percent, 85.0)

    def test_optimize_charging_schedule_already_charged(self):
        # Create test request
        future_time = datetime.now(timezone.utc) + timedelta(hours=8)
        request = ChargingOptimizationRequest(
            vehicle_id=1,
            station_id=2,
            target_soc_percent=85.0,
            departure_time=future_time
        )
        
        # Mock a vehicle that is already charged above target
        mock_vehicle = Vehicle(
            id=1,
            vin="TESTVIN123",
            current_soc_percent=Decimal("90.0"),  # Already above target
            battery_capacity_kwh=Decimal("75.0")
        )
        
        # Mock vehicle service
        with patch("app.services.vehicle_service.vehicle_service.get_vehicle", return_value=mock_vehicle):
            # Call the service method
            result = self.crud_smart_charging.optimize_charging_schedule(
                self.db_session_mock, 
                optimization_request=request
            )
            
            # Verify response for a vehicle already charged
            self.assertIsInstance(result, ChargingOptimizationResponse)
            self.assertEqual(result.vehicle_id, 1)
            self.assertEqual(len(result.optimized_schedule), 0)  # No charging needed
            self.assertIsNotNone(result.warnings)
            # Check for a warning that vehicle is already charged
            self.assertTrue(any("already charged" in warning.lower() for warning in result.warnings))

    def test_optimize_charging_schedule_vehicle_not_found(self):
        # Create test request
        future_time = datetime.now(timezone.utc) + timedelta(hours=8)
        request = ChargingOptimizationRequest(
            vehicle_id=999,  # Non-existent vehicle ID
            station_id=2,
            target_soc_percent=85.0,
            departure_time=future_time
        )
        
        # Mock vehicle service to return None (vehicle not found)
        with patch("app.services.vehicle_service.vehicle_service.get_vehicle", return_value=None):
            # Call the service method and check it raises appropriate exception
            with self.assertRaises(ValueError) as context:
                self.crud_smart_charging.optimize_charging_schedule(
                    self.db_session_mock, 
                    optimization_request=request
                )
            
            # Verify the error message
            self.assertIn("Vehicle not found", str(context.exception))

    def test_calculate_optimal_charging_slots(self):
        # Test the internal method that calculates optimal slots
        # This would test the core algorithm logic
        
        # Mock input parameters
        vehicle_id = 1
        current_soc = Decimal("30.0")
        target_soc = Decimal("85.0")
        battery_capacity = Decimal("75.0")
        departure_time = datetime.now(timezone.utc) + timedelta(hours=8)
        max_power = Decimal("11.0")
        tariffs = [
            {"start_time": "22:00", "end_time": "06:00", "rate": 0.10},
            {"start_time": "06:00", "end_time": "22:00", "rate": 0.25}
        ]
        
        # Call the internal method
        slots = self.crud_smart_charging._calculate_optimal_charging_slots(
            vehicle_id=vehicle_id,
            current_soc=current_soc,
            target_soc=target_soc,
            battery_capacity=battery_capacity,
            departure_time=departure_time,
            max_charging_power_kw=max_power,
            electricity_tariffs=tariffs
        )
        
        # Verify the result
        self.assertIsInstance(slots, list)
        if slots:  # If any slots are returned
            self.assertIsInstance(slots[0], ChargingScheduleSlot)
            
            # Check slots are continuous
            for i in range(len(slots) - 1):
                self.assertEqual(slots[i].end_time, slots[i+1].start_time)
            
            # Check final SOC meets or exceeds target
            self.assertGreaterEqual(slots[-1].estimated_soc_achieved_percent, target_soc)
            
            # Check we prefer cheaper time slots
            # This is complex and depends on your specific algorithm,
            # but we could check that more hours in cheaper periods are used if possible
            cheap_hours = 0
            expensive_hours = 0
            
            for slot in slots:
                duration = (slot.end_time - slot.start_time).total_seconds() / 3600
                # Simplistic check - assumes night hours are 22:00-06:00
                if slot.start_time.hour >= 22 or slot.start_time.hour < 6:
                    cheap_hours += duration
                else:
                    expensive_hours += duration
                    
            # Depending on your algorithm, you might expect that cheap hours are maximized
            # This is a very simplified example and might need adjusting
            total_hours = cheap_hours + expensive_hours
            self.assertGreater(cheap_hours / total_hours, 0.5)

if __name__ == '__main__':
    unittest.main() 