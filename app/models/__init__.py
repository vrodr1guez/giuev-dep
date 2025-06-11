# Import all models here so they're discovered by SQLAlchemy
from app.models.role import Role
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.telematics import VehicleTelematicsLive, VehicleTelematicsHistory
from app.models.organization import Organization, Fleet
from app.models.provider import TelematicsProvider
from app.models.user import User

# Models registry
__all__ = [
    "Vehicle",
    "VehicleStatus",
    "VehicleTelematicsLive",
    "VehicleTelematicsHistory",
    "Organization",
    "Fleet",
    "TelematicsProvider",
    "User",
    "Role",
]
