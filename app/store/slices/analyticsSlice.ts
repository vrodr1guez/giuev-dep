import { createSlice, PayloadAction } from '../../types/redux-toolkit';

interface AnalyticsState {
  loading: boolean;
  error: string | null;
  data: {
    fleetEfficiency: number;
    chargingOptimization: number;
    batteryHealth: number;
    driverPerformance: number;
  };
}

const initialState: AnalyticsState = {
  loading: false,
  error: null,
  data: {
    fleetEfficiency: 0,
    chargingOptimization: 0,
    batteryHealth: 0,
    driverPerformance: 0,
  },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsData: (state: AnalyticsState, action: PayloadAction<AnalyticsState['data']>) => {
      state.data = action.payload;
    },
    setLoading: (state: AnalyticsState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: AnalyticsState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAnalyticsData, setLoading, setError } = analyticsSlice.actions;
export default analyticsSlice.reducer; 