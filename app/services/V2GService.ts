import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// V2G types
export interface V2GFeasibilityRequest {
  vehicleId: string;
  minSocAfterDischargePercent?: number;
  targetEnergyToDischargeKwh?: number;
}

export interface V2GFeasibilityResponse {
  vehicleId: string;
  isFeasible: boolean;
  estimatedDischargeableEnergyKwh?: number;
  potentialRevenueEstimate?: number;
  constraintsHit?: string[];
}

export interface V2GDispatchSchedule {
  id: number;
  vehicleId: string;
  startTime: Date;
  endTime: Date;
  targetDischargeKwh: number;
  minSocAfterDischargePercent: number;
  createdAt: Date;
  status: string;
}

export interface V2GDispatchCreate {
  vehicleId: string;
  startTime: Date;
  endTime: Date;
  targetDischargeKwh: number;
  minSocAfterDischargePercent: number;
}

export interface V2GDispatchUpdate {
  startTime?: Date;
  endTime?: Date;
  targetDischargeKwh?: number;
  minSocAfterDischargePercent?: number;
  status?: string;
}

export class V2GService {
  async checkV2GFeasibility(request: V2GFeasibilityRequest): Promise<V2GFeasibilityResponse> {
    console.log(`Checking V2G feasibility for vehicle ${request.vehicleId}`);

    // Mock vehicle data
    const mockCurrentSoc = 70.0;
    const mockV2gCapable = true;
    const mockBatteryCapacityKwh = 70.0;

    if (!mockV2gCapable) {
      return {
        vehicleId: request.vehicleId,
        isFeasible: false,
        constraintsHit: ["Vehicle not V2G capable"]
      };
    }

    const maxDischargeableSoc = mockCurrentSoc - (request.minSocAfterDischargePercent || 30.0);
    if (maxDischargeableSoc <= 0) {
      return {
        vehicleId: request.vehicleId,
        isFeasible: false,
        constraintsHit: ["Current SoC too low or min_soc_after_discharge too high"]
      };
    }

    const estimatedDischargeableKwh = (maxDischargeableSoc / 100) * mockBatteryCapacityKwh;
    if (request.targetEnergyToDischargeKwh && request.targetEnergyToDischargeKwh > estimatedDischargeableKwh) {
      return {
        vehicleId: request.vehicleId,
        isFeasible: false,
        estimatedDischargeableEnergyKwh: estimatedDischargeableKwh,
        constraintsHit: ["Target discharge kWh exceeds available energy"]
      };
    }

    return {
      vehicleId: request.vehicleId,
      isFeasible: true,
      estimatedDischargeableEnergyKwh: estimatedDischargeableKwh,
      potentialRevenueEstimate: estimatedDischargeableKwh * 0.10 // Mock revenue $0.10/kWh
    };
  }

  async createV2GDispatchSchedule(scheduleIn: V2GDispatchCreate): Promise<V2GDispatchSchedule> {
    console.log(`Creating V2G dispatch schedule for vehicle ${scheduleIn.vehicleId}`);

    // Mock response with generated ID
    return {
      id: Math.floor(Math.random() * 1000), // Mock DB ID
      ...scheduleIn,
      createdAt: new Date(),
      status: 'scheduled'
    };
  }

  async getV2GDispatchSchedule(scheduleId: number): Promise<V2GDispatchSchedule | null> {
    // Mock implementation - in real app, would fetch from database
    // For demo, always return null to simulate not found
    return null;
  }

  async updateV2GDispatchSchedule(
    scheduleId: number,
    updateData: V2GDispatchUpdate
  ): Promise<V2GDispatchSchedule | null> {
    // Mock implementation - in real app, would update in database
    // For demo, always return null to simulate not found
    return null;
  }
} 