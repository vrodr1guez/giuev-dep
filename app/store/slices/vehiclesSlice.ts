import { createSlice, PayloadAction } from '../../types/redux-toolkit';
import type { RootState } from '../index';
import type { Vehicle } from '../../types/models';

interface VehiclesState {
  items: Vehicle[];
  selectedVehicleId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: VehiclesState = {
  items: [],
  selectedVehicleId: null,
  loading: false,
  error: null,
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setVehicles: (state: VehiclesState, action: PayloadAction<Vehicle[]>) => {
      state.items = action.payload;
    },
    updateVehicle: (state: VehiclesState, action: PayloadAction<Vehicle>) => {
      const index = state.items.findIndex(vehicle => vehicle.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setSelectedVehicleId: (state: VehiclesState, action: PayloadAction<string | null>) => {
      state.selectedVehicleId = action.payload;
    },
    setLoading: (state: VehiclesState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: VehiclesState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setVehicles, 
  updateVehicle, 
  setSelectedVehicleId, 
  setLoading, 
  setError 
} = vehiclesSlice.actions;

export const selectVehicles = (state: RootState) => state.vehicles.items;
export const selectSelectedVehicleId = (state: RootState) => state.vehicles.selectedVehicleId;

export default vehiclesSlice.reducer; 