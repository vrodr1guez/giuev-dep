import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Route planning types
export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  address?: string;
  stopDuration?: number; // in minutes
}

export interface OptimizedRoute {
  waypoints: RouteWaypoint[];
  totalDistance: number; // in kilometers
  totalTime: number; // in minutes
  energyConsumption: number; // in kWh
  chargingStops: ChargingStop[];
  cost: number; // in USD
}

export interface ChargingStop {
  stationId: number;
  stationName: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTime: Date;
  estimatedChargingTimeMinutes: number;
  estimatedSocAfterChargePercent: number;
  connectorTypePreference: string;
}

export interface RouteOptimizationOptions {
  vehicleType: string;
  batteryCapacity: number; // in kWh
  currentSoC: number; // Current State of Charge (%)
  targetSoC: number; // Target State of Charge at destination (%)
  preferredChargingNetworks?: string[];
  maxChargingStops?: number;
  prioritizeTime?: boolean; // vs cost optimization
}

export interface RoutePlanningRequest {
  vehicleId: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  currentSocPercent?: number;
  departureTime?: Date;
}

export interface RoutePlanningResponse {
  status: string;
  routePlan: RoutePlan;
}

export interface RoutePlan {
  origin: Waypoint;
  destination: Waypoint;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedEnergyConsumptionKwh: number;
  legs: RouteLeg[];
  chargingStops?: ChargingStop[];
  warnings?: string[];
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  description: string;
}

export interface RouteLeg {
  startLocation: Waypoint;
  endLocation: Waypoint;
  distanceKm: number;
  durationMinutes: number;
  pathPolyline: string;
}

export class RoutePlanningService {
  async planEvRoute(request: RoutePlanningRequest): Promise<RoutePlanningResponse> {
    console.log(`Planning route for vehicle ${request.vehicleId} from (${request.originLatitude}, ${request.originLongitude}) to (${request.destinationLatitude}, ${request.destinationLongitude})`);

    // Mock vehicle data
    const mockCurrentSoc = request.currentSocPercent || 60.0;
    const mockVehicleRangeKmOnCurrentSoc = 150.0; // km, placeholder
    const mockBatteryCapacityKwh = 70.0;

    // Mock routing data
    const mockTotalDistanceKm = 300.0;
    const mockDrivingDurationMinutes = 240; // 4 hours driving

    const legs: RouteLeg[] = [{
      startLocation: {
        latitude: request.originLatitude,
        longitude: request.originLongitude,
        description: "Origin"
      },
      endLocation: {
        latitude: request.destinationLatitude,
        longitude: request.destinationLongitude,
        description: "Destination"
      },
      distanceKm: mockTotalDistanceKm,
      durationMinutes: mockDrivingDurationMinutes,
      pathPolyline: "mock_polyline_data_here"
    }];

    const chargingStops: ChargingStop[] = [];
    const warnings: string[] = [];

    if (mockTotalDistanceKm > mockVehicleRangeKmOnCurrentSoc) {
      warnings.push("Route distance exceeds current vehicle range. Charging stops will be required.");
      
      // Simplified: Add one mock charging stop in the middle
      const mockChargeNeededKwh = Math.max(0,
        (mockTotalDistanceKm / (mockVehicleRangeKmOnCurrentSoc / mockCurrentSoc * 100) * mockBatteryCapacityKwh) -
        (mockCurrentSoc / 100 * mockBatteryCapacityKwh)
      );

      chargingStops.push({
        stationId: 999, // Mock station ID
        stationName: "Mock SuperCharger Midway",
        latitude: (request.originLatitude + request.destinationLatitude) / 2,
        longitude: (request.originLongitude + request.destinationLongitude) / 2,
        estimatedArrivalTime: new Date(
          (request.departureTime || new Date()).getTime() +
          (mockDrivingDurationMinutes / 2) * 60000
        ),
        estimatedChargingTimeMinutes: 45, // Mock charging time
        estimatedSocAfterChargePercent: 80.0,
        connectorTypePreference: "CCS"
      });
    }

    const mockTotalDurationMinutes = mockDrivingDurationMinutes + (chargingStops.length > 0 ? 45 : 0);

    const routePlan: RoutePlan = {
      origin: {
        latitude: request.originLatitude,
        longitude: request.originLongitude,
        description: "Origin"
      },
      destination: {
        latitude: request.destinationLatitude,
        longitude: request.destinationLongitude,
        description: "Destination"
      },
      totalDistanceKm: mockTotalDistanceKm,
      totalDurationMinutes: mockTotalDurationMinutes,
      estimatedEnergyConsumptionKwh: mockTotalDistanceKm * 0.2, // Rough estimate 0.2 kWh/km
      legs,
      chargingStops: chargingStops.length > 0 ? chargingStops : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };

    return {
      status: "success",
      routePlan
    };
  }
} 