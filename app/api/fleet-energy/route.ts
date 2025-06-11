import { NextRequest, NextResponse } from 'next/server';
import { FleetEnergyService } from '../../services/FleetEnergyService';

const fleetEnergyService = new FleetEnergyService();

// Add dynamic route configuration to fix static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/fleet-energy
export async function GET(request: NextRequest) {
  try {
    // Use the URL from the request object instead of request.url
    const url = new URL(request.nextUrl);
    const vehicleId = url.searchParams.get('vehicleId');
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate') || '2024-01-01';
    const endDate = url.searchParams.get('endDate') || '2024-12-31';

    if (type === 'costs') {
      const costs = await fleetEnergyService.getEnergyCosts(startDate, endDate);
      return NextResponse.json(costs);
    }

    if (type === 'summary') {
      const summary = await fleetEnergyService.getFleetEnergySummary(startDate, endDate);
      return NextResponse.json(summary);
    }

    if (type === 'recommendations') {
      const recommendations = await fleetEnergyService.getEnergyEfficiencyRecommendations();
      return NextResponse.json(recommendations);
    }

    if (vehicleId) {
      const consumption = await fleetEnergyService.getVehicleEnergyConsumption(vehicleId);
      return NextResponse.json(consumption);
    }

    // If no vehicle ID is provided, return all vehicles' consumption
    const allConsumption = await fleetEnergyService.getAllVehiclesEnergyConsumption();
    return NextResponse.json(allConsumption);
  } catch (error) {
    console.error('Error in GET /api/fleet-energy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 