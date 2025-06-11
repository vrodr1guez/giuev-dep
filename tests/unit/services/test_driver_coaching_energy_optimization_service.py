import unittest
from unittest.mock import MagicMock, patch, call
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.services.driver_coaching_energy_optimization_service import CRUDDriverCoachingEnergyOptimization, driver_coaching_energy_optimization_service
from app.models.driver_coaching_energy_optimization import DrivingEvent, DriverCoachingFeedback, FleetEnergyReport
from app.models.vehicle import Vehicle
from app.schemas.driver_coaching_energy_optimization import (
    DrivingEventCreate, DriverCoachingFeedbackCreate, FleetEnergyReportCreate,
    EDrivingEventType, EFeedbackCategory
)


class TestCRUDDriverCoachingEnergyOptimization(unittest.TestCase):
    """Test suite for Driver Coaching and Energy Optimization service."""

    def setUp(self):
        """Set up test environment before each test."""
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_dceo = CRUDDriverCoachingEnergyOptimization()
        
        # Pre-define common test data
        self.test_vehicle_id = 1
        self.test_driver_id = 1
        self.test_organization_id = 1
        self.current_time = datetime.now(timezone.utc)

    def test_create_driving_event_success(self):
        """Test successful creation of a driving event."""
        # Arrange
        event_create_schema = DrivingEventCreate(
            vehicle_id=self.test_vehicle_id,
            driver_id=self.test_driver_id,
            event_timestamp=self.current_time,
            event_type=EDrivingEventType.HARSH_BRAKING,
            latitude=Decimal("34.0522"),
            longitude=Decimal("-118.2437"),
            speed_kph=Decimal("50.0"),
            details={"g_force": "0.8"}
        )
        created_event_mock = DrivingEvent(id=1, **event_create_schema.model_dump())

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, "id", created_event_mock.id)

        # Act
        new_event = self.crud_dceo.create_driving_event(self.db_session_mock, event_in=event_create_schema)
        
        # Assert
        self.assertEqual(new_event.id, 1)
        self.assertEqual(new_event.event_type, EDrivingEventType.HARSH_BRAKING)
        self.assertEqual(new_event.vehicle_id, self.test_vehicle_id)
        self.assertEqual(new_event.driver_id, self.test_driver_id)
        self.assertEqual(new_event.latitude, Decimal("34.0522"))
        self.assertEqual(new_event.longitude, Decimal("-118.2437"))
        self.assertEqual(new_event.speed_kph, Decimal("50.0"))
        self.assertEqual(new_event.details, {"g_force": "0.8"})
        
        # Verify DB operations
        self.db_session_mock.add.assert_called_once()
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()

    def test_create_driving_event_db_error(self):
        """Test handling of database errors when creating a driving event."""
        # Arrange
        event_create_schema = DrivingEventCreate(
            vehicle_id=self.test_vehicle_id,
            driver_id=self.test_driver_id,
            event_timestamp=self.current_time,
            event_type=EDrivingEventType.SPEEDING,
            latitude=Decimal("34.0522"),
            longitude=Decimal("-118.2437"),
            speed_kph=Decimal("90.0"),
            details={"over_limit_by": "25.0"}
        )
        
        # Simulate a database error during commit
        self.db_session_mock.commit.side_effect = IntegrityError("Mock integrity error", None, None)
        
        # Act & Assert
        with self.assertRaises(IntegrityError):
            self.crud_dceo.create_driving_event(self.db_session_mock, event_in=event_create_schema)
            
        # Verify rollback was called
        self.db_session_mock.rollback.assert_called_once()

    def test_create_driver_coaching_feedback_success(self):
        """Test successful creation of driver coaching feedback."""
        # Arrange
        feedback_create_schema = DriverCoachingFeedbackCreate(
            driver_id=self.test_driver_id,
            feedback_timestamp=self.current_time,
            category=EFeedbackCategory.ENERGY_EFFICIENCY,
            message="Try to maintain a more consistent speed to improve energy efficiency.",
            related_event_id=1  # Optional link to a driving event
        )
        created_feedback_mock = DriverCoachingFeedback(id=1, **feedback_create_schema.model_dump())
        
        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, "id", created_feedback_mock.id)

        # Act
        new_feedback = self.crud_dceo.create_driver_coaching_feedback(self.db_session_mock, feedback_in=feedback_create_schema)
        
        # Assert
        self.assertEqual(new_feedback.id, 1)
        self.assertEqual(new_feedback.driver_id, self.test_driver_id)
        self.assertEqual(new_feedback.category, EFeedbackCategory.ENERGY_EFFICIENCY)
        self.assertEqual(new_feedback.message, "Try to maintain a more consistent speed to improve energy efficiency.")
        self.assertEqual(new_feedback.related_event_id, 1)
        
        # Verify DB operations
        self.db_session_mock.add.assert_called_once()
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()

    def test_create_driver_coaching_feedback_no_related_event(self):
        """Test creation of driver coaching feedback without a related event."""
        # Arrange
        feedback_create_schema = DriverCoachingFeedbackCreate(
            driver_id=self.test_driver_id,
            feedback_timestamp=self.current_time,
            category=EFeedbackCategory.SAFETY,
            message="Your overall safety score has improved this week. Great job!",
            related_event_id=None  # No related event
        )
        created_feedback_mock = DriverCoachingFeedback(id=1, **feedback_create_schema.model_dump())
        
        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, "id", created_feedback_mock.id)

        # Act
        new_feedback = self.crud_dceo.create_driver_coaching_feedback(self.db_session_mock, feedback_in=feedback_create_schema)
        
        # Assert
        self.assertEqual(new_feedback.id, 1)
        self.assertEqual(new_feedback.related_event_id, None)
        self.assertEqual(new_feedback.category, EFeedbackCategory.SAFETY)

    def test_generate_fleet_energy_report_success(self):
        """Test successful creation of a fleet energy report."""
        # Arrange
        report_period_start = self.current_time - timedelta(days=30)
        report_period_end = self.current_time
        
        report_create_schema = FleetEnergyReportCreate(
            organization_id=self.test_organization_id,
            report_period_start=report_period_start,
            report_period_end=report_period_end,
            total_energy_consumed_kwh=Decimal("5000.0"),
            total_distance_km=Decimal("25000.0"),
            average_efficiency_kwh_km=Decimal("0.2"),
            co2_saved_kg=Decimal("3750.0"),
            cost_saved_usd=Decimal("625.0"),
            recommendation="Consider implementing regenerative braking training for drivers."
        )
        created_report_mock = FleetEnergyReport(id=1, **report_create_schema.model_dump())
        
        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, "id", created_report_mock.id)

        # Act
        new_report = self.crud_dceo.create_fleet_energy_report(self.db_session_mock, report_in=report_create_schema)
        
        # Assert
        self.assertEqual(new_report.id, 1)
        self.assertEqual(new_report.organization_id, self.test_organization_id)
        self.assertEqual(new_report.report_period_start, report_period_start)
        self.assertEqual(new_report.report_period_end, report_period_end)
        self.assertEqual(new_report.total_energy_consumed_kwh, Decimal("5000.0"))
        self.assertEqual(new_report.total_distance_km, Decimal("25000.0"))
        self.assertEqual(new_report.average_efficiency_kwh_km, Decimal("0.2"))
        self.assertEqual(new_report.co2_saved_kg, Decimal("3750.0"))
        self.assertEqual(new_report.cost_saved_usd, Decimal("625.0"))
        
        # Verify DB operations
        self.db_session_mock.add.assert_called_once()
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()

    def test_get_driving_events_for_driver_with_events(self):
        """Test retrieving driving events for a driver when events exist."""
        # Arrange
        mock_events = [
            DrivingEvent(
                id=1, 
                driver_id=self.test_driver_id, 
                event_type=EDrivingEventType.SPEEDING,
                event_timestamp=self.current_time - timedelta(days=1)
            ),
            DrivingEvent(
                id=2, 
                driver_id=self.test_driver_id, 
                event_type=EDrivingEventType.HARSH_BRAKING,
                event_timestamp=self.current_time - timedelta(hours=5)
            )
        ]
        
        # Setup mock query chain
        mock_query = self.db_session_mock.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.all.return_value = mock_events

        # Act
        events = self.crud_dceo.get_driving_events_for_driver(self.db_session_mock, driver_id=self.test_driver_id)
        
        # Assert
        self.assertEqual(len(events), 2)
        self.assertEqual(events[0].event_type, EDrivingEventType.SPEEDING)
        self.assertEqual(events[1].event_type, EDrivingEventType.HARSH_BRAKING)
        
        # Verify query construction
        self.db_session_mock.query.assert_called_once_with(DrivingEvent)
        mock_query.filter.assert_called_once()  # Check DrivingEvent.driver_id filter was applied

    def test_get_driving_events_for_driver_no_events(self):
        """Test retrieving driving events for a driver when no events exist."""
        # Arrange
        mock_query = self.db_session_mock.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.all.return_value = []  # No events found
        
        # Act
        events = self.crud_dceo.get_driving_events_for_driver(self.db_session_mock, driver_id=self.test_driver_id)
        
        # Assert
        self.assertEqual(len(events), 0)
        self.assertIsInstance(events, list)

    def test_get_coaching_feedback_for_driver_with_feedback(self):
        """Test retrieving coaching feedback for a driver when feedback exists."""
        # Arrange
        mock_feedback = [
            DriverCoachingFeedback(
                id=1, 
                driver_id=self.test_driver_id, 
                category=EFeedbackCategory.SAFETY,
                feedback_timestamp=self.current_time - timedelta(days=7)
            ),
            DriverCoachingFeedback(
                id=2, 
                driver_id=self.test_driver_id, 
                category=EFeedbackCategory.ENERGY_EFFICIENCY,
                feedback_timestamp=self.current_time - timedelta(days=1)
            )
        ]
        
        # Setup mock query chain
        mock_query = self.db_session_mock.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.all.return_value = mock_feedback
        
        # Act
        feedback_list = self.crud_dceo.get_coaching_feedback_for_driver(self.db_session_mock, driver_id=self.test_driver_id)
        
        # Assert
        self.assertEqual(len(feedback_list), 2)
        self.assertEqual(feedback_list[0].category, EFeedbackCategory.SAFETY)
        self.assertEqual(feedback_list[1].category, EFeedbackCategory.ENERGY_EFFICIENCY)

    def test_get_coaching_feedback_for_driver_with_filters(self):
        """Test retrieving coaching feedback with category filter."""
        # Arrange - assuming the service supports filtering by category
        mock_feedback = [
            DriverCoachingFeedback(
                id=2, 
                driver_id=self.test_driver_id, 
                category=EFeedbackCategory.ENERGY_EFFICIENCY,
                feedback_timestamp=self.current_time - timedelta(days=1)
            )
        ]
        
        # Setup mock query chain with multiple filters
        mock_query = self.db_session_mock.query.return_value
        mock_filter1 = mock_query.filter.return_value
        mock_filter2 = mock_filter1.filter.return_value
        mock_filter2.all.return_value = mock_feedback
        
        # Act
        feedback_list = self.crud_dceo.get_coaching_feedback_for_driver(
            self.db_session_mock, 
            driver_id=self.test_driver_id,
            category=EFeedbackCategory.ENERGY_EFFICIENCY
        )
        
        # Assert
        self.assertEqual(len(feedback_list), 1)
        self.assertEqual(feedback_list[0].category, EFeedbackCategory.ENERGY_EFFICIENCY)

    def test_analyze_driving_patterns(self):
        """Test analyzing driving patterns for a driver."""
        # Arrange
        driver_id = self.test_driver_id
        mock_events = [
            DrivingEvent(
                id=1, 
                driver_id=driver_id, 
                event_type=EDrivingEventType.SPEEDING,
                event_timestamp=self.current_time - timedelta(days=10),
                speed_kph=Decimal("95.0")
            ),
            DrivingEvent(
                id=2, 
                driver_id=driver_id, 
                event_type=EDrivingEventType.HARSH_BRAKING,
                event_timestamp=self.current_time - timedelta(days=5),
                speed_kph=Decimal("45.0")
            ),
            DrivingEvent(
                id=3, 
                driver_id=driver_id, 
                event_type=EDrivingEventType.HARSH_ACCELERATION,
                event_timestamp=self.current_time - timedelta(days=2),
                speed_kph=Decimal("30.0")
            )
        ]
        
        # Setup mock for get_driving_events_for_driver
        with patch.object(self.crud_dceo, "get_driving_events_for_driver", return_value=mock_events):
            # Act
            analysis_result = self.crud_dceo.analyze_driving_patterns(self.db_session_mock, driver_id=driver_id)
            
            # Assert
            self.assertIsInstance(analysis_result, dict)
            self.assertIn("summary", analysis_result)
            self.assertIn("event_counts", analysis_result)
            self.assertIn("trends", analysis_result)
            
            # Verify the event counts are correctly calculated
            self.assertEqual(analysis_result["event_counts"][EDrivingEventType.SPEEDING], 1)
            self.assertEqual(analysis_result["event_counts"][EDrivingEventType.HARSH_BRAKING], 1)
            self.assertEqual(analysis_result["event_counts"][EDrivingEventType.HARSH_ACCELERATION], 1)

    def test_suggest_energy_optimization_strategies(self):
        """Test suggesting energy optimization strategies for an organization."""
        # Arrange
        organization_id = self.test_organization_id
        mock_reports = [
            FleetEnergyReport(
                id=1,
                organization_id=organization_id,
                report_period_start=self.current_time - timedelta(days=90),
                report_period_end=self.current_time - timedelta(days=60),
                total_energy_consumed_kwh=Decimal("6000.0"),
                total_distance_km=Decimal("24000.0"),
                average_efficiency_kwh_km=Decimal("0.25")
            ),
            FleetEnergyReport(
                id=2,
                organization_id=organization_id,
                report_period_start=self.current_time - timedelta(days=60),
                report_period_end=self.current_time - timedelta(days=30),
                total_energy_consumed_kwh=Decimal("5500.0"),
                total_distance_km=Decimal("25000.0"),
                average_efficiency_kwh_km=Decimal("0.22")
            ),
            FleetEnergyReport(
                id=3,
                organization_id=organization_id,
                report_period_start=self.current_time - timedelta(days=30),
                report_period_end=self.current_time,
                total_energy_consumed_kwh=Decimal("5000.0"),
                total_distance_km=Decimal("25000.0"),
                average_efficiency_kwh_km=Decimal("0.20")
            )
        ]
        
        # Setup mock for get_fleet_energy_reports_for_organization
        with patch.object(self.crud_dceo, "get_fleet_energy_reports_for_organization", return_value=mock_reports):
            # Act
            strategies = self.crud_dceo.suggest_energy_optimization_strategies(self.db_session_mock, organization_id=organization_id)
            
            # Assert
            self.assertIsInstance(strategies, list)
            self.assertTrue(len(strategies) > 0, "Should suggest at least one strategy")
            
            # Check that the improvement trend is recognized
            trend_identified = any("improving" in strategy.lower() for strategy in strategies)
            self.assertTrue(trend_identified, "Should identify the improving efficiency trend")

    def test_get_fleet_energy_reports_with_date_range(self):
        """Test retrieving fleet energy reports with date range filter."""
        # Arrange
        organization_id = self.test_organization_id
        start_date = self.current_time - timedelta(days=30)
        end_date = self.current_time
        
        mock_reports = [
            FleetEnergyReport(
                id=3,
                organization_id=organization_id,
                report_period_start=start_date,
                report_period_end=end_date,
                total_energy_consumed_kwh=Decimal("5000.0"),
                total_distance_km=Decimal("25000.0"),
                average_efficiency_kwh_km=Decimal("0.20")
            )
        ]
        
        # Setup mock query chain
        mock_query = self.db_session_mock.query.return_value
        mock_filter1 = mock_query.filter.return_value
        mock_filter2 = mock_filter1.filter.return_value
        mock_filter3 = mock_filter2.filter.return_value
        mock_filter3.all.return_value = mock_reports
        
        # Act
        reports = self.crud_dceo.get_fleet_energy_reports_for_organization(
            self.db_session_mock,
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Assert
        self.assertEqual(len(reports), 1)
        self.assertEqual(reports[0].organization_id, organization_id)
        self.assertEqual(reports[0].report_period_start, start_date)
        self.assertEqual(reports[0].report_period_end, end_date)


if __name__ == '__main__':
    unittest.main() 