# Import all models here to ensure they are registered with SQLAlchemy
from app.db.base_class import Base
from app.models.role import Role
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.telematics import VehicleTelematicsLive, VehicleTelematicsHistory
from app.models.organization import Organization, Fleet
from app.models.provider import TelematicsProvider

# Import all models here for Alembic to discover them
from app.db.base_class import Base
from app.models.user import User, Role
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.telematics import VehicleTelematicsLive, VehicleTelematicsHistory
from app.models.organization import Organization
from app.models.fleet import Fleet
from app.models.charging_station import ChargingStation, ChargingConnector, ChargingSession, ChargingConnectorType, ChargingStationStatus