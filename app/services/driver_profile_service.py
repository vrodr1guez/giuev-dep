from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.driver_profile import DriverProfile, DriverBehaviorData, ChargingSchedule
from app.models.notification import Notification, UserNotificationPreference


class DriverProfileService:
    """Service for managing driver profiles and personalized charging settings."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # --- Driver Profile Management ---
    
    def get_profile_by_id(self, profile_id: int) -> Optional[DriverProfile]:
        """Get a driver profile by ID."""
        return self.db.query(DriverProfile).filter(DriverProfile.id == profile_id).first()
    
    def get_profile_by_user_id(self, user_id: int) -> Optional[DriverProfile]:
        """Get a driver profile by user ID."""
        return self.db.query(DriverProfile).filter(DriverProfile.user_id == user_id).first()
    
    def create_profile(self, user_id: int, profile_data: Dict[str, Any]) -> DriverProfile:
        """Create a new driver profile."""
        # Convert pydantic model to dict if needed
        if hasattr(profile_data, "dict"):
            profile_data = profile_data.dict()
        
        profile = DriverProfile(
            user_id=user_id,
            **profile_data
        )
        
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        
        return profile
    
    def update_profile(self, profile_id: int, profile_data: Dict[str, Any]) -> DriverProfile:
        """Update an existing driver profile."""
        profile = self.get_profile_by_id(profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Driver profile not found")
        
        # Convert pydantic model to dict if needed
        if hasattr(profile_data, "dict"):
            profile_data = profile_data.dict(exclude_unset=True)
            
        for key, value in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        self.db.commit()
        self.db.refresh(profile)
        
        return profile
    
    def delete_profile(self, profile_id: int) -> bool:
        """Delete a driver profile."""
        profile = self.get_profile_by_id(profile_id)
        if not profile:
            return False
        
        self.db.delete(profile)
        self.db.commit()
        
        return True
    
    # --- Charging Schedule Management ---
    
    def get_charging_schedule(self, schedule_id: int) -> Optional[ChargingSchedule]:
        """Get a charging schedule by ID."""
        return self.db.query(ChargingSchedule).filter(ChargingSchedule.id == schedule_id).first()
    
    def get_charging_schedules(
        self, 
        profile_id: int, 
        active_only: bool = False
    ) -> List[ChargingSchedule]:
        """Get charging schedules for a driver profile."""
        query = self.db.query(ChargingSchedule).filter(
            ChargingSchedule.driver_profile_id == profile_id
        )
        
        if active_only:
            query = query.filter(
                ChargingSchedule.is_active == True,
                ChargingSchedule.is_complete == False
            )
            
        return query.order_by(ChargingSchedule.start_time).all()
    
    def create_charging_schedule(
        self, 
        profile_id: int, 
        schedule_data: Dict[str, Any]
    ) -> ChargingSchedule:
        """Create a new charging schedule."""
        # Convert pydantic model to dict if needed
        if hasattr(schedule_data, "dict"):
            schedule_data = schedule_data.dict()
        
        # Parse string dates to datetime objects
        if isinstance(schedule_data.get("start_time"), str):
            schedule_data["start_time"] = datetime.fromisoformat(schedule_data["start_time"].replace("Z", "+00:00"))
            
        if isinstance(schedule_data.get("end_time"), str):
            schedule_data["end_time"] = datetime.fromisoformat(schedule_data["end_time"].replace("Z", "+00:00"))
        
        schedule = ChargingSchedule(
            driver_profile_id=profile_id,
            **schedule_data
        )
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        return schedule
    
    def update_charging_schedule(
        self, 
        schedule_id: int, 
        schedule_data: Dict[str, Any]
    ) -> ChargingSchedule:
        """Update an existing charging schedule."""
        schedule = self.get_charging_schedule(schedule_id)
        if not schedule:
            raise HTTPException(status_code=404, detail="Charging schedule not found")
        
        # Convert pydantic model to dict if needed
        if hasattr(schedule_data, "dict"):
            schedule_data = schedule_data.dict(exclude_unset=True)
            
        # Parse string dates to datetime objects
        if isinstance(schedule_data.get("start_time"), str):
            schedule_data["start_time"] = datetime.fromisoformat(schedule_data["start_time"].replace("Z", "+00:00"))
            
        if isinstance(schedule_data.get("end_time"), str):
            schedule_data["end_time"] = datetime.fromisoformat(schedule_data["end_time"].replace("Z", "+00:00"))
            
        for key, value in schedule_data.items():
            if hasattr(schedule, key):
                setattr(schedule, key, value)
        
        self.db.commit()
        self.db.refresh(schedule)
        
        return schedule
    
    def delete_charging_schedule(self, schedule_id: int) -> bool:
        """Delete a charging schedule."""
        schedule = self.get_charging_schedule(schedule_id)
        if not schedule:
            return False
        
        self.db.delete(schedule)
        self.db.commit()
        
        return True
    
    # --- Behavior Analysis and Recommendations ---
    
    def get_behavior_data(
        self, 
        profile_id: int, 
        period_type: str = "weekly",
        limit: int = 10
    ) -> List[DriverBehaviorData]:
        """Get driver behavior data for a profile."""
        return self.db.query(DriverBehaviorData).filter(
            DriverBehaviorData.driver_profile_id == profile_id,
            DriverBehaviorData.period_type == period_type
        ).order_by(DriverBehaviorData.period_start.desc()).limit(limit).all()
    
    def store_behavior_data(
        self,
        profile_id: int,
        period_type: str,
        period_start: datetime,
        data: Dict[str, Any]
    ) -> DriverBehaviorData:
        """Store driver behavior data for analysis."""
        behavior_data = DriverBehaviorData(
            driver_profile_id=profile_id,
            period_type=period_type,
            period_start=period_start,
            **data
        )
        
        self.db.add(behavior_data)
        self.db.commit()
        self.db.refresh(behavior_data)
        
        return behavior_data
    
    def get_charging_recommendations(self, profile_id: int) -> List[Dict[str, Any]]:
        """Generate personalized charging recommendations based on behavior."""
        profile = self.get_profile_by_id(profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Driver profile not found")
            
        # Get recent behavior data
        behavior_data = self.get_behavior_data(profile_id, "weekly", 4)
        
        # This would be where the ML recommendation logic would run
        # For demonstration purposes, we'll return static recommendations
        recommendations = [
            {
                "type": "cost_saving",
                "title": "Save with Off-Peak Charging",
                "description": "Schedule charging between 11pm-7am to save up to 30% on electricity costs",
                "estimated_savings": "$25/month",
                "confidence": 0.85,
                "action": {
                    "type": "create_schedule",
                    "params": {
                        "start_time": "23:00",
                        "end_time": "07:00",
                        "days": [0, 1, 2, 3, 4]  # Weekdays
                    }
                }
            },
            {
                "type": "battery_health",
                "title": "Optimal Charging Range",
                "description": "Keep your battery between 20-80% to extend its lifespan",
                "estimated_benefit": "+15% battery longevity",
                "confidence": 0.9,
                "action": {
                    "type": "update_profile",
                    "params": {
                        "preferred_min_soc": 20,
                        "preferred_max_soc": 80
                    }
                }
            },
            {
                "type": "renewable_energy",
                "title": "Charge with Renewable Energy",
                "description": "Solar generation peaks between 10am-2pm. Charge then to reduce carbon footprint",
                "estimated_benefit": "-40% carbon emissions",
                "confidence": 0.75,
                "action": {
                    "type": "create_schedule",
                    "params": {
                        "start_time": "10:00",
                        "end_time": "14:00",
                        "days": [0, 1, 2, 3, 4, 5, 6]  # All days
                    }
                }
            }
        ]
        
        return recommendations 