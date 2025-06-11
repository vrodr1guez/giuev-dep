import unittest
from unittest.mock import patch, MagicMock, PropertyMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json
from datetime import datetime, timedelta

# Add the project root to the Python path
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from app.main import app
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.organization import Organization
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.core.security import get_password_hash, create_access_token
from app.services.user_service import user_service
from app.services.vehicle_service import vehicle_service
from app.api import deps


class MockDBSession:
    """A more sophisticated DB session mock that simulates session operations."""
    
    def __init__(self):
        self.committed = False
        self.rolled_back = False
        self.closed = False
        self._query_results = {}  # Mock query results
        self._added_objects = []
        
    def add(self, obj):
        """Simulate adding an object to the session."""
        self._added_objects.append(obj)
        
    def commit(self):
        """Simulate committing the session."""
        self.committed = True
        
    def rollback(self):
        """Simulate rolling back the session."""
        self.rolled_back = True
        
    def close(self):
        """Simulate closing the session."""
        self.closed = True
        
    def query(self, model):
        """Return a mock query object that can be chained."""
        return MockQuery(self, model)
        
    def register_query_result(self, model, filters, result):
        """Register a result for a specific query."""
        key = (model, tuple(filters) if filters else None)
        self._query_results[key] = result


class MockQuery:
    """Mock SQLAlchemy query object that supports method chaining."""
    
    def __init__(self, session, model):
        self.session = session
        self.model = model
        self._filters = []
        
    def filter(self, *criterion):
        """Add filter criteria and return self for chaining."""
        self._filters.extend(criterion)
        return self
        
    def first(self):
        """Return the first result or None."""
        results = self.all()
        return results[0] if results else None
        
    def all(self):
        """Return all results for the query."""
        key = (self.model, tuple(self._filters) if self._filters else None)
        return self.session._query_results.get(key, [])
        
    def get(self, id_value):
        """Simulate get by primary key."""
        for key, results in self.session._query_results.items():
            if key[0] == self.model:
                for result in results:
                    if hasattr(result, 'id') and result.id == id_value:
                        return result
        return None


# Override database dependency with our mock
def get_test_db():
    """Provide a mock database session for testing."""
    db = MockDBSession()
    try:
        yield db
    finally:
        db.close()


# Mock current user dependency for authenticated endpoints
async def get_current_test_user():
    """Return a mock user for testing authenticated endpoints."""
    test_user = User(
        id=1,
        email="testuser@example.com",
        hashed_password=get_password_hash("password123"),
        first_name="Test",
        last_name="User",
        is_active=True,
        is_superuser=False,
        organization_id=1
    )
    return test_user


async def get_current_test_admin():
    """Return a mock admin user for testing admin-only endpoints."""
    admin_user = User(
        id=2,
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass"),
        first_name="Admin",
        last_name="User",
        is_active=True,
        is_superuser=True,
        organization_id=1
    )
    return admin_user


# Override authentication dependencies
app.dependency_overrides[get_db] = get_test_db
app.dependency_overrides[deps.get_current_active_user] = get_current_test_user
app.dependency_overrides[deps.get_current_active_superuser] = get_current_test_admin

client = TestClient(app)


class TestVehicleAPI(unittest.TestCase):
    """Test suite for vehicle-related API endpoints."""

    def setUp(self):
        """Set up test fixtures before each test."""
        self.db_mock = next(get_test_db())
        
        # Common test data
        self.test_org = Organization(
            id=1,
            name="Test Organization",
            description="Test organization for API tests"
        )
        
        self.test_vehicles = [
            Vehicle(
                id=1,
                make="Tesla",
                model="Model 3",
                year=2022,
                vin="5YJ3E1EA1NF123456",
                license_plate="ABC123",
                organization_id=1,
                battery_capacity_kwh=75.0,
                range_km=500,
                current_soc_percent=85.0,
                status="available"
            ),
            Vehicle(
                id=2,
                make="Chevrolet",
                model="Bolt",
                year=2021,
                vin="1G1FY6S01M4111111",
                license_plate="XYZ789",
                organization_id=1,
                battery_capacity_kwh=65.0,
                range_km=400,
                current_soc_percent=75.0,
                status="charging"
            )
        ]
        
        # Register mock query results
        self.db_mock.register_query_result(Vehicle, None, self.test_vehicles)
        for vehicle in self.test_vehicles:
            self.db_mock.register_query_result(Vehicle, (Vehicle.id == vehicle.id,), [vehicle])
        
        # Setup mock for organization
        self.db_mock.register_query_result(Organization, (Organization.id == 1,), [self.test_org])

    def tearDown(self):
        """Clean up after each test."""
        app.dependency_overrides.clear()
        app.dependency_overrides[get_db] = get_test_db
        app.dependency_overrides[deps.get_current_active_user] = get_current_test_user
        app.dependency_overrides[deps.get_current_active_superuser] = get_current_test_admin

    def test_get_all_vehicles_success(self):
        """Test successfully retrieving all vehicles."""
        # Act
        response = client.get(f"{settings.API_V1_STR}/vehicles/")
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["id"], 1)
        self.assertEqual(data[0]["make"], "Tesla")
        self.assertEqual(data[0]["model"], "Model 3")
        self.assertEqual(data[1]["id"], 2)
        self.assertEqual(data[1]["make"], "Chevrolet")
        self.assertEqual(data[1]["model"], "Bolt")

    def test_get_vehicle_by_id_success(self):
        """Test successfully retrieving a vehicle by ID."""
        # Arrange
        vehicle_id = 1
        
        # Act
        response = client.get(f"{settings.API_V1_STR}/vehicles/{vehicle_id}")
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], vehicle_id)
        self.assertEqual(data["make"], "Tesla")
        self.assertEqual(data["model"], "Model 3")
        self.assertEqual(data["vin"], "5YJ3E1EA1NF123456")
        self.assertEqual(data["organization_id"], 1)

    def test_get_vehicle_by_id_not_found(self):
        """Test retrieving a non-existent vehicle by ID."""
        # Arrange
        non_existent_id = 999
        
        # Act
        response = client.get(f"{settings.API_V1_STR}/vehicles/{non_existent_id}")
        
        # Assert
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("detail", data)
        self.assertIn("not found", data["detail"].lower())

    @patch("app.services.vehicle_service.vehicle_service.create_vehicle")
    def test_create_vehicle_success(self, mock_create_vehicle):
        """Test successfully creating a new vehicle."""
        # Arrange
        new_vehicle_data = {
            "make": "Ford",
            "model": "Mustang Mach-E",
            "year": 2023,
            "vin": "1FMSK8DH3NGA00001",
            "license_plate": "EV-FORD",
            "organization_id": 1,
            "battery_capacity_kwh": 91.0,
            "range_km": 610,
            "current_soc_percent": 100.0,
            "status": "available"
        }
        
        # Create a mock vehicle response
        created_vehicle = Vehicle(
            id=3,
            **new_vehicle_data
        )
        mock_create_vehicle.return_value = created_vehicle
        
        # Act
        response = client.post(
            f"{settings.API_V1_STR}/vehicles/",
            json=new_vehicle_data
        )
        
        # Assert
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["id"], 3)
        self.assertEqual(data["make"], new_vehicle_data["make"])
        self.assertEqual(data["model"], new_vehicle_data["model"])
        self.assertEqual(data["vin"], new_vehicle_data["vin"])
        
        # Verify create_vehicle was called correctly
        mock_create_vehicle.assert_called_once()
        call_args = mock_create_vehicle.call_args
        self.assertEqual(call_args[1]["db"], self.db_mock)
        self.assertIsInstance(call_args[1]["obj_in"], VehicleCreate)
        self.assertEqual(call_args[1]["obj_in"].make, new_vehicle_data["make"])
        self.assertEqual(call_args[1]["obj_in"].model, new_vehicle_data["model"])

    @patch("app.services.vehicle_service.vehicle_service.create_vehicle")
    def test_create_vehicle_validation_error(self, mock_create_vehicle):
        """Test vehicle creation with invalid data."""
        # Arrange - invalid data missing required fields
        invalid_data = {
            "make": "Ford",
            # Missing required model field
            "year": 2023,
            # Missing required VIN field
            "license_plate": "INVALID"
            # Missing other required fields
        }
        
        # Act
        response = client.post(
            f"{settings.API_V1_STR}/vehicles/",
            json=invalid_data
        )
        
        # Assert
        self.assertEqual(response.status_code, 422)
        data = response.json()
        self.assertIn("detail", data)
        
        # Verify create_vehicle was not called
        mock_create_vehicle.assert_not_called()

    @patch("app.services.vehicle_service.vehicle_service.update_vehicle")
    def test_update_vehicle_success(self, mock_update_vehicle):
        """Test successfully updating a vehicle."""
        # Arrange
        vehicle_id = 1
        update_data = {
            "current_soc_percent": 95.0,
            "status": "maintenance",
            "notes": "Scheduled for software update"
        }
        
        # Create a mock updated vehicle
        updated_vehicle = self.test_vehicles[0]
        updated_vehicle.current_soc_percent = 95.0
        updated_vehicle.status = "maintenance"
        updated_vehicle.notes = "Scheduled for software update"
        mock_update_vehicle.return_value = updated_vehicle
        
        # Act
        response = client.patch(
            f"{settings.API_V1_STR}/vehicles/{vehicle_id}",
            json=update_data
        )
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], vehicle_id)
        self.assertEqual(data["current_soc_percent"], 95.0)
        self.assertEqual(data["status"], "maintenance")
        self.assertEqual(data["notes"], "Scheduled for software update")
        
        # Verify update_vehicle was called correctly
        mock_update_vehicle.assert_called_once()
        call_args = mock_update_vehicle.call_args
        self.assertEqual(call_args[1]["db"], self.db_mock)
        self.assertEqual(call_args[1]["id"], vehicle_id)
        self.assertIsInstance(call_args[1]["obj_in"], dict)
        self.assertEqual(call_args[1]["obj_in"]["current_soc_percent"], 95.0)
        self.assertEqual(call_args[1]["obj_in"]["status"], "maintenance")

    @patch("app.services.vehicle_service.vehicle_service.update_vehicle")
    def test_update_vehicle_not_found(self, mock_update_vehicle):
        """Test updating a non-existent vehicle."""
        # Arrange
        non_existent_id = 999
        update_data = {
            "current_soc_percent": 95.0,
            "status": "maintenance"
        }
        
        # Configure mock to simulate not found
        mock_update_vehicle.return_value = None
        
        # Act
        response = client.patch(
            f"{settings.API_V1_STR}/vehicles/{non_existent_id}",
            json=update_data
        )
        
        # Assert
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("detail", data)
        self.assertIn("not found", data["detail"].lower())

    @patch("app.services.vehicle_service.vehicle_service.delete_vehicle")
    def test_delete_vehicle_success(self, mock_delete_vehicle):
        """Test successfully deleting a vehicle."""
        # Arrange
        vehicle_id = 2
        
        # Configure mock to return True for successful deletion
        mock_delete_vehicle.return_value = True
        
        # Act
        response = client.delete(f"{settings.API_V1_STR}/vehicles/{vehicle_id}")
        
        # Assert
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")  # No content in response
        
        # Verify delete_vehicle was called correctly
        mock_delete_vehicle.assert_called_once_with(
            db=self.db_mock,
            id=vehicle_id
        )

    @patch("app.services.vehicle_service.vehicle_service.delete_vehicle")
    def test_delete_vehicle_not_found(self, mock_delete_vehicle):
        """Test deleting a non-existent vehicle."""
        # Arrange
        non_existent_id = 999
        
        # Configure mock to return False for unsuccessful deletion
        mock_delete_vehicle.return_value = False
        
        # Act
        response = client.delete(f"{settings.API_V1_STR}/vehicles/{non_existent_id}")
        
        # Assert
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("detail", data)
        self.assertIn("not found", data["detail"].lower())

    def test_get_vehicles_by_organization(self):
        """Test retrieving vehicles for a specific organization."""
        # Arrange
        organization_id = 1
        
        # Act
        response = client.get(f"{settings.API_V1_STR}/organizations/{organization_id}/vehicles")
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)  # Both test vehicles belong to org 1
        
        # Verify all returned vehicles belong to the requested organization
        for vehicle in data:
            self.assertEqual(vehicle["organization_id"], organization_id)

    @patch("app.services.vehicle_service.vehicle_service.get_vehicle_telemetry")
    def test_get_vehicle_telemetry(self, mock_get_telemetry):
        """Test retrieving telemetry data for a vehicle."""
        # Arrange
        vehicle_id = 1
        
        # Mock telemetry data
        mock_telemetry = {
            "vehicle_id": vehicle_id,
            "timestamp": datetime.now().isoformat(),
            "location": {
                "latitude": 34.0522,
                "longitude": -118.2437
            },
            "speed_kph": 65.5,
            "battery_soc_percent": 82.3,
            "estimated_range_km": 410,
            "power_kw": 15.2,
            "voltage_v": 385.6,
            "current_a": 39.4,
            "battery_temperature_c": 28.5,
            "tire_pressure_kpa": {
                "front_left": 220,
                "front_right": 221,
                "rear_left": 223,
                "rear_right": 222
            }
        }
        mock_get_telemetry.return_value = mock_telemetry
        
        # Act
        response = client.get(f"{settings.API_V1_STR}/vehicles/{vehicle_id}/telemetry")
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["vehicle_id"], vehicle_id)
        self.assertIn("timestamp", data)
        self.assertIn("location", data)
        self.assertIn("battery_soc_percent", data)
        self.assertEqual(data["battery_soc_percent"], 82.3)

    @patch("app.services.vehicle_service.vehicle_service.get_vehicle_by_vin")
    def test_get_vehicle_by_vin(self, mock_get_by_vin):
        """Test retrieving a vehicle by VIN."""
        # Arrange
        test_vin = "5YJ3E1EA1NF123456"
        mock_get_by_vin.return_value = self.test_vehicles[0]  # Tesla Model 3
        
        # Act
        response = client.get(f"{settings.API_V1_STR}/vehicles/vin/{test_vin}")
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["vin"], test_vin)
        self.assertEqual(data["make"], "Tesla")
        self.assertEqual(data["model"], "Model 3")
        
        # Verify service call
        mock_get_by_vin.assert_called_once_with(
            db=self.db_mock,
            vin=test_vin
        )


if __name__ == "__main__":
    unittest.main() 