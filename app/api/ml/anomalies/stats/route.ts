import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get data from the backend API first
    const backendResponse = await fetch('http://localhost:8003/api/ml/anomalies/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    }).catch(() => null);

    if (backendResponse?.ok) {
      const data = await backendResponse.json();
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Fallback to mock data if backend is not available
    const mockData = {
      total_anomalies: 23,
      vehicle_count: 8,
      recent_24h: 5,
      by_severity: {
        high: 3,
        medium: 7,
        low: 13
      },
      by_vehicle: {
        "vehicle_001": 4,
        "vehicle_002": 2,
        "vehicle_003": 6,
        "vehicle_004": 3,
        "vehicle_005": 1,
        "vehicle_006": 2,
        "vehicle_007": 3,
        "vehicle_008": 2
      },
      recent_anomalies: [
        {
          id: "anom_001",
          vehicle_id: "vehicle_001",
          severity: "high",
          type: "battery_temperature",
          description: "Battery temperature exceeded safe threshold",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: "anom_002", 
          vehicle_id: "vehicle_003",
          severity: "medium",
          type: "charging_efficiency",
          description: "Charging efficiency below expected range",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: true
        },
        {
          id: "anom_003",
          vehicle_id: "vehicle_005", 
          severity: "low",
          type: "energy_consumption",
          description: "Energy consumption pattern anomaly detected",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          resolved: false
        }
      ]
    };

    return NextResponse.json(mockData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('ML anomalies stats error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch anomaly statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
} 