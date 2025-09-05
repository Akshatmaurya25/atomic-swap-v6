import { 
  ApiResponse, 
  TradingBot, 
  ArbitrageOpportunity, 
  WalletData, 
  ActivityItem, 
  UserSettings,
  ProfitData,
  ChainPerformance,
  StrategyBreakdown
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Trading Bots API
  async getBots(): Promise<ApiResponse<TradingBot[]>> {
    return this.request<TradingBot[]>('/bots');
  }

  async createBot(botData: Partial<TradingBot>): Promise<ApiResponse<TradingBot>> {
    return this.request<TradingBot>('/bots', {
      method: 'POST',
      body: JSON.stringify(botData),
    });
  }

  async updateBot(botId: string, updates: Partial<TradingBot>): Promise<ApiResponse<TradingBot>> {
    return this.request<TradingBot>(`/bots/${botId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBot(botId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${botId}`, {
      method: 'DELETE',
    });
  }

  async startBot(botId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${botId}/start`, {
      method: 'POST',
    });
  }

  async pauseBot(botId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${botId}/pause`, {
      method: 'POST',
    });
  }

  async stopBot(botId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${botId}/stop`, {
      method: 'POST',
    });
  }

  // Opportunities API
  async getOpportunities(): Promise<ApiResponse<ArbitrageOpportunity[]>> {
    return this.request<ArbitrageOpportunity[]>('/opportunities');
  }

  async getOpportunityDetails(opportunityId: string): Promise<ApiResponse<ArbitrageOpportunity>> {
    return this.request<ArbitrageOpportunity>(`/opportunities/${opportunityId}`);
  }

  async executeOpportunity(opportunityId: string): Promise<ApiResponse<{ txHash: string }>> {
    return this.request<{ txHash: string }>(`/opportunities/${opportunityId}/execute`, {
      method: 'POST',
    });
  }

  async toggleFavoriteOpportunity(opportunityId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/opportunities/${opportunityId}/favorite`, {
      method: 'POST',
    });
  }

  // Portfolio API
  async getPortfolio(): Promise<ApiResponse<WalletData[]>> {
    return this.request<WalletData[]>('/portfolio');
  }

  async addWallet(walletData: Partial<WalletData>): Promise<ApiResponse<WalletData>> {
    return this.request<WalletData>('/portfolio/wallets', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  async removeWallet(walletAddress: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/portfolio/wallets/${walletAddress}`, {
      method: 'DELETE',
    });
  }

  async refreshWallet(walletAddress: string): Promise<ApiResponse<WalletData>> {
    return this.request<WalletData>(`/portfolio/wallets/${walletAddress}/refresh`, {
      method: 'POST',
    });
  }

  // Activity API
  async getActivities(params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
    timeRange?: string;
  }): Promise<ApiResponse<ActivityItem[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<ActivityItem[]>(`/activities${query}`);
  }

  async getActivityDetails(activityId: string): Promise<ApiResponse<ActivityItem>> {
    return this.request<ActivityItem>(`/activities/${activityId}`);
  }

  async exportActivities(format: 'csv' | 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>(`/activities/export?format=${format}`);
  }

  // Analytics API
  async getProfitData(timeRange: string = '7d'): Promise<ApiResponse<ProfitData[]>> {
    return this.request<ProfitData[]>(`/analytics/profit?timeRange=${timeRange}`);
  }

  async getChainPerformance(): Promise<ApiResponse<ChainPerformance[]>> {
    return this.request<ChainPerformance[]>('/analytics/chains');
  }

  async getStrategyBreakdown(): Promise<ApiResponse<StrategyBreakdown[]>> {
    return this.request<StrategyBreakdown[]>('/analytics/strategies');
  }

  async getPortfolioMetrics(): Promise<ApiResponse<{
    totalValue: number;
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    allocation: Array<{ name: string; value: number; percentage: number }>;
    topPerformers: Array<{ symbol: string; change: number; value: number }>;
  }>> {
    return this.request<{
      totalValue: number;
      dailyChange: number;
      weeklyChange: number;
      monthlyChange: number;
      allocation: Array<{ name: string; value: number; percentage: number }>;
      topPerformers: Array<{ symbol: string; change: number; value: number }>;
    }>('/analytics/portfolio');
  }

  // Settings API
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>('/settings');
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async resetSettings(): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>('/settings/reset', {
      method: 'POST',
    });
  }

  // Auth API (if needed)
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Utility methods
  setAuthToken(token: string) {
    // Store token in localStorage or secure storage
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeAuthToken() {
    localStorage.removeItem('auth_token');
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual service functions for easier importing
export const {
  getBots,
  createBot,
  updateBot,
  deleteBot,
  startBot,
  pauseBot,
  stopBot,
  getOpportunities,
  getOpportunityDetails,
  executeOpportunity,
  toggleFavoriteOpportunity,
  getPortfolio,
  addWallet,
  removeWallet,
  refreshWallet,
  getActivities,
  getActivityDetails,
  exportActivities,
  getProfitData,
  getChainPerformance,
  getStrategyBreakdown,
  getPortfolioMetrics,
  getSettings,
  updateSettings,
  resetSettings,
  login,
  logout,
  refreshToken,
} = apiService;