from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from fastapi import HTTPException

from app.models.telematics import VehicleTelematicsLive, VehicleTelematicsHistory
from app.schemas.vehicle import VehicleTelematicsLive as VehicleTelematicsLiveSchema
from app.schemas.vehicle import VehicleTelematicsHistory as VehicleTelematicsHistorySchema
from app.core.logging import logger


class CRUDTelematics:
    def get_live_telematics(
        self,
        db: Session,
        vehicle_id: int
    ) -> Optional[VehicleTelematicsLive]:
        """
        Retrieve live telematics data for a specific vehicle.

        Args:
            db: Database session
            vehicle_id: ID of the vehicle to query

        Returns:
            Optional[VehicleTelematicsLive]: The live telematics data or None if not found

        Raises:
            HTTPException: If database error occurs
        """
        try:
            return db.query(VehicleTelematicsLive).filter(
                VehicleTelematicsLive.vehicle_id == vehicle_id
            ).first()
        except SQLAlchemyError as e:
            logger.error(
                f"Database error retrieving live telematics for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving telematics data"
            )

    def create_or_update_live_telematics(
        self,
        db: Session,
        vehicle_id: int,
        obj_in: VehicleTelematicsLiveSchema
    ) -> VehicleTelematicsLive:
        """
        Create or update live telematics data for a vehicle.

        Args:
            db: Database session
            vehicle_id: ID of the vehicle to update
            obj_in: Schema containing the telematics data

        Returns:
            VehicleTelematicsLive: The created or updated telematics record

        Raises:
            HTTPException: If validation or database error occurs
        """
        try:
            db_obj = self.get_live_telematics(db, vehicle_id)

            # Validate required fields
            if not all([
                obj_in.latitude is not None,
                obj_in.longitude is not None,
                obj_in.state_of_charge_percent is not None
            ]):
                raise ValueError("Missing required telematics fields")

            if db_obj:
                # Update existing record
                update_data = obj_in.model_dump(exclude_unset=True)
                update_data["updated_at"] = datetime.utcnow()

                for field, value in update_data.items():
                    setattr(db_obj, field, value)
            else:
                # Create new record
                db_obj = VehicleTelematicsLive(
                    **obj_in.model_dump(),
                    vehicle_id=vehicle_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )

            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

        except ValueError as e:
            logger.error(
                f"Validation error for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error updating live telematics for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error updating telematics data"
            )

    def create_telematics_history(
        self,
        db: Session,
        vehicle_id: int,
        obj_in: Union[Dict[str, Any], VehicleTelematicsHistorySchema]
    ) -> VehicleTelematicsHistory:
        """
        Create a historical telematics record.

        Args:
            db: Database session
            vehicle_id: ID of the vehicle
            obj_in: Dictionary or schema containing the telematics data

        Returns:
            VehicleTelematicsHistory: The created history record

        Raises:
            HTTPException: If validation or database error occurs
        """
        try:
            # Convert dict to schema if needed
            if isinstance(obj_in, dict):
                obj_in = VehicleTelematicsHistorySchema(**obj_in)

            # Ensure timestamp exists
            if not obj_in.timestamp:
                obj_in.timestamp = datetime.utcnow()

            db_obj = VehicleTelematicsHistory(
                **obj_in.model_dump(),
                vehicle_id=vehicle_id
            )

            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

        except ValueError as e:
            logger.error(
                f"Validation error creating history for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(
                f"Database error creating history for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error creating telematics history"
            )

    def get_telematics_history(
        self,
        db: Session,
        vehicle_id: int,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[VehicleTelematicsHistory]:
        """
        Retrieve historical telematics data for a vehicle.

        Args:
            db: Database session
            vehicle_id: ID of the vehicle
            start_time: Optional start time filter
            end_time: Optional end time filter
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return

        Returns:
            List[VehicleTelematicsHistory]: List of historical records

        Raises:
            HTTPException: If database error occurs
        """
        try:
            query = db.query(VehicleTelematicsHistory).filter(
                VehicleTelematicsHistory.vehicle_id == vehicle_id
            )

            if start_time:
                query = query.filter(
                    VehicleTelematicsHistory.timestamp >= start_time)
            if end_time:
                query = query.filter(
                    VehicleTelematicsHistory.timestamp <= end_time)

            return query.order_by(
                VehicleTelematicsHistory.timestamp.desc()
            ).offset(skip).limit(limit).all()

        except SQLAlchemyError as e:
            logger.error(
                f"Database error retrieving history for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error retrieving telematics history"
            )

    def process_incoming_telematics_data(
        self,
        db: Session,
        vehicle_id: int,
        raw_telematics_payload: Dict[str, Any]
    ) -> None:
        """
        Process raw telematics data from a provider.

        This function:
        1. Normalizes the raw payload into our schema format
        2. Updates live telematics data
        3. Creates a historical record
        4. Handles any provider-specific data transformations

        Args:
            db: Database session
            vehicle_id: ID of the vehicle
            raw_telematics_payload: Raw telematics data from provider

        Raises:
            HTTPException: If processing, validation or database error occurs
        """
        try:
            current_time = datetime.utcnow()

            # Normalize raw data into our schema format
            live_data_dict = {
                "timestamp": raw_telematics_payload.get(
                    "timestamp",
                    current_time),
                "latitude": raw_telematics_payload.get("latitude"),
                "longitude": raw_telematics_payload.get("longitude"),
                "speed_kmh": raw_telematics_payload.get("speed_kmh"),
                "state_of_charge_percent": raw_telematics_payload.get("soc"),
                "state_of_health_percent": raw_telematics_payload.get("soh"),
                "odometer_km": raw_telematics_payload.get("odometer"),
                "is_charging": raw_telematics_payload.get(
                    "is_charging",
                    False),
                "ambient_temperature_celsius": raw_telematics_payload.get("ambient_temp"),
                "raw_data": raw_telematics_payload}

            # Validate and create live data update
            live_data_schema = VehicleTelematicsLiveSchema(**live_data_dict)
            self.create_or_update_live_telematics(
                db, vehicle_id, live_data_schema)

            # Prepare and create historical record
            history_data_dict = live_data_dict.copy()
            history_data_dict.update({
                "energy_consumed_kwh_since_last": raw_telematics_payload.get("energy_consumed_interval", 0.0),
                "diagnostic_trouble_codes": raw_telematics_payload.get("dtcs", []),
                "timestamp": live_data_dict["timestamp"] or current_time
            })

            self.create_telematics_history(db, vehicle_id, history_data_dict)

            logger.info(
                f"Successfully processed telematics data for vehicle {vehicle_id}")

        except Exception as e:
            logger.error(
                f"Error processing telematics data for vehicle {vehicle_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing telematics data: {str(e)}"
            )


telematics_service = CRUDTelematics()
