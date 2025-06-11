import api from './api';

export interface ChargingSession {
  id: number;
  vehicle_id: number;
  charging_station_id: number;
  connector_id: number;
  user_id: number | null;
  start_time: string;
  end_time: string | null;
  start_soc_percent: number | null;
  end_soc_percent: number | null;
  energy_delivered_kwh: number | null;
  total_cost: number | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ChargingSessionListResponse {
  total: number;
  sessions: ChargingSession[];
}

export interface SessionFilter {
  skip?: number;
  limit?: number;
  vehicle_id?: number;
  charging_station_id?: number;
  is_completed?: boolean;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface SessionCreateRequest {
  vehicle_id: number;
  charging_station_id: number;
  connector_id: number;
  start_soc_percent?: number;
}

export interface SessionUpdateRequest {
  end_time?: string;
  end_soc_percent?: number;
  energy_delivered_kwh?: number;
  total_cost?: number;
  is_completed?: boolean;
}

const ChargingSessionsService = {
  // Get all charging sessions with optional filters
  getSessions: async (filters: SessionFilter = {}): Promise<ChargingSessionListResponse> => {
    const response = await api.get<ChargingSessionListResponse>('/charging-sessions', {
      params: filters,
    });
    return response.data;
  },

  // Get a specific charging session by ID
  getSession: async (id: number): Promise<ChargingSession> => {
    const response = await api.get<ChargingSession>(`/charging-sessions/${id}`);
    return response.data;
  },

  // Start a new charging session
  startSession: async (data: SessionCreateRequest): Promise<ChargingSession> => {
    const response = await api.post<ChargingSession>('/charging-sessions', data);
    return response.data;
  },

  // Update/end a charging session
  updateSession: async (id: number, data: SessionUpdateRequest): Promise<ChargingSession> => {
    const response = await api.put<ChargingSession>(`/charging-sessions/${id}`, data);
    return response.data;
  },

  // Delete a charging session (admin only)
  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/charging-sessions/${id}`);
  },
};

export default ChargingSessionsService; 