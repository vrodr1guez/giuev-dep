// Define store structure
export interface BatteryState {
  healthData: any[];
  usageHistory: any[];
  alerts: any[];
  filters: any;
  loading: boolean;
  error: string | null;
}

export interface VehiclesState {
  items: any[];
  loading: boolean;
  error: string;
  selectedVehicleId: string | null;
}

export interface ChargingState {
  stations: any[];
  filters: any;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  battery: BatteryState;
  vehicles: VehiclesState;
  charging: ChargingState;
  [key: string]: any;
}

// Mock store for imports
export const store = {
  getState: () => ({} as RootState),
  dispatch: (action: any) => {},
  subscribe: (listener: () => void) => () => {},
};

// Mock dispatch type for hooks
export type AppDispatch = typeof store.dispatch; 