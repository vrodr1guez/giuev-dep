import type { BaseEntity } from './models';

export interface BatteryHealth {
  vehicleId: string;
  timestamp: Date;
  stateOfHealth: number; // 0-100%
  cycleCount: number;
  internalResistance?: number;
  temperature?: number;
  lastDeepDischarge?: Date;
  maximumCapacity: number; // kWh
  anomalyDetected: boolean;
}

export interface BatteryUsage {
  vehicleId: string;
  timestamp: Date;
  stateOfCharge: number; // 0-100%
  powerDraw: number; // kW (negative for regen)
  temperature: number; // Celsius
  chargeRate?: number; // kW
  dischargeRate?: number; // kW
  voltage: number; // V
  current: number; // A
}

export interface BatteryAlert {
  id: string;
  vehicleId: string;
  timestamp: Date;
  type: 'degradation' | 'temperature' | 'anomaly' | 'balancing';
  severity: 'low' | 'medium' | 'high';
  message: string;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface BatteryFilters {
  sohRange: [number, number];
  vehicleIds?: string[];
  timeRange?: [Date, Date];
}

export interface BatteryState {
  healthData: BatteryHealth[];
  usageHistory: BatteryUsage[];
  alerts: BatteryAlert[];
  filters: BatteryFilters;
  loading: boolean;
  error: string | null;
}

export interface BatteryPrediction {
  recommendations: string[];
  predictedSoH: number;
  confidenceScore: number;
  predictedLifespan: number;
  suggestedActions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface BatteryAnalytics {
  averageSoH: number;
  criticalVehicles: number;
  totalAlerts: number;
  alertsByType: Record<string, number>;
  degradationRate?: number; // percentage per year
  chargingEfficiency?: number; // percentage
  temperatureImpact?: {
    optimal: boolean;
    recommendations: string[];
  };
  usagePatterns?: {
    fastChargingFrequency: number;
    deepDischargeFrequency: number;
    recommendations: string[];
  };
} 