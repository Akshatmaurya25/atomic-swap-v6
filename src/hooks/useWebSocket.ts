import { useEffect, useRef, useState } from 'react';
import { wsService } from '@/services/websocket';

// Hook for managing WebSocket connection
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState(wsService.connectionState);
  
  useEffect(() => {
    const handleConnected = () => setConnectionStatus('connected');
    const handleDisconnected = () => setConnectionStatus('disconnected');
    const handleError = () => setConnectionStatus('error');

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('error', handleError);

    // Connect if not already connected
    if (!wsService.isConnected) {
      wsService.connect();
    }

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('error', handleError);
    };
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    connect: wsService.connect.bind(wsService),
    disconnect: wsService.disconnect.bind(wsService),
  };
}

// Hook for real-time opportunities
export function useRealtimeOpportunities() {
  const [opportunities, setOpportunities] = useState<import('@/types').ArbitrageOpportunity[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleOpportunityUpdate = (data: unknown) => {
      setOpportunities(data as import('@/types').ArbitrageOpportunity[]);
      setLastUpdate(new Date());
    };

    wsService.onOpportunityUpdate(handleOpportunityUpdate);
    wsService.subscribeToOpportunities();

    return () => {
      wsService.off('opportunity_update', handleOpportunityUpdate);
      wsService.unsubscribeFromStream('opportunities');
    };
  }, []);

  return {
    opportunities,
    lastUpdate,
  };
}

// Hook for real-time bot status updates
export function useRealtimeBotStatus() {
  const [botStatuses, setBotStatuses] = useState<Map<string, { status: 'active' | 'paused' | 'stopped'; lastUpdate: Date }>>(new Map());

  useEffect(() => {
    const handleBotStatusUpdate = (data: unknown) => {
      const typedData = data as { botId: string; status: { status: 'active' | 'paused' | 'stopped'; lastUpdate: Date } };
      setBotStatuses(prev => new Map(prev.set(typedData.botId, typedData.status)));
    };

    wsService.onBotStatusUpdate(handleBotStatusUpdate);
    wsService.subscribeToBotUpdates();

    return () => {
      wsService.off('bot_status', handleBotStatusUpdate);
      wsService.unsubscribeFromStream('bots');
    };
  }, []);

  return {
    botStatuses: Object.fromEntries(botStatuses),
    getBotStatus: (botId: string) => botStatuses.get(botId),
  };
}

// Hook for real-time price updates
export function useRealtimePrices() {
  const [prices, setPrices] = useState<Map<string, { price: number; change: number; timestamp: Date }>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handlePriceUpdate = (data: unknown) => {
      const typedData = data as { symbol: string; price: number; change: number };
      setPrices(prev => new Map(prev.set(typedData.symbol, {
        price: typedData.price,
        change: typedData.change,
        timestamp: new Date(),
      })));
      setLastUpdate(new Date());
    };

    wsService.onPriceUpdate(handlePriceUpdate);

    return () => {
      wsService.off('price_update', handlePriceUpdate);
    };
  }, []);

  return {
    prices: Object.fromEntries(prices),
    getPrice: (symbol: string) => prices.get(symbol),
    lastUpdate,
  };
}

// Hook for trade execution notifications
export function useTradeNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    success?: boolean;
    txHash?: string;
    amount?: number;
    token?: string;
  }>>([]);

  useEffect(() => {
    const handleTradeExecuted = (data: unknown) => {
      const typedData = data as {
        type: string;
        message: string;
        success?: boolean;
        txHash?: string;
        amount?: number;
        token?: string;
      };
      setNotifications(prev => [...prev, {
        ...typedData,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      }]);
    };

    wsService.onTradeExecuted(handleTradeExecuted);

    return () => {
      wsService.off('trade_executed', handleTradeExecuted);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    dismissNotification,
    clearAllNotifications,
  };
}

// Hook for periodic data refresh
export function usePeriodicRefresh(callback: () => void, interval: number = 30000) {
  const callbackRef = useRef(callback);
  const [isActive, setIsActive] = useState(true);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      callbackRef.current();
    }, interval);

    // Call immediately
    callbackRef.current();

    return () => clearInterval(intervalId);
  }, [interval, isActive]);

  return {
    isActive,
    start: () => setIsActive(true),
    stop: () => setIsActive(false),
    toggle: () => setIsActive(prev => !prev),
  };
}