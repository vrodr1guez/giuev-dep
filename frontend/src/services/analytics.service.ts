import api from './api';

export interface ChargingSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  charging: {
    total_sessions: number;
    total_energy_kwh: number;
    avg_session_duration_minutes: number;
    avg_energy_per_session_kwh: number;
  };
  cost: {
    total_cost: number;
    avg_cost_per_kwh: number;
    avg_cost_per_session: number;
  };
}

export interface DailyConsumptionData {
  date: string;
  energy_kwh: number;
  session_count: number;
}

export interface EnergyConsumptionByDay {
  period: {
    start_date: string;
    end_date: string;
  };
  daily_data: DailyConsumptionData[];
}

export interface StationMetrics {
  station_id: number;
  station_name: string;
  connector_count: number;
  session_count: number;
  total_energy_delivered_kwh: number;
  total_charging_hours: number;
  utilization_percent: number;
}

export interface StationUtilization {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  stations: StationMetrics[];
}

export interface VehicleEfficiencyMetrics {
  vehicle_id: number;
  vin: string;
  make: string;
  model: string;
  total_energy_consumed_kwh: number;
  estimated_distance_km: number;
  efficiency_kwh_per_100km: number;
}

export interface VehicleEfficiency {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  vehicles: VehicleEfficiencyMetrics[];
}

const AnalyticsService = {
  // Get charging summary
  getChargingSummary: async (
    start_date?: string,
    end_date?: string,
    organization_id?: number,
    fleet_id?: number
  ): Promise<ChargingSummary> => {
    const response = await api.get<ChargingSummary>('/analytics/charging-summary', {
      params: {
        start_date,
        end_date,
        organization_id,
        fleet_id,
      },
    });
    return response.data;
  },

  // Get energy consumption by day
  getEnergyConsumptionByDay: async (
    days: number = 30,
    organization_id?: number,
    fleet_id?: number
  ): Promise<EnergyConsumptionByDay> => {
    const response = await api.get<EnergyConsumptionByDay>(
      '/analytics/energy-consumption-by-day',
      {
        params: {
          days,
          organization_id,
          fleet_id,
        },
      }
    );
    return response.data;
  },

  // Get station utilization
  getStationUtilization: async (
    days: number = 30,
    organization_id?: number
  ): Promise<StationUtilization> => {
    const response = await api.get<StationUtilization>('/analytics/station-utilization', {
      params: {
        days,
        organization_id,
      },
    });
    return response.data;
  },

  // Get vehicle efficiency
  getVehicleEfficiency: async (
    days: number = 30,
    organization_id?: number,
    fleet_id?: number
  ): Promise<VehicleEfficiency> => {
    const response = await api.get<VehicleEfficiency>('/analytics/vehicle-efficiency', {
      params: {
        days,
        organization_id,
        fleet_id,
      },
    });
    return response.data;
  },
};

export default AnalyticsService; 