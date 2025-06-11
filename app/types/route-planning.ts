import { z } from 'zod';

// Waypoint schema
export const WaypointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().optional(),
});

export type Waypoint = z.infer<typeof WaypointSchema>;

// ChargingStop schema
export const ChargingStopSchema = z.object({
  stationId: z.number(),
  stationName: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  estimatedArrivalTime: z.date().optional(),
  estimatedChargingTimeMinutes: z.number().optional(),
  estimatedSocAfterChargePercent: z.number().optional(),
  connectorTypePreference: z.string().optional(),
});

export type ChargingStop = z.infer<typeof ChargingStopSchema>;

// RouteLeg schema
export const RouteLegSchema = z.object({
  startLocation: WaypointSchema,
  endLocation: WaypointSchema,
  distanceKm: z.number(),
  durationMinutes: z.number(),
  pathPolyline: z.string().optional(),
});

export type RouteLeg = z.infer<typeof RouteLegSchema>;

// RoutePlan schema
export const RoutePlanSchema = z.object({
  origin: WaypointSchema,
  destination: WaypointSchema,
  totalDistanceKm: z.number(),
  totalDurationMinutes: z.number(),
  estimatedEnergyConsumptionKwh: z.number().optional(),
  legs: z.array(RouteLegSchema),
  chargingStops: z.array(ChargingStopSchema).optional(),
  warnings: z.array(z.string()).optional(),
});

export type RoutePlan = z.infer<typeof RoutePlanSchema>;

// Route Planning Request schema
export const RoutePlanningRequestSchema = z.object({
  vehicleId: z.number(),
  originLatitude: z.number(),
  originLongitude: z.number(),
  destinationLatitude: z.number(),
  destinationLongitude: z.number(),
  departureTime: z.date().optional(),
  preference: z.enum(['fastest', 'shortest', 'most_energy_efficient', 'avoid_tolls']).optional().default('fastest'),
  currentSocPercent: z.number().optional(),
  minArrivalSocPercent: z.number().optional().default(20.0),
});

export type RoutePlanningRequest = z.infer<typeof RoutePlanningRequestSchema>;

// Route Planning Response schema
export const RoutePlanningResponseSchema = z.object({
  requestId: z.string().optional(),
  status: z.string(),
  routePlan: RoutePlanSchema.optional(),
  errorMessage: z.string().optional(),
});

export type RoutePlanningResponse = z.infer<typeof RoutePlanningResponseSchema>; 