from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.schemas.charging import ChargingOptimizationRequest, ChargingOptimizationResponse, ChargingScheduleSlot
from app.models.vehicle import Vehicle
from app.models.grid import GridLoadForecast, StationAvailability
from app.services.dynamic_pricing import dynamic_pricing_service
from app.core.logging import logger


class SmartChargingService:
    def __init__(self):
        self.SOC_SAFETY_MARGIN = 2.0  # 2% safety margin for SoC calculations
        self.MIN_CHARGING_POWER = 1.0  # Minimum charging power in kW
        self.TIME_SLOT_MINUTES = 15  # 15-minute intervals for optimization

    async def optimize_charging_schedule(
        self,
        db: Session,
        request: ChargingOptimizationRequest
    ) -> ChargingOptimizationResponse:
        """
        Develops an optimized charging schedule considering multiple factors:
        - Vehicle current SoC and battery characteristics
        - Grid load and capacity
        - Dynamic electricity pricing
        - Charging station constraints
        - Time constraints and user preferences
        """
        try:
            # Get vehicle information
            vehicle = await self._get_vehicle_info(db, request.vehicle_id)
            if not vehicle:
                raise ValueError(f"Vehicle {request.vehicle_id} not found")

            # Get current vehicle state
            current_soc = self._get_current_soc(vehicle)
            target_soc = request.target_soc_percent or 100.0

            # Validate basic parameters
            self._validate_charging_request(request, current_soc, target_soc)

            # Calculate energy requirements
            energy_needed = self._calculate_energy_needed(
                vehicle.battery_capacity_kwh,
                current_soc,
                target_soc
            )

            # Get charging power constraints
            max_power = self._get_max_charging_power(
                vehicle,
                request.max_charging_power_kw
            )

            # Get grid load forecasts
            load_forecasts = await self._get_grid_forecasts(
                db,
                request.station_id,
                datetime.utcnow(),
                request.departure_time
            )

            # Get dynamic tariffs - note: dynamic_pricing_service.calculate_dynamic_tariffs is not an async method
            # so we don't use await here
            tariffs = dynamic_pricing_service.calculate_dynamic_tariffs(
                db,
                request.station_id,
                datetime.utcnow(),
                request.departure_time,
                base_rate=0.15,  # Could be configurable
                renewable_percentage=self._get_renewable_percentage()
            )

            # Generate optimized schedule
            schedule = await self._generate_optimized_schedule(
                energy_needed,
                max_power,
                current_soc,
                vehicle.battery_capacity_kwh,
                datetime.utcnow(),
                request.departure_time,
                load_forecasts,
                tariffs
            )

            # Calculate total cost
            total_cost = None
            if schedule:
                # Note: dynamic_pricing_service.calculate_total_cost is not an
                # async method
                total_cost = dynamic_pricing_service.calculate_total_cost(
                    energy_needed,
                    schedule[0].start_time,
                    schedule[-1].end_time,
                    tariffs
                )["total_cost"]

            # Generate warnings
            warnings = await self._generate_warnings(
                schedule,
                target_soc,
                request.departure_time,
                energy_needed
            )

            return ChargingOptimizationResponse(
                vehicle_id=request.vehicle_id,
                optimized_schedule=schedule,
                total_estimated_cost=total_cost,
                warnings=warnings
            )

        except Exception as e:
            logger.error(f"Error optimizing charging schedule: {str(e)}")
            raise

    async def _get_vehicle_info(
            self,
            db: Session,
            vehicle_id: int) -> Optional[Vehicle]:
        """Get vehicle information from database."""
        return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    def _get_current_soc(self, vehicle: Vehicle) -> float:
        """Get current state of charge from vehicle telemetry."""
        if not vehicle.telematics_live:
            raise ValueError("No live telemetry data available for vehicle")
        return vehicle.telematics_live.battery_level_percent

    def _validate_charging_request(
        self,
        request: ChargingOptimizationRequest,
        current_soc: float,
        target_soc: float
    ) -> None:
        """Validate charging request parameters."""
        if target_soc <= current_soc:
            raise ValueError("Target SoC must be greater than current SoC")

        if request.departure_time <= datetime.utcnow():
            raise ValueError("Departure time must be in the future")

        if request.max_charging_power_kw and request.max_charging_power_kw < self.MIN_CHARGING_POWER:
            raise ValueError(
                f"Charging power must be at least {self.MIN_CHARGING_POWER} kW")

    def _calculate_energy_needed(
        self,
        battery_capacity_kwh: float,
        current_soc: float,
        target_soc: float
    ) -> float:
        """Calculate required energy in kWh."""
        return battery_capacity_kwh * (target_soc - current_soc) / 100.0

    def _get_max_charging_power(
        self,
        vehicle: Vehicle,
        requested_power: Optional[float]
    ) -> float:
        """Get maximum charging power considering vehicle and station limits."""
        vehicle_max = vehicle.max_charging_power_kw or 150.0  # Default if not specified
        return min(
            vehicle_max,
            requested_power or float('inf')
        )

    async def _get_grid_forecasts(
        self,
        db: Session,
        station_id: int,
        start_time: datetime,
        end_time: datetime
    ) -> List[GridLoadForecast]:
        """Get grid load forecasts for the charging period."""
        return db.query(GridLoadForecast).filter(
            GridLoadForecast.station_id == station_id,
            GridLoadForecast.timestamp >= start_time,
            GridLoadForecast.timestamp <= end_time
        ).order_by(GridLoadForecast.timestamp).all()

    def _get_renewable_percentage(self) -> float:
        """Get current renewable energy percentage from grid."""
        # This could be integrated with a grid monitoring service
        return 30.0  # Example value

    async def _generate_optimized_schedule(
        self,
        energy_needed: float,
        max_power: float,
        current_soc: float,
        battery_capacity: float,
        start_time: datetime,
        end_time: datetime,
        load_forecasts: List[GridLoadForecast],
        tariffs: List[Any]
    ) -> List[ChargingScheduleSlot]:
        """
        Generate optimized charging schedule using dynamic programming.
        Considers:
        - Grid load constraints
        - Electricity prices
        - Battery charging characteristics
        - Time constraints
        """
        schedule = []
        remaining_energy = energy_needed
        current_slot_soc = current_soc
        current_time = start_time

        # Sort time slots by cost effectiveness
        time_slots = await self._get_cost_effective_slots(
            start_time,
            end_time,
            load_forecasts,
            tariffs
        )

        for slot in time_slots:
            if remaining_energy <= 0:
                break

            # Calculate maximum power for this slot
            slot_max_power = min(
                max_power,
                slot['available_power']
            )

            # Calculate maximum energy that can be delivered in this slot
            slot_duration_hours = (
                slot['end_time'] - slot['start_time']).total_seconds() / 3600
            max_slot_energy = slot_max_power * slot_duration_hours

            # Calculate actual energy to deliver
            slot_energy = min(remaining_energy, max_slot_energy)

            if slot_energy > 0:
                # Calculate actual charging power
                charging_power = slot_energy / slot_duration_hours

                # Calculate SoC increase
                soc_increase = (slot_energy / battery_capacity) * 100

                schedule.append(
                    ChargingScheduleSlot(
                        start_time=slot['start_time'],
                        end_time=slot['end_time'],
                        charging_power_kw=charging_power,
                        estimated_soc_achieved_percent=current_slot_soc +
                        soc_increase))

                remaining_energy -= slot_energy
                current_slot_soc += soc_increase

        return schedule

    async def _get_cost_effective_slots(
        self,
        start_time: datetime,
        end_time: datetime,
        load_forecasts: List[GridLoadForecast],
        tariffs: List[Any]
    ) -> List[Dict[str, Any]]:
        """
        Get time slots sorted by cost effectiveness.
        Considers both electricity prices and grid load.
        """
        slots = []
        current_time = start_time
        interval = timedelta(minutes=self.TIME_SLOT_MINUTES)

        while current_time < end_time:
            next_time = min(current_time + interval, end_time)

            # Get grid load for this slot
            load = next(
                (f for f in load_forecasts if f.timestamp == current_time),
                None
            )

            # Get tariff for this slot
            tariff = next((t for t in tariffs if t.start_time <=
                           current_time < t.end_time), None)

            if load and tariff:
                # Calculate cost effectiveness score
                # Lower score = more cost effective
                load_factor = load.load_kw / load.peak_threshold_kw
                price_factor = tariff.base_rate * \
                    tariff.demand_multiplier * (1 - tariff.renewable_discount)
                score = load_factor * price_factor

                slots.append({
                    'start_time': current_time,
                    'end_time': next_time,
                    'available_power': load.available_capacity_kw,
                    'score': score
                })

            current_time = next_time

        return sorted(slots, key=lambda x: x['score'])

    async def _generate_warnings(
        self,
        schedule: List[ChargingScheduleSlot],
        target_soc: float,
        departure_time: datetime,
        energy_needed: float
    ) -> List[str]:
        """Generate warnings about the charging schedule."""
        warnings = []

        if not schedule:
            warnings.append("No viable charging schedule found")
            return warnings

        # Check if target SoC will be reached
        final_soc = schedule[-1].estimated_soc_achieved_percent
        if final_soc < target_soc - self.SOC_SAFETY_MARGIN:
            warnings.append(
                f"Target SoC of {target_soc}% may not be achieved. "
                f"Estimated final SoC: {final_soc:.1f}%"
            )

        # Check if charging extends beyond departure
        last_slot_end = schedule[-1].end_time
        if last_slot_end > departure_time:
            warnings.append("Charging schedule extends beyond departure time")

        # Check if charging power is reduced
        for slot in schedule:
            if slot.charging_power_kw < self.MIN_CHARGING_POWER:
                warnings.append(
                    f"Charging power reduced below {self.MIN_CHARGING_POWER}kW "
                    f"during some periods")
                break

        return warnings


smart_charging_service = SmartChargingService()
