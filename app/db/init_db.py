from sqlalchemy.orm import Session
import logging

from app.models.charging_station import (
    ChargingStation, ChargingConnector, ChargingConnectorType, ChargingStationStatus
)

# Add these imports if they are not already present at the top of the file
from app.models.role import Role, RoleName
from app.models.user import User
from app.models.organization import Organization
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.telematics import TelematicsData
from app.core.security import get_password_hash # Assuming this is where get_password_hash is

logger = logging.getLogger(__name__)

# Make sure the functions being called are defined or imported
# Example for create_roles, create_users, etc.
# These functions should ideally be in their own service/crud files and imported here.

# Placeholder for actual functions if not defined elsewhere in this file or imported
def create_roles(db: Session):
    logger.info("Checking/creating roles...")
    existing_roles = {role.name for role in db.query(Role).all()}
    for role_name in RoleName:
        if role_name.value not in existing_roles:
            db_role = Role(name=role_name.value, description=f"{role_name.value.capitalize()} role")
            db.add(db_role)
    db.commit()
    logger.info("Roles checked/created.")

def create_users(db: Session):
    logger.info("Checking/creating sample users...")
    admin_role = db.query(Role).filter(Role.name == RoleName.ADMIN).first()
    user_role = db.query(Role).filter(Role.name == RoleName.USER).first()

    if not admin_role or not user_role:
        logger.error("Admin or User role not found. Please create roles first.")
        return

    users_to_create = [
        {"email": "admin@example.com", "full_name": "Admin User", "hashed_password": get_password_hash("adminpassword"), "roles": [admin_role, user_role], "is_active": True, "is_superuser": True},
        {"email": "user1@example.com", "full_name": "Regular User One", "hashed_password": get_password_hash("userpassword1"), "roles": [user_role], "is_active": True},
        {"email": "user2@example.com", "full_name": "Regular User Two", "hashed_password": get_password_hash("userpassword2"), "roles": [user_role], "is_active": True},
    ]

    for user_data in users_to_create:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            db_user = User(
                email=user_data["email"],
                full_name=user_data.get("full_name"),
                hashed_password=user_data["hashed_password"],
                is_active=user_data.get("is_active", True),
                is_superuser=user_data.get("is_superuser", False),
                roles=user_data["roles"]
            )
            db.add(db_user)
    db.commit()
    logger.info("Sample users checked/created.")

def create_sample_organizations(db: Session):
    logger.info("Checking/creating sample organizations...")
    if not db.query(Organization).first():
        org1 = Organization(name="GreenFuture Charging", description="Leading provider of EV charging solutions")
        org2 = Organization(name="City EV Fleet Services", description="Municipal EV fleet management")
        db.add_all([org1, org2])
        db.commit()
    logger.info("Sample organizations checked/created.")

def create_sample_vehicles(db: Session):
    logger.info("Checking/creating sample vehicles...")
    org1 = db.query(Organization).first() # Get first org for simplicity
    user1 = db.query(User).filter(User.email == "user1@example.com").first()

    if not db.query(Vehicle).first() and org1 and user1:
        vehicles_to_create = [
            {"make": "Tesla", "model": "Model 3", "year": 2022, "license_plate": "EV001", "vin": "TESLA001XYZ", "organization_id": org1.id, "user_id": user1.id, "status": VehicleStatus.ACTIVE, "battery_capacity_kwh": 75.0},
            {"make": "Nissan", "model": "Leaf", "year": 2023, "license_plate": "EV002", "vin": "NISSAN002ABC", "organization_id": org1.id, "user_id": user1.id, "status": VehicleStatus.IN_MAINTENANCE, "battery_capacity_kwh": 40.0},
        ]
        for v_data in vehicles_to_create:
            db.add(Vehicle(**v_data))
        db.commit()
    logger.info("Sample vehicles checked/created.")

def create_sample_telematics(db: Session):
    logger.info("Checking/creating sample telematics data...")
    vehicle1 = db.query(Vehicle).filter(Vehicle.license_plate == "EV001").first()
    if not db.query(TelematicsData).first() and vehicle1:
        telematics1 = TelematicsData(vehicle_id=vehicle1.id, latitude=40.7128, longitude=-74.0060, speed_kmh=0, state_of_charge_percent=80.5, battery_temperature_c=25.0, is_charging=False)
        db.add(telematics1)
        db.commit()
    logger.info("Sample telematics data checked/created.")

# Add sample charging stations
def create_sample_charging_stations(db: Session) -> None:
    """Create sample charging stations with connectors."""
    
    # Check if we already have charging stations
    station = db.query(ChargingStation).first()
    if station:
        logger.info("Charging stations already initialized")
        return
    
    logger.info("Creating sample charging stations")
    
    # Create sample charging stations for organization 1
    stations = [
        {
            "name": "Downtown Fast Charging Hub",
            "description": "24/7 fast charging station in downtown",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "address": "123 Main St",
            "city": "New York",
            "state": "NY",
            "country": "USA",
            "zip_code": "10001",
            "status": ChargingStationStatus.AVAILABLE,
            "organization_id": 1,
            "is_public": True,
            "hourly_rate": 15.0,
            "has_restroom": True,
            "has_convenience_store": True,
            "has_restaurant": False,
            "open_24_hours": True,
            "connectors": [
                {
                    "connector_type": ChargingConnectorType.CCS2,
                    "power_kw": 150.0,
                    "voltage": 400.0,
                    "amperage": 375.0,
                    "connector_number": 1,
                    "status": ChargingStationStatus.AVAILABLE
                },
                {
                    "connector_type": ChargingConnectorType.CCS2,
                    "power_kw": 150.0,
                    "voltage": 400.0,
                    "amperage": 375.0,
                    "connector_number": 2,
                    "status": ChargingStationStatus.AVAILABLE
                },
                {
                    "connector_type": ChargingConnectorType.CHADEMO,
                    "power_kw": 50.0,
                    "voltage": 500.0,
                    "amperage": 100.0,
                    "connector_number": 3,
                    "status": ChargingStationStatus.AVAILABLE
                }
            ]
        },
        {
            "name": "Fleet Charging Depot",
            "description": "Private charging depot for fleet vehicles",
            "latitude": 40.7061,
            "longitude": -73.9969,
            "address": "456 Fleet Ave",
            "city": "New York",
            "state": "NY",
            "country": "USA",
            "zip_code": "10002",
            "status": ChargingStationStatus.AVAILABLE,
            "organization_id": 1,
            "is_public": False,
            "hourly_rate": None,
            "has_restroom": True,
            "has_convenience_store": False,
            "has_restaurant": False,
            "open_24_hours": True,
            "connectors": [
                {
                    "connector_type": ChargingConnectorType.TYPE_2,
                    "power_kw": 22.0,
                    "voltage": 400.0,
                    "amperage": 32.0,
                    "connector_number": 1,
                    "status": ChargingStationStatus.AVAILABLE
                },
                {
                    "connector_type": ChargingConnectorType.TYPE_2,
                    "power_kw": 22.0,
                    "voltage": 400.0,
                    "amperage": 32.0,
                    "connector_number": 2,
                    "status": ChargingStationStatus.AVAILABLE
                },
                {
                    "connector_type": ChargingConnectorType.TYPE_2,
                    "power_kw": 22.0,
                    "voltage": 400.0,
                    "amperage": 32.0,
                    "connector_number": 3,
                    "status": ChargingStationStatus.AVAILABLE
                },
                {
                    "connector_type": ChargingConnectorType.TYPE_2,
                    "power_kw": 22.0,
                    "voltage": 400.0,
                    "amperage": 32.0,
                    "connector_number": 4,
                    "status": ChargingStationStatus.AVAILABLE
                }
            ]
        }
    ]
    
    for station_data in stations:
        connectors_data = station_data.pop("connectors")
        
        station = ChargingStation(**station_data)
        db.add(station)
        db.flush()  # Get the station ID
        
        for connector_data in connectors_data:
            connector = ChargingConnector(
                charging_station_id=station.id,
                **connector_data
            )
            db.add(connector)
    
    db.commit()
    logger.info(f"Created {len(stations)} sample charging stations")

def init_db(db: Session) -> None:
    """Initialize the database with sample data."""
    
    # Create initial data
    create_roles(db)
    create_users(db)
    create_sample_organizations(db)
    create_sample_vehicles(db)
    create_sample_telematics(db)
    create_sample_charging_stations(db)
    
    logger.info("Database initialized with sample data") 