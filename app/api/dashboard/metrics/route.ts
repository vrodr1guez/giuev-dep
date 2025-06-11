import { NextRequest, NextResponse } from 'next/server';

// Simulate real-time metrics data
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Add time-based variation for realistic data
    const timeVariation = Math.sin((hour * 60 + minute) / 60 * Math.PI / 12);
    const randomVariation = () => (Math.random() - 0.5) * 0.1;

    const metrics = {
      battery_health: {
        value: Number((94.2 + timeVariation * 2 + randomVariation()).toFixed(1)),
        change: Number((2.1 + randomVariation() * 2).toFixed(1)),
        trend: timeVariation > 0 ? 'up' : 'down'
      },
      energy_efficiency: {
        value: Number((87.5 + timeVariation * 3 + randomVariation()).toFixed(1)),
        change: Number((-1.2 + randomVariation() * 2).toFixed(1)),
        trend: timeVariation > 0 ? 'up' : 'down'
      },
      usage_rate: {
        value: Number((76.3 + timeVariation * 5 + randomVariation()).toFixed(1)),
        change: Number((5.3 + randomVariation() * 3).toFixed(1)),
        trend: 'up'
      },
      cost_savings: {
        value: Math.round(1245 + timeVariation * 100 + randomVariation() * 50),
        change: Number((12.8 + randomVariation() * 5).toFixed(1)),
        trend: 'up'
      }
    };

    const response = {
      status: 'success',
      timestamp: now.toISOString(),
      metrics,
      system_status: {
        health: 'good',
        active_vehicles: Math.round(45 + timeVariation * 5),
        charging_stations: Math.round(randomVariation() * 2 + 12),
        alerts: Math.floor(Math.random() * 3)
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error generating metrics:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 