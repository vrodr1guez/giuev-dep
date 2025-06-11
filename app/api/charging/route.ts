import { NextResponse } from 'next/server';
import { ChargingNetworkService } from '../../services/ChargingNetworkService';

const chargingService = new ChargingNetworkService();

// GET /api/charging/stations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');

    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseFloat(radius);

      const stations = await chargingService.getChargingStationsNearby(lat, lng, rad);
      return NextResponse.json(stations);
    }

    // If no coordinates are provided, return all stations
    const stations = await chargingService.getChargingStations();
    return NextResponse.json(stations);
  } catch (error) {
    console.error('Error in GET /api/charging/stations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/charging/stations
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json(
      { message: 'Station creation is not implemented in the mock service' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in POST /api/charging/stations:', error);
    return NextResponse.json(
      { error: 'Invalid station data' },
      { status: 400 }
    );
  }
} 