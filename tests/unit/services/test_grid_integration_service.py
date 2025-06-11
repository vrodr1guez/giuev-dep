import unittest
import pytest
from unittest.mock import MagicMock, patch, ANY
from datetime import datetime, timezone, timedelta
import random
import uuid

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.services.grid_integration_service import GridIntegrationService
from app.models.grid import GridStatus, PriceTier
from app.models.v2g import V2GTransaction, V2GTransactionStatus

from tests.fixtures.telemetry_fixtures import (
    create_vehicle_profile,
    create_v2g_transaction
)

class TestGridIntegrationService(unittest.TestCase):
    """Test suite for the Grid Integration Service."""
    
    def setUp(self):
        """Set up common test resources."""
        self.db_session_mock = MagicMock(spec=Session)
        self.grid_service = GridIntegrationService()
        self.now = datetime.now(timezone.utc)
        
        # Create a standard test vehicle profile
        self.test_vehicle = create_vehicle_profile(
            vehicle_id=1,
            make="Tesla",
            model="Model 3",
            year=2020,
            battery_age_years=2.0
        )
        
        # Default grid status mock
        self.grid_status_mock = MagicMock(spec=GridStatus)
        self.grid_status_mock.id = str(uuid.uuid4())
        self.grid_status_mock.current_demand_percent = 75.0
        self.grid_status_mock.current_price_tier = PriceTier.MEDIUM
        self.grid_status_mock.price_per_kwh = 0.25
        self.grid_status_mock.timestamp = self.now
        self.grid_status_mock.renewable_mix_percent = 30.0
        self.grid_status_mock.carbon_intensity = 350.0  # g CO2/kWh
        self.grid_status_mock.is_peak_event = False
        
        # Set up standard mocks
        self.grid_service.get_latest_grid_status = MagicMock(
            return_value=self.grid_status_mock
        )
        self.grid_service.get_vehicle_by_id = MagicMock(
            return_value=self.test_vehicle
        )

    def test_get_current_grid_status(self):
        """Test retrieving the current grid status."""
        # Call the method under test
        result = self.grid_service.get_current_grid_status(self.db_session_mock)
        
        # Assertions
        self.assertEqual(result, self.grid_status_mock)
        self.grid_service.get_latest_grid_status.assert_called_once_with(self.db_session_mock)
    
    @pytest.mark.parametrize(
        "battery_soc, min_export_soc, battery_age, peak_event, expected_eligible",
        [
            # Normal cases
            (80, 30, 1.0, False, True),    # High SOC, new battery, normal grid
            (50, 30, 2.0, False, True),    # Medium SOC, moderate battery age, normal grid
            
            # SOC edge cases
            (35, 30, 1.0, False, True),    # Just above minimum SOC
            (25, 30, 1.0, False, False),   # Below minimum SOC
            
            # Battery health edge cases
            (80, 30, 5.0, False, False),   # Old battery (> 4 years)
            (90, 30, 3.5, False, True),    # Borderline battery age with high SOC
            
            # Peak event cases
            (50, 30, 2.0, True, True),     # Medium SOC, peak event, should be eligible
            (35, 30, 3.5, True, True),     # Borderline SOC and age, peak event
            
            # Combined edge cases
            (32, 30, 3.8, False, False),   # Multiple borderline conditions
            (95, 30, 4.2, True, True),     # Very high SOC compensates for old battery during peak
        ]
    )
    def test_check_v2g_eligibility(self, battery_soc, min_export_soc, battery_age, 
                                peak_event, expected_eligible):
        """Test checking vehicle eligibility for V2G transactions."""
        # Update test vehicle profile with specific age
        self.test_vehicle["battery_age_years"] = battery_age
        
        # Update grid status for peak event condition
        self.grid_status_mock.is_peak_event = peak_event
        
        # Mock telemetry data
        telemetry_mock = MagicMock()
        telemetry_mock.state_of_charge_percent = battery_soc
        telemetry_mock.timestamp = self.now
        
        # Mock telemetry service response
        self.grid_service.get_latest_telemetry = MagicMock(return_value=telemetry_mock)
        
        # Mock system settings
        self.grid_service.get_min_v2g_soc = MagicMock(return_value=min_export_soc)
        self.grid_service.get_max_v2g_battery_age = MagicMock(return_value=4.0)
        
        # Call the method under test
        result = self.grid_service.check_v2g_eligibility(
            self.db_session_mock, self.test_vehicle["id"]
        )
        
        # Assertions
        self.assertEqual(result["eligible"], expected_eligible)
        if not expected_eligible:
            self.assertIn("reason", result)
            if battery_soc < min_export_soc:
                self.assertIn("soc", result["reason"].lower())
            if battery_age > 4.0 and battery_soc < 90:
                self.assertIn("age", result["reason"].lower())

    @pytest.mark.parametrize(
        "grid_demand, price_tier, price_per_kwh, battery_soc, expected_suitable",
        [
            # Definitely suitable conditions
            (90, PriceTier.HIGH, 0.50, 80, True),     # High grid demand, high price, high SOC
            (95, PriceTier.CRITICAL, 0.80, 60, True), # Critical grid demand, critical price
            
            # Marginally suitable conditions
            (75, PriceTier.MEDIUM, 0.25, 70, True),   # Medium demand and price
            
            # Not suitable conditions
            (40, PriceTier.LOW, 0.10, 50, False),     # Low demand and price
            (60, PriceTier.MEDIUM, 0.20, 40, False),  # Medium demand but lower SOC
            
            # Edge cases
            (80, PriceTier.HIGH, 0.40, 35, False),    # High demand but very low SOC
            (50, PriceTier.LOW, 0.15, 90, False),     # Low demand despite high SOC
        ]
    )
    def test_assess_v2g_opportunity(self, grid_demand, price_tier, price_per_kwh, 
                                   battery_soc, expected_suitable):
        """Test assessing V2G opportunities based on grid and vehicle conditions."""
        # Update grid status for specific test conditions
        self.grid_status_mock.current_demand_percent = grid_demand
        self.grid_status_mock.current_price_tier = price_tier
        self.grid_status_mock.price_per_kwh = price_per_kwh
        
        # Mock telemetry data
        telemetry_mock = MagicMock()
        telemetry_mock.state_of_charge_percent = battery_soc
        telemetry_mock.timestamp = self.now
        
        # Mock telemetry service response
        self.grid_service.get_latest_telemetry = MagicMock(return_value=telemetry_mock)
        
        # Mock eligibility check (assume eligible)
        self.grid_service.check_v2g_eligibility = MagicMock(
            return_value={"eligible": True}
        )
        
        # Call the method under test
        result = self.grid_service.assess_v2g_opportunity(
            self.db_session_mock, self.test_vehicle["id"]
        )
        
        # Assertions
        self.assertEqual(result["suitable_now"], expected_suitable)
        self.assertEqual(result["grid_demand_percent"], grid_demand)
        self.assertEqual(result["price_tier"], price_tier.value)
        self.assertEqual(result["price_per_kwh"], price_per_kwh)

    @pytest.mark.parametrize(
        "battery_soc, max_export_duration, grid_demand, price_tier, expected_max_power, expected_revenue",
        [
            # Normal cases
            (80, 2.0, 80, PriceTier.HIGH, 7.0, None),      # High SOC, high demand
            (50, 1.0, 70, PriceTier.MEDIUM, 5.0, None),    # Medium SOC, medium demand
            
            # SOC impact cases
            (90, 2.0, 80, PriceTier.HIGH, 10.0, None),     # Very high SOC
            (40, 1.0, 80, PriceTier.HIGH, 4.0, None),      # Lower SOC
            
            # Grid event impact
            (60, 3.0, 95, PriceTier.CRITICAL, 8.0, None),  # Critical grid event
            
            # Duration impact
            (70, 0.5, 80, PriceTier.HIGH, 10.0, None),     # Short duration allows higher power
            (70, 4.0, 80, PriceTier.HIGH, 5.0, None),      # Longer duration requires lower power
        ]
    )
    def test_calculate_v2g_capacity(self, battery_soc, max_export_duration, grid_demand, 
                                  price_tier, expected_max_power, expected_revenue):
        """Test calculating V2G capacity and potential revenue."""
        # Update grid status for specific test conditions
        self.grid_status_mock.current_demand_percent = grid_demand
        self.grid_status_mock.current_price_tier = price_tier
        
        if price_tier == PriceTier.LOW:
            self.grid_status_mock.price_per_kwh = 0.10
        elif price_tier == PriceTier.MEDIUM:
            self.grid_status_mock.price_per_kwh = 0.25
        elif price_tier == PriceTier.HIGH:
            self.grid_status_mock.price_per_kwh = 0.40
        else:  # CRITICAL
            self.grid_status_mock.price_per_kwh = 0.75
        
        # Mock telemetry data
        telemetry_mock = MagicMock()
        telemetry_mock.state_of_charge_percent = battery_soc
        telemetry_mock.timestamp = self.now
        
        # Mock telemetry service response
        self.grid_service.get_latest_telemetry = MagicMock(return_value=telemetry_mock)
        
        # Mock max duration setting
        self.grid_service.get_max_v2g_duration = MagicMock(return_value=max_export_duration)
        
        # Call the method under test
        result = self.grid_service.calculate_v2g_capacity(
            self.db_session_mock, self.test_vehicle["id"]
        )
        
        # Assertions
        # Allow for some flexibility in the expected power value
        self.assertIsNotNone(result["max_export_power_kw"])
        power_within_range = (
            expected_max_power * 0.8 <= result["max_export_power_kw"] <= expected_max_power * 1.2
        )
        self.assertTrue(power_within_range, 
                      f"Expected power around {expected_max_power}, got {result['max_export_power_kw']}")
        
        self.assertIsNotNone(result["max_export_duration_hours"])
        self.assertEqual(result["max_export_duration_hours"], max_export_duration)
        
        self.assertIsNotNone(result["potential_energy_kwh"])
        self.assertGreater(result["potential_energy_kwh"], 0)
        
        self.assertIsNotNone(result["estimated_revenue"])
        self.assertGreater(result["estimated_revenue"], 0)
        
        if expected_revenue is not None:
            self.assertAlmostEqual(result["estimated_revenue"], expected_revenue, delta=expected_revenue * 0.1)

    def test_create_v2g_transaction_success(self):
        """Test creating a V2G transaction successfully."""
        # Mock eligibility check
        self.grid_service.check_v2g_eligibility = MagicMock(
            return_value={"eligible": True}
        )
        
        # Create transaction data
        transaction_data = {
            "vehicle_id": self.test_vehicle["id"],
            "energy_to_export_kwh": 10.0,
            "max_duration_hours": 2.0,
            "max_power_kw": 7.0,
            "min_price_per_kwh": 0.20
        }
        
        # Set up DB session mock behavior
        self.db_session_mock.add = MagicMock()
        self.db_session_mock.commit = MagicMock()
        self.db_session_mock.refresh = MagicMock()
        
        # Mock the model instantiation
        with patch('app.services.grid_integration_service.V2GTransaction') as mock_v2g_transaction:
            mock_transaction = MagicMock(spec=V2GTransaction)
            mock_transaction.id = str(uuid.uuid4())
            mock_transaction.status = V2GTransactionStatus.CREATED
            mock_v2g_transaction.return_value = mock_transaction
            
            # Call the method under test
            result = self.grid_service.create_v2g_transaction(
                self.db_session_mock, transaction_data
            )
            
            # Assertions
            self.assertIsNotNone(result)
            self.assertEqual(result.status, V2GTransactionStatus.CREATED)
            
            # Verify DB operations
            self.db_session_mock.add.assert_called_once()
            self.db_session_mock.commit.assert_called_once()
            self.db_session_mock.refresh.assert_called_once()
            
            # Verify transaction creation with correct data
            mock_v2g_transaction.assert_called_once()
            call_kwargs = mock_v2g_transaction.call_args[1]
            self.assertEqual(call_kwargs["vehicle_id"], self.test_vehicle["id"])
            self.assertEqual(call_kwargs["energy_to_export_kwh"], 10.0)
            self.assertEqual(call_kwargs["max_duration_hours"], 2.0)
            self.assertEqual(call_kwargs["max_power_kw"], 7.0)
            self.assertEqual(call_kwargs["min_price_per_kwh"], 0.20)
            self.assertEqual(call_kwargs["status"], V2GTransactionStatus.CREATED)

    def test_create_v2g_transaction_not_eligible(self):
        """Test creating a V2G transaction when vehicle is not eligible."""
        # Mock eligibility check - NOT eligible
        self.grid_service.check_v2g_eligibility = MagicMock(
            return_value={"eligible": False, "reason": "SOC too low"}
        )
        
        # Create transaction data
        transaction_data = {
            "vehicle_id": self.test_vehicle["id"],
            "energy_to_export_kwh": 10.0,
            "max_duration_hours": 2.0,
            "max_power_kw": 7.0,
            "min_price_per_kwh": 0.20
        }
        
        # Call the method under test and check for exception
        with self.assertRaises(ValueError) as context:
            self.grid_service.create_v2g_transaction(
                self.db_session_mock, transaction_data
            )
        
        # Verify exception message
        self.assertIn("eligible", str(context.exception).lower())
        self.assertIn("soc", str(context.exception).lower())
        
        # Verify no DB operations occurred
        self.db_session_mock.add.assert_not_called()
        self.db_session_mock.commit.assert_not_called()

    def test_create_v2g_transaction_db_error(self):
        """Test handling database errors during transaction creation."""
        # Mock eligibility check
        self.grid_service.check_v2g_eligibility = MagicMock(
            return_value={"eligible": True}
        )
        
        # Create transaction data
        transaction_data = {
            "vehicle_id": self.test_vehicle["id"],
            "energy_to_export_kwh": 10.0,
            "max_duration_hours": 2.0,
            "max_power_kw": 7.0,
            "min_price_per_kwh": 0.20
        }
        
        # Set up DB session mock behavior to raise an error
        self.db_session_mock.add = MagicMock()
        self.db_session_mock.commit = MagicMock(side_effect=SQLAlchemyError("Database error"))
        self.db_session_mock.rollback = MagicMock()
        
        # Call the method under test and check for exception
        with self.assertRaises(SQLAlchemyError) as context:
            self.grid_service.create_v2g_transaction(
                self.db_session_mock, transaction_data
            )
        
        # Verify exception message
        self.assertIn("database error", str(context.exception).lower())
        
        # Verify rollback was called
        self.db_session_mock.rollback.assert_called_once()

    @pytest.mark.parametrize(
        "current_status, requested_status, can_transition",
        [
            # Valid transitions
            (V2GTransactionStatus.CREATED, V2GTransactionStatus.INITIATED, True),
            (V2GTransactionStatus.INITIATED, V2GTransactionStatus.IN_PROGRESS, True),
            (V2GTransactionStatus.IN_PROGRESS, V2GTransactionStatus.COMPLETED, True),
            (V2GTransactionStatus.IN_PROGRESS, V2GTransactionStatus.FAILED, True),
            (V2GTransactionStatus.INITIATED, V2GTransactionStatus.CANCELLED, True),
            
            # Invalid transitions
            (V2GTransactionStatus.COMPLETED, V2GTransactionStatus.IN_PROGRESS, False),
            (V2GTransactionStatus.FAILED, V2GTransactionStatus.COMPLETED, False),
            (V2GTransactionStatus.CANCELLED, V2GTransactionStatus.INITIATED, False),
            (V2GTransactionStatus.CREATED, V2GTransactionStatus.COMPLETED, False),
        ]
    )
    def test_update_v2g_transaction_status(self, current_status, requested_status, can_transition):
        """Test updating V2G transaction status with various transitions."""
        # Create a mock transaction
        mock_transaction = MagicMock(spec=V2GTransaction)
        mock_transaction.id = str(uuid.uuid4())
        mock_transaction.vehicle_id = self.test_vehicle["id"]
        mock_transaction.status = current_status
        mock_transaction.created_at = self.now - timedelta(hours=1)
        mock_transaction.updated_at = self.now - timedelta(minutes=30)
        
        # Mock getting the transaction
        self.db_session_mock.query().filter().first.return_value = mock_transaction
        
        # Update data
        update_data = {
            "status": requested_status,
            "notes": "Test status update"
        }
        
        if can_transition:
            # Call the method under test
            result = self.grid_service.update_v2g_transaction_status(
                self.db_session_mock, mock_transaction.id, update_data
            )
            
            # Assertions
            self.assertEqual(result.status, requested_status)
            self.assertEqual(result.notes, "Test status update")
            
            # Verify DB operations
            self.db_session_mock.commit.assert_called_once()
        else:
            # Call the method under test and expect exception
            with self.assertRaises(ValueError) as context:
                self.grid_service.update_v2g_transaction_status(
                    self.db_session_mock, mock_transaction.id, update_data
                )
            
            # Verify exception message
            self.assertIn("invalid", str(context.exception).lower())
            self.assertIn("transition", str(context.exception).lower())
            
            # Verify no commit
            self.db_session_mock.commit.assert_not_called()

    def test_fleet_v2g_capacity_calculation(self):
        """Test calculating V2G capacity for an entire fleet."""
        # Create multiple vehicle profiles
        vehicles = [
            create_vehicle_profile(vehicle_id=1, model="Model 3", battery_age_years=1.5),
            create_vehicle_profile(vehicle_id=2, model="Model Y", battery_age_years=2.0),
            create_vehicle_profile(vehicle_id=3, model="F-150 Lightning", battery_age_years=0.5),
        ]
        
        # Mock fleet service to return these vehicles
        self.grid_service.get_fleet_vehicles = MagicMock(return_value=vehicles)
        
        # Mock individual V2G capacity calculations
        self.grid_service.calculate_v2g_capacity = MagicMock(side_effect=[
            {
                "max_export_power_kw": 7.0,
                "max_export_duration_hours": 2.0,
                "potential_energy_kwh": 12.0,
                "estimated_revenue": 4.80,
                "vehicle_id": 1
            },
            {
                "max_export_power_kw": 9.0,
                "max_export_duration_hours": 2.0,
                "potential_energy_kwh": 15.0,
                "estimated_revenue": 6.00,
                "vehicle_id": 2
            },
            {
                "max_export_power_kw": 12.0,
                "max_export_duration_hours": 3.0,
                "potential_energy_kwh": 25.0,
                "estimated_revenue": 10.00,
                "vehicle_id": 3
            }
        ])
        
        # Mock eligibility checks
        self.grid_service.check_v2g_eligibility = MagicMock(return_value={"eligible": True})
        
        # Call the method under test
        result = self.grid_service.calculate_fleet_v2g_capacity(
            self.db_session_mock, fleet_id=1
        )
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertEqual(result["total_available_vehicles"], 3)
        self.assertEqual(result["total_potential_energy_kwh"], 52.0)
        self.assertEqual(result["total_max_power_kw"], 28.0)
        self.assertEqual(result["total_estimated_revenue"], 20.80)
        self.assertEqual(len(result["vehicles"]), 3)

    def test_monitor_active_v2g_transactions(self):
        """Test monitoring active V2G transactions."""
        # Create mock transactions
        mock_transactions = [
            MagicMock(spec=V2GTransaction),
            MagicMock(spec=V2GTransaction),
            MagicMock(spec=V2GTransaction)
        ]
        
        # Set up transaction properties
        for i, txn in enumerate(mock_transactions):
            txn.id = str(uuid.uuid4())
            txn.vehicle_id = i + 1
            txn.status = V2GTransactionStatus.IN_PROGRESS
            txn.start_time = self.now - timedelta(minutes=random.randint(10, 60))
            txn.energy_exported_kwh = random.uniform(2.0, 8.0)
            txn.target_energy_kwh = random.uniform(10.0, 20.0)
            txn.current_power_kw = random.uniform(5.0, 10.0)
            txn.max_power_kw = random.uniform(10.0, 15.0)
            txn.grid_event_id = None if i > 0 else "grid-event-123"
        
        # Mock getting active transactions
        self.db_session_mock.query().filter().all.return_value = mock_transactions
        
        # Mock telemetry data
        self.grid_service.get_latest_telemetry = MagicMock(side_effect=[
            # Vehicle 1 - continuing normally
            MagicMock(state_of_charge_percent=60, is_connected=True),
            # Vehicle 2 - has completed its energy target
            MagicMock(state_of_charge_percent=30, is_connected=True),
            # Vehicle 3 - disconnected
            MagicMock(state_of_charge_percent=40, is_connected=False)
        ])
        
        # Mock updating transaction
        self.grid_service.update_v2g_transaction_status = MagicMock()
        
        # Call the method under test
        self.grid_service.monitor_active_v2g_transactions(self.db_session_mock)
        
        # Verify update was called for completed and disconnected transactions
        self.assertEqual(self.grid_service.update_v2g_transaction_status.call_count, 2)
        
        # Check updates for completed transaction (the second transaction)
        call_args_list = self.grid_service.update_v2g_transaction_status.call_args_list
        self.assertEqual(call_args_list[0][0][0], self.db_session_mock)
        self.assertEqual(call_args_list[0][0][1], mock_transactions[1].id)
        self.assertEqual(call_args_list[0][0][2]["status"], V2GTransactionStatus.COMPLETED)
        
        # Check updates for disconnected transaction (the third transaction)
        self.assertEqual(call_args_list[1][0][0], self.db_session_mock)
        self.assertEqual(call_args_list[1][0][1], mock_transactions[2].id)
        self.assertEqual(call_args_list[1][0][2]["status"], V2GTransactionStatus.FAILED)

if __name__ == '__main__':
    unittest.main() 