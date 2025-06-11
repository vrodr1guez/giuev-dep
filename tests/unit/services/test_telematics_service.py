import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.services.telematics_service import CRUDTelematics, telematics_service
from app.models.telematics import TelematicsData
from app.schemas.telematics import TelematicsDataCreate, TelematicsDataUpdate

class TestCRUDTelematics(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_telematics = CRUDTelematics()

    def test_create_telematics_data(self):
        now = datetime.now(timezone.utc)
        telematics_create_schema = TelematicsDataCreate(
            vehicle_id=1,
            timestamp=now,
            latitude=Decimal("34.0522"),
            longitude=Decimal("-118.2437"),
            speed_kmh=Decimal("60.5"),
            state_of_charge_percent=Decimal("75.5"),
            battery_temperature_celsius=Decimal("25.0"),
            odometer_km=Decimal("12345.6")
        )
        
        created_telematics_mock = TelematicsData(
            id=1,
            vehicle_id=telematics_create_schema.vehicle_id,
            timestamp=telematics_create_schema.timestamp,
            latitude=telematics_create_schema.latitude,
            longitude=telematics_create_schema.longitude,
            speed_kmh=telematics_create_schema.speed_kmh,
            state_of_charge_percent=telematics_create_schema.state_of_charge_percent,
            battery_temperature_celsius=telematics_create_schema.battery_temperature_celsius,
            odometer_km=telematics_create_schema.odometer_km
        )

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_telematics_mock.id)

        new_telematics_data = self.crud_telematics.create_telematics_data(self.db_session_mock, obj_in=telematics_create_schema)
            
        self.db_session_mock.add.assert_called_once()
        added_object = self.db_session_mock.add.call_args[0][0]
        self.assertEqual(added_object.vehicle_id, telematics_create_schema.vehicle_id)
        self.assertEqual(added_object.latitude, telematics_create_schema.latitude)
        
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()
        
        self.assertEqual(new_telematics_data.vehicle_id, telematics_create_schema.vehicle_id)
        self.assertIsNotNone(new_telematics_data.id)
        self.assertEqual(new_telematics_data.state_of_charge_percent, telematics_create_schema.state_of_charge_percent)

    def test_get_telematics_data_by_vehicle_id(self):
        vehicle_id = 1
        now = datetime.now(timezone.utc)
        mock_data = [
            TelematicsData(id=1, vehicle_id=vehicle_id, timestamp=now, speed_kmh=Decimal("50.0")),
            TelematicsData(id=2, vehicle_id=vehicle_id, timestamp=now, speed_kmh=Decimal("55.0"))
        ]
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.vehicle_id == vehicle_id).order_by(TelematicsData.timestamp.desc()).offset(0).limit(100).all.return_value = mock_data

        telematics_list = self.crud_telematics.get_telematics_data_by_vehicle_id(
            self.db_session_mock, vehicle_id=vehicle_id, skip=0, limit=100
        )

        self.assertEqual(len(telematics_list), 2)
        self.assertEqual(telematics_list[0].speed_kmh, Decimal("50.0"))
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.vehicle_id == vehicle_id).order_by(TelematicsData.timestamp.desc()).offset(0).limit(100).all.assert_called_once()

    def test_get_latest_telematics_data_for_vehicle(self):
        vehicle_id = 1
        now = datetime.now(timezone.utc)
        mock_latest_data = TelematicsData(
            id=3, 
            vehicle_id=vehicle_id, 
            timestamp=now,
            speed_kmh=Decimal("70.0"), 
            state_of_charge_percent=Decimal("65.0"),
            latitude=Decimal("34.0522"),
            longitude=Decimal("-118.2437")
        )
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.vehicle_id == vehicle_id).order_by(TelematicsData.timestamp.desc()).first.return_value = mock_latest_data

        latest_data = self.crud_telematics.get_latest_telematics_data_for_vehicle(self.db_session_mock, vehicle_id=vehicle_id)

        self.assertIsNotNone(latest_data)
        self.assertEqual(latest_data.speed_kmh, Decimal("70.0"))
        self.assertEqual(latest_data.state_of_charge_percent, Decimal("65.0"))
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.vehicle_id == vehicle_id).order_by(TelematicsData.timestamp.desc()).first.assert_called_once()

    def test_get_telematics_data_by_id(self):
        telematics_id = 1
        mock_data = TelematicsData(
            id=telematics_id, 
            vehicle_id=1, 
            timestamp=datetime.now(timezone.utc), 
            speed_kmh=Decimal("40.0")
        )
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.id == telematics_id).first.return_value = mock_data

        retrieved_data = self.crud_telematics.get_telematics_data(self.db_session_mock, telematics_id=telematics_id)

        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data.id, telematics_id)
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.id == telematics_id).first.assert_called_once()

    def test_get_telematics_data_by_id_not_found(self):
        telematics_id = 999
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.id == telematics_id).first.return_value = None
        
        retrieved_data = self.crud_telematics.get_telematics_data(self.db_session_mock, telematics_id=telematics_id)
        
        self.assertIsNone(retrieved_data)
        self.db_session_mock.query(TelematicsData).filter(TelematicsData.id == telematics_id).first.assert_called_once()

    def test_get_telematics_data_by_time_range(self):
        vehicle_id = 1
        start_time = datetime(2023, 6, 1, tzinfo=timezone.utc)
        end_time = datetime(2023, 6, 2, tzinfo=timezone.utc)
        
        mock_data = [
            TelematicsData(id=1, vehicle_id=vehicle_id, timestamp=datetime(2023, 6, 1, 10, 0, tzinfo=timezone.utc)),
            TelematicsData(id=2, vehicle_id=vehicle_id, timestamp=datetime(2023, 6, 1, 14, 0, tzinfo=timezone.utc))
        ]
        
        self.db_session_mock.query(TelematicsData).filter(
            TelematicsData.vehicle_id == vehicle_id,
            TelematicsData.timestamp >= start_time,
            TelematicsData.timestamp <= end_time
        ).order_by(TelematicsData.timestamp).all.return_value = mock_data
        
        result = self.crud_telematics.get_telematics_data_by_time_range(
            self.db_session_mock, 
            vehicle_id=vehicle_id,
            start_time=start_time,
            end_time=end_time
        )
        
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].id, 1)
        self.assertEqual(result[1].id, 2)

if __name__ == '__main__':
    unittest.main() 