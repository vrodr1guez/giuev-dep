/// <reference path="../types/react.d.ts" />
import React from 'react';
import { useDispatch } from 'react-redux';
import { wsService, WS_MESSAGE_TYPES } from '../services/websocket';
import { updateVehicle } from '../store/slices/vehiclesSlice';
import type { Vehicle } from '../types/models';

export const useVehicleUpdates = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    // Subscribe to vehicle updates
    const unsubscribe = wsService.subscribe(
      WS_MESSAGE_TYPES.VEHICLE_STATUS,
      (payload: Vehicle) => {
        dispatch(updateVehicle(payload));
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [dispatch]);
};

export default useVehicleUpdates; 