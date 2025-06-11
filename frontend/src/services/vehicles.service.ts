import api from './api';

export interface Vehicle {
  id: number;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  battery_capacity_kwh: number;
  nominal_range_km: number;
  organization_id: number;
  fleet_id: number | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface VehicleListResponse {
  total: number;
  vehicles: Vehicle[];
}

export interface VehicleFilter {
  skip?: number;
  limit?: number;
  organization_id?: number;
  fleet_id?: number;
  status?: string;
}

export interface VehicleTelematicsLive {
  vehicle_id: number;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  speed_kmh: number | null;
  state_of_charge_percent: number | null;
  state_of_health_percent: number | null;
  odometer_km: number | null;
  is_charging: boolean;
  ambient_temperature_celsius: number | null;
  updated_at: string;
}

export interface VehicleTelematicsHistory {
  log_id: number;
  vehicle_id: number;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  speed_kmh: number | null;
  state_of_charge_percent: number | null;
  energy_consumed_kwh_since_last: number | null;
  odometer_km: number | null;
  diagnostic_trouble_codes: string[];
}

const VehiclesService = {
  // Get all vehicles with optional filters
  getVehicles: async (filters: VehicleFilter = {}): Promise<VehicleListResponse> => {
    const response = await api.get<VehicleListResponse>('/vehicles', {
      params: filters,
    });
    return response.data;
  },

  // Get a specific vehicle by ID
  getVehicle: async (id: number): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  // Create a new vehicle
  createVehicle: async (data: any): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  // Update a vehicle
  updateVehicle: async (id: number, data: any): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  // Delete a vehicle
  deleteVehicle: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  // Get live telematics data for a vehicle
  getLiveTelematicsData: async (vehicle_id: number): Promise<VehicleTelematicsLive> => {
    const response = await api.get<VehicleTelematicsLive>(`/telematics/live/${vehicle_id}`);
    return response.data;
  },

  // Get historical telematics data for a vehicle
  getHistoricalTelematicsData: async (
    vehicle_id: number,
    start_date?: string,
    end_date?: string,
    limit?: number
  ): Promise<VehicleTelematicsHistory[]> => {
    const response = await api.get<{
      records: VehicleTelematicsHistory[];
    }>(`/telematics/history/${vehicle_id}`, {
      params: {
        start_date,
        end_date,
        limit,
      },
    });
    return response.data.records;
  },
};

export default VehiclesService; 