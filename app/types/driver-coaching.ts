export interface DriverProfile {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  employeeId?: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  joiningDate: string;
  status: 'active' | 'inactive' | 'training' | 'suspended';
  assignedVehicles: string[];
}

export interface DrivingScore {
  driverId: string;
  overall: number; // 0-100
  energyEfficiency: number; // 0-100
  safetyRating: number; // 0-100
  complianceScore: number; // 0-100
  trendLastMonth: 'up' | 'down' | 'stable';
  periodStart: string;
  periodEnd: string;
}

export interface DrivingEvent {
  id: string;
  driverId: string;
  vehicleId: string;
  timestamp: string;
  type: 'harsh-braking' | 'harsh-acceleration' | 'speeding' | 'regen-underuse' | 'efficient-driving';
  severity: 'low' | 'medium' | 'high';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  details: Record<string, any>;
}

export interface CoachingTip {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'efficiency' | 'compliance' | 'battery-care';
  relevantMetrics: string[];
  mediaUrl?: string;
}

export interface CoachingAssignment {
  id: string;
  driverId: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  tips: CoachingTip[];
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: string;
  feedback?: string;
}

export interface DriverLeaderboard {
  topDrivers: {
    driverId: string;
    driverName: string;
    score: number;
    change: number;
  }[];
  mostImproved: {
    driverId: string;
    driverName: string;
    improvement: number;
  }[];
  period: string;
} 