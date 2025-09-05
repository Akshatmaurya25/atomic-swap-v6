// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Trading Bot Types
export interface TradingBot {
  id: string;
  name: string;
  strategy: 'arbitrage' | 'dca' | 'grid';
  status: 'active' | 'paused' | 'stopped';
  pairs: string[];
  chains: string[];
  created: Date;
  performance: BotPerformance;
  settings: BotSettings;
}

export interface BotPerformance {
  totalProfit: number;
  profitPercentage: number;
  trades: number;
  successRate: number;
  balance: number;
}

export interface BotSettings {
  minProfitPercentage: number;
  maxInvestment: number;
  stopLoss: number;
  slippage?: number;
  gasLimit?: 'auto' | 'manual';
  customGasLimit?: number;
}

// Arbitrage Opportunity Types
export interface ArbitrageOpportunity {
  id: string;
  tokenPair: string;
  sourceChain: string;
  targetChain: string;
  sourcePlatform: string;
  targetPlatform: string;
  sourcePrice: number;
  targetPrice: number;
  potentialProfit: number;
  profitPercentage: number;
  liquidity: number;
  estimatedGas: number;
  timeWindow: number;
  risk: 'low' | 'medium' | 'high';
  lastUpdated?: Date;
  trending?: boolean;
  executable?: boolean;
  favorite?: boolean;
}

// Portfolio Types
export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  chain: string;
  color?: string;
}

export interface WalletData {
  address: string;
  name: string;
  chain: string;
  totalValue: number;
  assets: WalletAsset[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// Activity Types
export type ActivityType = 'trade' | 'arbitrage' | 'bot_action' | 'transfer' | 'approval' | 'deposit' | 'withdrawal';
export type ActivityStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  timestamp: Date;
  description: string;
  details: ActivityDetails;
}

export interface ActivityDetails {
  fromToken?: string;
  toToken?: string;
  fromAmount?: number;
  toAmount?: number;
  fromChain?: string;
  toChain?: string;
  platform?: string;
  botId?: string;
  botName?: string;
  txHash?: string;
  gasUsed?: number;
  gasFee?: number;
  profit?: number;
  profitPercentage?: number;
  walletAddress?: string;
}

// Settings Types
export interface UserSettings {
  profile: ProfileSettings;
  trading: TradingSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export interface ProfileSettings {
  displayName: string;
  email: string;
  timezone: string;
  language: string;
}

export interface TradingSettings {
  defaultSlippage: number;
  maxGasPrice: number;
  autoExecuteLimit: number;
  riskTolerance: 'low' | 'medium' | 'high';
  enableMEV: boolean;
  preferredChains: string[];
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  opportunities: boolean;
  botActions: boolean;
  priceAlerts: boolean;
  failedTrades: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  apiKeysEnabled: boolean;
  whitelistedIPs: string[];
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'auto';
  currency: 'USD' | 'EUR' | 'GBP';
  hideBalances: boolean;
  compactMode: boolean;
}

// Analytics Types
export interface ProfitData {
  date: string;
  profit: number;
  trades: number;
}

export interface ChainPerformance {
  name: string;
  profit: number;
  trades: number;
  percentage: number;
}

export interface StrategyBreakdown {
  name: string;
  value: number;
  profit: number;
  color: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'opportunity_update' | 'price_update' | 'bot_status' | 'trade_executed';
  data: unknown;
  timestamp: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}