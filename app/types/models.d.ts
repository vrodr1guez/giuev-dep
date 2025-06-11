// This file resolves the "Cannot find type definition file for 'models'" error

// Type definitions for models
declare module 'models' {
  // Base entities
  export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface GeoLocation {
    latitude: number;
    longitude: number;
  }

  // Vehicle related
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

  // Charging related
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
    status: ChargingSessionStatus;
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

  export interface ChargingFilters {
    stationIds?: string[];
    status?: ChargingStationStatus;
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

  // Payment types
  export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
  }

  export interface PaymentRequest {
    amount: number;
    currency: string;
  }

  export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
  }
} 