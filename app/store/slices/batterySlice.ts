import { createSlice, PayloadAction } from '../../types/redux-toolkit';
import {
  BatteryHealth,
  BatteryUsage,
  BatteryAlert,
  BatteryFilters,
  BatteryState
} from '../../types/battery';

const initialState: BatteryState = {
  healthData: [],
  usageHistory: [],
  alerts: [],
  filters: {
    sohRange: [0, 100],
  },
  loading: false,
  error: null
};

const batterySlice = createSlice({
  name: 'battery',
  initialState,
  reducers: {
    setHealthData: (state: BatteryState, action: PayloadAction<BatteryHealth[]>) => {
      state.healthData = action.payload;
    },
    updateHealthData: (state: BatteryState, action: PayloadAction<BatteryHealth>) => {
      const index = state.healthData.findIndex((h: BatteryHealth) => h.vehicleId === action.payload.vehicleId);
      if (index !== -1) {
        state.healthData[index] = action.payload;
      } else {
        state.healthData.push(action.payload);
      }
    },
    addUsageData: (state: BatteryState, action: PayloadAction<BatteryUsage>) => {
      state.usageHistory.push(action.payload);
      // Keep history size manageable by removing old entries
      if (state.usageHistory.length > 1000) {
        state.usageHistory = state.usageHistory.slice(-1000);
      }
    },
    addAlert: (state: BatteryState, action: PayloadAction<BatteryAlert>) => {
      state.alerts.unshift(action.payload);
      // Keep alerts list manageable
      if (state.alerts.length > 100) {
        state.alerts = state.alerts.slice(0, 100);
      }
    },
    clearAlerts: (state: BatteryState, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((alert: BatteryAlert) => alert.vehicleId !== action.payload);
    },
    setFilters: (state: BatteryState, action: PayloadAction<Partial<BatteryFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state: BatteryState) => {
      state.filters = initialState.filters;
    },
    setLoading: (state: BatteryState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: BatteryState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
});

export const {
  setHealthData,
  updateHealthData,
  addUsageData,
  addAlert,
  clearAlerts,
  setFilters,
  clearFilters,
  setLoading,
  setError
} = batterySlice.actions;

export default batterySlice.reducer; 