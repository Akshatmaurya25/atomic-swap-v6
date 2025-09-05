import { WebSocketMessage } from '@/types';

type WebSocketEventHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private isConnecting = false;

  private readonly WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(this.WS_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('disconnected', {});
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', { error });
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventHandlers.clear();
  }

  private handleMessage(message: WebSocketMessage) {
    const { type, data } = message;
    this.emit(type, data);
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_exceeded', {});
    }
  }

  // Event subscription methods
  on(event: string, handler: WebSocketEventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: WebSocketEventHandler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Specific event subscription helpers
  onOpportunityUpdate(handler: (opportunities: import('@/types').ArbitrageOpportunity[]) => void) {
    this.on('opportunity_update', (data) => handler(data as import('@/types').ArbitrageOpportunity[]));
  }

  onPriceUpdate(handler: (priceData: { symbol: string; price: number; change: number; timestamp: number }) => void) {
    this.on('price_update', (data) => handler(data as { symbol: string; price: number; change: number; timestamp: number }));
  }

  onBotStatusUpdate(handler: (botStatus: { botId: string; status: 'active' | 'paused' | 'stopped'; timestamp: number }) => void) {
    this.on('bot_status', (data) => handler(data as { botId: string; status: 'active' | 'paused' | 'stopped'; timestamp: number }));
  }

  onTradeExecuted(handler: (tradeData: { type: string; message: string; success: boolean; txHash?: string; amount?: number; token?: string; timestamp: number }) => void) {
    this.on('trade_executed', (data) => handler(data as { type: string; message: string; success: boolean; txHash?: string; amount?: number; token?: string; timestamp: number }));
  }

  // Send messages (if needed for bidirectional communication)
  send(type: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: type as import('@/types').WebSocketMessage['type'],
        data,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Subscribe to specific data streams
  subscribeToOpportunities() {
    this.send('subscribe', { stream: 'opportunities' });
  }

  subscribeToPortfolio() {
    this.send('subscribe', { stream: 'portfolio' });
  }

  subscribeToBotUpdates() {
    this.send('subscribe', { stream: 'bots' });
  }

  unsubscribeFromStream(stream: string) {
    this.send('unsubscribe', { stream });
  }

  // Connection state
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Auto-connect on import (optional - you might want to do this manually)
if (typeof window !== 'undefined') {
  // Only connect in browser environment
  // wsService.connect();
}