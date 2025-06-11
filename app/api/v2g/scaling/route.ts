import { NextRequest, NextResponse } from 'next/server';
import { devDataStore } from '@/lib/db';

// V2G Scaling Management API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    // Get current V2G scaling status
    if (action === 'status') {
      const currentStatus = {
        timestamp: new Date().toISOString(),
        scaling_status: {
          total_fleet: 125,
          v2g_enabled: 89,
          currently_active: 34,
          available_to_scale: 55,
          scaling_in_progress: false,
          last_scaling_action: new Date(Date.now() - 3600000).toISOString()
        },
        grid_conditions: {
          demand_level: 1.2 + Math.random() * 0.8,
          optimal_for_scaling: true,
          peak_hours_active: false,
          utility_signals: {
            frequency_regulation_needed: true,
            peak_shaving_requested: false,
            demand_response_available: true
          }
        },
        scaling_recommendations: {
          recommended_action: 'scale_up',
          target_vehicles: 65,
          potential_revenue_increase: '$1,847/day',
          confidence_score: 87.5,
          optimal_timing: 'Next 2 hours (approaching peak)'
        },
        fleet_readiness: {
          vehicles_ready_to_participate: 48,
          average_battery_level: 78.3,
          charging_completion_eta: '45 minutes',
          vehicles_in_maintenance: 3
        }
      };

      return NextResponse.json(currentStatus);
    }

    // Get scaling history
    if (action === 'history') {
      const scalingHistory = {
        timestamp: new Date().toISOString(),
        recent_scaling_events: [
          {
            id: 'scale-001',
            date: new Date(Date.now() - 86400000).toISOString(),
            action: 'scale_up',
            from_vehicles: 28,
            to_vehicles: 34,
            revenue_impact: '+$247.50',
            duration_minutes: 12,
            success: true
          },
          {
            id: 'scale-002', 
            date: new Date(Date.now() - 172800000).toISOString(),
            action: 'scale_down',
            from_vehicles: 45,
            to_vehicles: 28,
            reason: 'low_grid_demand',
            duration_minutes: 8,
            success: true
          },
          {
            id: 'scale-003',
            date: new Date(Date.now() - 259200000).toISOString(),
            action: 'scale_up',
            from_vehicles: 22,
            to_vehicles: 45,
            revenue_impact: '+$1,024.75',
            duration_minutes: 18,
            success: true
          }
        ],
        performance_metrics: {
          average_scaling_time: '12.7 minutes',
          success_rate: '98.5%',
          total_revenue_from_scaling: '$15,847.30',
          efficiency_improvement: '23.5%'
        }
      };

      return NextResponse.json(scalingHistory);
    }

    // Get scaling recommendations
    if (action === 'recommendations') {
      const currentHour = new Date().getHours();
      const isPeakHours = currentHour >= 16 && currentHour <= 20;
      const gridDemand = 1.2 + Math.random() * 0.8;
      
      const recommendations = {
        timestamp: new Date().toISOString(),
        immediate_recommendations: [
          {
            priority: 'high',
            action: 'scale_up',
            target_vehicles: isPeakHours ? 75 : 55,
            reasoning: isPeakHours ? 'Peak hours - maximum revenue opportunity' : 'Moderate grid demand increase',
            estimated_revenue_gain: isPeakHours ? '$2,847/day' : '$1,245/day',
            implementation_time: '8-15 minutes',
            risk_level: 'low'
          },
          {
            priority: 'medium',
            action: 'optimize_vehicle_selection',
            description: 'Prioritize vehicles with highest battery levels for V2G participation',
            estimated_efficiency_gain: '12%',
            implementation_time: '3-5 minutes',
            risk_level: 'minimal'
          }
        ],
        strategic_recommendations: [
          {
            timeframe: 'next_2_hours',
            action: 'gradual_scale_up',
            target: isPeakHours ? 85 : 70,
            reasoning: 'Grid demand forecast shows sustained increase'
          },
          {
            timeframe: 'tomorrow_peak',
            action: 'pre_position_fleet',
            description: 'Ensure 80+ vehicles are charged and ready for V2G by 4 PM',
            estimated_impact: '+$3,247 peak revenue'
          }
        ],
        market_conditions: {
          electricity_prices: 'Rising (+12% vs. yesterday)',
          grid_stability: 'Good (95.2% reliability)',
          renewable_generation: '68% (moderate wind/solar)',
          demand_forecast: gridDemand > 1.5 ? 'High' : 'Moderate',
          optimal_scale_window: isPeakHours ? 'Now through 8 PM' : '4 PM - 8 PM'
        }
      };

      return NextResponse.json(recommendations);
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });

  } catch (error) {
    console.error('V2G scaling status error:', error);
    return NextResponse.json(
      { error: 'Failed to get V2G scaling status', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target_vehicles, optimization_mode, priority, user_id } = body;

    if (action === 'scale_up' || action === 'scale_down') {
      const currentActive = 34;
      const maxVehicles = 89;
      const targetVehicles = Math.min(Math.max(target_vehicles || 50, 10), maxVehicles);
      
      // Simulate scaling operation
      const scalingOperation = {
        id: `scale-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_id: user_id || 'system',
        action,
        request_details: {
          current_active: currentActive,
          target_vehicles: targetVehicles,
          change: targetVehicles - currentActive,
          optimization_mode: optimization_mode || 'balanced'
        },
        execution: {
          status: 'initiated',
          estimated_duration: Math.abs(targetVehicles - currentActive) * 0.3 + ' minutes',
          progress_phases: [
            'Validating vehicle readiness',
            'Coordinating with grid operators',
            'Initiating vehicle connections',
            'Monitoring discharge ramp-up',
            'Confirming stable operation'
          ]
        },
        impact_forecast: {
          revenue_change: targetVehicles > currentActive ? 
            `+$${((targetVehicles - currentActive) * 15 * 8).toLocaleString()}/day` :
            `-$${((currentActive - targetVehicles) * 15 * 8).toLocaleString()}/day`,
          grid_contribution_change: `${targetVehicles > currentActive ? '+' : ''}${((targetVehicles - currentActive) * 25).toFixed(1)} kW`,
          efficiency_impact: targetVehicles > currentActive ? 'Improved grid integration' : 'Optimized for current demand',
          environmental_benefit: `${targetVehicles > currentActive ? '+' : ''}${((targetVehicles - currentActive) * 2.1).toFixed(1)} tons CO2 offset/month`
        },
        next_steps: [
          'Monitor real-time vehicle performance',
          'Track grid stability metrics',
          'Adjust individual vehicle discharge rates as needed',
          'Prepare for demand changes'
        ]
      };

      // Store the scaling operation (in a real system, this would go to a database)
      await devDataStore.createV2GSession({
        type: 'scaling_operation',
        data: scalingOperation
      });

      return NextResponse.json(scalingOperation);
    }

    if (action === 'optimize') {
      const optimizationResults = {
        timestamp: new Date().toISOString(),
        optimization_type: optimization_mode || 'revenue_maximization',
        results: {
          vehicles_reassigned: 12,
          efficiency_gain: '8.5%',
          revenue_improvement: '+$423.50/day',
          grid_stability_improvement: '+2.3 points',
          battery_health_impact: 'Negligible (optimized charging patterns)'
        },
        actions_taken: [
          'Redistributed high-SoC vehicles to frequency regulation',
          'Moved moderate-SoC vehicles to demand response',
          'Reserved low-SoC vehicles for emergency grid support',
          'Adjusted discharge rates for optimal efficiency'
        ],
        performance_monitoring: {
          real_time_tracking: 'Active',
          alert_thresholds: 'Set for grid conditions',
          automatic_adjustments: 'Enabled',
          reporting_interval: '5 minutes'
        }
      };

      return NextResponse.json(optimizationResults);
    }

    if (action === 'emergency_scale') {
      const emergencyResponse = {
        timestamp: new Date().toISOString(),
        emergency_type: priority === 'critical' ? 'grid_emergency' : 'high_demand',
        response: {
          vehicles_activated: priority === 'critical' ? 89 : 75, // Max available or high scale
          activation_time: priority === 'critical' ? '2-3 minutes' : '5-8 minutes',
          grid_support_level: priority === 'critical' ? 'Maximum' : 'High',
          estimated_duration: priority === 'critical' ? '30-60 minutes' : '2-4 hours'
        },
        coordination: {
          utility_notification: 'Sent',
          grid_operator_contact: 'Established',
          real_time_monitoring: 'Activated',
          backup_systems: 'On standby'
        },
        revenue_impact: {
          emergency_premium_rate: priority === 'critical' ? '+150%' : '+75%',
          total_estimated_revenue: priority === 'critical' ? '$8,947' : '$4,234',
          duration_dependent: true
        }
      };

      return NextResponse.json(emergencyResponse);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('V2G scaling operation error:', error);
    return NextResponse.json(
      { error: 'Failed to execute V2G scaling operation', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation_id, action, parameters } = body;

    if (action === 'cancel') {
      const cancellationResult = {
        timestamp: new Date().toISOString(),
        operation_id,
        cancellation: {
          status: 'successful',
          vehicles_affected: 12,
          rollback_time: '2-4 minutes',
          current_state: 'returning_to_previous_configuration'
        },
        impact: {
          revenue_loss: 'Minimal (operation was early stage)',
          grid_impact: 'None (graceful disconnect)',
          vehicle_status: 'All vehicles healthy and available'
        }
      };

      return NextResponse.json(cancellationResult);
    }

    if (action === 'modify') {
      const modificationResult = {
        timestamp: new Date().toISOString(),
        operation_id,
        modification: {
          status: 'applied',
          changes: parameters,
          adjustment_time: '1-2 minutes',
          new_target: parameters.target_vehicles || 'unchanged'
        }
      };

      return NextResponse.json(modificationResult);
    }

    return NextResponse.json({ error: 'Invalid action for PUT request' }, { status: 400 });

  } catch (error) {
    console.error('V2G scaling modification error:', error);
    return NextResponse.json(
      { error: 'Failed to modify V2G scaling operation', details: error.message },
      { status: 500 }
    );
  }
} 