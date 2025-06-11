import { NextRequest, NextResponse } from 'next/server';

// Mock database for dispatch schedules
let dispatchSchedules = [
  {
    id: 1,
    vehicleId: 'EV-001',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
    dischargePowerKw: 25,
    energyDischargedKwh: 0,
    status: 'scheduled',
    gridServiceProgramId: 'FREQ_REG_001',
    estimatedRevenue: 45.75,
    actualRevenue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    vehicleId: 'EV-003',
    startTime: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
    endTime: new Date(Date.now() + 5400000).toISOString(),   // 1.5 hours from now
    dischargePowerKw: 40,
    energyDischargedKwh: 15.7,
    status: 'active',
    gridServiceProgramId: 'PEAK_SHAVE_002',
    estimatedRevenue: 78.50,
    actualRevenue: 65.30,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');

    let filteredSchedules = [...dispatchSchedules];

    if (vehicleId) {
      filteredSchedules = filteredSchedules.filter(schedule => schedule.vehicleId === vehicleId);
    }

    if (status) {
      filteredSchedules = filteredSchedules.filter(schedule => schedule.status === status);
    }

    const summary = {
      total_schedules: filteredSchedules.length,
      active_dispatches: filteredSchedules.filter(s => s.status === 'active').length,
      scheduled_dispatches: filteredSchedules.filter(s => s.status === 'scheduled').length,
      completed_dispatches: filteredSchedules.filter(s => s.status === 'completed').length,
      total_estimated_revenue: filteredSchedules.reduce((sum, s) => sum + s.estimatedRevenue, 0),
      total_energy_scheduled_kwh: filteredSchedules.reduce((sum, s) => sum + (s.dischargePowerKw * 2), 0) // Assume 2hr average
    };

    return NextResponse.json({
      summary,
      schedules: filteredSchedules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('V2G dispatch GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dispatch schedules', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      startTime,
      endTime,
      dischargePowerKw,
      gridServiceProgramId,
      priority = 'normal'
    } = body;

    // Validate required fields
    if (!vehicleId || !startTime || !endTime || !dischargePowerKw) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleId, startTime, endTime, dischargePowerKw' },
        { status: 400 }
      );
    }

    // Calculate estimated revenue based on grid program and power
    const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
    const estimatedEnergyKwh = dischargePowerKw * durationHours;
    
    // Grid service rates ($/kWh)
    const serviceRates = {
      'FREQ_REG_001': 0.25,
      'PEAK_SHAVE_002': 0.18,
      'DEMAND_RESP_003': 0.22,
      'GRID_STAB_004': 0.20
    };
    
    const rate = serviceRates[gridServiceProgramId] || 0.15;
    const estimatedRevenue = estimatedEnergyKwh * rate;

    const newSchedule = {
      id: dispatchSchedules.length + 1,
      vehicleId,
      startTime,
      endTime,
      dischargePowerKw,
      energyDischargedKwh: 0,
      status: 'scheduled',
      gridServiceProgramId: gridServiceProgramId || 'DEFAULT_001',
      estimatedRevenue: parseFloat(estimatedRevenue.toFixed(2)),
      actualRevenue: 0,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatchSchedules.push(newSchedule);

    return NextResponse.json({
      message: 'V2G dispatch schedule created successfully',
      schedule: newSchedule,
      dispatch_window: {
        duration_hours: parseFloat(durationHours.toFixed(2)),
        estimated_energy_kwh: parseFloat(estimatedEnergyKwh.toFixed(2)),
        revenue_rate: rate
      }
    }, { status: 201 });
  } catch (error) {
    console.error('V2G dispatch POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create dispatch schedule', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, energyDischargedKwh, actualRevenue } = body;

    const scheduleIndex = dispatchSchedules.findIndex(s => s.id === id);
    if (scheduleIndex === -1) {
      return NextResponse.json(
        { error: 'Dispatch schedule not found' },
        { status: 404 }
      );
    }

    // Update the schedule
    if (status) dispatchSchedules[scheduleIndex].status = status;
    if (energyDischargedKwh !== undefined) dispatchSchedules[scheduleIndex].energyDischargedKwh = energyDischargedKwh;
    if (actualRevenue !== undefined) dispatchSchedules[scheduleIndex].actualRevenue = actualRevenue;
    
    dispatchSchedules[scheduleIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      message: 'V2G dispatch schedule updated successfully',
      schedule: dispatchSchedules[scheduleIndex]
    });
  } catch (error) {
    console.error('V2G dispatch PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update dispatch schedule', details: error.message },
      { status: 500 }
    );
  }
} 