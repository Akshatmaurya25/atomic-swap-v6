import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/services/supabase';
import { TradingBot, ArbitrageOpportunity, ActivityItem, UserSettings } from '@/types';

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const response = await supabaseService.signUp(email, password);
    return response;
  };

  const signIn = async (email: string, password: string) => {
    const response = await supabaseService.signIn(email, password);
    return response;
  };

  const signOut = async () => {
    const response = await supabaseService.signOut();
    return response;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}

// Generic hook for Supabase operations
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await queryFn();
      
      if (response.success && response.data !== undefined) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch data');
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
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

// Specific hooks for each entity
export function useBots() {
  const { user } = useAuth();
  const [realTimeData, setRealTimeData] = useState<TradingBot[] | null>(null);

  const query = useSupabaseQuery(
    () => supabaseService.getBots(),
    [user?.id]
  );

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates
    const subscription = supabaseService.subscribeToBots((bots) => {
      setRealTimeData(bots);
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    data: realTimeData || query.data,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useOpportunities() {
  const [realTimeData, setRealTimeData] = useState<ArbitrageOpportunity[] | null>(null);

  const query = useSupabaseQuery(
    () => supabaseService.getOpportunities(),
    []
  );

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = supabaseService.subscribeToOpportunities((opportunities) => {
      setRealTimeData(opportunities);
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    data: realTimeData || query.data,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useActivities(params?: {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const { user } = useAuth();
  const [realTimeData, setRealTimeData] = useState<ActivityItem[] | null>(null);

  const query = useSupabaseQuery(
    () => supabaseService.getActivities(params),
    [user?.id, params]
  );

  useEffect(() => {
    if (!user) return;

    const subscription = supabaseService.subscribeToActivities((activities) => {
      setRealTimeData(activities);
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    data: realTimeData || query.data,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSettings() {
  const { user } = useAuth();
  
  return useSupabaseQuery(
    () => supabaseService.getSettings(),
    [user?.id]
  );
}

// Operation hooks for mutations
export function useBotOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(operation: () => Promise<{ success: boolean; data?: T; error?: string }>) => {
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
  };

  return {
    loading,
    error,
    clearError: () => setError(null),
    createBot: (botData: Partial<TradingBot>) => execute(() => supabaseService.createBot(botData)),
    updateBot: (botId: string, updates: Partial<TradingBot>) => execute(() => supabaseService.updateBot(botId, updates)),
    deleteBot: (botId: string) => execute(() => supabaseService.deleteBot(botId)),
    startBot: (botId: string) => execute(() => supabaseService.startBot(botId)),
    pauseBot: (botId: string) => execute(() => supabaseService.pauseBot(botId)),
    stopBot: (botId: string) => execute(() => supabaseService.stopBot(botId)),
  };
}

export function useOpportunityOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(operation: () => Promise<{ success: boolean; data?: T; error?: string }>) => {
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
  };

  return {
    loading,
    error,
    clearError: () => setError(null),
    toggleFavorite: (opportunityId: string) => execute(() => supabaseService.toggleFavoriteOpportunity(opportunityId)),
  };
}

export function useSettingsOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(operation: () => Promise<{ success: boolean; data?: T; error?: string }>) => {
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
  };

  return {
    loading,
    error,
    clearError: () => setError(null),
    updateSettings: (settings: Partial<UserSettings>) => execute(() => supabaseService.updateSettings(settings)),
  };
}

export function useActivityLogger() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logActivity = async (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supabaseService.createActivity(activity);
      
      if (!response.success) {
        setError(response.error || 'Failed to log activity');
        return null;
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    logActivity,
    loading,
    error,
    clearError: () => setError(null),
  };
}