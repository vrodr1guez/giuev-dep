// Base response interface for all API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Base paginated response interface
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Base entity interface with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Base audit fields interface
export interface AuditFields {
  createdAt: string;
  updatedAt: string;
}

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

// Common role types
export type UserRole = 'admin' | 'manager' | 'driver' | 'viewer';

// Vehicle status types
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'charging' | 'offline';

// Fleet types
export type FleetType = 'delivery' | 'passenger' | 'service' | 'mixed';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  organizationId: string;
}

export interface Organization extends BaseEntity {
  name: string;
  type: 'fleet_operator' | 'charging_provider' | 'utility';
  status: 'active' | 'inactive';
}

export interface Vehicle extends BaseEntity {
  vin: string;
  model: string;
  make: string;
  year: number;
  licensePlate: string;
  status: 'available' | 'in_use' | 'maintenance' | 'charging' | 'offline';
  currentBatteryLevel: number;
  organizationId: string;
}

export interface ChargingStation extends BaseEntity {
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  operationalStatus: 'operational' | 'limited' | 'out_of_service';
  availableConnectors: number;
  totalConnectors: number;
  organizationId: string;
} 