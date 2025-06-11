import { NextRequest, NextResponse } from 'next/server';

// Mock database for grid partnerships
const gridPartnerships = [
  {
    id: 1,
    name: "ConEd (Consolidated Edison)",
    location: "New York, NY",
    partnership_status: "Active Premium",
    revenue_sharing: "65/35 Split",
    monthly_revenue: 28473.50,
    services: ["Frequency Regulation", "Peak Shaving", "Demand Response"],
    contact: "John Chen, Grid Operations Manager",
    phone: "(212) 460-4600",
    email: "jchen@coned.com",
    contract_expires: "2025-12-31",
    performance_rating: 4.8,
    grid_services: {
      frequency_regulation: { rate: 0.25, availability: "24/7" },
      peak_shaving: { rate: 0.18, peak_hours: "4-8 PM" },
      demand_response: { rate: 0.22, notification_time: "2 hours" }
    },
    created_at: "2023-01-15",
    last_updated: new Date().toISOString()
  },
  {
    id: 2,
    name: "PG&E (Pacific Gas & Electric)",
    location: "San Francisco, CA",
    partnership_status: "Active Standard",
    revenue_sharing: "60/40 Split",
    monthly_revenue: 34127.25,
    services: ["Grid Stabilization", "Renewable Integration", "Load Balancing"],
    contact: "Sarah Williams, Partnership Director",
    phone: "(415) 973-7000",
    email: "swilliams@pge.com",
    contract_expires: "2026-06-30",
    performance_rating: 4.6,
    grid_services: {
      grid_stabilization: { rate: 0.20, availability: "Peak demand periods" },
      renewable_integration: { rate: 0.16, bonus_multiplier: 1.3 },
      load_balancing: { rate: 0.14, response_time: "< 15 minutes" }
    },
    created_at: "2023-03-22",
    last_updated: new Date().toISOString()
  },
  {
    id: 3,
    name: "Duke Energy",
    location: "Charlotte, NC",
    partnership_status: "Pilot Program",
    revenue_sharing: "50/50 Split",
    monthly_revenue: 15849.75,
    services: ["Demand Response", "Grid Modernization"],
    contact: "Mike Johnson, Innovation Lead",
    phone: "(704) 594-6200",
    email: "mjohnson@duke-energy.com",
    contract_expires: "2024-12-31",
    performance_rating: 4.3,
    grid_services: {
      demand_response: { rate: 0.22, minimum_duration: "1 hour" },
      grid_modernization: { rate: 0.19, pilot_bonus: 0.05 }
    },
    created_at: "2024-01-10",
    last_updated: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const location = searchParams.get('location');

    let filteredPartnerships = [...gridPartnerships];

    if (status) {
      filteredPartnerships = filteredPartnerships.filter(p => 
        p.partnership_status.toLowerCase().includes(status.toLowerCase())
      );
    }

    if (location) {
      filteredPartnerships = filteredPartnerships.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    const summary = {
      total_partnerships: filteredPartnerships.length,
      active_partnerships: filteredPartnerships.filter(p => p.partnership_status.includes('Active')).length,
      pilot_programs: filteredPartnerships.filter(p => p.partnership_status.includes('Pilot')).length,
      total_monthly_revenue: filteredPartnerships.reduce((sum, p) => sum + p.monthly_revenue, 0),
      average_performance_rating: filteredPartnerships.reduce((sum, p) => sum + p.performance_rating, 0) / filteredPartnerships.length,
      revenue_opportunities: {
        frequency_regulation: filteredPartnerships.filter(p => p.services.includes('Frequency Regulation')).length,
        peak_shaving: filteredPartnerships.filter(p => p.services.includes('Peak Shaving')).length,
        demand_response: filteredPartnerships.filter(p => p.services.includes('Demand Response')).length
      }
    };

    return NextResponse.json({
      summary,
      partnerships: filteredPartnerships,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Grid partnerships GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve grid partnerships', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      location,
      contact,
      email,
      phone,
      services,
      revenue_sharing,
      partnership_type = 'Standard'
    } = body;

    // Validate required fields
    if (!name || !location || !contact || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, location, contact, email' },
        { status: 400 }
      );
    }

    const newPartnership = {
      id: gridPartnerships.length + 1,
      name,
      location,
      partnership_status: `Active ${partnership_type}`,
      revenue_sharing: revenue_sharing || "60/40 Split",
      monthly_revenue: 0, // Will be updated as revenue is generated
      services: services || [],
      contact,
      phone: phone || '',
      email,
      contract_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      performance_rating: 4.0, // Starting rating
      grid_services: {
        demand_response: { rate: 0.20, minimum_duration: "1 hour" },
        grid_modernization: { rate: 0.18, pilot_bonus: 0.02 }
      },
      created_at: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    };

    gridPartnerships.push(newPartnership);

    return NextResponse.json({
      message: 'Grid partnership created successfully',
      partnership: newPartnership
    }, { status: 201 });
  } catch (error) {
    console.error('Grid partnerships POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create grid partnership', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const partnershipIndex = gridPartnerships.findIndex(p => p.id === id);
    if (partnershipIndex === -1) {
      return NextResponse.json(
        { error: 'Grid partnership not found' },
        { status: 404 }
      );
    }

    // Update the partnership
    gridPartnerships[partnershipIndex] = {
      ...gridPartnerships[partnershipIndex],
      ...updateData,
      last_updated: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Grid partnership updated successfully',
      partnership: gridPartnerships[partnershipIndex]
    });
  } catch (error) {
    console.error('Grid partnerships PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update grid partnership', details: error.message },
      { status: 500 }
    );
  }
} 