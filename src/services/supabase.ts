import { supabase, Tables, Inserts, Updates } from '@/lib/supabase';
import { 
  TradingBot, 
  ArbitrageOpportunity, 
  WalletData, 
  ActivityItem, 
  UserSettings,
  ApiResponse 
} from '@/types';

class SupabaseService {
  // Helper method to format API responses
  private formatResponse<T>(data: T | null, error: any = null): ApiResponse<T> {
    if (error) {
      console.error('Supabase error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Database operation failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Database error (${error.code})`;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (Object.keys(error).length === 0) {
        errorMessage = 'Database connection or table access error. Please check if tables exist.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
    return {
      success: true,
      data: data || undefined
    };
  }

  // Auth helpers
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return this.formatResponse(user, error);
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return this.formatResponse(data, error);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return this.formatResponse(data, error);
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return this.formatResponse({}, error);
  }

  // Trading Bots CRUD
  async getBots(): Promise<ApiResponse<TradingBot[]>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('trading_bots')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    // Transform database format to our TradingBot type
    const transformedBots: TradingBot[] = (data || []).map(bot => ({
      id: bot.id,
      name: bot.name,
      strategy: bot.strategy as 'arbitrage' | 'dca' | 'grid',
      status: bot.status as 'active' | 'paused' | 'stopped',
      pairs: bot.pairs,
      chains: bot.chains,
      created: new Date(bot.created_at),
      performance: bot.performance || {
        totalProfit: 0,
        profitPercentage: 0,
        trades: 0,
        successRate: 0,
        balance: 1000
      },
      settings: bot.settings || {
        minProfitPercentage: 0.5,
        maxInvestment: 1000,
        stopLoss: -5.0
      }
    }));

    return this.formatResponse(transformedBots, error);
  }

  async createBot(botData: Partial<TradingBot>): Promise<ApiResponse<TradingBot>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const insertData: Inserts<'trading_bots'> = {
      user_id: user.user.id,
      name: botData.name!,
      strategy: botData.strategy!,
      status: botData.status || 'stopped',
      pairs: botData.pairs || [],
      chains: botData.chains || [],
      settings: botData.settings || {},
      performance: botData.performance || {}
    };

    const { data, error } = await supabase
      .from('trading_bots')
      .insert(insertData)
      .select()
      .single();

    if (data) {
      const transformedBot: TradingBot = {
        id: data.id,
        name: data.name,
        strategy: data.strategy as 'arbitrage' | 'dca' | 'grid',
        status: data.status as 'active' | 'paused' | 'stopped',
        pairs: data.pairs,
        chains: data.chains,
        created: new Date(data.created_at),
        performance: data.performance,
        settings: data.settings
      };
      return this.formatResponse(transformedBot, error);
    }

    return this.formatResponse(null, error);
  }

  async updateBot(botId: string, updates: Partial<TradingBot>): Promise<ApiResponse<TradingBot>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const updateData: Updates<'trading_bots'> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.status) updateData.status = updates.status;
    if (updates.pairs) updateData.pairs = updates.pairs;
    if (updates.chains) updateData.chains = updates.chains;
    if (updates.settings) updateData.settings = updates.settings;
    if (updates.performance) updateData.performance = updates.performance;

    const { data, error } = await supabase
      .from('trading_bots')
      .update(updateData)
      .eq('id', botId)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (data) {
      const transformedBot: TradingBot = {
        id: data.id,
        name: data.name,
        strategy: data.strategy as 'arbitrage' | 'dca' | 'grid',
        status: data.status as 'active' | 'paused' | 'stopped',
        pairs: data.pairs,
        chains: data.chains,
        created: new Date(data.created_at),
        performance: data.performance,
        settings: data.settings
      };
      return this.formatResponse(transformedBot, error);
    }

    return this.formatResponse(null, error);
  }

  async deleteBot(botId: string): Promise<ApiResponse<void>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const { error } = await supabase
      .from('trading_bots')
      .delete()
      .eq('id', botId)
      .eq('user_id', user.user.id);

    return this.formatResponse({}, error);
  }

  // Bot actions
  async startBot(botId: string): Promise<ApiResponse<void>> {
    return this.updateBot(botId, { status: 'active' });
  }

  async pauseBot(botId: string): Promise<ApiResponse<void>> {
    return this.updateBot(botId, { status: 'paused' });
  }

  async stopBot(botId: string): Promise<ApiResponse<void>> {
    return this.updateBot(botId, { status: 'stopped' });
  }

  // Opportunities CRUD
  async getOpportunities(): Promise<ApiResponse<ArbitrageOpportunity[]>> {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        user_favorites!left (
          user_id
        )
      `)
      .eq('executable', true)
      .order('potential_profit', { ascending: false })
      .limit(50);

    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const transformedOpportunities: ArbitrageOpportunity[] = (data || []).map(opp => ({
      id: opp.id,
      tokenPair: opp.token_pair,
      sourceChain: opp.source_chain,
      targetChain: opp.target_chain,
      sourcePlatform: opp.source_platform,
      targetPlatform: opp.target_platform,
      sourcePrice: opp.source_price,
      targetPrice: opp.target_price,
      potentialProfit: opp.potential_profit,
      profitPercentage: opp.profit_percentage,
      liquidity: opp.liquidity,
      estimatedGas: opp.estimated_gas,
      timeWindow: opp.time_window,
      risk: opp.risk as 'low' | 'medium' | 'high',
      lastUpdated: new Date(opp.updated_at),
      trending: opp.trending,
      executable: opp.executable,
      favorite: userId ? opp.user_favorites.some((fav: any) => fav.user_id === userId) : false
    }));

    return this.formatResponse(transformedOpportunities, error);
  }

  async toggleFavoriteOpportunity(opportunityId: string): Promise<ApiResponse<void>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('opportunity_id', opportunityId)
      .single();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.user.id)
        .eq('opportunity_id', opportunityId);
      return this.formatResponse({}, error);
    } else {
      // Add favorite
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.user.id,
          opportunity_id: opportunityId
        });
      return this.formatResponse({}, error);
    }
  }

  // Activities CRUD
  async getActivities(params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ActivityItem[]>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    let query = supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type);
    }
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query;

    const transformedActivities: ActivityItem[] = (data || []).map(activity => ({
      id: activity.id,
      type: activity.type as any,
      status: activity.status as any,
      timestamp: new Date(activity.created_at),
      description: activity.description,
      details: activity.details || {}
    }));

    return this.formatResponse(transformedActivities, error);
  }

  async createActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ApiResponse<ActivityItem>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: user.user.id,
        type: activity.type,
        status: activity.status,
        description: activity.description,
        details: activity.details
      })
      .select()
      .single();

    if (data) {
      const transformedActivity: ActivityItem = {
        id: data.id,
        type: data.type,
        status: data.status,
        timestamp: new Date(data.created_at),
        description: data.description,
        details: data.details
      };
      return this.formatResponse(transformedActivity, error);
    }

    return this.formatResponse(null, error);
  }

  // User Settings
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (data) {
      const settings: UserSettings = {
        profile: data.profile || {},
        trading: data.trading || {},
        notifications: data.notifications || {},
        security: data.security || {},
        appearance: data.appearance || {}
      };
      return this.formatResponse(settings, error);
    }

    // Return default settings if none exist
    const defaultSettings: UserSettings = {
      profile: {
        displayName: user.user.email?.split('@')[0] || 'User',
        email: user.user.email || '',
        timezone: 'UTC',
        language: 'en'
      },
      trading: {
        defaultSlippage: 1.0,
        maxGasPrice: 50,
        autoExecuteLimit: 1000,
        riskTolerance: 'medium',
        enableMEV: false,
        preferredChains: ['Ethereum', 'Polygon', 'Arbitrum']
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        opportunities: true,
        botActions: true,
        priceAlerts: false,
        failedTrades: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 24,
        apiKeysEnabled: false,
        whitelistedIPs: []
      },
      appearance: {
        theme: 'dark',
        currency: 'USD',
        hideBalances: false,
        compactMode: false
      }
    };

    return this.formatResponse(defaultSettings);
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return this.formatResponse(null, { message: 'User not authenticated' });
    }

    const updateData: Updates<'user_settings'> = {
      updated_at: new Date().toISOString()
    };

    if (settings.profile) updateData.profile = settings.profile;
    if (settings.trading) updateData.trading = settings.trading;
    if (settings.notifications) updateData.notifications = settings.notifications;
    if (settings.security) updateData.security = settings.security;
    if (settings.appearance) updateData.appearance = settings.appearance;

    // Use upsert to handle first-time settings creation
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.user.id,
        ...updateData
      })
      .select()
      .single();

    if (data) {
      const updatedSettings: UserSettings = {
        profile: data.profile || {},
        trading: data.trading || {},
        notifications: data.notifications || {},
        security: data.security || {},
        appearance: data.appearance || {}
      };
      return this.formatResponse(updatedSettings, error);
    }

    return this.formatResponse(null, error);
  }

  // Real-time subscriptions
  subscribeToOpportunities(callback: (opportunities: ArbitrageOpportunity[]) => void) {
    return supabase
      .channel('opportunities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'opportunities' }, 
        () => {
          // Refetch opportunities when any change occurs
          this.getOpportunities().then(response => {
            if (response.success && response.data) {
              callback(response.data);
            }
          });
        }
      )
      .subscribe();
  }

  subscribeToBots(callback: (bots: TradingBot[]) => void) {
    return supabase
      .channel('trading_bots')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trading_bots' }, 
        () => {
          this.getBots().then(response => {
            if (response.success && response.data) {
              callback(response.data);
            }
          });
        }
      )
      .subscribe();
  }

  subscribeToActivities(callback: (activities: ActivityItem[]) => void) {
    return supabase
      .channel('activities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'activities' }, 
        () => {
          this.getActivities().then(response => {
            if (response.success && response.data) {
              callback(response.data);
            }
          });
        }
      )
      .subscribe();
  }
}

// Create singleton instance
export const supabaseService = new SupabaseService();