export const WS_MESSAGE_TYPES = {
  // System messages
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
  
  // Vehicle updates
  VEHICLE_UPDATE: 'vehicle_update',
  VEHICLE_LOCATION: 'vehicle_location',
  VEHICLE_TELEMETRY: 'vehicle_telemetry',
  
  // Charging updates
  CHARGING_STATUS: 'charging_status',
  CHARGING_START: 'charging_start',
  CHARGING_END: 'charging_end',
  
  // Battery updates
  BATTERY_ALERT: 'battery_alert',
  BATTERY_STATUS: 'battery_status',
  BATTERY_HEALTH: 'battery_health',
  
  // Driver updates
  DRIVER_EVENT: 'driver_event',
  DRIVER_STATUS: 'driver_status',
  DRIVER_LOCATION: 'driver_location',
  
  // System notifications
  SYSTEM_NOTIFICATION: 'system_notification',
  MAINTENANCE_ALERT: 'maintenance_alert',
  FLEET_UPDATE: 'fleet_update',
} as const;

export type WebSocketMessageType = keyof typeof WS_MESSAGE_TYPES;

// WebSocket connection states (matching browser WebSocket.readyState)
export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

// WebSocket error codes
export const WS_ERROR_CODES = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  INVALID_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MISSING_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
} as const;

// WebSocket configuration defaults
export const WS_CONFIG_DEFAULTS = {
  maxReconnectAttempts: 5,
  initialReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectBackoffMultiplier: 1.5,
  pingInterval: 30000,
} as const; 