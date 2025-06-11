from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.grid import DynamicTariff, GridLoadForecast
from app.core.logging import logger


class DynamicPricingService:
    def __init__(self):
        self.BASE_DEMAND_THRESHOLD = 0.7  # 70% of peak capacity
        self.MAX_DEMAND_MULTIPLIER = 2.0  # Maximum price multiplier for high demand
        self.MIN_DEMAND_MULTIPLIER = 0.8  # Minimum price multiplier for low demand
        self.RENEWABLE_MAX_DISCOUNT = 0.2  # Maximum discount for renewable energy

    def calculate_dynamic_tariffs(
        self,
        db: Session,
        station_id: int,
        start_time: datetime,
        end_time: datetime,
        base_rate: float,
        renewable_percentage: Optional[float] = None
    ) -> List[DynamicTariff]:
        """
        Calculate dynamic tariffs based on demand and renewable energy availability.

        Args:
            db: Database session
            station_id: Charging station ID
            start_time: Start time for tariff calculation
            end_time: End time for tariff calculation
            base_rate: Base electricity rate
            renewable_percentage: Percentage of renewable energy available

        Returns:
            List of dynamic tariffs for the specified period
        """
        try:
            # Get grid load forecasts
            load_forecasts = self._get_load_forecasts(
                db, station_id, start_time, end_time)

            # Calculate demand-based multipliers
            demand_multipliers = self._calculate_demand_multipliers(
                load_forecasts)

            # Calculate renewable energy discount
            renewable_discount = self._calculate_renewable_discount(
                renewable_percentage)

            # Generate tariffs
            tariffs = []
            current_time = start_time
            interval = timedelta(minutes=15)  # 15-minute intervals

            while current_time < end_time:
                next_time = min(current_time + interval, end_time)

                tariff = DynamicTariff(
                    station_id=station_id,
                    start_time=current_time,
                    end_time=next_time,
                    base_rate=base_rate,
                    demand_multiplier=demand_multipliers.get(
                        current_time,
                        1.0
                    ),
                    renewable_discount=renewable_discount
                )

                tariffs.append(tariff)
                current_time = next_time

            return tariffs

        except Exception as e:
            logger.error(f"Error calculating dynamic tariffs: {str(e)}")
            raise

    def _get_load_forecasts(
        self,
        db: Session,
        station_id: int,
        start_time: datetime,
        end_time: datetime
    ) -> List[GridLoadForecast]:
        """Get grid load forecasts for tariff calculation."""
        return db.query(GridLoadForecast).filter(
            and_(
                GridLoadForecast.station_id == station_id,
                GridLoadForecast.timestamp >= start_time,
                GridLoadForecast.timestamp <= end_time
            )
        ).order_by(GridLoadForecast.timestamp).all()

    def _calculate_demand_multipliers(
        self,
        load_forecasts: List[GridLoadForecast]
    ) -> Dict[datetime, float]:
        """Calculate price multipliers based on demand."""
        multipliers = {}

        for forecast in load_forecasts:
            # Calculate demand ratio
            demand_ratio = forecast.load_kw / forecast.peak_threshold_kw

            # Calculate multiplier based on demand
            if demand_ratio <= self.BASE_DEMAND_THRESHOLD:
                # Low demand - discount
                multiplier = max(
                    self.MIN_DEMAND_MULTIPLIER,
                    1.0 - (self.BASE_DEMAND_THRESHOLD - demand_ratio)
                )
            else:
                # High demand - premium
                multiplier = min(
                    self.MAX_DEMAND_MULTIPLIER,
                    1.0 + (demand_ratio - self.BASE_DEMAND_THRESHOLD)
                )

            multipliers[forecast.timestamp] = multiplier

        return multipliers

    def _calculate_renewable_discount(
        self,
        renewable_percentage: Optional[float]
    ) -> float:
        """Calculate discount based on renewable energy availability."""
        if renewable_percentage is None:
            return 0.0

        # Linear discount based on renewable percentage
        return min(
            self.RENEWABLE_MAX_DISCOUNT,
            (renewable_percentage / 100.0) * self.RENEWABLE_MAX_DISCOUNT
        )

    def calculate_total_cost(
        self,
        energy_kwh: float,
        start_time: datetime,
        end_time: datetime,
        tariffs: List[DynamicTariff]
    ) -> Dict[str, float]:
        """
        Calculate total cost considering all pricing factors.

        Args:
            energy_kwh: Total energy consumption in kWh
            start_time: Start time of charging
            end_time: End time of charging
            tariffs: List of applicable tariffs

        Returns:
            Dictionary with cost breakdown
        """
        try:
            total_duration = (
                end_time - start_time).total_seconds() / 3600  # hours
            energy_per_hour = energy_kwh / total_duration

            base_cost = 0.0
            demand_cost = 0.0
            renewable_discount = 0.0

            for tariff in tariffs:
                if tariff.start_time >= end_time or tariff.end_time <= start_time:
                    continue

                # Calculate overlap duration
                overlap_start = max(start_time, tariff.start_time)
                overlap_end = min(end_time, tariff.end_time)
                overlap_hours = (
                    overlap_end - overlap_start).total_seconds() / 3600

                # Calculate energy consumed during this tariff period
                period_energy = energy_per_hour * overlap_hours

                # Calculate costs
                period_base_cost = period_energy * tariff.base_rate
                period_demand_cost = period_base_cost * \
                    (tariff.demand_multiplier - 1.0)
                period_discount = period_base_cost * tariff.renewable_discount

                base_cost += period_base_cost
                demand_cost += period_demand_cost
                renewable_discount += period_discount

            total_cost = base_cost + demand_cost - renewable_discount

            return {
                "base_cost": round(base_cost, 2),
                "demand_cost": round(demand_cost, 2),
                "renewable_discount": round(renewable_discount, 2),
                "total_cost": round(total_cost, 2)
            }

        except Exception as e:
            logger.error(f"Error calculating total cost: {str(e)}")
            raise


dynamic_pricing_service = DynamicPricingService()
