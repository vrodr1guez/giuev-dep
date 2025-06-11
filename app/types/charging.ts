import { Location } from './models';

export enum ConnectorStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  FAULTED = 'faulted',
  OFFLINE = 'offline'
}

export enum ConnectorType {
  TYPE1 = 'Type 1',
  TYPE2 = 'Type 2',
  CCS1 = 'CCS1',
  CCS2 = 'CCS2',
  CHADEMO = 'CHAdeMO',
  TESLA = 'Tesla'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface ChargingSession {
  id: string;
  stationId: string;
  vehicleId: string;
  driverId?: string;
  startTime: string;
  endTime?: string;
  energyDelivered?: number; // in kWh
  cost?: number;
  status: 'in-progress' | 'completed' | 'interrupted' | 'scheduled';
}

export interface ChargingConnector {
  id: string;
  type: 'CCS' | 'CHAdeMO' | 'Type2' | 'Tesla';
  powerOutput: number; // in kW
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
}

export interface ChargingStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  connectors: ChargingConnector[];
  lastMaintenance?: string;
  powerRating: number; // in kW
  networkProvider?: string;
  networkId?: string;
  isPublic?: boolean;
}

export interface ChargingStationFilter {
  status?: ConnectorStatus | 'all';
  connectorType?: ConnectorType | 'all';
  minPower?: number;
  maxPower?: number;
  area?: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
}

export interface StationAvailability {
  totalConnectors: number;
  availableConnectors: number;
  inUseConnectors: number;
  faultedConnectors: number;
}

export interface ChargingFilters {
  status: ConnectorStatus[];
  connectorTypes: ConnectorType[];
  network?: string;
  isPublic?: boolean;
}

export interface ChargingState {
  stations: ChargingStation[];
  sessions: ChargingSession[];
  selectedStationId: string | null;
  loading: boolean;
  error: string | null;
  filters: ChargingFilters;
}

export interface ChargingSchedule {
  id: string;
  vehicleId: string;
  stationId: string;
  plannedStartTime: string;
  plannedEndTime: string;
  estimatedEnergyNeeded: number; // in kWh
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface ChargingNetworkStats {
  totalStations: number;
  availableStations: number;
  totalEnergySuppliesToday: number; // in kWh
  peakDemand: number; // in kW
  averageSessionDuration: number; // in minutes
} 