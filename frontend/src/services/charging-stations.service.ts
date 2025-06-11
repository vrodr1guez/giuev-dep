import api from './api';

export interface ChargingConnector {
  id: number;
  charging_station_id: number;
  connector_type: string;
  power_kw: number;
  voltage: number;
  amperage: number;
  connector_number: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChargingStation {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  status: string;
  organization_id: number;
  is_public: boolean;
  hourly_rate: number | null;
  has_restroom: boolean;
  has_convenience_store: boolean;
  has_restaurant: boolean;
  open_24_hours: boolean;
  connectors: ChargingConnector[];
  created_at: string;
  updated_at: string;
}

export interface StationListResponse {
  total: number;
  stations: ChargingStation[];
}

export interface StationFilter {
  skip?: number;
  limit?: number;
  status?: string;
  is_public?: boolean;
  organization_id?: number;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

const ChargingStationsService = {
  // Get all charging stations with optional filters
  getStations: async (filters: StationFilter = {}): Promise<StationListResponse> => {
    const response = await api.get<StationListResponse>('/charging-stations', {
      params: filters,
    });
    return response.data;
  },

  // Get a specific charging station by ID
  getStation: async (id: number): Promise<ChargingStation> => {
    const response = await api.get<ChargingStation>(`/charging-stations/${id}`);
    return response.data;
  },

  // Create a new charging station
  createStation: async (data: any): Promise<ChargingStation> => {
    const response = await api.post<ChargingStation>('/charging-stations', data);
    return response.data;
  },

  // Update a charging station
  updateStation: async (id: number, data: any): Promise<ChargingStation> => {
    const response = await api.put<ChargingStation>(`/charging-stations/${id}`, data);
    return response.data;
  },

  // Delete a charging station
  deleteStation: async (id: number): Promise<void> => {
    await api.delete(`/charging-stations/${id}`);
  },

  // Add a connector to a station
  addConnector: async (stationId: number, data: any): Promise<ChargingConnector> => {
    const response = await api.post<ChargingConnector>(
      `/charging-stations/${stationId}/connectors`,
      data
    );
    return response.data;
  },

  // Update a connector
  updateConnector: async (
    stationId: number,
    connectorId: number,
    data: any
  ): Promise<ChargingConnector> => {
    const response = await api.put<ChargingConnector>(
      `/charging-stations/${stationId}/connectors/${connectorId}`,
      data
    );
    return response.data;
  },

  // Delete a connector
  deleteConnector: async (stationId: number, connectorId: number): Promise<void> => {
    await api.delete(`/charging-stations/${stationId}/connectors/${connectorId}`);
  },
};

export default ChargingStationsService; 