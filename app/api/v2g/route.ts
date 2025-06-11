import { NextResponse } from 'next/server';

// GET /api/v2g
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'schedule') {
      // Mock V2G dispatch schedule
      const schedule = {
        vehicleId: 'EV001',
        scheduleId: 'SCH001',
        startTime: '2024-01-15T18:00:00Z',
        endTime: '2024-01-15T22:00:00Z',
        powerOutput: 10.5,
        estimatedRevenue: 25.50,
        status: 'scheduled'
      };
      return NextResponse.json(schedule);
    }

    // Default response
    return NextResponse.json({
      message: 'V2G API',
      endpoints: {
        'GET ?type=schedule': 'Get V2G dispatch schedule'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/v2g:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v2g
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'createSchedule') {
      // Mock creating a V2G dispatch schedule
      const newSchedule = {
        scheduleId: `SCH${Date.now()}`,
        vehicleId: body.vehicleId,
        startTime: body.startTime,
        endTime: body.endTime,
        powerOutput: body.powerOutput,
        status: 'created',
        createdAt: new Date().toISOString()
      };
      return NextResponse.json(newSchedule);
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/v2g:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 