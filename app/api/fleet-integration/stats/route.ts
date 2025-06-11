import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate real-time fleet integration statistics
    const stats = {
      activeConnections: 247 + Math.floor(Math.random() * 10),
      successRate: 98.5 + (Math.random() * 0.4),
      avgSetupTime: '12 minutes',
      totalProviders: 8,
      enterpriseClients: 142,
      dataPointsSync: 2847659,
      lastUpdate: new Date().toISOString(),
      trending: [
        { provider: 'SAP Fleet Management', growth: '+15%' },
        { provider: 'Samsara Fleet Operations', growth: '+12%' },
        { provider: 'Geotab Fleet Intelligence', growth: '+8%' }
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching fleet integration stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fleet integration statistics' },
      { status: 500 }
    );
  }
} 