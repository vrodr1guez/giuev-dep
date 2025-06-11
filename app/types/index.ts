// Define all types in a single file to eliminate import errors

// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// Vehicle types
export interface Vehicle {
  id: string;
  vin: string;
  model: string;
  status: VehicleStatus;
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  CHARGING = 'charging',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance'
}

// Driver types
export interface Driver {
  id: string;
  name: string;
  status: DriverStatus;
}

export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// Charging types
export interface ChargingStation {
  id: string;
  name: string;
  location: GeoLocation;
  status: ChargingStationStatus;
  connectors: Connector[];
}

export enum ChargingStationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

export interface Connector {
  id: string;
  type: ConnectorType;
  status: ConnectorStatus;
}

export enum ConnectorType {
  TYPE1 = 'TYPE1',
  TYPE2 = 'TYPE2',
  CCS = 'CCS',
  CHADEMO = 'CHADEMO'
}

export enum ConnectorStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  OFFLINE = 'offline'
}

export interface ChargingSession {
  id: string;
  vehicleId: string;
  stationId: string;
  connectorId: string;
  startTime: Date;
  endTime?: Date;
  status: ChargingSessionStatus;
  energyDelivered?: number;
}

export enum ChargingSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface StationAvailability {
  stationId: string;
  available: boolean;
}

// Payment types
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  sessionId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
}

// Filter types
export interface ChargingFilters {
  stationIds?: string[];
  status?: ChargingStationStatus;
}

// Additional type utilities
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResponse<T> = Promise<T>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 