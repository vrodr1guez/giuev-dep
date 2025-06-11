from celery import Celery
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.battery_health_alert import battery_health_service
from app.ml.battery_degradation_model import battery_degradation_model
from app.core.logging import logger

# Initialize Celery
celery_app = Celery(
    "battery_health_monitor",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)


@celery_app.task(name="monitor_battery_health")
def monitor_battery_health(vehicle_ids: Optional[List[int]] = None):
    """
    Monitor battery health for specified vehicles or all vehicles.
    Creates alerts if health issues are detected.
    """
    db = SessionLocal()
    try:
        if vehicle_ids is None:
            # Get all active vehicle IDs from the database
            vehicle_ids = [1, 2, 3]  # Replace with actual query

        for vehicle_id in vehicle_ids:
            try:
                # Check battery health and create alerts
                battery_health_service.check_battery_health_and_create_alerts(
                    db, vehicle_id)

                # Predict degradation
                reports = battery_health_service.get_battery_health_reports_for_vehicle(
                    db, vehicle_id, limit=10)
                if reports:
                    prediction = battery_degradation_model.predict_degradation(
                        reports)
                    if (
                        prediction.get("prediction_available") and
                        prediction.get("predicted_soh", 100) < 80
                    ):
                        # Create degradation warning alert
                        from app.schemas.battery_health_alert import AlertCreate
                        alert = AlertCreate(
                            organization_id=1,  # Replace with actual org ID
                            vehicle_id=vehicle_id,
                            alert_type="battery_degradation_warning",
                            severity="warning",
                            message=(
                                f"Vehicle {vehicle_id} battery is predicted to degrade to "
                                f"{prediction['predicted_soh']:.1f}% SoH within a year. "
                                f"Confidence: {prediction['confidence_level']}"
                            )
                        )
                        battery_health_service.alert_service.create_alert(
                            db, alert)

            except Exception as e:
                logger.error(
                    f"Error monitoring battery health for vehicle {vehicle_id}: {str(e)}",
                    extra={
                        "vehicle_id": vehicle_id})
                continue

    finally:
        db.close()


@celery_app.task(name="train_degradation_model")
def train_degradation_model():
    """
    Periodically train the battery degradation model with new data.
    """
    db = SessionLocal()
    try:
        # Get all battery health reports for training
        # This is a placeholder - implement actual data gathering logic
        training_data = []

        if training_data:
            battery_degradation_model.train(training_data)
            logger.info(
                "Successfully trained battery degradation model",
                extra={"num_samples": len(training_data)}
            )
        else:
            logger.warning(
                "No training data available for battery degradation model")

    except Exception as e:
        logger.error(f"Error training battery degradation model: {str(e)}")
    finally:
        db.close()

# Schedule periodic tasks


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Monitor battery health every 6 hours
    sender.add_periodic_task(
        timedelta(hours=6),
        monitor_battery_health.s(),
        name="monitor_battery_health"
    )

    # Train model weekly
    sender.add_periodic_task(
        timedelta(days=7),
        train_degradation_model.s(),
        name="train_degradation_model"
    )
