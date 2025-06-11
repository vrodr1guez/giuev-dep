import { 
  ChargingStation, 
  ChargingSession, 
  ChargingSchedule,
  ChargingNetworkStats
} from '../types/charging';

// Mock data for the service
const mockChargingStations: ChargingStation[] = [
  {
    id: 'cs-001',
    name: 'Downtown Charging Hub',
    location: {
      lat: 45.4215,
      lng: -75.6972,
      address: '123 Main Street, Ottawa, ON'
    },
    status: 'available',
    connectors: [
      { id: 'conn-001', type: 'CCS', powerOutput: 150, status: 'available' },
      { id: 'conn-002', type: 'CHAdeMO', powerOutput: 50, status: 'available' },
      { id: 'conn-003', type: 'Type2', powerOutput: 22, status: 'in-use' }
    ],
    lastMaintenance: '2024-04-15',
    powerRating: 200,
    networkProvider: 'ChargePoint'
  },
  {
    id: 'cs-002',
    name: 'West End Depot',
    location: {
      lat: 45.3475,
      lng: -75.7566,
      address: '456 West Avenue, Ottawa, ON'
    },
    status: 'in-use',
    connectors: [
      { id: 'conn-004', type: 'CCS', powerOutput: 50, status: 'in-use' },
      { id: 'conn-005', type: 'Type2', powerOutput: 22, status: 'available' }
    ],
    lastMaintenance: '2024-03-30',
    powerRating: 100,
    networkProvider: 'Electrify Canada'
  },
  {
    id: 'cs-003',
    name: 'East Side Station',
    location: {
      lat: 45.4315,
      lng: -75.6512,
      address: '789 East Road, Ottawa, ON'
    },
    status: 'maintenance',
    connectors: [
      { id: 'conn-006', type: 'CCS', powerOutput: 150, status: 'maintenance' },
      { id: 'conn-007', type: 'Tesla', powerOutput: 250, status: 'maintenance' }
    ],
    lastMaintenance: '2024-05-20',
    powerRating: 250,
    networkProvider: 'Tesla'
  }
];

const mockChargingSessions: ChargingSession[] = [
  {
    id: 'sess-001',
    stationId: 'cs-001',
    vehicleId: 'v-002',
    driverId: 'driver-003',
    startTime: '2024-05-21T08:30:00Z',
    endTime: '2024-05-21T09:45:00Z',
    energyDelivered: 45.6,
    cost: 15.96,
    status: 'completed'
  },
  {
    id: 'sess-002',
    stationId: 'cs-002',
    vehicleId: 'v-001',
    driverId: 'driver-001',
    startTime: '2024-05-21T10:15:00Z',
    status: 'in-progress'
  },
  {
    id: 'sess-003',
    stationId: 'cs-001',
    vehicleId: 'v-003',
    driverId: 'driver-002',
    startTime: '2024-05-22T14:00:00Z',
    status: 'scheduled'
  }
];

export class ChargingNetworkService {
  /**
   * Get all charging stations
   */
  async getChargingStations(): Promise<ChargingStation[]> {
    // In a real app, this would fetch from an API or database
    return mockChargingStations;
  }

  /**
   * Get a specific charging station by ID
   */
  async getChargingStationById(id: string): Promise<ChargingStation | null> {
    const station = mockChargingStations.find(s => s.id === id);
    return station || null;
  }

  /**
   * Get charging stations with available connectors
   */
  async getAvailableChargingStations(): Promise<ChargingStation[]> {
    return mockChargingStations.filter(station => 
      station.status === 'available' && 
      station.connectors.some(connector => connector.status === 'available')
    );
  }

  /**
   * Get charging stations within a certain radius
   */
  async getChargingStationsNearby(lat: number, lng: number, radiusKm: number): Promise<ChargingStation[]> {
    // Simple distance calculation (not accurate for large distances)
    const nearbyStations = mockChargingStations.filter(station => {
      const distance = Math.sqrt(
        Math.pow(station.location.lat - lat, 2) + 
        Math.pow(station.location.lng - lng, 2)
      ) * 111; // Rough conversion to km
      return distance <= radiusKm;
    });
    
    return nearbyStations;
  }

  /**
   * Get all charging sessions
   */
  async getChargingSessions(): Promise<ChargingSession[]> {
    return mockChargingSessions;
  }

  /**
   * Get charging sessions for a specific vehicle
   */
  async getChargingSessionsByVehicle(vehicleId: string): Promise<ChargingSession[]> {
    return mockChargingSessions.filter(session => session.vehicleId === vehicleId);
  }

  /**
   * Create a new charging session
   */
  async createChargingSession(session: Omit<ChargingSession, 'id'>): Promise<ChargingSession> {
    const newSession: ChargingSession = {
      ...session,
      id: `sess-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    };
    
    // In a real app, this would be saved to a database
    mockChargingSessions.push(newSession);
    return newSession;
  }

  /**
   * Update a charging session
   */
  async updateChargingSession(id: string, data: Partial<ChargingSession>): Promise<ChargingSession | null> {
    const sessionIndex = mockChargingSessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) return null;
    
    const updatedSession = {
      ...mockChargingSessions[sessionIndex],
      ...data
    };
    
    mockChargingSessions[sessionIndex] = updatedSession;
    return updatedSession;
  }

  /**
   * Get charging network statistics
   */
  async getNetworkStatistics(): Promise<ChargingNetworkStats> {
    return {
      totalStations: mockChargingStations.length,
      availableStations: mockChargingStations.filter(s => s.status === 'available').length,
      totalEnergySuppliesToday: 234.5, // kWh
      peakDemand: 145.8, // kW
      averageSessionDuration: 62 // minutes
    };
  }
} 