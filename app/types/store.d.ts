import { BatteryState } from '../store/slices/batterySlice';

export interface RootState {
  battery: BatteryState;
  // Add other state slices here as needed
} 