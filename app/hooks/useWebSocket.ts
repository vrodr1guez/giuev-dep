import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

interface UseWebSocketOptions {
  url: string;
  token: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
}

interface UseWebSocketReturn {
  status: WebSocketStatus;
  sendMessage: (data: any) => void;
  reconnect: () => void;
  disconnect: () => void;
  lastMessage: any;
}

export function useWebSocket({
  url,
  token,
  autoReconnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState('connecting');
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  // Function to create a WebSocket connection
  const connect = useCallback(() => {
    // Close existing connections
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create URL with token for authentication
    const wsUrl = `${url}?token=${token}`;
    
    // Create new WebSocket connection
    const socket = new WebSocket(wsUrl);
    
    // Store the socket reference
    socketRef.current = socket;
    
    // Setup event handlers
    socket.onopen = () => {
      setStatus('open');
      reconnectAttemptsRef.current = 0;
      if (onOpen) onOpen();
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      setStatus('closed');
      if (onClose) onClose();
      
      // Attempt to reconnect if enabled
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, reconnectInterval);
      }
    };
    
    socket.onerror = (event) => {
      setStatus('error');
      if (onError) onError(event);
    };
  }, [url, token, autoReconnect, reconnectInterval, maxReconnectAttempts, onMessage, onOpen, onClose, onError]);

  // Function to send messages
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Function to manually reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Function to disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // Connect on mount and clean up on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    sendMessage,
    reconnect,
    disconnect,
    lastMessage,
  };
}

// Specialized hook for vehicle telematics
interface UseVehicleTelematicsOptions {
  token: string;
  vehicleId: string;
  onTelemetryUpdate?: (data: any) => void;
}

export function useVehicleTelemetry({
  token,
  vehicleId,
  onTelemetryUpdate,
}: UseVehicleTelematicsOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_API_WS_URL || (
    window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/api/v1/ws/telematics`
      : `ws://${window.location.host}/api/v1/ws/telematics`
  );

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'telemetry_update' && onTelemetryUpdate) {
      onTelemetryUpdate(data);
    }
  }, [onTelemetryUpdate]);

  const { 
    status, 
    sendMessage, 
    reconnect, 
    disconnect, 
    lastMessage 
  } = useWebSocket({
    url: baseUrl,
    token,
    onMessage: handleMessage
  });

  // Subscribe to vehicle telematics when connection is open
  useEffect(() => {
    if (status === 'open') {
      sendMessage({
        action: 'subscribe',
        vehicle_id: vehicleId
      });
    }
    
    return () => {
      if (status === 'open') {
        sendMessage({
          action: 'unsubscribe',
          vehicle_id: vehicleId
        });
      }
    };
  }, [status, sendMessage, vehicleId]);

  return {
    status,
    lastTelemetry: lastMessage?.type === 'telemetry_update' ? lastMessage : null,
    reconnect,
    disconnect
  };
}

// Specialized hook for charging station updates
interface UseChargingStationsOptions {
  token: string;
  onStationUpdate?: (data: any) => void;
}

export function useChargingStations({
  token,
  onStationUpdate,
}: UseChargingStationsOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_API_WS_URL || (
    window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/api/v1/ws/charging-stations`
      : `ws://${window.location.host}/api/v1/ws/charging-stations`
  );

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'station_update' && onStationUpdate) {
      onStationUpdate(data);
    }
  }, [onStationUpdate]);

  const { 
    status, 
    reconnect, 
    disconnect, 
    lastMessage 
  } = useWebSocket({
    url: baseUrl,
    token,
    onMessage: handleMessage
  });

  return {
    status,
    lastStationUpdate: lastMessage?.type === 'station_update' ? lastMessage : null,
    reconnect,
    disconnect
  };
}

// Specialized hook for real-time notifications
interface UseNotificationsOptions {
  token: string;
  onNotification?: (data: any) => void;
}

export function useNotifications({
  token,
  onNotification,
}: UseNotificationsOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_API_WS_URL || (
    window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/api/v1/ws/notifications`
      : `ws://${window.location.host}/api/v1/ws/notifications`
  );

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'notification' && onNotification) {
      onNotification(data);
    }
  }, [onNotification]);

  const { 
    status, 
    reconnect, 
    disconnect, 
    lastMessage 
  } = useWebSocket({
    url: baseUrl,
    token,
    onMessage: handleMessage
  });

  return {
    status,
    lastNotification: lastMessage?.type === 'notification' ? lastMessage : null,
    reconnect,
    disconnect
  };
} 