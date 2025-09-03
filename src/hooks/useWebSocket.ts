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
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleOpportunityUpdate = (data: any[]) => {
      setOpportunities(data);
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
  const [botStatuses, setBotStatuses] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const handleBotStatusUpdate = (data: { botId: string; status: any }) => {
      setBotStatuses(prev => new Map(prev.set(data.botId, data.status)));
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
  const [prices, setPrices] = useState<Map<string, any>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handlePriceUpdate = (data: { symbol: string; price: number; change: number }) => {
      setPrices(prev => new Map(prev.set(data.symbol, {
        price: data.price,
        change: data.change,
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
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const handleTradeExecuted = (data: any) => {
      setNotifications(prev => [...prev, {
        ...data,
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