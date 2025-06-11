export const WS_MESSAGE_TYPES = {
  BATTERY_ALERT: 'battery_alert' as const,
  BATTERY_USAGE: 'battery_usage' as const,
  BATTERY_HEALTH: 'battery_health' as const,
  CHARGING_STATUS: 'charging_status' as const,
  VEHICLE_STATUS: 'vehicle_status' as const,
} as const;

type MessageType = typeof WS_MESSAGE_TYPES[keyof typeof WS_MESSAGE_TYPES];
type MessageHandler = (payload: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Map<MessageType, Set<MessageHandler>> = new Map();

  connect(url: string) {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        this.notifySubscribers(type, payload);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Implement reconnection logic here
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  subscribe(type: MessageType, handler: MessageHandler): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }

    this.subscribers.get(type)?.add(handler);

    return () => {
      this.subscribers.get(type)?.delete(handler);
    };
  }

  private notifySubscribers(type: MessageType, payload: any) {
    this.subscribers.get(type)?.forEach(handler => handler(payload));
  }

  send(type: MessageType, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

export const wsService = new WebSocketService(); 