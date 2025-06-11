import { NextResponse } from 'next/server';
import { RoutePlanningService } from '../../services/RoutePlanningService';

const routePlanningService = new RoutePlanningService();

export async function POST(request: Request) {
  try {
    const routeRequest = await request.json();
    
    // Validate required fields
    if (!routeRequest.origin || !routeRequest.destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }
    
    const response = await routePlanningService.planEvRoute(routeRequest) as any;
    
    if (response.status === 'failed') {
      return NextResponse.json(
        { error: response.errorMessage || 'Route planning failed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in route planning:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 