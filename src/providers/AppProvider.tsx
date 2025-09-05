'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/services/supabase';
import { createDefaultUserSettings } from '@/utils/initData';
import { TradingBot, ArbitrageOpportunity, ActivityItem, UserSettings } from '@/types';

interface AppState {
  // Auth state
  user: User | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  
  // Wallet state
  isWalletConnected: boolean;
  walletAddress: string | undefined;
  
  // Data state
  bots: TradingBot[] | null;
  opportunities: ArbitrageOpportunity[] | null;
  activities: ActivityItem[] | null;
  settings: UserSettings | null;
  
  // Loading states
  dataLoading: boolean;
  botsLoading: boolean;
  opportunitiesLoading: boolean;
  activitiesLoading: boolean;
  
  // Error states
  botsError: string | null;
  opportunitiesError: string | null;
  activitiesError: string | null;
  
  // App state
  needsDatabaseSetup: boolean;
  isInitialized: boolean;
}

interface AppActions {
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: unknown }>;
  signUp: (email: string, password: string) => Promise<{ data: unknown; error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  
  // Data actions
  refreshData: () => Promise<void>;
  refreshBots: () => Promise<void>;
  refreshOpportunities: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  
  // Bot operations
  createBot: (botData: Partial<TradingBot>) => Promise<TradingBot | null>;
  updateBot: (botId: string, updates: Partial<TradingBot>) => Promise<TradingBot | null>;
  deleteBot: (botId: string) => Promise<boolean>;
  startBot: (botId: string) => Promise<boolean>;
  pauseBot: (botId: string) => Promise<boolean>;
  stopBot: (botId: string) => Promise<boolean>;
  
  // Opportunity operations
  toggleFavoriteOpportunity: (opportunityId: string) => Promise<boolean>;
  
  // Settings operations
  updateSettings: (settings: Partial<UserSettings>) => Promise<UserSettings | null>;
  
  // Setup actions
  markDatabaseSetupComplete: () => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { address, isConnected } = useAccount();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Data state
  const [bots, setBots] = useState<TradingBot[] | null>(null);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[] | null>(null);
  const [activities, setActivities] = useState<ActivityItem[] | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Loading states
  const [dataLoading, setDataLoading] = useState(false);
  const [botsLoading, setBotsLoading] = useState(false);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  
  // Error states
  const [botsError, setBotsError] = useState<string | null>(null);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  
  // App state
  const [needsDatabaseSetup, setNeedsDatabaseSetup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
        
        // Clear data when user logs out
        if (!session?.user) {
          setBots(null);
          setOpportunities(null);
          setActivities(null);
          setSettings(null);
          setIsInitialized(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Initialize data when user is authenticated and wallet is connected
  useEffect(() => {
    if (user && isConnected && !isInitialized && !needsDatabaseSetup) {
      initializeUserData();
    }
  }, [user, isConnected, isInitialized, needsDatabaseSetup]);

  const initializeUserData = useCallback(async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        refreshBots(),
        refreshOpportunities(),
        refreshActivities(),
        refreshUserSettings(),
      ]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize user data:', error);
      // Check if it's a database setup issue
      if (error instanceof Error && (
        error.message.includes('relation') ||
        error.message.includes('permission denied')
      )) {
        setNeedsDatabaseSetup(true);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Data fetching functions
  const refreshBots = useCallback(async () => {
    if (!user) return;
    
    setBotsLoading(true);
    setBotsError(null);
    
    try {
      const response = await supabaseService.getBots();
      if (response.success && response.data) {
        setBots(response.data);
      } else {
        setBotsError(response.error || 'Failed to fetch bots');
        setBots([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bots';
      setBotsError(errorMessage);
      setBots([]);
      
      if (errorMessage.includes('relation') || errorMessage.includes('permission denied')) {
        setNeedsDatabaseSetup(true);
      }
    } finally {
      setBotsLoading(false);
    }
  }, [user]);

  const refreshOpportunities = useCallback(async () => {
    setOpportunitiesLoading(true);
    setOpportunitiesError(null);
    
    try {
      const response = await supabaseService.getOpportunities();
      if (response.success && response.data) {
        setOpportunities(response.data);
      } else {
        setOpportunitiesError(response.error || 'Failed to fetch opportunities');
        setOpportunities([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch opportunities';
      setOpportunitiesError(errorMessage);
      setOpportunities([]);
      
      if (errorMessage.includes('relation') || errorMessage.includes('permission denied')) {
        setNeedsDatabaseSetup(true);
      }
    } finally {
      setOpportunitiesLoading(false);
    }
  }, []);

  const refreshActivities = useCallback(async () => {
    if (!user) return;
    
    setActivitiesLoading(true);
    setActivitiesError(null);
    
    try {
      const response = await supabaseService.getActivities({ limit: 10 });
      if (response.success && response.data) {
        setActivities(response.data);
      } else {
        setActivitiesError(response.error || 'Failed to fetch activities');
        setActivities([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch activities';
      setActivitiesError(errorMessage);
      setActivities([]);
      
      if (errorMessage.includes('relation') || errorMessage.includes('permission denied')) {
        setNeedsDatabaseSetup(true);
      }
    } finally {
      setActivitiesLoading(false);
    }
  }, [user]);

  const refreshUserSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await supabaseService.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        // If no settings exist, create default settings
        console.log('No settings found, creating default settings for user');
        await createDefaultUserSettings(user.id);
        // Try to fetch again
        const retryResponse = await supabaseService.getSettings();
        if (retryResponse.success && retryResponse.data) {
          setSettings(retryResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, [user]);

  const refreshData = async () => {
    await Promise.all([
      refreshBots(),
      refreshOpportunities(),
      refreshActivities(),
    ]);
  };

  // Auth actions
  const signIn = async (email: string, password: string) => {
    const response = await supabaseService.signIn(email, password);
    return {
      data: response.success ? response.data : null,
      error: response.error || null
    };
  };

  const signUp = async (email: string, password: string) => {
    const response = await supabaseService.signUp(email, password);
    return {
      data: response.success ? response.data : null,
      error: response.error || null
    };
  };

  const signOut = async () => {
    const response = await supabaseService.signOut();
    // Clear local state
    setBots(null);
    setOpportunities(null);
    setActivities(null);
    setSettings(null);
    setIsInitialized(false);
    setNeedsDatabaseSetup(false);
    return { error: response.error || null };
  };

  // Bot operations
  const createBot = async (botData: Partial<TradingBot>) => {
    try {
      const response = await supabaseService.createBot(botData);
      if (response.success && response.data) {
        await refreshBots(); // Refresh bots list
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create bot:', error);
      return null;
    }
  };

  const updateBot = async (botId: string, updates: Partial<TradingBot>) => {
    try {
      const response = await supabaseService.updateBot(botId, updates);
      if (response.success && response.data) {
        await refreshBots(); // Refresh bots list
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update bot:', error);
      return null;
    }
  };

  const deleteBot = async (botId: string) => {
    try {
      const response = await supabaseService.deleteBot(botId);
      if (response.success) {
        await refreshBots(); // Refresh bots list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete bot:', error);
      return false;
    }
  };

  const startBot = async (botId: string) => {
    try {
      const response = await supabaseService.startBot(botId);
      if (response.success) {
        await refreshBots(); // Refresh bots list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to start bot:', error);
      return false;
    }
  };

  const pauseBot = async (botId: string) => {
    try {
      const response = await supabaseService.pauseBot(botId);
      if (response.success) {
        await refreshBots(); // Refresh bots list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to pause bot:', error);
      return false;
    }
  };

  const stopBot = async (botId: string) => {
    try {
      const response = await supabaseService.stopBot(botId);
      if (response.success) {
        await refreshBots(); // Refresh bots list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to stop bot:', error);
      return false;
    }
  };

  // Opportunity operations
  const toggleFavoriteOpportunity = async (opportunityId: string) => {
    try {
      const response = await supabaseService.toggleFavoriteOpportunity(opportunityId);
      if (response.success) {
        await refreshOpportunities(); // Refresh opportunities list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  };

  // Settings operations
  const updateSettings = async (settingsData: Partial<UserSettings>) => {
    try {
      const response = await supabaseService.updateSettings(settingsData);
      if (response.success && response.data) {
        setSettings(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return null;
    }
  };

  const markDatabaseSetupComplete = () => {
    setNeedsDatabaseSetup(false);
    setIsInitialized(false); // This will trigger data initialization
  };

  const value: AppContextType = {
    // State
    user,
    authLoading,
    isAuthenticated: !!user,
    isWalletConnected: isConnected,
    walletAddress: address,
    bots,
    opportunities,
    activities,
    settings,
    dataLoading,
    botsLoading,
    opportunitiesLoading,
    activitiesLoading,
    botsError,
    opportunitiesError,
    activitiesError,
    needsDatabaseSetup,
    isInitialized,
    
    // Actions
    signIn,
    signUp,
    signOut,
    refreshData,
    refreshBots,
    refreshOpportunities,
    refreshActivities,
    createBot,
    updateBot,
    deleteBot,
    startBot,
    pauseBot,
    stopBot,
    toggleFavoriteOpportunity,
    updateSettings,
    markDatabaseSetupComplete,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};