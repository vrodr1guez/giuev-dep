/// <reference path="../types/react.d.ts" />
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { wsService, WS_MESSAGE_TYPES } from '../services/websocket';
import { updateStation, setStations } from '../store/slices/chargingSlice';
import { ChargingStation, ConnectorType } from '../types/models';
import { RootState } from '../store';
import { api, endpoints } from '../services/api';

export const useChargingStations = () => {
  const dispatch = useDispatch();
  const stations = useSelector((state: RootState) => state.charging.stations);
  const filters = useSelector((state: RootState) => state.charging.filters);
  const loading = useSelector((state: RootState) => state.charging.loading);
  const error = useSelector((state: RootState) => state.charging.error);

  // Fetch charging stations
  const fetchStations = async () => {
    try {
      const response = await api.get<ChargingStation[]>(endpoints.charging.stations);
      dispatch(setStations(response));
    } catch (error) {
      console.error('Error fetching charging stations:', error);
    }
  };

  // Subscribe to real-time updates
  React.useEffect(() => {
    const unsubscribe = wsService.subscribe(
      WS_MESSAGE_TYPES.CHARGING_STATUS,
      (payload: ChargingStation) => {
        dispatch(updateStation(payload));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // Initial fetch
  React.useEffect(() => {
    fetchStations();
  }, []);

  // Filter stations based on current filters
  const filteredStations = stations.filter((station: ChargingStation) => {
    if (filters.status.length > 0 && !filters.status.includes(station.status)) {
      return false;
    }
    if (
      filters.connectorTypes.length > 0 &&
      !station.connectors.some((connector) => filters.connectorTypes.includes(connector.type))
    ) {
      return false;
    }
    if (filters.network && station.networkId !== filters.network) {
      return false;
    }
    if (filters.isPublic !== undefined && station.isPublic !== filters.isPublic) {
      return false;
    }
    return true;
  });

  // Get station by ID
  const getStationById = (id: string) => 
    stations.find((s: ChargingStation) => s.id === id);

  // Get available stations
  const getAvailableStations = () => 
    stations.filter((s: ChargingStation) => s.status === 'available');

  // Get stations with issues
  const getStationsWithIssues = () =>
    stations.filter((s: ChargingStation) => s.status === 'offline' || s.status === 'maintenance');

  return {
    stations: filteredStations,
    loading,
    error,
    getStationById,
    getAvailableStations,
    getStationsWithIssues,
    refreshStations: fetchStations,
  };
};

export default useChargingStations; 