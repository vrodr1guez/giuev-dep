from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.maintenance import MaintenanceRecord, MaintenanceStatus, MaintenanceType
from app.models.vehicle import Vehicle, VehicleStatus
from app.schemas.maintenance import MaintenanceRecordCreate
from app.core.notifications import NotificationService
from app.crud.maintenance import maintenance_service
from app.core.logging import logger


class MaintenanceScheduler:
    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service

    def schedule_maintenance(
        self,
        db: Session,
        vehicle_id: int,
        maintenance_type: MaintenanceType,
        scheduled_date: datetime,
        description: str,
        requires_vehicle_offline: bool = False,
        service_provider: Optional[str] = None,
        estimated_duration_hours: Optional[float] = None,
        notify_stakeholders: bool = True
    ) -> MaintenanceRecord:
        """Schedule a new maintenance record with notifications."""
        try:
            # Create maintenance record
            record_in = MaintenanceRecordCreate(
                vehicle_id=vehicle_id,
                type=maintenance_type,
                description=description,
                scheduled_date=scheduled_date,
                requires_vehicle_offline=requires_vehicle_offline,
                service_provider=service_provider
            )

            record = maintenance_service.create_maintenance_record(
                db=db,
                obj_in=record_in,
                current_user_id=1  # System user ID
            )

            if notify_stakeholders:
                self._send_maintenance_notifications(db, record)

            return record

        except Exception as e:
            logger.error(
                f"Error scheduling maintenance for vehicle {vehicle_id}: {str(e)}")
            raise

    def check_upcoming_maintenance(
        self,
        db: Session,
        days_ahead: int = 7
    ) -> List[MaintenanceRecord]:
        """Check for upcoming maintenance in the next X days."""
        try:
            future_date = datetime.utcnow() + timedelta(days=days_ahead)

            records = db.query(MaintenanceRecord).join(
                Vehicle
            ).filter(
                and_(
                    MaintenanceRecord.status == MaintenanceStatus.SCHEDULED,
                    MaintenanceRecord.scheduled_date <= future_date,
                    MaintenanceRecord.scheduled_date >= datetime.utcnow(),
                    Vehicle.status != VehicleStatus.RETIRED
                )
            ).order_by(MaintenanceRecord.scheduled_date.asc()).all()

            return records

        except Exception as e:
            logger.error(f"Error checking upcoming maintenance: {str(e)}")
            raise

    def get_maintenance_recommendations(
        self,
        db: Session,
        vehicle_id: int
    ) -> List[dict]:
        """Generate maintenance recommendations based on vehicle data."""
        try:
            vehicle = db.query(Vehicle).filter(
                Vehicle.id == vehicle_id).first()
            if not vehicle:
                raise ValueError(f"Vehicle {vehicle_id} not found")

            # Get last maintenance records
            last_maintenance = db.query(
                MaintenanceRecord
            ).filter(
                MaintenanceRecord.vehicle_id == vehicle_id,
                MaintenanceRecord.status == MaintenanceStatus.COMPLETED
            ).order_by(
                MaintenanceRecord.completion_date.desc()
            ).first()

            recommendations = []

            # Check mileage-based maintenance
            if vehicle.telematics_live:
                current_mileage = vehicle.telematics_live.odometer_km
                if last_maintenance and last_maintenance.next_service_mileage:
                    if current_mileage >= last_maintenance.next_service_mileage:
                        recommendations.append({
                            "type": MaintenanceType.SCHEDULED,
                            "priority": "high",
                            "reason": "Mileage threshold reached",
                            "recommended_date": datetime.utcnow() + timedelta(days=7)
                        })

            # Check battery health
            if vehicle.telematics_live and vehicle.telematics_live.state_of_health_percent:
                if vehicle.telematics_live.state_of_health_percent < 85:
                    recommendations.append({
                        "type": MaintenanceType.BATTERY,
                        "priority": "medium",
                        "reason": "Battery health below threshold",
                        "recommended_date": datetime.utcnow() + timedelta(days=14)
                    })

            return recommendations

        except Exception as e:
            logger.error(
                f"Error generating maintenance recommendations for vehicle {vehicle_id}: {str(e)}")
            raise

    def get_maintenance_statistics(
        self,
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        vehicle_id: Optional[int] = None
    ) -> dict:
        """Get maintenance statistics for analysis."""
        try:
            query = db.query(MaintenanceRecord)

            if vehicle_id:
                query = query.filter(
                    MaintenanceRecord.vehicle_id == vehicle_id)
            if start_date:
                query = query.filter(
                    MaintenanceRecord.created_at >= start_date)
            if end_date:
                query = query.filter(MaintenanceRecord.created_at <= end_date)

            # Basic statistics
            total_records = query.count()
            completed_records = query.filter(
                MaintenanceRecord.status == MaintenanceStatus.COMPLETED
            ).count()

            # Average completion time
            completion_times = db.query(
                func.avg(
                    MaintenanceRecord.completion_date -
                    MaintenanceRecord.start_date)).filter(
                MaintenanceRecord.status == MaintenanceStatus.COMPLETED).scalar()

            # Maintenance types distribution
            type_distribution = {}
            for record in query.all():
                type_distribution[record.type] = type_distribution.get(
                    record.type, 0) + 1

            # Cost analysis
            total_cost = db.query(
                func.sum(
                    MaintenanceRecord.cost)).scalar() or 0
            avg_cost = db.query(func.avg(MaintenanceRecord.cost)).scalar() or 0

            return {
                "total_records": total_records,
                "completed_records": completed_records,
                "completion_rate": (
                    completed_records /
                    total_records *
                    100) if total_records > 0 else 0,
                "avg_completion_time_hours": completion_times.total_seconds() /
                3600 if completion_times else None,
                "type_distribution": type_distribution,
                "total_cost": total_cost,
                "average_cost": avg_cost}

        except Exception as e:
            logger.error(f"Error generating maintenance statistics: {str(e)}")
            raise

    def _send_maintenance_notifications(
        self,
        db: Session,
        maintenance_record: MaintenanceRecord
    ) -> None:
        """Send notifications to relevant stakeholders."""
        try:
            vehicle = db.query(Vehicle).filter(
                Vehicle.id == maintenance_record.vehicle_id).first()

            # Notify fleet manager
            if vehicle.fleet_id:
                self.notification_service.send_notification(
                    recipient_type="fleet_manager",
                    recipient_id=vehicle.fleet_id,
                    title="New Maintenance Scheduled",
                    message=f"Maintenance scheduled for vehicle {vehicle.license_plate} "
                    f"on {maintenance_record.scheduled_date}",
                    data={
                        "maintenance_id": maintenance_record.id,
                        "vehicle_id": vehicle.id,
                        "type": maintenance_record.type,
                        "scheduled_date": maintenance_record.scheduled_date.isoformat()})

            # Notify service provider if specified
            if maintenance_record.service_provider:
                self.notification_service.send_notification(
                    recipient_type="service_provider",
                    recipient_id=maintenance_record.service_provider,
                    title="New Maintenance Assignment",
                    message=f"New maintenance task assigned for vehicle {vehicle.license_plate}",
                    data={
                        "maintenance_id": maintenance_record.id,
                        "vehicle_id": vehicle.id,
                        "type": maintenance_record.type,
                        "scheduled_date": maintenance_record.scheduled_date.isoformat()})

        except Exception as e:
            logger.error(f"Error sending maintenance notifications: {str(e)}")
            # Don't raise the exception as this is a non-critical operation


maintenance_scheduler = MaintenanceScheduler(NotificationService())
