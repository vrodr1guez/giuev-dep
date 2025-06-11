from fastapi import APIRouter

from app.api.routes.vehicles import router as vehicles_router

# Re-export the router
router = vehicles_router 