import { NextRequest, NextResponse } from 'next/server';
import { DriverCoachingService } from '../../services/DriverCoachingService';

const driverCoachingService = new DriverCoachingService();

// Add dynamic route configuration to fix static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/driver-coaching
export async function GET(request: NextRequest) {
  try {
    // Use the URL from the request object instead of request.url
    const url = new URL(request.nextUrl);
    const driverId = url.searchParams.get('driverId');
    const type = url.searchParams.get('type');

    if (type === 'leaderboard') {
      const leaderboard = await driverCoachingService.getDriverLeaderboard();
      return NextResponse.json(leaderboard);
    }

    if (type === 'events' && driverId) {
      const events = await driverCoachingService.getDriverEvents(driverId);
      return NextResponse.json(events);
    }

    if (driverId) {
      const profile = await driverCoachingService.getDriverProfileById(driverId);
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(profile);
    }

    // If no driver ID is provided, return all profiles
    const profiles = await driverCoachingService.getDriverProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error in GET /api/driver-coaching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 