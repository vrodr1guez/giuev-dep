// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Location type used across multiple models
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Vehicle related types
export enum VehicleStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use', 
  CHARGING = 'charging',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline'
}

export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  vin: string;
  licensePlate: string;
  batteryCapacity: number;
  currentCharge: number;
  range: number;
  status: 'available' | 'charging' | 'in_use' | 'maintenance' | 'offline';
  location?: Location;
  driver?: Driver;
  lastUpdated: Date;
}

// Charging related types
export enum ConnectorType {
  TYPE1 = 'Type1',
  TYPE2 = 'Type2',
  CCS1 = 'CCS1',
  CCS2 = 'CCS2',
  CHADEMO = 'CHAdeMO',
  TESLA = 'Tesla'
}

export enum ConnectorStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  FAULTED = 'faulted',
  OFFLINE = 'offline'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface ChargingConnector {
  id: string;
  stationId: string;
  type: ConnectorType;
  powerOutput: number; // kW
  status: ConnectorStatus;
  pricePerKwh: number;
  lastStatusUpdate: Date;
  currentSession?: ChargingSession;
  createdAt: Date;
  updatedAt: Date;
}

export interface StationAvailability {
  totalConnectors: number;
  availableConnectors: number;
  inUseConnectors: number;
  faultedConnectors: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  location: Location;
  address: string;
  provider: string;
  isPublic: boolean;
  networkId?: string;
  operatingHours: string;
  contactPhone: string;
  status: string;
  connectors: any[];
  powerCapacity: number;
  currentLoad: number;
  availability: {
    totalConnectors: number;
    availableConnectors: number;
    inUseConnectors: number;
    faultedConnectors: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChargingSession extends BaseEntity {
  connectorId: string;
  vehicleId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number; // kWh
  totalCost: number;
  paymentStatus: PaymentStatus;
  connector: ChargingConnector;
}

// Battery related types
export interface BatteryHealth {
  vehicleId: string;
  timestamp: Date;
  stateOfHealth: number; // 0-100%
  cycleCount: number;
  internalResistance?: number;
  temperature?: number;
  lastDeepDischarge?: Date;
  maximumCapacity: number; // kWh
  anomalyDetected: boolean;
}

export interface BatteryUsage {
  vehicleId: string;
  timestamp: Date;
  stateOfCharge: number; // 0-100%
  powerDraw: number; // kW (negative for regen)
  temperature: number; // Celsius
  chargeRate?: number; // kW
  dischargeRate?: number; // kW
  voltage: number; // V
  current: number; // A
}

export interface BatteryPrediction {
  recommendations: string[];
  predictedSoH: number;
  confidenceScore: number;
  predictedLifespan: number;
  suggestedActions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface BatteryAlert {
  id: string;
  vehicleId: string;
  timestamp: Date;
  type: 'degradation' | 'temperature' | 'anomaly' | 'balancing';
  severity: 'low' | 'medium' | 'high';
  message: string;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface BatteryFilters {
  sohRange: [number, number];
  vehicleIds?: string[];
  timeRange?: [Date, Date];
}

// Dashboard types
export interface VehicleStatusCount {
  name: string;
  count: number;
  fill: string;
}

export interface SoCDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface EnergyConsumption {
  date: string;
  consumption: number;
}

export interface ChargingSessionSummary {
  date: string;
  sessions: number;
  avgDurationMin: number;
}

// Settings and user types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  units: 'metric' | 'imperial';
  dashboardLayout: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  preferences: UserPreferences;
  createdAt: Date;
}

// State types
export interface BatteryState {
  healthData: BatteryHealth[];
  usageHistory: BatteryUsage[];
  alerts: BatteryAlert[];
  filters: BatteryFilters;
  loading: boolean;
  error: string | null;
} 