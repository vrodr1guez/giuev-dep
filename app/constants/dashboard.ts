import { AlertItem, ChargingSession, DashboardVehicleStatus, FleetSummary, SoCDistribution } from "../types/dashboard";

export const CHART_COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  tertiary: '#ffc658',
  quaternary: '#ff8042',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

export const SOC_RANGES = [
  { min: 0, max: 20, label: '0-20%', color: CHART_COLORS.quaternary },
  { min: 21, max: 40, label: '21-40%', color: CHART_COLORS.warning },
  { min: 41, max: 60, label: '41-60%', color: CHART_COLORS.info },
  { min: 61, max: 80, label: '61-80%', color: CHART_COLORS.primary },
  { min: 81, max: 100, label: '81-100%', color: CHART_COLORS.success },
];

export const VEHICLE_STATUSES = {
  ONLINE: 'online',
  CHARGING: 'charging',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
} as const;

export const STATUS_COLORS = {
  [VEHICLE_STATUSES.ONLINE]: 'bg-green-100 text-green-800',
  [VEHICLE_STATUSES.CHARGING]: 'bg-blue-100 text-blue-800',
  [VEHICLE_STATUSES.OFFLINE]: 'bg-gray-100 text-gray-800',
  [VEHICLE_STATUSES.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
  [VEHICLE_STATUSES.ERROR]: 'bg-red-100 text-red-800',
} as const;

export const TIME_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  CUSTOM: 'custom',
} as const;

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const ALERT_SEVERITY_COLORS = {
  [ALERT_SEVERITY.LOW]: 'bg-blue-100 text-blue-800',
  [ALERT_SEVERITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [ALERT_SEVERITY.HIGH]: 'bg-red-100 text-red-800',
} as const;

export const CHART_CONFIG = {
  height: 350,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  gridStrokeDasharray: '3 3',
  animationDuration: 300,
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const MAX_ALERTS_DISPLAY = 5;

// Fleet Summary Data
export const fleetSummary: FleetSummary = {
  totalVehicles: 26,
  avgSoC: 72,
  energyConsumed: {
    value: 156,
    unit: 'kWh',
    change: 5
  },
  chargingNow: 5
};

// Vehicle Status Data
export const vehicleStatusData: DashboardVehicleStatus[] = [
  { name: 'Online', count: 18, fill: '#22c55e' },
  { name: 'Charging', count: 5, fill: '#3b82f6' },
  { name: 'Offline', count: 2, fill: '#f59e0b' },
  { name: 'Maintenance', count: 1, fill: '#ef4444' },
];

// SoC Distribution Data
export const socDistributionData: SoCDistribution[] = [
  { name: '0-20%', value: 2, fill: '#ef4444' },
  { name: '21-40%', value: 3, fill: '#f59e0b' },
  { name: '41-60%', value: 5, fill: '#10b981' },
  { name: '61-80%', value: 10, fill: '#3b82f6' },
  { name: '81-100%', value: 6, fill: '#22c55e' },
];

// Charging Sessions Data
export const chargingSessionsData: ChargingSession[] = [
  { date: '05/01', sessions: 10, avgDurationMin: 45 },
  { date: '05/02', sessions: 12, avgDurationMin: 40 },
  { date: '05/03', sessions: 8, avgDurationMin: 50 },
  { date: '05/04', sessions: 15, avgDurationMin: 35 },
  { date: '05/05', sessions: 11, avgDurationMin: 42 },
  { date: '05/06', sessions: 9, avgDurationMin: 48 },
  { date: '05/07', sessions: 13, avgDurationMin: 38 },
];

// Alerts Data
export const alertsData: AlertItem[] = [
  {
    id: 'alert-1',
    message: 'Vehicle EV007: Low SoC (15%)',
    severity: 'warning',
    linkText: 'View',
    linkHref: '/vehicles/EV007'
  },
  {
    id: 'alert-2',
    message: 'Charging Station CS002: Connector Offline',
    severity: 'critical',
    linkText: 'View',
    linkHref: '/charging-stations/CS002'
  },
  {
    id: 'alert-3',
    message: 'Driver John D: Harsh Braking Event Detected',
    severity: 'info',
    linkText: 'View',
    linkHref: '/drivers/JohnD/feedback'
  },
  {
    id: 'alert-4',
    message: 'V2G Dispatch Alert: Grid demand spike expected in 30 mins',
    severity: 'critical',
    linkText: 'Manage V2G',
    linkHref: '/v2g'
  }
];

// Map Data - Vehicle Locations
export const vehicleLocations = [
  { id: 'EV001', lat: 40.7128, lng: -74.0060, status: 'driving', soc: 65, driver: 'John D.', model: 'Tesla Model 3', range: 185 },
  { id: 'EV002', lat: 40.7282, lng: -73.9942, status: 'charging', soc: 45, driver: 'Sarah M.', model: 'Nissan Leaf', range: 98 },
  { id: 'EV003', lat: 40.7589, lng: -73.9851, status: 'driving', soc: 78, driver: 'Robert K.', model: 'Chevy Bolt', range: 210 },
  { id: 'EV004', lat: 40.7549, lng: -74.0039, status: 'idle', soc: 92, driver: 'Emma L.', model: 'Ford Mustang Mach-E', range: 270 },
  { id: 'EV005', lat: 40.7429, lng: -73.9915, status: 'driving', soc: 23, driver: 'Michael P.', model: 'Hyundai Kona Electric', range: 62 },
  { id: 'EV007', lat: 40.7382, lng: -74.0150, status: 'alert', soc: 15, driver: 'David W.', model: 'Kia EV6', range: 45 },
];

// Map Data - Charging Stations
export const chargingStations = [
  { id: 'CS001', lat: 40.7200, lng: -74.0000, type: 'fast', available: 2, total: 4, power: 150 },
  { id: 'CS002', lat: 40.7350, lng: -73.9900, type: 'standard', available: 0, total: 6, power: 50 },
  { id: 'CS003', lat: 40.7500, lng: -74.0100, type: 'fast', available: 1, total: 2, power: 350 },
  { id: 'CS004', lat: 40.7450, lng: -73.9800, type: 'standard', available: 3, total: 8, power: 22 },
];

// Battery Health Data
export const batteryHealthData = [
  { name: 'Excellent (>95%)', value: 8, fill: '#22c55e' },
  { name: 'Good (90-95%)', value: 12, fill: '#3b82f6' },
  { name: 'Fair (85-90%)', value: 4, fill: '#f59e0b' },
  { name: 'Poor (<85%)', value: 2, fill: '#ef4444' },
];

// Driver Efficiency Data
export const driverEfficiencyData = [
  { name: 'John D.', efficiency: 4.8, trips: 28, fill: '#22c55e' },
  { name: 'Sarah M.', efficiency: 4.5, trips: 22, fill: '#3b82f6' },
  { name: 'Robert K.', efficiency: 4.2, trips: 18, fill: '#8b5cf6' },
  { name: 'Emma L.', efficiency: 4.7, trips: 25, fill: '#22c55e' },
  { name: 'Michael P.', efficiency: 3.9, trips: 15, fill: '#f59e0b' },
  { name: 'David W.', efficiency: 3.6, trips: 12, fill: '#ef4444' },
];

// Vehicle Summary Data
export const vehicleData = [
  { id: 'EV001', model: 'Tesla Model 3', driver: 'John D.', status: 'online', soc: 65, location: 'Downtown', lastUpdated: '10 min ago' },
  { id: 'EV002', model: 'Nissan Leaf', driver: 'Sarah M.', status: 'charging', soc: 45, location: 'East Side', lastUpdated: '5 min ago' },
  { id: 'EV003', model: 'Chevy Bolt', driver: 'Robert K.', status: 'online', soc: 78, location: 'North End', lastUpdated: '12 min ago' },
  { id: 'EV004', model: 'Ford Mach-E', driver: 'Emma L.', status: 'online', soc: 92, location: 'West Side', lastUpdated: '8 min ago' },
  { id: 'EV005', model: 'Hyundai Kona', driver: 'Michael P.', status: 'online', soc: 23, location: 'South End', lastUpdated: '15 min ago' },
  { id: 'EV006', model: 'VW ID.4', driver: 'Jennifer R.', status: 'offline', soc: 54, location: 'Maintenance', lastUpdated: '2 days ago' },
  { id: 'EV007', model: 'Kia EV6', driver: 'David W.', status: 'alert', soc: 15, location: 'Harbor Area', lastUpdated: '3 min ago' },
  { id: 'EV008', model: 'Tesla Model Y', driver: 'Lisa T.', status: 'online', soc: 72, location: 'Downtown', lastUpdated: '18 min ago' },
]; 