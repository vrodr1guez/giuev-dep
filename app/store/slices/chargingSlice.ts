import { createSlice, PayloadAction } from '../../types/redux-toolkit';
import type { RootState } from '../index';
import { ChargingStation, ChargingSession, ChargingState } from '../../types/charging';

const initialState: ChargingState = {
  stations: [],
  sessions: [],
  selectedStationId: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    connectorTypes: [],
  },
};

const chargingSlice = createSlice({
  name: 'charging',
  initialState,
  reducers: {
    setStations: (state: ChargingState, action: PayloadAction<ChargingStation[]>) => {
      state.stations = action.payload;
    },
    updateStation: (state: ChargingState, action: PayloadAction<ChargingStation>) => {
      const index = state.stations.findIndex((s: ChargingStation) => s.id === action.payload.id);
      if (index !== -1) {
        state.stations[index] = action.payload;
      }
    },
    addSession: (state: ChargingState, action: PayloadAction<ChargingSession>) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state: ChargingState, action: PayloadAction<ChargingSession>) => {
      const index = state.sessions.findIndex((s: ChargingSession) => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    },
    setSelectedStation: (state: ChargingState, action: PayloadAction<string | null>) => {
      state.selectedStationId = action.payload;
    },
    setLoading: (state: ChargingState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: ChargingState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state: ChargingState, action: PayloadAction<Partial<ChargingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state: ChargingState) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setStations,
  updateStation,
  addSession,
  updateSession,
  setSelectedStation,
  setLoading,
  setError,
  setFilters,
  clearFilters,
} = chargingSlice.actions;

export const selectChargingState = (state: RootState) => state.charging;

export default chargingSlice.reducer; 