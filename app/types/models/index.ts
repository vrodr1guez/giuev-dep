// Define all types here temporarily to make it work
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  location: GeoLocation;
  status: ChargingStationStatus;
}

export enum ChargingStationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance'
}

// Add minimal definitions for other types
export interface Connector { id: string; type: ConnectorType; }
export enum ConnectorType { TYPE1 = 'TYPE1', TYPE2 = 'TYPE2', CCS = 'CCS', CHADEMO = 'CHADEMO' }
export enum ConnectorStatus { AVAILABLE = 'available', OCCUPIED = 'occupied', OFFLINE = 'offline' }
export interface ChargingSession { id: string; startTime: Date; endTime?: Date; }
export enum ChargingSessionStatus { ACTIVE = 'active', COMPLETED = 'completed', FAILED = 'failed' }
export interface StationAvailability { stationId: string; available: boolean; }
export interface ChargingFilters { stationIds?: string[]; status?: ChargingStationStatus; }

export interface Vehicle { id: string; vin: string; model: string; }
export enum VehicleStatus { AVAILABLE = 'available', CHARGING = 'charging', IN_USE = 'in_use' }

export interface Driver { id: string; name: string; }
export enum DriverStatus { ACTIVE = 'active', INACTIVE = 'inactive' }

export enum PaymentStatus { PENDING = 'pending', COMPLETED = 'completed', FAILED = 'failed' }
export interface PaymentRequest { amount: number; currency: string; }
export interface PaymentResponse { success: boolean; transactionId?: string; } 