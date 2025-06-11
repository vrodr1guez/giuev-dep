import { NextRequest, NextResponse } from 'next/server';

// V2G scaling and optimization logic
function calculateOptimalV2GParticipation(
  totalVehicles: number, 
  v2gEnabled: number, 
  targetScale?: number,
  gridDemand?: number
) {
  // Base participation rate (38% currently active)
  let baseParticipationRate = 0.38;
  
  // Adjust based on grid demand
  if (gridDemand) {
    if (gridDemand > 1.5) baseParticipationRate += 0.15; // High demand
    else if (gridDemand > 1.2) baseParticipationRate += 0.08; // Medium demand
  }
  
  // Apply scaling target if provided
  if (targetScale) {
    baseParticipationRate = Math.min(targetScale / v2gEnabled, 0.95); // Max 95% participation
  }
  
  // Smart scaling - gradually increase participation
  const timeOfDay = new Date().getHours();
  if (timeOfDay >= 16 && timeOfDay <= 20) { // Peak hours
    baseParticipationRate += 0.1;
  }
  
  const activeVehicles = Math.floor(v2gEnabled * baseParticipationRate);
  return Math.min(activeVehicles, v2gEnabled);
}

function generateV2GVehicleData(vehicleCount: number, scalingFactor: number = 1) {
  return Array.from({ length: vehicleCount }, (_, i) => {
    const vehicleId = `EV-${String(i + 1).padStart(3, '0')}`;
    const baseEfficiency = 85 + Math.random() * 10;
    const scaledEfficiency = Math.min(baseEfficiency * (1 + scalingFactor * 0.1), 98);
    
    return {
      vehicle_id: vehicleId,
      battery_soc: 60 + Math.random() * 35,
      discharge_rate_kw: (15 + Math.random() * 35) * (1 + scalingFactor * 0.2),
      earnings_per_hour: (8.50 + Math.random() * 12) * (1 + scalingFactor * 0.15),
      grid_service_type: ['frequency_regulation', 'demand_response', 'peak_shaving'][Math.floor(Math.random() * 3)],
      estimated_discharge_duration_hours: 2 + Math.random() * 4,
      v2g_efficiency: scaledEfficiency,
      participation_score: Math.random() * 100,
      last_v2g_session: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      total_v2g_revenue_today: Math.random() * 150 + 50
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const demoType = searchParams.get('demo_type');
    const scaleTarget = searchParams.get('scale_target');
    const optimizeGrid = searchParams.get('optimize_grid') === 'true';

    if (demoType === 'v2g') {
      // Fleet configuration
      const totalVehicles = 125;
      const v2gEnabled = 89;
      
      // Calculate optimal V2G participation
      const gridDemand = 1.2 + Math.random() * 0.8; // Dynamic grid demand
      const targetActiveVehicles = scaleTarget ? 
        parseInt(scaleTarget) : 
        calculateOptimalV2GParticipation(totalVehicles, v2gEnabled, null, gridDemand);
      
      // Ensure we don't exceed enabled vehicles
      const actualActiveVehicles = Math.min(targetActiveVehicles, v2gEnabled);
      
      // Calculate scaling factor for revenue optimization
      const scalingFactor = actualActiveVehicles / 34; // Original was 34 active
      
      // Generate real-time V2G data
      const realTimeV2GData = generateV2GVehicleData(actualActiveVehicles, scalingFactor);
      
      // Calculate totals
      const totalGridContribution = realTimeV2GData.reduce((sum, vehicle) => sum + vehicle.discharge_rate_kw, 0);
      const totalHourlyRevenue = realTimeV2GData.reduce((sum, vehicle) => sum + vehicle.earnings_per_hour, 0);
      const dailyRevenue = totalHourlyRevenue * 8; // Assume 8 hours average daily operation
      const monthlyProjection = dailyRevenue * 30;

      const v2gDemoData = {
        timestamp: new Date().toISOString(),
        scaling_info: {
          scaling_active: actualActiveVehicles > 34,
          target_vehicles: targetActiveVehicles,
          actual_active: actualActiveVehicles,
          scaling_factor: scalingFactor,
          optimization_enabled: optimizeGrid,
          participation_rate: (actualActiveVehicles / v2gEnabled * 100).toFixed(1) + '%'
        },
        fleet_summary: {
          total_vehicles: totalVehicles,
          v2g_enabled: v2gEnabled,
          v2g_active: actualActiveVehicles,
          v2g_idle: v2gEnabled - actualActiveVehicles,
          total_capacity_kwh: 8950,
          available_discharge_kwh: Math.floor(totalGridContribution * 4.5), // Rough estimate
          current_grid_contribution_kw: Math.round(totalGridContribution * 100) / 100,
          daily_revenue: Math.round(dailyRevenue * 100) / 100,
          monthly_revenue_projection: Math.round(monthlyProjection)
        },
        grid_integration: {
          grid_demand_level: Math.round(gridDemand * 100) / 100,
          frequency_regulation_active: actualActiveVehicles > 25,
          peak_shaving_mode: actualActiveVehicles > 40,
          load_balancing_active: actualActiveVehicles > 50,
          renewable_percentage: 73.2 + (scalingFactor - 1) * 5, // Better integration with more vehicles
          carbon_credits_earned: 45.7 * scalingFactor,
          utility_partnerships: ["ConEd", "PG&E", "Duke Energy"],
          grid_stability_score: Math.min(85 + actualActiveVehicles * 0.5, 98)
        },
        real_time_v2g: realTimeV2GData,
        optimization_recommendations: {
          can_scale_up: actualActiveVehicles < v2gEnabled,
          max_potential_vehicles: v2gEnabled,
          estimated_additional_revenue: actualActiveVehicles < v2gEnabled ? 
            (v2gEnabled - actualActiveVehicles) * 15 * 8 : 0, // $15/hour average for 8 hours
          optimal_participation_time: gridDemand > 1.5 ? 'Now (High Grid Demand)' : 'Peak Hours (4-8 PM)',
          battery_readiness: Math.floor((v2gEnabled - actualActiveVehicles) * 0.8), // 80% of idle vehicles ready
          scaling_suggestions: [
            actualActiveVehicles < 50 ? "Increase participation during peak hours" : null,
            gridDemand > 1.5 ? "High grid demand - scale up recommended" : null,
            actualActiveVehicles < v2gEnabled * 0.6 ? "Consider incentives for more vehicle participation" : null
          ].filter(Boolean)
        },
        revenue_analytics: {
          hourly_rates: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            base_rate: 0.12 + Math.random() * 0.08,
            v2g_premium_rate: (0.18 + Math.random() * 0.15) * (1 + scalingFactor * 0.1),
            grid_demand_multiplier: 1.2 + Math.random() * 0.8,
            forecasted_revenue: (150 + Math.random() * 300) * scalingFactor
          })),
          weekly_projection: {
            monday: dailyRevenue * 1.1,
            tuesday: dailyRevenue * 1.15,
            wednesday: dailyRevenue * 1.05,
            thursday: dailyRevenue * 1.25,
            friday: dailyRevenue * 1.5,
            saturday: dailyRevenue * 0.95,
            sunday: dailyRevenue * 0.8
          },
          scaling_impact: {
            revenue_increase_percent: ((scalingFactor - 1) * 100).toFixed(1) + '%',
            efficiency_gain: scalingFactor > 1 ? 'Improved grid integration' : 'Stable operation',
            grid_benefit_score: Math.min(actualActiveVehicles * 1.2, 100)
          }
        }
      };

      return NextResponse.json(v2gDemoData);
    }

    // Default analytics demo data for other types
    const defaultDemoData = {
      timestamp: new Date().toISOString(),
      fleet_metrics: {
        total_vehicles: 125,
        active_vehicles: 98,
        charging_vehicles: 23,
        idle_vehicles: 42,
        maintenance_vehicles: 4
      },
      energy_metrics: {
        total_energy_consumed_kwh: 15847.3,
        renewable_energy_percentage: 67.8,
        cost_per_kwh: 0.14,
        carbon_footprint_reduction: 8947.2
      },
      performance_analytics: Array.from({ length: 10 }, (_, i) => ({
        metric: ['efficiency', 'utilization', 'availability', 'cost_optimization', 'battery_health'][i % 5],
        value: 85 + Math.random() * 15,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change_percentage: (Math.random() * 10 - 5).toFixed(1)
      }))
    };

    return NextResponse.json(defaultDemoData);
  } catch (error) {
    console.error('Demo data generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo data', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { demo_type, scale_target, optimization_mode, custom_params } = body;

    if (demo_type === 'v2g_scaling') {
      // Handle V2G scaling requests
      const totalVehicles = 125;
      const v2gEnabled = 89;
      const targetActive = scale_target || 75; // Default scale target
      
      const scalingResults = {
        timestamp: new Date().toISOString(),
        scaling_operation: {
          requested_target: targetActive,
          achieved_target: Math.min(targetActive, v2gEnabled),
          scaling_success: targetActive <= v2gEnabled,
          scaling_factor: Math.min(targetActive, v2gEnabled) / 34,
          estimated_time_to_scale: Math.abs(targetActive - 34) * 0.5 + ' minutes',
          revenue_impact: `+${((Math.min(targetActive, v2gEnabled) / 34 - 1) * 100).toFixed(1)}%`
        },
        optimization_recommendations: {
          optimal_time: optimization_mode === 'peak_hours' ? 'Now executing' : 'Schedule for 4-8 PM',
          battery_preparation: 'Initiating pre-conditioning for ' + Math.min(targetActive, v2gEnabled) + ' vehicles',
          grid_coordination: 'Coordinating with utility partners for optimal dispatch'
        },
        next_steps: [
          'Monitor battery levels across fleet',
          'Coordinate with grid demand forecasts',
          'Optimize revenue per vehicle hour',
          'Track grid stability metrics'
        ]
      };

      return NextResponse.json(scalingResults);
    }

    // Generate custom demo data based on parameters
    const customDemoData = {
      timestamp: new Date().toISOString(),
      demo_type,
      custom_params,
      generated_data: {
        message: "Custom demo data generated successfully",
        data_points: Math.floor(Math.random() * 1000) + 100,
        status: "active"
      }
    };

    return NextResponse.json(customDemoData);
  } catch (error) {
    console.error('Custom demo data generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate custom demo data', details: error.message },
      { status: 500 }
    );
  }
} 