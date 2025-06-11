from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.battery_health_alert import BatteryHealthReport, Alert
from app.schemas.battery_health_alert import BatteryHealthReportCreate, BatteryHealthReportUpdate, AlertCreate, AlertUpdate
from app.core.logging import logger


class BatteryHealthService:
    def create_battery_health_report(
            self,
            db: Session,
            obj_in: BatteryHealthReportCreate) -> BatteryHealthReport:
        """Create a new battery health report."""
        db_obj = BatteryHealthReport(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_battery_health_report(
            self,
            db: Session,
            report_id: int) -> Optional[BatteryHealthReport]:
        """Get a specific battery health report by ID."""
        return db.query(BatteryHealthReport).filter(
            BatteryHealthReport.id == report_id).first()

    def get_battery_health_reports_for_vehicle(
        self, db: Session, vehicle_id: int, skip: int = 0, limit: int = 100
    ) -> List[BatteryHealthReport]:
        """Get all battery health reports for a specific vehicle."""
        return (
            db.query(BatteryHealthReport)
            .filter(BatteryHealthReport.vehicle_id == vehicle_id)
            .order_by(BatteryHealthReport.report_date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_battery_health_report(
            self,
            db: Session,
            db_obj: BatteryHealthReport,
            obj_in: BatteryHealthReportUpdate) -> BatteryHealthReport:
        """Update a battery health report."""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def predict_battery_degradation(
            self, db: Session, vehicle_id: int) -> Dict[str, Any]:
        """
        Predict battery degradation using AI/ML models.
        This is a placeholder that should be replaced with actual ML model predictions.
        """
        reports = self.get_battery_health_reports_for_vehicle(
            db, vehicle_id, limit=10)
        if not reports:
            return {
                "vehicle_id": vehicle_id,
                "prediction_available": False,
                "reason": "Insufficient historical data"
            }

        # Mock prediction logic - replace with actual ML model
        current_soh = reports[0].state_of_health_percent or 100
        mock_degradation_rate = 2.5  # % per year

        return {
            "vehicle_id": vehicle_id,
            "current_soh": current_soh,
            "predicted_soh_12_months": max(
                0,
                current_soh -
                mock_degradation_rate),
            "confidence_level": "medium",
            "prediction_timestamp": datetime.utcnow(),
            "note": "This is a mock prediction. Replace with actual ML model."}

    def check_battery_health_and_create_alerts(
            self, db: Session, vehicle_id: int) -> None:
        """Check battery health and create alerts if necessary."""
        reports = self.get_battery_health_reports_for_vehicle(
            db, vehicle_id, limit=1)
        if not reports:
            logger.warning(
                f"No battery health reports found for vehicle {vehicle_id}")
            return

        report = reports[0]
        if not report.state_of_health_percent:
            logger.warning(f"No SoH data available for vehicle {vehicle_id}")
            return

        soh = report.state_of_health_percent
        alert_data = None

        # Define alert thresholds
        if soh < 70:  # Critical threshold
            alert_data = {
                "alert_type": "battery_soh_critical",
                "severity": "critical",
                "message": f"Vehicle {vehicle_id} battery SoH is critically low at {soh}%"}
        elif soh < 80:  # Warning threshold
            alert_data = {
                "alert_type": "battery_soh_warning",
                "severity": "warning",
                "message": f"Vehicle {vehicle_id} battery SoH is low at {soh}%"
            }

        if alert_data:
            # Check for existing active alerts
            existing_alert = alert_service.get_active_alert_by_type_and_vehicle(
                db, alert_type=alert_data["alert_type"], vehicle_id=vehicle_id)

            if not existing_alert:
                alert_service.create_alert(db, AlertCreate(
                    organization_id=1,  # Replace with actual organization_id
                    vehicle_id=vehicle_id,
                    **alert_data
                ))
                logger.info(
                    f"Created battery health alert for vehicle {vehicle_id}")


class AlertService:
    def create_alert(self, db: Session, obj_in: AlertCreate) -> Alert:
        """Create a new alert."""
        db_obj = Alert(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_alert(self, db: Session, alert_id: int) -> Optional[Alert]:
        """Get a specific alert by ID."""
        return db.query(Alert).filter(Alert.id == alert_id).first()

    def get_alerts_for_organization(
            self,
            db: Session,
            organization_id: int,
            skip: int = 0,
            limit: int = 100,
            status: Optional[str] = None,
            vehicle_id: Optional[int] = None,
            severity: Optional[str] = None) -> List[Alert]:
        """Get filtered alerts for an organization."""
        query = db.query(Alert).filter(
            Alert.organization_id == organization_id)

        if status:
            query = query.filter(Alert.status == status)
        if vehicle_id:
            query = query.filter(Alert.vehicle_id == vehicle_id)
        if severity:
            query = query.filter(Alert.severity == severity)

        return query.order_by(Alert.created_at.desc()).offset(
            skip).limit(limit).all()

    def update_alert(
            self,
            db: Session,
            db_obj: Alert,
            obj_in: AlertUpdate) -> Alert:
        """Update an alert."""
        update_data = obj_in.model_dump(exclude_unset=True)

        # Handle status transitions
        if "status" in update_data:
            if update_data["status"] == "acknowledged" and not db_obj.acknowledged_at:
                update_data["acknowledged_at"] = datetime.utcnow()
            elif update_data["status"] == "resolved":
                update_data["resolved_at"] = datetime.utcnow()
                if not db_obj.acknowledged_at:
                    update_data["acknowledged_at"] = datetime.utcnow()

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_active_alert_by_type_and_vehicle(
        self, db: Session, alert_type: str, vehicle_id: int
    ) -> Optional[Alert]:
        """Get active alert by type and vehicle ID."""
        return db.query(Alert).filter(
            Alert.alert_type == alert_type,
            Alert.vehicle_id == vehicle_id,
            Alert.status == "active"
        ).first()


battery_health_service = BatteryHealthService()
alert_service = AlertService()
