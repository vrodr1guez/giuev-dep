import {
  DriverProfile,
  DrivingScore,
  DrivingEvent,
  CoachingTip,
  CoachingAssignment,
  DriverLeaderboard
} from '../types/driver-coaching';

// Mock data for driver profiles
const mockDriverProfiles: DriverProfile[] = [
  {
    id: 'driver-001',
    name: 'John Smith',
    licenseNumber: 'DL-45678',
    licenseExpiry: '2026-08-15',
    employeeId: 'EMP-1234',
    contactInfo: {
      email: 'john.smith@example.com',
      phone: '+1-555-123-4567'
    },
    joiningDate: '2021-03-15',
    status: 'active',
    assignedVehicles: ['v-001', 'v-003']
  },
  {
    id: 'driver-002',
    name: 'Emily Chen',
    licenseNumber: 'DL-87654',
    licenseExpiry: '2025-11-30',
    employeeId: 'EMP-2345',
    contactInfo: {
      email: 'emily.chen@example.com',
      phone: '+1-555-234-5678'
    },
    joiningDate: '2022-06-01',
    status: 'active',
    assignedVehicles: ['v-002']
  },
  {
    id: 'driver-003',
    name: 'Michael Brown',
    licenseNumber: 'DL-12345',
    licenseExpiry: '2024-12-31',
    employeeId: 'EMP-3456',
    contactInfo: {
      email: 'michael.brown@example.com',
      phone: '+1-555-345-6789'
    },
    joiningDate: '2020-09-10',
    status: 'training',
    assignedVehicles: ['v-004']
  }
];

// Mock data for driving scores
const mockDrivingScores: DrivingScore[] = [
  {
    driverId: 'driver-001',
    overall: 87,
    energyEfficiency: 92,
    safetyRating: 85,
    complianceScore: 82,
    trendLastMonth: 'up',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30'
  },
  {
    driverId: 'driver-002',
    overall: 94,
    energyEfficiency: 95,
    safetyRating: 93,
    complianceScore: 94,
    trendLastMonth: 'stable',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30'
  },
  {
    driverId: 'driver-003',
    overall: 72,
    energyEfficiency: 68,
    safetyRating: 75,
    complianceScore: 80,
    trendLastMonth: 'up',
    periodStart: '2024-04-01',
    periodEnd: '2024-04-30'
  }
];

// Mock data for driving events
const mockDrivingEvents: DrivingEvent[] = [
  {
    id: 'event-001',
    driverId: 'driver-001',
    vehicleId: 'v-001',
    timestamp: '2024-04-15T10:23:45Z',
    type: 'harsh-braking',
    severity: 'medium',
    location: {
      lat: 45.4215,
      lng: -75.6972,
      address: '123 Main Street, Ottawa, ON'
    },
    details: {
      deceleration: '-0.7g',
      speed: '45 km/h',
      roadCondition: 'wet'
    }
  },
  {
    id: 'event-002',
    driverId: 'driver-003',
    vehicleId: 'v-004',
    timestamp: '2024-04-16T14:12:30Z',
    type: 'speeding',
    severity: 'high',
    location: {
      lat: 45.3475,
      lng: -75.7566,
      address: '456 West Avenue, Ottawa, ON'
    },
    details: {
      speed: '72 km/h',
      speedLimit: '50 km/h',
      duration: '2 minutes'
    }
  },
  {
    id: 'event-003',
    driverId: 'driver-002',
    vehicleId: 'v-002',
    timestamp: '2024-04-18T09:45:12Z',
    type: 'efficient-driving',
    severity: 'low',
    location: {
      lat: 45.4315,
      lng: -75.6512,
      address: '789 East Road, Ottawa, ON'
    },
    details: {
      avgEnergyUse: '14.2 kWh/100km',
      regenPercent: '25%',
      tripDistance: '18.5 km'
    }
  }
];

// Mock data for coaching tips
const mockCoachingTips: CoachingTip[] = [
  {
    id: 'tip-001',
    title: 'Smooth Braking Techniques',
    description: 'Learn how to use regenerative braking effectively to maximize range and minimize wear on the brake system.',
    category: 'efficiency',
    relevantMetrics: ['harsh-braking', 'regen-underuse'],
    mediaUrl: '/images/coaching/regen-braking.mp4'
  },
  {
    id: 'tip-002',
    title: 'Speed Management for EV Range',
    description: 'Managing your speed is critical for EV range. This tip shows how to optimize speed for maximum efficiency.',
    category: 'efficiency',
    relevantMetrics: ['speeding', 'energy-consumption']
  },
  {
    id: 'tip-003',
    title: 'Defensive Driving for EVs',
    description: 'EV-specific defensive driving techniques that improve safety and extend battery life.',
    category: 'safety',
    relevantMetrics: ['harsh-braking', 'harsh-acceleration'],
    mediaUrl: '/images/coaching/defensive-driving.mp4'
  }
];

// Mock data for coaching assignments
const mockCoachingAssignments: CoachingAssignment[] = [
  {
    id: 'assignment-001',
    driverId: 'driver-001',
    assignedBy: 'manager-001',
    assignedDate: '2024-04-20',
    dueDate: '2024-05-05',
    tips: [mockCoachingTips[0], mockCoachingTips[2]],
    status: 'in-progress'
  },
  {
    id: 'assignment-002',
    driverId: 'driver-003',
    assignedBy: 'manager-002',
    assignedDate: '2024-04-18',
    dueDate: '2024-05-02',
    tips: [mockCoachingTips[1], mockCoachingTips[2]],
    status: 'assigned'
  }
];

export class DriverCoachingService {
  /**
   * Get all driver profiles
   */
  async getDriverProfiles(): Promise<DriverProfile[]> {
    return mockDriverProfiles;
  }

  /**
   * Get a driver profile by ID
   */
  async getDriverProfileById(id: string): Promise<DriverProfile | null> {
    const driver = mockDriverProfiles.find(d => d.id === id);
    return driver || null;
  }

  /**
   * Get driving score for a driver
   */
  async getDrivingScore(driverId: string): Promise<DrivingScore | null> {
    const score = mockDrivingScores.find(s => s.driverId === driverId);
    return score || null;
  }

  /**
   * Get driving events for a driver
   */
  async getDriverEvents(driverId: string): Promise<DrivingEvent[]> {
    return mockDrivingEvents.filter(e => e.driverId === driverId);
  }

  /**
   * Get coaching tips
   */
  async getCoachingTips(category?: string): Promise<CoachingTip[]> {
    if (!category) return mockCoachingTips;
    return mockCoachingTips.filter(tip => tip.category === category);
  }

  /**
   * Get coaching assignments for a driver
   */
  async getDriverAssignments(driverId: string): Promise<CoachingAssignment[]> {
    return mockCoachingAssignments.filter(a => a.driverId === driverId);
  }

  /**
   * Create a new coaching assignment
   */
  async createAssignment(assignment: Omit<CoachingAssignment, 'id'>): Promise<CoachingAssignment> {
    const newAssignment: CoachingAssignment = {
      ...assignment,
      id: `assignment-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    };
    
    mockCoachingAssignments.push(newAssignment);
    return newAssignment;
  }

  /**
   * Update a coaching assignment status
   */
  async updateAssignmentStatus(
    id: string, 
    status: 'assigned' | 'in-progress' | 'completed' | 'overdue',
    feedback?: string
  ): Promise<CoachingAssignment | null> {
    const assignmentIndex = mockCoachingAssignments.findIndex(a => a.id === id);
    if (assignmentIndex === -1) return null;
    
    const updatedAssignment = {
      ...mockCoachingAssignments[assignmentIndex],
      status,
      ...(feedback && { feedback }),
      ...(status === 'completed' && { completedDate: new Date().toISOString().split('T')[0] })
    };
    
    mockCoachingAssignments[assignmentIndex] = updatedAssignment;
    return updatedAssignment;
  }

  /**
   * Get driver leaderboard
   */
  async getDriverLeaderboard(): Promise<DriverLeaderboard> {
    const sortedByScore = [...mockDrivingScores].sort((a, b) => b.overall - a.overall);
    
    return {
      topDrivers: sortedByScore.slice(0, 3).map(score => {
        const driver = mockDriverProfiles.find(d => d.id === score.driverId);
        return {
          driverId: score.driverId,
          driverName: driver?.name || 'Unknown Driver',
          score: score.overall,
          change: Math.floor(Math.random() * 5) // Mock change
        };
      }),
      mostImproved: [
        {
          driverId: 'driver-003',
          driverName: 'Michael Brown',
          improvement: 12
        },
        {
          driverId: 'driver-001',
          driverName: 'John Smith',
          improvement: 5
        }
      ],
      period: 'April 2024'
    };
  }
} 