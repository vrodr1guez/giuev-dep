import { z } from 'zod';

// V2G Feasibility Request schema
export const V2GFeasibilityRequestSchema = z.object({
  vehicleId: z.number(),
  startDatetime: z.date(),
  endDatetime: z.date(),
  maxDischargePowerKw: z.number().optional(),
  minSocAfterDischargePercent: z.number().optional().default(30.0),
  targetEnergyToDischargeKwh: z.number().optional(),
});

export type V2GFeasibilityRequest = z.infer<typeof V2GFeasibilityRequestSchema>;

// V2G Feasibility Response schema
export const V2GFeasibilityResponseSchema = z.object({
  vehicleId: z.number(),
  isFeasible: z.boolean(),
  estimatedDischargeableEnergyKwh: z.number().optional(),
  potentialRevenueEstimate: z.number().optional(),
  constraintsHit: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type V2GFeasibilityResponse = z.infer<typeof V2GFeasibilityResponseSchema>;

// V2G Dispatch Schedule schema
export const V2GDispatchScheduleSchema = z.object({
  id: z.number().optional(),
  vehicleId: z.number(),
  startTime: z.date(),
  endTime: z.date(),
  dischargePowerKw: z.number(),
  energyDischargedKwh: z.number().optional(),
  status: z.string(), // e.g., scheduled, active, completed, cancelled
  gridServiceProgramId: z.string().optional(),
  createdAt: z.date().optional(),
});

export type V2GDispatchSchedule = z.infer<typeof V2GDispatchScheduleSchema>;

// V2G Dispatch Create schema
export const V2GDispatchCreateSchema = V2GDispatchScheduleSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.literal('scheduled'),
});

export type V2GDispatchCreate = z.infer<typeof V2GDispatchCreateSchema>;

// V2G Dispatch Update schema
export const V2GDispatchUpdateSchema = z.object({
  status: z.string().optional(),
  energyDischargedKwh: z.number().optional(),
});

export type V2GDispatchUpdate = z.infer<typeof V2GDispatchUpdateSchema>; 