import { useState, useEffect, useCallback } from 'react';
import { priceFeedService } from '@/services/priceFeed';

export function usePriceFeed() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check initial status
  useEffect(() => {
    const status = priceFeedService.getStatus();
    setIsRunning(status.isRunning);
  }, []);

  // Start price feed
  const start = useCallback((intervalMs: number = 30000) => {
    try {
      priceFeedService.start(intervalMs);
      setIsRunning(true);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start price feed');
    }
  }, []);

  // Stop price feed
  const stop = useCallback(() => {
    try {
      priceFeedService.stop();
      setIsRunning(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop price feed');
    }
  }, []);

  // Manual update trigger
  const triggerUpdate = useCallback(async () => {
    try {
      await priceFeedService.triggerUpdate();
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger update');
    }
  }, []);

  // Auto-start when component mounts (optional)
  useEffect(() => {
    // Auto-start price feed in development/demo mode
    if (process.env.NODE_ENV === 'development' && !isRunning) {
      start(30000); // 30 second interval
    }

    // Cleanup on unmount
    return () => {
      if (isRunning) {
        stop();
      }
    };
  }, []);

  return {
    isRunning,
    lastUpdate,
    error,
    start,
    stop,
    triggerUpdate,
    clearError: () => setError(null),
  };
}