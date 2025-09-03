'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAccount, useBalance } from 'wagmi';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { cn, formatCurrency, formatPercentage, truncateAddress } from '@/lib/utils';

interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  chain: string;
  color: string;
}

interface WalletData {
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

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  pnLPercentage: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  bestPerformer: string;
  worstPerformer: string;
}

// Mock portfolio data
const mockWallets: WalletData[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'Main Trading Wallet',
    chain: 'Ethereum',
    totalValue: 47500.50,
    assets: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 12.5,
        value: 33125.00,
        price: 2650.00,
        change24h: 5.2,
        chain: 'Ethereum',
        color: '#627EEA'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 8950.25,
        value: 8950.25,
        price: 1.00,
        change24h: 0.1,
        chain: 'Ethereum',
        color: '#2775CA'
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        balance: 5425.25,
        value: 5425.25,
        price: 1.00,
        change24h: -0.05,
        chain: 'Ethereum',
        color: '#26A17B'
      }
    ],
    performance: {
      daily: 2.1,
      weekly: 8.5,
      monthly: 15.2
    }
  },
  {
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    name: 'Arbitrage Bot Wallet',
    chain: 'Polygon',
    totalValue: 23450.75,
    assets: [
      {
        symbol: 'MATIC',
        name: 'Polygon',
        balance: 15000.00,
        value: 13425.00,
        price: 0.895,
        change24h: -2.3,
        chain: 'Polygon',
        color: '#8247E5'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 10025.75,
        value: 10025.75,
        price: 1.00,
        change24h: 0.1,
        chain: 'Polygon',
        color: '#2775CA'
      }
    ],
    performance: {
      daily: -0.5,
      weekly: 3.2,
      monthly: 12.8
    }
  },
  {
    address: '0x9876543210987654321098765432109876543210',
    name: 'DeFi Yield Wallet',
    chain: 'Arbitrum',
    totalValue: 18750.00,
    assets: [
      {
        symbol: 'ARB',
        name: 'Arbitrum',
        balance: 8500.00,
        value: 10625.00,
        price: 1.25,
        change24h: 4.1,
        chain: 'Arbitrum',
        color: '#2D374B'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 3.05,
        value: 8082.50,
        price: 2650.00,
        change24h: 5.2,
        chain: 'Arbitrum',
        color: '#627EEA'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 42.50,
        value: 42.50,
        price: 1.00,
        change24h: 0.1,
        chain: 'Arbitrum',
        color: '#2775CA'
      }
    ],
    performance: {
      daily: 1.8,
      weekly: 6.7,
      monthly: 9.3
    }
  }
];

const performanceHistory = [
  { date: '2024-01-01', value: 75000, pnl: 0 },
  { date: '2024-01-02', value: 78500, pnl: 3500 },
  { date: '2024-01-03', value: 76200, pnl: 1200 },
  { date: '2024-01-04', value: 82100, pnl: 7100 },
  { date: '2024-01-05', value: 85750, pnl: 10750 },
  { date: '2024-01-06', value: 88900, pnl: 13900 },
  { date: '2024-01-07', value: 89701.25, pnl: 14701.25 },
];

export default function PortfolioPage() {
  const { address } = useAccount();
  const [wallets] = useState<WalletData[]>(mockWallets);
  const [hideBalances, setHideBalances] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const calculateMetrics = (): PortfolioMetrics => {
    const totalValue = wallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);
    const dailyChanges = wallets.map(w => (w.totalValue * w.performance.daily) / 100);
    const dailyChange = dailyChanges.reduce((sum, change) => sum + change, 0);
    
    const allAssets = wallets.flatMap(w => w.assets);
    const bestPerformer = allAssets.reduce((best, asset) => 
      asset.change24h > best.change24h ? asset : best
    );
    const worstPerformer = allAssets.reduce((worst, asset) => 
      asset.change24h < worst.change24h ? asset : worst
    );

    return {
      totalValue,
      totalPnL: 14701.25, // From performance history
      pnLPercentage: (14701.25 / (totalValue - 14701.25)) * 100,
      dailyChange,
      weeklyChange: totalValue * 0.061, // Mock 6.1% weekly
      monthlyChange: totalValue * 0.125, // Mock 12.5% monthly
      bestPerformer: bestPerformer.symbol,
      worstPerformer: worstPerformer.symbol
    };
  };

  const metrics = calculateMetrics();
  
  // Prepare data for charts
  const assetAllocation = wallets.flatMap(wallet => 
    wallet.assets.map(asset => ({
      name: `${asset.symbol} (${wallet.chain})`,
      value: asset.value,
      color: asset.color,
      percentage: (asset.value / metrics.totalValue) * 100
    }))
  ).sort((a, b) => b.value - a.value);

  const chainDistribution = wallets.map(wallet => ({
    name: wallet.chain,
    value: wallet.totalValue,
    percentage: (wallet.totalValue / metrics.totalValue) * 100
  }));

  const displayValue = (value: number) => hideBalances ? '••••••' : formatCurrency(value);

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Portfolio</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Overview of your assets across all connected wallets
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideBalances(!hideBalances)}
            >
              {hideBalances ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {hideBalances ? 'Show' : 'Hide'} Balances
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Wallet
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">
                    {displayValue(metrics.totalValue)}
                  </p>
                  <p className={cn(
                    "text-xs flex items-center mt-1",
                    metrics.dailyChange >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {metrics.dailyChange >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {hideBalances ? '••••' : `${formatCurrency(Math.abs(metrics.dailyChange))} (${formatPercentage(Math.abs(metrics.dailyChange / metrics.totalValue * 100))})`}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total P&L</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    metrics.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {hideBalances ? '••••••' : formatCurrency(metrics.totalPnL)}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    metrics.pnLPercentage >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {hideBalances ? '••••' : formatPercentage(metrics.pnLPercentage)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Best Performer</p>
                  <p className="text-2xl font-bold text-green-400">{metrics.bestPerformer}</p>
                  <p className="text-xs text-green-400 mt-1">24h winner</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Connected Wallets</p>
                  <p className="text-2xl font-bold text-white">{wallets.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Active wallets</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Portfolio Performance */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Portfolio Performance</span>
              </CardTitle>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value, name) => [
                        formatCurrency(value as number),
                        name === 'value' ? 'Portfolio Value' : 'P&L'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#FFEB3B" 
                      strokeWidth={3}
                      name="Portfolio Value"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#4CAF50" 
                      strokeWidth={2}
                      name="P&L"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Asset Allocation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation.slice(0, 6)} // Show top 6 assets
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetAllocation.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value) => [formatCurrency(value as number), 'Value']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chain Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Chain Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chainDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }}
                      formatter={(value) => [formatCurrency(value as number), 'Value']}
                    />
                    <Bar dataKey="value" fill="#FFEB3B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallets Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallets.map((wallet, index) => (
                <div 
                  key={wallet.address}
                  className="p-4 border border-gray-700 rounded-lg hover:border-yellow-400/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedWallet(selectedWallet === wallet.address ? null : wallet.address)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{wallet.name}</h3>
                        <p className="text-sm text-gray-400">
                          {truncateAddress(wallet.address)} • {wallet.chain}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {displayValue(wallet.totalValue)}
                      </p>
                      <p className={cn(
                        "text-sm flex items-center justify-end",
                        wallet.performance.daily >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {wallet.performance.daily >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {formatPercentage(Math.abs(wallet.performance.daily))}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Wallet Details */}
                  {selectedWallet === wallet.address && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wallet.assets.map((asset, assetIndex) => (
                          <div key={assetIndex} className="bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-6 h-6 rounded-full"
                                  style={{ backgroundColor: asset.color }}
                                />
                                <span className="font-medium text-white">{asset.symbol}</span>
                              </div>
                              <Badge 
                                variant={asset.change24h >= 0 ? "success" : "error"} 
                                size="sm"
                              >
                                {formatPercentage(asset.change24h)}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Balance:</span>
                                <span className="text-white">
                                  {hideBalances ? '••••••' : `${asset.balance.toLocaleString()} ${asset.symbol}`}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Value:</span>
                                <span className="text-white">
                                  {displayValue(asset.value)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Price:</span>
                                <span className="text-white">
                                  {hideBalances ? '••••' : formatCurrency(asset.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Wallet Actions */}
                      <div className="flex items-center space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400">
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}