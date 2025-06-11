from typing import List, Optional, Dict, Any, Union, Type
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.models.integration import (
    ExternalIntegration, ApiKey, IntegrationDataSync, 
    WeatherForecast, FleetVehicleSync
)
from app.schemas.integration import (
    ExternalIntegrationCreate, ExternalIntegrationUpdate,
    ApiKeyCreate, ApiKeyUpdate, 
    IntegrationDataSyncCreate, IntegrationDataSyncUpdate,
    WeatherDataCreate, WeatherDataUpdate,
    FleetVehicleCreate, FleetVehicleUpdate
)


class CRUDBase:
    def __init__(self, model):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[Any]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Any]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: Any) -> Any:
        obj_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Any, obj_in: Union[Dict[str, Any], Any]
    ) -> Any:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Any]:
        obj = db.query(self.model).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj


class CRUDIntegration(CRUDBase):
    """CRUD operations for the ExternalIntegration model"""
    
    def create_with_api_key(
        self, db: Session, *, integration_in: ExternalIntegrationCreate, api_key_in: Optional[ApiKeyCreate] = None
    ) -> ExternalIntegration:
        """Create a new integration with optional API key"""
        obj_data = jsonable_encoder(integration_in)
        db_obj = ExternalIntegration(**obj_data)
        db.add(db_obj)
        db.flush()  # Get the new ID
        
        # Add API key if provided
        if api_key_in:
            key_data = jsonable_encoder(api_key_in)
            api_key = ApiKey(**key_data, integration_id=db_obj.id)
            db.add(api_key)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_provider(
        self, db: Session, *, provider: str, integration_type: Optional[str] = None
    ) -> List[ExternalIntegration]:
        """Get integrations by provider name and optionally by type"""
        query = db.query(ExternalIntegration).filter(ExternalIntegration.provider == provider)
        
        if integration_type:
            query = query.filter(ExternalIntegration.integration_type == integration_type)
            
        return query.all()
    
    def get_with_api_keys(self, db: Session, *, id: int) -> Optional[ExternalIntegration]:
        """Get integration with related API keys"""
        return db.query(ExternalIntegration).filter(
            ExternalIntegration.id == id
        ).first()
    
    def get_active_by_type(
        self, db: Session, *, integration_type: str
    ) -> List[ExternalIntegration]:
        """Get active integrations by type"""
        return db.query(ExternalIntegration).filter(
            ExternalIntegration.integration_type == integration_type,
            ExternalIntegration.status == "active"
        ).all()


class CRUDApiKey(CRUDBase):
    """CRUD operations for the ApiKey model"""
    
    def get_by_integration(
        self, db: Session, *, integration_id: int, active_only: bool = False
    ) -> List[ApiKey]:
        """Get API keys by integration ID, optionally only active ones"""
        query = db.query(ApiKey).filter(ApiKey.integration_id == integration_id)
        
        if active_only:
            query = query.filter(ApiKey.is_active == True)
            
        return query.all()
    
    def get_active_key(
        self, db: Session, *, integration_id: int
    ) -> Optional[ApiKey]:
        """Get a single active API key for an integration"""
        return db.query(ApiKey).filter(
            ApiKey.integration_id == integration_id,
            ApiKey.is_active == True
        ).first()


class CRUDIntegrationDataSync(CRUDBase):
    """CRUD operations for the IntegrationDataSync model"""
    
    def get_by_integration(
        self, db: Session, *, integration_id: int, limit: int = 10
    ) -> List[IntegrationDataSync]:
        """Get recent sync records for an integration"""
        return db.query(IntegrationDataSync).filter(
            IntegrationDataSync.integration_id == integration_id
        ).order_by(IntegrationDataSync.started_at.desc()).limit(limit).all()
    
    def get_by_type(
        self, db: Session, *, integration_id: int, sync_type: str, limit: int = 5
    ) -> List[IntegrationDataSync]:
        """Get recent sync records for an integration and sync type"""
        return db.query(IntegrationDataSync).filter(
            IntegrationDataSync.integration_id == integration_id,
            IntegrationDataSync.sync_type == sync_type
        ).order_by(IntegrationDataSync.started_at.desc()).limit(limit).all()
    
    def update_status(
        self, db: Session, *, sync_id: int, status: str, 
        completed: bool = False, error: Optional[str] = None
    ) -> IntegrationDataSync:
        """Update sync status"""
        sync = db.query(IntegrationDataSync).get(sync_id)
        if not sync:
            return None
            
        sync.status = status
        
        if completed:
            from datetime import datetime
            sync.completed_at = datetime.utcnow()
            
        if error:
            sync.error_message = error
            
        db.add(sync)
        db.commit()
        db.refresh(sync)
        return sync


class CRUDWeatherForecast(CRUDBase):
    """CRUD operations for the WeatherForecast model"""
    
    def get_by_location(
        self, db: Session, *, latitude: float, longitude: float, 
        limit: int = 10, integration_id: Optional[int] = None
    ) -> List[WeatherForecast]:
        """Get forecasts for a specific location"""
        query = db.query(WeatherForecast).filter(
            WeatherForecast.latitude == latitude,
            WeatherForecast.longitude == longitude
        )
        
        if integration_id:
            query = query.filter(WeatherForecast.integration_id == integration_id)
            
        return query.order_by(WeatherForecast.forecast_time.desc()).limit(limit).all()
    
    def get_latest_forecast(
        self, db: Session, *, latitude: float, longitude: float,
        integration_id: Optional[int] = None
    ) -> Optional[WeatherForecast]:
        """Get the latest forecast for a location"""
        query = db.query(WeatherForecast).filter(
            WeatherForecast.latitude == latitude,
            WeatherForecast.longitude == longitude
        )
        
        if integration_id:
            query = query.filter(WeatherForecast.integration_id == integration_id)
            
        return query.order_by(WeatherForecast.prediction_timestamp.desc()).first()


class CRUDFleetVehicleSync(CRUDBase):
    """CRUD operations for the FleetVehicleSync model"""
    
    def get_by_vehicle(
        self, db: Session, *, vehicle_id: int
    ) -> List[FleetVehicleSync]:
        """Get all fleet syncs for a specific vehicle"""
        return db.query(FleetVehicleSync).filter(
            FleetVehicleSync.vehicle_id == vehicle_id
        ).all()
    
    def get_by_external_id(
        self, db: Session, *, integration_id: int, external_id: str
    ) -> Optional[FleetVehicleSync]:
        """Get fleet sync by external ID"""
        return db.query(FleetVehicleSync).filter(
            FleetVehicleSync.integration_id == integration_id,
            FleetVehicleSync.external_vehicle_id == external_id
        ).first()
    
    def get_by_integration(
        self, db: Session, *, integration_id: int, skip: int = 0, limit: int = 100
    ) -> List[FleetVehicleSync]:
        """Get all vehicles synced with a specific integration"""
        return db.query(FleetVehicleSync).filter(
            FleetVehicleSync.integration_id == integration_id
        ).offset(skip).limit(limit).all()


# Create instances for use with dependency injection
integration = CRUDIntegration(ExternalIntegration)
api_key = CRUDApiKey(ApiKey)
integration_data_sync = CRUDIntegrationDataSync(IntegrationDataSync)
weather_forecast = CRUDWeatherForecast(WeatherForecast)
fleet_vehicle_sync = CRUDFleetVehicleSync(FleetVehicleSync) 