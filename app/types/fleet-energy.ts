import { z } from 'zod';

// Vehicle Type Enum
export const VehicleTypeEnum = z.enum([
  'sedan',
  'suv',
  'van',
  'truck',
  'bus',
]);

// Explicitly define the type instead of using z.infer
export type VehicleType = 'sedan' | 'suv' | 'van' | 'truck' | 'bus';

// Energy Consumption By Vehicle Type Schema
export const EnergyConsumptionByVehicleTypeSchema = z.object({
  vehicle_type: VehicleTypeEnum,
  avg_efficiency: z.number().positive(),
  total_vehicles: z.number().int().positive().optional(),
  total_energy_kwh: z.number().nonnegative().optional(),
});

// Explicitly define the interface
export interface EnergyConsumptionByVehicleType {
  vehicle_type: VehicleType;
  avg_efficiency: number;
  total_vehicles?: number;
  total_energy_kwh?: number;
}

// Energy Consumption Trend Schema
export const EnergyConsumptionTrendSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // Format: YYYY-MM
  total_kwh: z.number().nonnegative(),
  avg_kwh_per_km: z.number().positive().optional(),
  total_cost: z.number().nonnegative().optional(),
});

// Explicitly define the interface
export interface EnergyConsumptionTrend {
  month: string;
  total_kwh: number;
  avg_kwh_per_km?: number;
  total_cost?: number;
}

// Fleet Energy Report Schema
export const FleetEnergyReportSchema = z.object({
  organizationId: z.number().positive(),
  reportPeriodStart: z.date(),
  reportPeriodEnd: z.date(),
  totalEnergyConsumedKwh: z.number().nonnegative(),
  totalDistanceDrivenKm: z.number().nonnegative(),
  averageFleetEfficiencyKwhPerKm: z.number().positive(),
  totalChargingCost: z.number().nonnegative().optional(),
  totalV2gRevenue: z.number().nonnegative().optional(),
  energyConsumptionByVehicleType: z.array(EnergyConsumptionByVehicleTypeSchema).optional(),
  energyConsumptionTrends: z.array(EnergyConsumptionTrendSchema).optional(),
  optimizationSuggestions: z.array(z.string()).optional(),
}).refine(
  (data) => data.reportPeriodEnd > data.reportPeriodStart,
  {
    message: "End date must be after start date",
    path: ["reportPeriodEnd"],
  }
);

// Explicitly define the interface
export interface FleetEnergyReport {
  organizationId: number;
  reportPeriodStart: Date;
  reportPeriodEnd: Date;
  totalEnergyConsumedKwh: number;
  totalDistanceDrivenKm: number;
  averageFleetEfficiencyKwhPerKm: number;
  totalChargingCost?: number;
  totalV2gRevenue?: number;
  energyConsumptionByVehicleType?: EnergyConsumptionByVehicleType[];
  energyConsumptionTrends?: EnergyConsumptionTrend[];
  optimizationSuggestions?: string[];
}

// Scenario Types Enum
export const ScenarioTypeEnum = z.enum([
  'off_peak_charging_shift',
  'route_optimization_impact',
  'v2g_expansion',
  'fleet_composition_change',
]);

// Explicitly define the type
export type ScenarioType = 'off_peak_charging_shift' | 'route_optimization_impact' | 'v2g_expansion' | 'fleet_composition_change';

// Energy Optimization Scenario Request Schema
export const EnergyOptimizationScenarioRequestSchema = z.object({
  organizationId: z.number().positive(),
  scenarioType: ScenarioTypeEnum,
  parameters: z.record(z.string(), z.any()).refine(
    (params) => {
      switch (Object.keys(params)[0]) {
        case 'percentage_shifted':
          return params.percentage_shifted >= 0 && params.percentage_shifted <= 100;
        case 'route_efficiency_target':
          return params.route_efficiency_target > 0;
        case 'v2g_participation_rate':
          return params.v2g_participation_rate >= 0 && params.v2g_participation_rate <= 100;
        default:
          return true;
      }
    },
    {
      message: "Invalid parameter values for scenario type",
    }
  ),
});

// Explicitly define the interface
export interface EnergyOptimizationScenarioRequest {
  organizationId: number;
  scenarioType: ScenarioType;
  parameters: Record<string, any>;
}

// Energy Optimization Scenario Response Schema
export const EnergyOptimizationScenarioResponseSchema = z.object({
  scenarioType: ScenarioTypeEnum,
  estimatedEnergySavingsKwh: z.number().nonnegative(),
  estimatedCostSavings: z.number().nonnegative(),
  assumptions: z.array(z.string()).min(1),
  confidenceLevel: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Explicitly define the interface
export interface EnergyOptimizationScenarioResponse {
  scenarioType: ScenarioType;
  estimatedEnergySavingsKwh: number;
  estimatedCostSavings: number;
  assumptions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
}

// Request Schemas
export const GetFleetEnergyReportRequestSchema = z.object({
  organizationId: z.number().positive(),
  reportPeriodStart: z.date(),
  reportPeriodEnd: z.date(),
}).refine(
  (data) => data.reportPeriodEnd > data.reportPeriodStart,
  {
    message: "End date must be after start date",
    path: ["reportPeriodEnd"],
  }
);

// Explicitly define the interface
export interface GetFleetEnergyReportRequest {
  organizationId: number;
  reportPeriodStart: Date;
  reportPeriodEnd: Date;
} 