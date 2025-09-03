import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { ApiResponse } from '@/types';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for managing async operations with loading states
export function useAsyncOperation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<ApiResponse<T>>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await operation();
      
      if (!response.success) {
        setError(response.error || 'Operation failed');
        return null;
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    execute,
    clearError: () => setError(null),
  };
}

// Specific hooks for different entities
export function useBots() {
  return useApi(() => apiService.getBots());
}

export function useOpportunities() {
  return useApi(() => apiService.getOpportunities());
}

export function usePortfolio() {
  return useApi(() => apiService.getPortfolio());
}

export function useActivities(params?: {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
  timeRange?: string;
}) {
  return useApi(() => apiService.getActivities(params), [params]);
}

export function useSettings() {
  return useApi(() => apiService.getSettings());
}

export function useAnalytics(timeRange: string = '7d') {
  const profitData = useApi(() => apiService.getProfitData(timeRange), [timeRange]);
  const chainPerformance = useApi(() => apiService.getChainPerformance());
  const strategyBreakdown = useApi(() => apiService.getStrategyBreakdown());
  const portfolioMetrics = useApi(() => apiService.getPortfolioMetrics());

  return {
    profitData: profitData.data,
    chainPerformance: chainPerformance.data,
    strategyBreakdown: strategyBreakdown.data,
    portfolioMetrics: portfolioMetrics.data,
    loading: profitData.loading || chainPerformance.loading || strategyBreakdown.loading || portfolioMetrics.loading,
    error: profitData.error || chainPerformance.error || strategyBreakdown.error || portfolioMetrics.error,
    refetch: () => {
      profitData.refetch();
      chainPerformance.refetch();
      strategyBreakdown.refetch();
      portfolioMetrics.refetch();
    }
  };
}

// Hook for bot operations
export function useBotOperations() {
  const { execute, loading, error } = useAsyncOperation();

  const createBot = (botData: any) => execute(() => apiService.createBot(botData));
  const updateBot = (botId: string, updates: any) => execute(() => apiService.updateBot(botId, updates));
  const deleteBot = (botId: string) => execute(() => apiService.deleteBot(botId));
  const startBot = (botId: string) => execute(() => apiService.startBot(botId));
  const pauseBot = (botId: string) => execute(() => apiService.pauseBot(botId));
  const stopBot = (botId: string) => execute(() => apiService.stopBot(botId));

  return {
    createBot,
    updateBot,
    deleteBot,
    startBot,
    pauseBot,
    stopBot,
    loading,
    error,
  };
}

// Hook for opportunity operations
export function useOpportunityOperations() {
  const { execute, loading, error } = useAsyncOperation();

  const executeOpportunity = (opportunityId: string) => 
    execute(() => apiService.executeOpportunity(opportunityId));
  
  const toggleFavorite = (opportunityId: string) =>
    execute(() => apiService.toggleFavoriteOpportunity(opportunityId));

  return {
    executeOpportunity,
    toggleFavorite,
    loading,
    error,
  };
}

// Hook for settings operations
export function useSettingsOperations() {
  const { execute, loading, error } = useAsyncOperation();

  const updateSettings = (settings: any) => execute(() => apiService.updateSettings(settings));
  const resetSettings = () => execute(() => apiService.resetSettings());

  return {
    updateSettings,
    resetSettings,
    loading,
    error,
  };
}

// Hook for portfolio operations
export function usePortfolioOperations() {
  const { execute, loading, error } = useAsyncOperation();

  const addWallet = (walletData: any) => execute(() => apiService.addWallet(walletData));
  const removeWallet = (walletAddress: string) => execute(() => apiService.removeWallet(walletAddress));
  const refreshWallet = (walletAddress: string) => execute(() => apiService.refreshWallet(walletAddress));

  return {
    addWallet,
    removeWallet,
    refreshWallet,
    loading,
    error,
  };
}