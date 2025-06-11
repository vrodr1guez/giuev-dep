from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.vehicle import Vehicle
from app.models.charging import ChargingStation
from app.schemas.charging import (
    ChargingOptimizationRequest,
    ChargingOptimizationResponse,
    ChargingScheduleSlot
)
from app.core.logging import logger


class ChargingOptimizer:
    def __init__(self):
        self.MIN_CHARGING_POWER = 1.0  # Minimum charging power in kW
        self.SOC_SAFETY_MARGIN = 5.0  # Safety margin for SoC calculations in percent

    async def optimize_charging_schedule(
        self,
        db: Session,
        request: ChargingOptimizationRequest
    ) -> ChargingOptimizationResponse:
        """
        Optimize the charging schedule based on various constraints.

        Args:
            db: Database session
            request: Charging optimization request containing constraints

        Returns:
            ChargingOptimizationResponse with optimized charging schedule
        """
        try:
            # Get vehicle information
            vehicle = await self._get_vehicle(db, request.vehicle_id)
            if not vehicle:
                raise ValueError(f"Vehicle {request.vehicle_id} not found")

            # Get current vehicle state
            current_soc = await self._get_current_soc(vehicle)
            target_soc = request.target_soc_percent or 100.0

            # Validate inputs
            await self._validate_optimization_request(request, current_soc, target_soc)

            # Calculate required energy
            required_energy_kwh = self._calculate_required_energy(
                vehicle.battery_capacity_kwh,
                current_soc,
                target_soc
            )

            # Get charging power constraints
            max_power = min(
                request.max_charging_power_kw or float('inf'),
                await self._get_max_charging_power(vehicle)
            )

            # Get station info if needed (using the new station_id field)
            station = db.query(ChargingStation).filter(
                ChargingStation.id == request.station_id).first()
            if not station:
                logger.warning(
                    f"Station {request.station_id} not found, proceeding without station-specific constraints")

            # Generate optimized schedule
            schedule = await self._generate_charging_schedule(
                current_time=datetime.utcnow(),
                departure_time=request.departure_time,
                required_energy_kwh=required_energy_kwh,
                max_power_kw=max_power,
                tariffs=request.electricity_tariffs,
                battery_capacity_kwh=vehicle.battery_capacity_kwh,
                current_soc=current_soc
            )

            # Calculate total cost
            total_cost = await self._calculate_total_cost(schedule, request.electricity_tariffs)

            # Generate warnings if any
            warnings = await self._generate_warnings(
                schedule,
                target_soc,
                request.departure_time
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

    async def _get_vehicle(
            self,
            db: Session,
            vehicle_id: int) -> Optional[Vehicle]:
        """Get vehicle information from database."""
        return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    async def _get_current_soc(self, vehicle: Vehicle) -> float:
        """Get current state of charge from vehicle telemetry."""
        if not vehicle.telematics_live:
            raise ValueError("No live telemetry data available for vehicle")
        return vehicle.telematics_live.battery_level_percent

    async def _validate_optimization_request(
        self,
        request: ChargingOptimizationRequest,
        current_soc: float,
        target_soc: float
    ) -> None:
        """Validate optimization request parameters."""
        if target_soc <= current_soc:
            raise ValueError("Target SoC must be greater than current SoC")

        if request.departure_time <= datetime.utcnow():
            raise ValueError("Departure time must be in the future")

        if request.max_charging_power_kw and request.max_charging_power_kw < self.MIN_CHARGING_POWER:
            raise ValueError(
                f"Charging power must be at least {self.MIN_CHARGING_POWER} kW")

    def _calculate_required_energy(
        self,
        battery_capacity_kwh: float,
        current_soc: float,
        target_soc: float
    ) -> float:
        """Calculate required energy in kWh to reach target SoC."""
        return battery_capacity_kwh * (target_soc - current_soc) / 100.0

    async def _get_max_charging_power(self, vehicle: Vehicle) -> float:
        """Get maximum charging power supported by the vehicle."""
        # This should be retrieved from vehicle specifications
        # For now, using a default value
        return 150.0  # kW

    async def _generate_charging_schedule(
        self,
        current_time: datetime,
        departure_time: datetime,
        required_energy_kwh: float,
        max_power_kw: float,
        tariffs: Optional[List[Dict[str, Any]]],
        battery_capacity_kwh: float,
        current_soc: float
    ) -> List[ChargingScheduleSlot]:
        """Generate optimized charging schedule."""
        schedule = []
        remaining_energy = required_energy_kwh
        current_slot_time = current_time
        current_slot_soc = current_soc

        # Sort time slots by electricity rate if tariffs are provided
        time_slots = await self._get_sorted_time_slots(
            current_time,
            departure_time,
            tariffs
        )

        for slot in time_slots:
            if remaining_energy <= 0:
                break

            slot_duration_hours = (
                slot['end_time'] - slot['start_time']).total_seconds() / 3600
            max_slot_energy = max_power_kw * slot_duration_hours
            slot_energy = min(remaining_energy, max_slot_energy)

            if slot_energy > 0:
                charging_power = slot_energy / slot_duration_hours
                soc_increase = (slot_energy / battery_capacity_kwh) * 100

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

    async def _get_sorted_time_slots(
        self,
        start_time: datetime,
        end_time: datetime,
        tariffs: Optional[List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """Get time slots sorted by electricity rate."""
        if not tariffs:
            # If no tariffs provided, create uniform time slots
            slots = []
            current = start_time
            while current < end_time:
                next_time = min(current + timedelta(hours=1), end_time)
                slots.append({
                    'start_time': current,
                    'end_time': next_time,
                    'rate': 1.0  # Default rate
                })
                current = next_time
            return slots

        # Sort slots by rate (lowest first)
        return sorted(tariffs, key=lambda x: x['rate'])

    async def _calculate_total_cost(
        self,
        schedule: List[ChargingScheduleSlot],
        tariffs: Optional[List[Dict[str, Any]]]
    ) -> Optional[float]:
        """Calculate total cost of charging schedule."""
        if not tariffs:
            return None

        total_cost = 0.0
        for slot in schedule:
            slot_rate = await self._get_slot_rate(slot.start_time, tariffs)
            slot_duration_hours = (
                slot.end_time - slot.start_time).total_seconds() / 3600
            slot_energy = slot.charging_power_kw * slot_duration_hours
            total_cost += slot_energy * slot_rate

        return round(total_cost, 2)

    async def _get_slot_rate(
        self,
        time: datetime,
        tariffs: List[Dict[str, Any]]
    ) -> float:
        """Get electricity rate for a given time."""
        for tariff in tariffs:
            start_time = datetime.strptime(
                tariff['start_time'], '%H:%M').time()
            end_time = datetime.strptime(tariff['end_time'], '%H:%M').time()

            if start_time <= time.time() <= end_time:
                return tariff['rate']

        return max(tariff['rate']
                   for tariff in tariffs)  # Default to highest rate

    async def _generate_warnings(
        self,
        schedule: List[ChargingScheduleSlot],
        target_soc: float,
        departure_time: datetime
    ) -> List[str]:
        """Generate warnings for the charging schedule."""
        warnings = []

        if not schedule:
            warnings.append("No viable charging schedule found")
            return warnings

        final_soc = schedule[-1].estimated_soc_achieved_percent
        if final_soc < target_soc - self.SOC_SAFETY_MARGIN:
            warnings.append(
                f"Target SoC of {target_soc}% may not be achieved. "
                f"Estimated final SoC: {final_soc:.1f}%"
            )

        last_slot_end = schedule[-1].end_time
        if last_slot_end > departure_time:
            warnings.append("Charging schedule extends beyond departure time")

        return warnings


charging_optimizer = ChargingOptimizer()
