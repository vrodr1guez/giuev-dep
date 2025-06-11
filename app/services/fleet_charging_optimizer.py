from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.vehicle import Vehicle
from app.models.grid import GridLoadForecast, DynamicTariff, StationAvailability
from app.schemas.charging import ChargingOptimizationRequest, ChargingOptimizationResponse
from app.services.charging_optimizer import charging_optimizer
from app.core.logging import logger


class FleetChargingOptimizer:
    def __init__(self):
        self.LOAD_SAFETY_MARGIN = 0.9  # 90% of peak threshold
        self.MIN_POWER_ALLOCATION = 1.0  # Minimum power allocation in kW

    async def optimize_fleet_charging(
        self,
        db: Session,
        vehicle_ids: List[int],
        station_id: int,
        optimization_window: timedelta = timedelta(hours=24)
    ) -> Dict[int, ChargingOptimizationResponse]:
        """
        Optimize charging schedules for multiple vehicles considering grid constraints.

        Args:
            db: Database session
            vehicle_ids: List of vehicle IDs to optimize
            station_id: ID of the charging station
            optimization_window: Time window for optimization

        Returns:
            Dictionary mapping vehicle IDs to their optimized schedules
        """
        try:
            # Get grid load forecasts
            load_forecasts = await self._get_load_forecasts(
                db,
                station_id,
                datetime.utcnow(),
                datetime.utcnow() + optimization_window
            )

            # Get station availability
            available_connectors = await self._get_available_connectors(db, station_id)

            # Get vehicles with their charging requirements
            vehicles = await self._get_vehicles_info(db, vehicle_ids)

            # Sort vehicles by priority (e.g., departure time, current SoC)
            prioritized_vehicles = await self._prioritize_vehicles(vehicles)

            # Calculate power allocation for each time slot
            power_allocations = await self._calculate_power_allocations(
                load_forecasts,
                available_connectors,
                len(prioritized_vehicles)
            )

            # Optimize each vehicle's schedule with allocated power
            schedules = {}
            for vehicle in prioritized_vehicles:
                schedule = await self._optimize_vehicle_charging(
                    db,
                    vehicle,
                    power_allocations[vehicle.id],
                    optimization_window,
                    station_id
                )
                schedules[vehicle.id] = schedule

                # Update power allocations based on scheduled charging
                await self._update_power_allocations(power_allocations, schedule)

            return schedules

        except Exception as e:
            logger.error(f"Error optimizing fleet charging: {str(e)}")
            raise

    async def _get_load_forecasts(
        self,
        db: Session,
        station_id: int,
        start_time: datetime,
        end_time: datetime
    ) -> List[GridLoadForecast]:
        """Get grid load forecasts for the optimization period."""
        return db.query(GridLoadForecast).filter(
            GridLoadForecast.station_id == station_id,
            GridLoadForecast.timestamp >= start_time,
            GridLoadForecast.timestamp <= end_time
        ).order_by(GridLoadForecast.timestamp).all()

    async def _get_available_connectors(
        self,
        db: Session,
        station_id: int
    ) -> List[StationAvailability]:
        """Get available charging connectors at the station."""
        return db.query(StationAvailability).filter(
            StationAvailability.station_id == station_id,
            StationAvailability.status == 'available'
        ).all()

    async def _get_vehicles_info(
        self,
        db: Session,
        vehicle_ids: List[int]
    ) -> List[Vehicle]:
        """Get vehicle information for the fleet."""
        return db.query(Vehicle).filter(Vehicle.id.in_(vehicle_ids)).all()

    async def _prioritize_vehicles(
            self, vehicles: List[Vehicle]) -> List[Vehicle]:
        """Sort vehicles by priority based on various factors."""
        # Sort by departure time and current SoC
        return sorted(vehicles, key=lambda v: (v.departure_time or datetime.max, -
                                               v.telematics_live.battery_level_percent if v.telematics_live else 0))

    async def _calculate_power_allocations(
        self,
        load_forecasts: List[GridLoadForecast],
        available_connectors: List[StationAvailability],
        num_vehicles: int
    ) -> Dict[int, float]:
        """Calculate power allocation for each vehicle based on grid constraints."""
        total_available_power = sum(
            connector.max_power_kw for connector in available_connectors
        )

        # Ensure minimum power allocation per vehicle
        min_power = self.MIN_POWER_ALLOCATION
        max_power = (total_available_power *
                     self.LOAD_SAFETY_MARGIN) / num_vehicles

        return {
            i: min(max_power, min_power)
            for i in range(num_vehicles)
        }

    async def _optimize_vehicle_charging(
        self,
        db: Session,
        vehicle: Vehicle,
        allocated_power: float,
        optimization_window: timedelta,
        station_id: int
    ) -> ChargingOptimizationResponse:
        """Optimize charging schedule for a single vehicle."""
        request = ChargingOptimizationRequest(
            vehicle_id=vehicle.id,
            station_id=station_id,
            target_soc_percent=100.0,  # Default to full charge
            departure_time=vehicle.departure_time or (
                datetime.utcnow() + optimization_window
            ),
            max_charging_power_kw=allocated_power
        )

        return await charging_optimizer.optimize_charging_schedule(db, request)

    async def _update_power_allocations(
        self,
        power_allocations: Dict[int, float],
        schedule: ChargingOptimizationResponse
    ) -> None:
        """Update power allocations based on scheduled charging."""
        # This is a placeholder for actual power allocation update logic
        # In a real implementation, this would consider the actual power usage
        # and update the available power for other vehicles
        pass


fleet_charging_optimizer = FleetChargingOptimizer()
