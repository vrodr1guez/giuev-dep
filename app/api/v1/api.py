from fastapi import APIRouter, Depends
from app.api.deps import get_current_active_user

from app.api.v1.endpoints import (
    login,
    users,
    roles,
    vehicles,
    charging,
    charging_stations,
    charging_sessions,
    charging_networks,
    charging_data_import,
    telematics,
    maintenance,
    integrations,
    analytics,
    grid_integration,
    battery_health,
    vehicle_usage_prediction,
    energy_marketplace,
    energy_prices,
    charging_optimization,
    mobile,
    websocket,
    billing,
    dashboard,
    vin_telematics,
    charging_schedules,
    grid_partnerships,
    federated_learning_plus,
)

api_router = APIRouter()

# Include all the API routes
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(charging.router, prefix="/charging", tags=["charging"])
api_router.include_router(charging_stations.router, prefix="/charging-stations", tags=["charging-stations"])
api_router.include_router(charging_sessions.router, prefix="/charging-sessions", tags=["charging-sessions"])
api_router.include_router(charging_networks.router, prefix="/charging-networks", tags=["charging-networks"])
api_router.include_router(charging_data_import.router, prefix="/charging-data", tags=["charging-data"])
api_router.include_router(telematics.router, prefix="/telematics", tags=["telematics"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(grid_integration.router, prefix="/grid-integration", tags=["grid-integration"])
api_router.include_router(battery_health.router, prefix="/battery-health", tags=["battery-health"])
api_router.include_router(vehicle_usage_prediction.router, prefix="/vehicle-usage-prediction", tags=["vehicle-usage-prediction"])
api_router.include_router(energy_marketplace.router, prefix="/energy-marketplace", tags=["energy-marketplace"])
api_router.include_router(energy_prices.router, prefix="/energy-prices", tags=["energy-prices"])
api_router.include_router(charging_optimization.router, prefix="/charging-optimization", tags=["charging-optimization"])
api_router.include_router(mobile.router, prefix="/mobile", tags=["mobile"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(vin_telematics.router, prefix="/vin-telematics", tags=["vin-telematics"])
api_router.include_router(charging_schedules.router, prefix="/charging-schedules", tags=["charging-schedules"])
api_router.include_router(grid_partnerships.router, prefix="/grid-partnerships", tags=["grid-partnerships"])
api_router.include_router(federated_learning_plus.router, prefix="/federated-learning-plus", tags=["federated-learning-plus"])

# Add other routers here as they are developed
