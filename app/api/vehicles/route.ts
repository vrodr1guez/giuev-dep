import { NextRequest, NextResponse } from 'next/server';

// API base URL - should be configured in your environment variables
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';
    const skip = searchParams.get('skip') || '0';
    const organizationId = searchParams.get('organization_id');
    const fleetId = searchParams.get('fleet_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query string
    let queryString = `?limit=${limit}&skip=${skip}`;
    if (organizationId) queryString += `&organization_id=${organizationId}`;
    if (fleetId) queryString += `&fleet_id=${fleetId}`;
    if (status) queryString += `&status=${status}`;
    if (search) queryString += `&search=${encodeURIComponent(search)}`;

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/vehicles${queryString}`, {
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if needed
        ...(request.headers.get('authorization')
          ? { Authorization: request.headers.get('authorization')! }
          : {}),
      },
      // Cache setting
      next: { revalidate: 60 }, // Revalidate after 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization')
          ? { Authorization: request.headers.get('authorization')! }
          : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vehicle' },
      { status: 500 }
    );
  }
} 