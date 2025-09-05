'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Activity,
  Search,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ArrowLeftRight,
  Wallet,
  Bot,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { cn, formatCurrency, formatPercentage, timeAgo, truncateAddress } from '@/lib/utils';

type ActivityType = 'trade' | 'arbitrage' | 'bot_action' | 'transfer' | 'approval' | 'deposit' | 'withdrawal';
type ActivityStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

interface ActivityItem {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  timestamp: Date;
  description: string;
  details: {
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
  };
}

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'arbitrage',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    description: 'ETH/USDC arbitrage executed successfully',
    details: {
      fromToken: 'ETH',
      toToken: 'USDC',
      fromAmount: 5.0,
      toAmount: 13250.00,
      fromChain: 'Ethereum',
      toChain: 'Polygon',
      platform: 'Uniswap V3 → QuickSwap',
      txHash: '0x1234567890abcdef1234567890abcdef12345678',
      gasUsed: 180000,
      gasFee: 45.30,
      profit: 127.50,
      profitPercentage: 0.96
    }
  },
  {
    id: '2',
    type: 'bot_action',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    description: 'ETH/USDC Arbitrage Master bot started',
    details: {
      botId: '1',
      botName: 'ETH/USDC Arbitrage Master',
      walletAddress: '0x1234567890123456789012345678901234567890'
    }
  },
  {
    id: '3',
    type: 'transfer',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    description: 'USDC transferred to arbitrage wallet',
    details: {
      fromToken: 'USDC',
      fromAmount: 5000.00,
      fromChain: 'Ethereum',
      toChain: 'Polygon',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      gasFee: 12.50,
      walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    }
  },
  {
    id: '4',
    type: 'arbitrage',
    status: 'failed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    description: 'USDT/USDC arbitrage failed due to insufficient liquidity',
    details: {
      fromToken: 'USDT',
      toToken: 'USDC',
      fromAmount: 2000.00,
      fromChain: 'BSC',
      toChain: 'Arbitrum',
      platform: 'PancakeSwap → SushiSwap',
      txHash: '0xfailed123456789abcdef1234567890abcdef123',
      gasFee: 8.75
    }
  },
  {
    id: '5',
    type: 'trade',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    description: 'Swapped BTC for USDT on Ethereum',
    details: {
      fromToken: 'BTC',
      toToken: 'USDT',
      fromAmount: 0.25,
      toAmount: 16812.50,
      fromChain: 'Ethereum',
      platform: 'Uniswap V3',
      txHash: '0x567890abcdef1234567890abcdef1234567890ab',
      gasUsed: 150000,
      gasFee: 38.20
    }
  },
  {
    id: '6',
    type: 'bot_action',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    description: 'DCA Bitcoin Strategy bot paused',
    details: {
      botId: '3',
      botName: 'DCA Bitcoin Strategy',
      walletAddress: '0x9876543210987654321098765432109876543210'
    }
  },
  {
    id: '7',
    type: 'deposit',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    description: 'Deposited funds to trading wallet',
    details: {
      fromToken: 'ETH',
      fromAmount: 10.0,
      fromChain: 'Ethereum',
      txHash: '0x890abcdef1234567890abcdef1234567890abcdef',
      gasFee: 25.60,
      walletAddress: '0x1234567890123456789012345678901234567890'
    }
  },
  {
    id: '8',
    type: 'arbitrage',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 hours ago
    description: 'MATIC/USDC arbitrage in progress',
    details: {
      fromToken: 'MATIC',
      toToken: 'USDC',
      fromAmount: 5000.00,
      fromChain: 'Polygon',
      toChain: 'Ethereum',
      platform: 'QuickSwap → Uniswap V3'
    }
  }
];

export default function ActivityPage() {
  const [activities] = useState<ActivityItem[]>(mockActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | 'all'>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.fromToken?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toToken?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.botName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'all' || activity.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;

      let matchesTime = true;
      if (selectedTimeRange !== 'all') {
        const now = new Date();
        const timeLimit = {
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000
        }[selectedTimeRange];
        
        matchesTime = now.getTime() - activity.timestamp.getTime() <= timeLimit;
      }

      return matchesSearch && matchesType && matchesStatus && matchesTime;
    });
  }, [activities, searchTerm, selectedType, selectedStatus, selectedTimeRange]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'arbitrage': return TrendingUp;
      case 'trade': return ArrowLeftRight;
      case 'transfer': return Wallet;
      case 'bot_action': return Bot;
      case 'deposit': return Play;
      case 'withdrawal': return Pause;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'pending': return Clock;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'arbitrage': return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'trade': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'transfer': return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      case 'bot_action': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'deposit': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'withdrawal': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  const formatActivityType = (type: ActivityType) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Stats calculations
  const completedActivities = filteredActivities.filter(a => a.status === 'completed');
  const totalProfit = completedActivities.reduce((sum, activity) => 
    sum + (activity.details.profit || 0), 0
  );
  const arbitrageCount = completedActivities.filter(a => a.type === 'arbitrage').length;
  const successRate = filteredActivities.length > 0 
    ? (completedActivities.length / filteredActivities.length) * 100 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Activity</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Complete history of your trading activities and transactions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Activities</p>
                  <p className="text-2xl font-bold text-white">{filteredActivities.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">{successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(totalProfit)}
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
                  <p className="text-sm text-gray-400">Arbitrage Trades</p>
                  <p className="text-2xl font-bold text-yellow-400">{arbitrageCount}</p>
                </div>
                <ArrowLeftRight className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ActivityType | 'all')}
                  className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="arbitrage">Arbitrage</option>
                  <option value="trade">Trade</option>
                  <option value="transfer">Transfer</option>
                  <option value="bot_action">Bot Action</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ActivityStatus | 'all')}
                  className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as '24h' | '7d' | '30d' | 'all')}
                  className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const StatusIcon = getStatusIcon(activity.status);

                return (
                  <div key={activity.id} className="p-4 border border-gray-700 rounded-lg hover:border-yellow-400/30 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Activity Icon */}
                      <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <ActivityIcon className="w-5 h-5 text-yellow-400" />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-white">{activity.description}</h3>
                            <Badge size="sm" className={getTypeColor(activity.type)}>
                              {formatActivityType(activity.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={cn('w-4 h-4', getStatusColor(activity.status))} />
                            <Badge 
                              variant={
                                activity.status === 'completed' ? 'success' :
                                activity.status === 'failed' ? 'error' :
                                activity.status === 'pending' ? 'warning' : 'default'
                              }
                              size="sm"
                            >
                              {activity.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {/* Activity Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          {activity.details.fromToken && activity.details.toToken && (
                            <div>
                              <p className="text-gray-400">Trade</p>
                              <p className="text-white">
                                {activity.details.fromAmount?.toLocaleString()} {activity.details.fromToken} → {activity.details.toAmount?.toLocaleString()} {activity.details.toToken}
                              </p>
                            </div>
                          )}

                          {activity.details.fromChain && (
                            <div>
                              <p className="text-gray-400">Chain{activity.details.toChain ? 's' : ''}</p>
                              <p className="text-white">
                                {activity.details.fromChain}
                                {activity.details.toChain && ` → ${activity.details.toChain}`}
                              </p>
                            </div>
                          )}

                          {activity.details.platform && (
                            <div>
                              <p className="text-gray-400">Platform</p>
                              <p className="text-white">{activity.details.platform}</p>
                            </div>
                          )}

                          {activity.details.profit && (
                            <div>
                              <p className="text-gray-400">Profit</p>
                              <p className="text-green-400 font-medium">
                                {formatCurrency(activity.details.profit)}
                                {activity.details.profitPercentage && (
                                  <span className="ml-1">({formatPercentage(activity.details.profitPercentage)})</span>
                                )}
                              </p>
                            </div>
                          )}

                          {activity.details.gasFee && (
                            <div>
                              <p className="text-gray-400">Gas Fee</p>
                              <p className="text-white">{formatCurrency(activity.details.gasFee)}</p>
                            </div>
                          )}

                          {activity.details.botName && (
                            <div>
                              <p className="text-gray-400">Bot</p>
                              <p className="text-white">{activity.details.botName}</p>
                            </div>
                          )}

                          {activity.details.walletAddress && (
                            <div>
                              <p className="text-gray-400">Wallet</p>
                              <p className="text-white font-mono text-xs">
                                {truncateAddress(activity.details.walletAddress)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(activity.timestamp)}</span>
                          </div>
                          
                          {activity.details.txHash && (
                            <Button variant="ghost" size="sm" className="text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Tx
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredActivities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No activities found</h3>
                  <p className="text-gray-400">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}