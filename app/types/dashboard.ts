import React from 'react';
import { ApiResponse, PaginatedResponse } from './base';

export interface VehicleStatus {
  name: string;
  count: number;
  fill: string;
}

export interface EnergyConsumption {
  date: string;
  consumption: number;
}

export interface SoCDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface ChargingSession {
  date: string;
  sessions: number;
  avgDurationMin: number;
}

export interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  link: string;
  linkText: string;
}

export interface DashboardStats {
  totalVehicles: number;
  avgSoC: number;
  todayEnergyKwh: number;
  chargingNow: number;
}

export interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
}

export interface DashboardData {
  vehicleStatus: VehicleStatus[];
  energyConsumption: EnergyConsumption[];
  socDistribution: SoCDistribution[];
  chargingSessions: ChargingSession[];
  alerts: Alert[];
  stats: {
    totalEvs: string;
    avgSoc: string;
    energyConsumed: string;
    chargingNow: string;
  };
}

// API response types
export type DashboardStatsResponse = ApiResponse<DashboardStats>;
export type VehicleStatusResponse = ApiResponse<VehicleStatus[]>;
export type EnergyConsumptionResponse = ApiResponse<EnergyConsumption[]>;
export type ChargingSessionResponse = ApiResponse<ChargingSession[]>;
export type SoCDistributionResponse = ApiResponse<SoCDistribution[]>;
export type AlertResponse = ApiResponse<Alert>;
export type AlertsResponse = PaginatedResponse<Alert>;

// Dashboard UI specific types that are different from the main model types

export interface DashboardVehicleStatus {
  name: string;
  count: number;
  fill: string;
}

export interface AlertItem {
  id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  linkText: string;
  linkHref: string;
}

export interface FleetSummary {
  totalVehicles: number;
  avgSoC: number;
  energyConsumed: {
    value: number;
    unit: string;
    change: number;
  };
  chargingNow: number;
} 