import unittest
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from app.services.vehicle_service import CRUDVehicle, vehicle_service
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

class TestCRUDVehicle(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_vehicle = CRUDVehicle() # Test the class directly

    def test_get_vehicle_by_vin(self):
        mock_vehicle = Vehicle(id=1, vin="TESTVIN123", make="TestMake", model="TestModel")
        self.db_session_mock.query(Vehicle).filter(Vehicle.vin == "TESTVIN123").first.return_value = mock_vehicle

        vehicle = self.crud_vehicle.get_vehicle_by_vin(self.db_session_mock, vin="TESTVIN123")
        
        self.assertIsNotNone(vehicle)
        self.assertEqual(vehicle.vin, "TESTVIN123")
        self.db_session_mock.query(Vehicle).filter(Vehicle.vin == "TESTVIN123").first.assert_called_once()

    def test_get_vehicle_by_vin_not_found(self):
        self.db_session_mock.query(Vehicle).filter(Vehicle.vin == "NONEXISTENTVIN").first.return_value = None
        vehicle = self.crud_vehicle.get_vehicle_by_vin(self.db_session_mock, vin="NONEXISTENTVIN")
        self.assertIsNone(vehicle)

    def test_create_vehicle(self):
        vehicle_create_schema = VehicleCreate(
            vin="NEWVIN456", 
            make="NewMake",
            model="NewModel",
            year=2023,
            license_plate="NEWLP123",
            battery_capacity_kwh=75.0,
            nominal_range_km=400.0,
            organization_id=1
        )
        
        created_vehicle_mock = Vehicle(
            id=2,
            vin=vehicle_create_schema.vin,
            make=vehicle_create_schema.make,
            model=vehicle_create_schema.model,
            year=vehicle_create_schema.year,
            license_plate=vehicle_create_schema.license_plate,
            battery_capacity_kwh=vehicle_create_schema.battery_capacity_kwh,
            nominal_range_km=vehicle_create_schema.nominal_range_km,
            organization_id=vehicle_create_schema.organization_id
        )

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_vehicle_mock.id)

        new_vehicle = self.crud_vehicle.create_vehicle(self.db_session_mock, obj_in=vehicle_create_schema)
            
        self.db_session_mock.add.assert_called_once()
        added_object = self.db_session_mock.add.call_args[0][0]
        self.assertEqual(added_object.vin, vehicle_create_schema.vin)
        self.assertEqual(added_object.make, vehicle_create_schema.make)
        self.assertEqual(added_object.model, vehicle_create_schema.model)
        
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()
        
        self.assertEqual(new_vehicle.vin, vehicle_create_schema.vin)
        self.assertIsNotNone(new_vehicle.id)
        self.assertEqual(new_vehicle.make, vehicle_create_schema.make)
        self.assertEqual(new_vehicle.model, vehicle_create_schema.model)

    def test_get_vehicles_by_organization(self):
        mock_vehicles = [
            Vehicle(id=1, vin="ORGVEH1", organization_id=1, make="Make1", model="Model1"),
            Vehicle(id=2, vin="ORGVEH2", organization_id=1, make="Make2", model="Model2")
        ]
        self.db_session_mock.query(Vehicle).filter(Vehicle.organization_id == 1).offset(0).limit(100).all.return_value = mock_vehicles

        vehicles = self.crud_vehicle.get_vehicles_by_organization(self.db_session_mock, organization_id=1, skip=0, limit=100)

        self.assertEqual(len(vehicles), 2)
        self.assertEqual(vehicles[0].vin, "ORGVEH1")
        self.db_session_mock.query(Vehicle).filter(Vehicle.organization_id == 1).offset(0).limit(100).all.assert_called_once()

    def test_update_vehicle(self):
        existing_vehicle = Vehicle(id=1, vin="OLDVIN", make="OldMake", model="OldModel", year=2020, license_plate="OLDLP", organization_id=1)
        vehicle_update_schema = VehicleUpdate(make="UpdatedMake", model="UpdatedModel", year=2022)

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.return_value = None

        updated_vehicle = self.crud_vehicle.update_vehicle(self.db_session_mock, db_obj=existing_vehicle, obj_in=vehicle_update_schema)

        self.db_session_mock.add.assert_called_once_with(existing_vehicle)
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once_with(existing_vehicle)

        self.assertEqual(updated_vehicle.make, "UpdatedMake")
        self.assertEqual(updated_vehicle.model, "UpdatedModel")
        self.assertEqual(updated_vehicle.year, 2022)

    def test_delete_vehicle(self):
        vehicle_to_delete = Vehicle(id=1, vin="DELVIN1", make="DeleteMake", model="DeleteModel")
        self.db_session_mock.query(Vehicle).get(1).return_value = vehicle_to_delete
        self.db_session_mock.delete.return_value = None
        self.db_session_mock.commit.return_value = None

        deleted_vehicle = self.crud_vehicle.delete_vehicle(self.db_session_mock, vehicle_id=1)

        self.db_session_mock.query(Vehicle).get.assert_called_once_with(1)
        self.db_session_mock.delete.assert_called_once_with(vehicle_to_delete)
        self.db_session_mock.commit.assert_called_once()
        self.assertEqual(deleted_vehicle, vehicle_to_delete)

    def test_delete_vehicle_not_found(self):
        self.db_session_mock.query(Vehicle).get(99).return_value = None
        deleted_vehicle = self.crud_vehicle.delete_vehicle(self.db_session_mock, vehicle_id=99)
        self.assertIsNone(deleted_vehicle)
        self.db_session_mock.delete.assert_not_called()

if __name__ == '__main__':
    unittest.main() 