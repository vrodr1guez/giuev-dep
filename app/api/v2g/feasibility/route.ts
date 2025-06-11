import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      startDatetime, 
      endDatetime, 
      maxDischargePowerKw = 50,
      minSocAfterDischargePercent = 30,
      targetEnergyToDischargeKwh 
    } = body;

    // Simulate V2G feasibility analysis
    const currentSoC = 75 + (Math.random() * 20); // 75-95%
    const batteryCapacityKwh = 100; // kWh
    const availableEnergyKwh = (currentSoC - minSocAfterDischargePercent) / 100 * batteryCapacityKwh;
    
    const duration = new Date(endDatetime).getTime() - new Date(startDatetime).getTime();
    const durationHours = duration / (1000 * 60 * 60);
    
    const maxPossibleDischarge = Math.min(
      availableEnergyKwh,
      maxDischargePowerKw * durationHours,
      targetEnergyToDischargeKwh || availableEnergyKwh
    );

    const gridDemandMultiplier = 1.2 + (Math.random() * 0.8); // 1.2-2.0x
    const baseRate = 0.15; // $0.15/kWh
    const v2gPremiumRate = baseRate * gridDemandMultiplier;
    
    const potentialRevenue = maxPossibleDischarge * v2gPremiumRate;
    const isFeasible = maxPossibleDischarge > 5; // Minimum 5 kWh to be feasible

    const constraints = [];
    if (currentSoC < 40) constraints.push("Battery SoC too low for safe discharge");
    if (durationHours < 2) constraints.push("Discharge window too short");
    if (maxDischargePowerKw > 100) constraints.push("Requested power exceeds vehicle capability");

    const response = {
      vehicleId,
      isFeasible,
      estimatedDischargeableEnergyKwh: parseFloat(maxPossibleDischarge.toFixed(2)),
      potentialRevenueEstimate: parseFloat(potentialRevenue.toFixed(2)),
      constraintsHit: constraints,
      gridDemandLevel: parseFloat(gridDemandMultiplier.toFixed(2)),
      currentSoCPercent: parseFloat(currentSoC.toFixed(1)),
      v2gRate: parseFloat(v2gPremiumRate.toFixed(3)),
      notes: isFeasible 
        ? `Optimal V2G window detected. High grid demand (${gridDemandMultiplier.toFixed(1)}x premium rate).`
        : "V2G not recommended at this time. Consider adjusting parameters."
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('V2G feasibility analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze V2G feasibility', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/v2g/feasibility",
    method: "POST",
    description: "Analyze V2G discharge feasibility for a specific vehicle and time window",
    required_fields: ["vehicleId", "startDatetime", "endDatetime"],
    optional_fields: ["maxDischargePowerKw", "minSocAfterDischargePercent", "targetEnergyToDischargeKwh"]
  });
} 