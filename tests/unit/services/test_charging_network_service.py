import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.services.charging_network_service import CRUDChargingNetwork, charging_network_service
from app.models.charging_network import ChargingStation, ChargingSession, Connector, ConnectorStatus, ChargingStationStatus
from app.schemas.charging_network import (
    ChargingStationCreate, ChargingStationUpdate, 
    ConnectorCreate, ConnectorUpdate, 
    ChargingSessionCreate, ChargingSessionUpdate,
    EConnectorType, EChargingCapability
)

class TestCRUDChargingNetwork(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_cn = CRUDChargingNetwork()

    def test_create_charging_station(self):
        station_create_schema = ChargingStationCreate(
            name="Central Charging Hub",
            address="123 Main St",
            city="Anytown",
            state="CA",
            zip_code="90210",
            latitude=Decimal("34.0522"),
            longitude=Decimal("-118.2437"),
            operator_name="ChargeOperator Inc.",
            status=ChargingStationStatus.AVAILABLE,
            organization_id=1 # Assuming an organization owns/manages this
        )
        
        created_station_mock = ChargingStation(
            id=1,
            **station_create_schema.model_dump()
        )

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_station_mock.id)

        new_station = self.crud_cn.create_charging_station(self.db_session_mock, station_in=station_create_schema)
            
        self.db_session_mock.add.assert_called_once()
        added_object = self.db_session_mock.add.call_args[0][0]
        self.assertEqual(added_object.name, station_create_schema.name)
        
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()
        
        self.assertEqual(new_station.name, station_create_schema.name)
        self.assertIsNotNone(new_station.id)
        self.assertEqual(new_station.status, ChargingStationStatus.AVAILABLE)

    def test_get_charging_station(self):
        station_id = 1
        mock_station = ChargingStation(id=station_id, name="Test Station")
        self.db_session_mock.query(ChargingStation).filter(ChargingStation.id == station_id).first.return_value = mock_station

        retrieved_station = self.crud_cn.get_charging_station(self.db_session_mock, station_id=station_id)

        self.assertIsNotNone(retrieved_station)
        self.assertEqual(retrieved_station.id, station_id)
        self.db_session_mock.query(ChargingStation).filter(ChargingStation.id == station_id).first.assert_called_once()

    def test_get_charging_stations_by_location(self):
        # This method is more complex and involves geospatial queries in a real scenario.
        # For a unit test, we mock the query result.
        mock_stations = [ChargingStation(id=1, name="Nearby Station")]
        self.db_session_mock.query(ChargingStation).filter(True).limit(10).all.return_value = mock_stations # Simplified filter

        stations = self.crud_cn.get_charging_stations_by_location(
            self.db_session_mock, latitude=Decimal("34.0"), longitude=Decimal("-118.0"), radius_km=5
        )
        self.assertEqual(len(stations), 1)
        # Add more specific assertions if the filter logic was more detailed in the mock

    def test_create_connector(self):
        connector_create_schema = ConnectorCreate(
            station_id=1,
            connector_id_external="C1",
            connector_type=EConnectorType.CCS_TYPE_2,
            max_power_kw=Decimal("50.0"),
            status=ConnectorStatus.AVAILABLE,
            capabilities=[EChargingCapability.RFID_READER]
        )
        created_connector_mock = Connector(id=1, **connector_create_schema.model_dump())

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_connector_mock.id)

        new_connector = self.crud_cn.create_connector(self.db_session_mock, connector_in=connector_create_schema)
        self.assertIsNotNone(new_connector.id)
        self.assertEqual(new_connector.connector_id_external, "C1")

    def test_start_charging_session(self):
        session_create_schema = ChargingSessionCreate(
            vehicle_id=1,
            connector_id=1,
            user_id=1,
            # start_time is set by the service
        )
        # Mock the connector to be available
        mock_connector = Connector(id=1, station_id=1, status=ConnectorStatus.AVAILABLE)
        with patch.object(self.crud_cn, "get_connector", return_value=mock_connector):
            created_session_mock = ChargingSession(id=1, vehicle_id=1, connector_id=1, status="STARTED")
            self.db_session_mock.add.return_value = None
            self.db_session_mock.commit.return_value = None
            self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_session_mock.id)

            new_session = self.crud_cn.start_charging_session(self.db_session_mock, session_in=session_create_schema)
            self.assertIsNotNone(new_session.id)
            self.assertEqual(new_session.status, "STARTED")
            self.assertEqual(mock_connector.status, ConnectorStatus.CHARGING) # Check connector status update

    def test_stop_charging_session(self):
        session_id = 1
        mock_session = ChargingSession(
            id=session_id, vehicle_id=1, connector_id=1, status="STARTED", 
            start_time=datetime.now(timezone.utc) - timedelta(minutes=30)
        )
        mock_connector = Connector(id=1, station_id=1, status=ConnectorStatus.CHARGING)
        
        with patch.object(self.crud_cn, "get_charging_session", return_value=mock_session),
             patch.object(self.crud_cn, "get_connector", return_value=mock_connector):
            
            self.db_session_mock.add.return_value = None
            self.db_session_mock.commit.return_value = None
            self.db_session_mock.refresh.return_value = None

            stopped_session = self.crud_cn.stop_charging_session(self.db_session_mock, session_id=session_id, final_soc_percentage=Decimal("85.0"))
            self.assertIsNotNone(stopped_session.end_time)
            self.assertEqual(stopped_session.status, "COMPLETED")
            self.assertEqual(stopped_session.final_soc_percentage, Decimal("85.0"))
            self.assertIsNotNone(stopped_session.energy_consumed_kwh)
            self.assertEqual(mock_connector.status, ConnectorStatus.AVAILABLE) # Check connector status update

if __name__ == '__main__':
    unittest.main() 