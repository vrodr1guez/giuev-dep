/// <reference path="../types/react.d.ts" />
import React from 'react';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { AppDispatch } from '../store';
import { RootState } from '../types/store';
import { wsService, WS_MESSAGE_TYPES } from '../services/websocket';
import {
  BatteryHealth,
  BatteryUsage,
  BatteryAlert,
  BatteryAnalytics,
  BatteryPrediction
} from '../types/battery';
import {
  updateHealthData,
  addUsageData,
  addAlert,
} from '../store/slices/batterySlice';
import { api, endpoints } from '../services/api';

// Create typed hooks
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useBatteryAnalytics = (vehicleId?: string) => {
  const dispatch = useAppDispatch();
  const healthData = useAppSelector(state => state.battery.healthData);
  const usageHistory = useAppSelector(state => state.battery.usageHistory);
  const alerts = useAppSelector(state => state.battery.alerts);
  const filters = useAppSelector(state => state.battery.filters);

  // Fetch battery health data for a specific vehicle or all vehicles
  const fetchBatteryHealth = async () => {
    try {
      const url = vehicleId
        ? `${endpoints.battery.health}/${vehicleId}`
        : endpoints.battery.health;
      const response = await api.get<BatteryHealth[]>(url);
      response.forEach((health: BatteryHealth) => dispatch(updateHealthData(health)));
    } catch (error) {
      console.error('Error fetching battery health data:', error);
    }
  };

  // Subscribe to real-time battery updates
  React.useEffect(() => {
    const unsubscribeHealth = wsService.subscribe(
      WS_MESSAGE_TYPES.BATTERY_ALERT,
      (payload: BatteryAlert) => {
        if (!vehicleId || payload.vehicleId === vehicleId) {
          dispatch(addAlert(payload));
        }
      }
    );

    const unsubscribeUsage = wsService.subscribe(
      WS_MESSAGE_TYPES.BATTERY_USAGE,
      (payload: BatteryUsage) => {
        if (!vehicleId || payload.vehicleId === vehicleId) {
          dispatch(addUsageData(payload));
        }
      }
    );

    return () => {
      unsubscribeHealth();
      unsubscribeUsage();
    };
  }, [dispatch, vehicleId]);

  // Initial fetch
  React.useEffect(() => {
    fetchBatteryHealth();
  }, [vehicleId]);

  // Filter and process data
  const filteredData = {
    health: vehicleId
      ? healthData.find((h: BatteryHealth) => h.vehicleId === vehicleId)
      : healthData.filter((h: BatteryHealth) => 
          h.stateOfHealth >= filters.sohRange[0] && h.stateOfHealth <= filters.sohRange[1]
        ),
    usage: usageHistory.filter((u: BatteryUsage) => !vehicleId || u.vehicleId === vehicleId),
    alerts: alerts.filter((a: BatteryAlert) => !vehicleId || a.vehicleId === vehicleId),
  };

  // Analytics calculations
  const analytics: BatteryAnalytics = {
    averageSoH: healthData.length
      ? healthData.reduce((sum: number, h: BatteryHealth) => sum + h.stateOfHealth, 0) / healthData.length
      : 0,
    criticalVehicles: healthData.filter((h: BatteryHealth) => h.stateOfHealth < 80).length,
    totalAlerts: alerts.length,
    alertsByType: alerts.reduce((acc: Record<string, number>, alert: BatteryAlert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    // Example value or calculation for degradation rate - should be calculated from historical data
    degradationRate: healthData.length
      ? healthData.reduce((sum: number, h: BatteryHealth) => {
          // Calculate estimated degradation based on max capacity and cycle count
          const estimatedDegradation = (h.maximumCapacity * 0.0002 * h.cycleCount) / 100;
          return sum + estimatedDegradation;
        }, 0) / healthData.length
      : undefined,
    chargingEfficiency: 0.92, // Example value, should be calculated based on actual data
    temperatureImpact: {
      optimal: true,
      recommendations: []
    },
    usagePatterns: {
      fastChargingFrequency: 0,
      deepDischargeFrequency: 0,
      recommendations: []
    }
  };

  // Predictions and recommendations
  const getPredictions = (vehicleHealth: BatteryHealth) => {
    // Estimate predicted lifespan based on cycle count and capacity
    const estimatedLifespan = 120 - ((100 - vehicleHealth.stateOfHealth) * 1.5);
    
    // Calculate months to next service based on cycle count
    const monthsToNextService = Math.max(
      0,
      estimatedLifespan - (vehicleHealth.cycleCount / 30) // Assuming 30 cycles per month
    );

    // Generate recommendations based on health data
    const recommendations = [];
    if (vehicleHealth.stateOfHealth < 85) {
      recommendations.push("Consider reducing fast charging frequency");
    }
    if (vehicleHealth.temperature && vehicleHealth.temperature > 35) {
      recommendations.push("Monitor battery temperature during charging");
    }
    if (vehicleHealth.anomalyDetected) {
      recommendations.push("Schedule battery inspection");
    }

    return {
      remainingLifespan: estimatedLifespan,
      recommendedActions: recommendations,
      nextServiceDate: new Date(
        Date.now() + monthsToNextService * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  };

  return {
    data: filteredData,
    analytics,
    getPredictions,
    refreshData: fetchBatteryHealth,
  };
};

export default useBatteryAnalytics; 