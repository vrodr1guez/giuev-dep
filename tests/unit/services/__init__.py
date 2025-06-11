"""
Service Unit Tests Package

This package contains unit tests for the application's service layer.
Services represent the core business logic of the application and should be
thoroughly tested in isolation from external dependencies.

Service tests should:
1. Mock all external dependencies (database, APIs, etc.)
2. Test various scenarios (success, failure, edge cases)
3. Verify correct error handling and validation
"""

import pytest
from unittest import mock
from datetime import datetime, timedelta

# Service test constants
TEST_ORGANIZATION_ID = 1
TEST_VEHICLE_ID = 1
TEST_CHARGING_STATION_ID = 1

# Mock service data fixtures
@pytest.fixture
def mock_vehicle_data():
    """Return mock vehicle data for testing."""
    return {
        "id": TEST_VEHICLE_ID,
        "vin": "1HGCM82633A123456",
        "license_plate": "TEST123",
        "make": "Tesla",
        "model": "Model Y",
        "year": 2023,
        "battery_capacity_kwh": 75.0,
        "nominal_range_km": 450.0,
        "organization_id": TEST_ORGANIZATION_ID,
        "status": "active",
        "created_at": datetime.utcnow() - timedelta(days=30),
        "updated_at": datetime.utcnow()
    }

@pytest.fixture
def mock_charging_station_data():
    """Return mock charging station data for testing."""
    return {
        "id": TEST_CHARGING_STATION_ID,
        "name": "Test Station",
        "location_description": "Test Location",
        "latitude": 45.4215,
        "longitude": -75.6972,
        "organization_id": TEST_ORGANIZATION_ID,
        "status": "active",
        "is_public": True,
        "created_at": datetime.utcnow() - timedelta(days=60),
        "updated_at": datetime.utcnow()
    }

@pytest.fixture
def mock_charging_optimization_request():
    """Return mock charging optimization request data for testing."""
    now = datetime.utcnow()
    return {
        "vehicle_id": TEST_VEHICLE_ID,
        "charging_station_id": TEST_CHARGING_STATION_ID,
        "current_soc": 30.0,
        "target_soc": 80.0,
        "departure_time": (now + timedelta(hours=8)).isoformat(),
        "max_charging_rate_kw": 11.0,
        "consider_electricity_cost": True,
        "consider_grid_load": True,
        "priority": "balanced"
    } 