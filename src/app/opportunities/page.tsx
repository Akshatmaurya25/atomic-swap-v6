'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { ArbitrageOpportunity } from '@/components/dashboard/ArbitrageOpportunity';
import { 
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Clock,
  DollarSign,
  Zap,
  Star,
  StarOff,
  Play,
  Pause
} from 'lucide-react';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

interface OpportunityFilter {
  minProfit: number;
  maxProfit: number;
  minProfitPercentage: number;
  chains: string[];
  pairs: string[];
  riskLevels: string[];
  minLiquidity: number;
  maxTimeWindow: number;
}

interface ExtendedOpportunity {
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
  lastUpdated: Date;
  trending: boolean;
  executable: boolean;
  favorite: boolean;
}

// Extended mock opportunities data
const generateMockOpportunities = (): ExtendedOpportunity[] => [
  {
    id: '1',
    tokenPair: 'ETH/USDC',
    sourceChain: 'Ethereum',
    targetChain: 'Polygon',
    sourcePlatform: 'Uniswap V3',
    targetPlatform: 'QuickSwap',
    sourcePrice: 2650.50,
    targetPrice: 2663.25,
    potentialProfit: 127.50,
    profitPercentage: 0.48,
    liquidity: 150000,
    estimatedGas: 45.30,
    timeWindow: 180,
    risk: 'low',
    lastUpdated: new Date(Date.now() - 1000 * 30),
    trending: true,
    executable: true,
    favorite: false
  },
  {
    id: '2',
    tokenPair: 'USDT/USDC',
    sourceChain: 'BSC',
    targetChain: 'Arbitrum',
    sourcePlatform: 'PancakeSwap',
    targetPlatform: 'SushiSwap',
    sourcePrice: 1.0025,
    targetPrice: 1.0041,
    potentialProfit: 32.00,
    profitPercentage: 0.16,
    liquidity: 89000,
    estimatedGas: 12.75,
    timeWindow: 120,
    risk: 'medium',
    lastUpdated: new Date(Date.now() - 1000 * 45),
    trending: false,
    executable: true,
    favorite: true
  },
  {
    id: '3',
    tokenPair: 'BTC/USDT',
    sourceChain: 'Ethereum',
    targetChain: 'Base',
    sourcePlatform: 'Uniswap V2',
    targetPlatform: 'BaseSwap',
    sourcePrice: 67250.00,
    targetPrice: 67489.50,
    potentialProfit: 239.50,
    profitPercentage: 0.36,
    liquidity: 245000,
    estimatedGas: 52.80,
    timeWindow: 300,
    risk: 'low',
    lastUpdated: new Date(Date.now() - 1000 * 15),
    trending: true,
    executable: true,
    favorite: false
  },
  {
    id: '4',
    tokenPair: 'MATIC/USDC',
    sourceChain: 'Polygon',
    targetChain: 'Ethereum',
    sourcePlatform: 'QuickSwap',
    targetPlatform: 'Uniswap V3',
    sourcePrice: 0.8945,
    targetPrice: 0.9012,
    potentialProfit: 67.00,
    profitPercentage: 0.75,
    liquidity: 45000,
    estimatedGas: 38.20,
    timeWindow: 90,
    risk: 'high',
    lastUpdated: new Date(Date.now() - 1000 * 60),
    trending: false,
    executable: false,
    favorite: false
  },
  {
    id: '5',
    tokenPair: 'ARB/USDC',
    sourceChain: 'Arbitrum',
    targetChain: 'Optimism',
    sourcePlatform: 'Camelot',
    targetPlatform: 'Velodrome',
    sourcePrice: 1.2456,
    targetPrice: 1.2523,
    potentialProfit: 45.30,
    profitPercentage: 0.54,
    liquidity: 78000,
    estimatedGas: 18.90,
    timeWindow: 150,
    risk: 'medium',
    lastUpdated: new Date(Date.now() - 1000 * 90),
    trending: false,
    executable: true,
    favorite: true
  }
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ExtendedOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<ExtendedOpportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showDevelopmentToast } = useToast();

  // Show development toast when page loads
  useEffect(() => {
    showDevelopmentToast(
      '🔍 Arbitrage Opportunities - In Development',
      'Live Yellow Network arbitrage scanning is coming soon! This preview shows cross-chain opportunities with real market data simulation.'
    );
  }, [showDevelopmentToast]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'profit' | 'percentage' | 'time' | 'liquidity'>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [filters, setFilters] = useState<OpportunityFilter>({
    minProfit: 0,
    maxProfit: 10000,
    minProfitPercentage: 0,
    chains: [],
    pairs: [],
    riskLevels: [],
    minLiquidity: 0,
    maxTimeWindow: 600
  });

  const refreshOpportunities = useCallback(() => {
    setIsScanning(true);
    // Simulate API call
    setTimeout(() => {
      const updated = opportunities.map(opp => ({
        ...opp,
        lastUpdated: new Date(),
        // Simulate small price changes
        sourcePrice: opp.sourcePrice * (1 + (Math.random() - 0.5) * 0.001),
        targetPrice: opp.targetPrice * (1 + (Math.random() - 0.5) * 0.001),
      }));
      setOpportunities(updated);
      setIsScanning(false);
    }, 1500);
  }, [opportunities]);

  useEffect(() => {
    // Initialize with mock data
    const mockData = generateMockOpportunities();
    setOpportunities(mockData);
    setFilteredOpportunities(mockData);
  }, []);

  useEffect(() => {
    // Auto refresh opportunities
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshOpportunities();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshOpportunities]);

  useEffect(() => {
    // Apply filters and search
    const filtered = opportunities.filter(opp => {
      const matchesSearch = opp.tokenPair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.sourceChain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.targetChain.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        opp.potentialProfit >= filters.minProfit &&
        opp.potentialProfit <= filters.maxProfit &&
        opp.profitPercentage >= filters.minProfitPercentage &&
        opp.liquidity >= filters.minLiquidity &&
        opp.timeWindow <= filters.maxTimeWindow &&
        (filters.chains.length === 0 || filters.chains.includes(opp.sourceChain) || filters.chains.includes(opp.targetChain)) &&
        (filters.pairs.length === 0 || filters.pairs.includes(opp.tokenPair)) &&
        (filters.riskLevels.length === 0 || filters.riskLevels.includes(opp.risk));

      return matchesSearch && matchesFilters;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'profit':
          aVal = a.potentialProfit;
          bVal = b.potentialProfit;
          break;
        case 'percentage':
          aVal = a.profitPercentage;
          bVal = b.profitPercentage;
          break;
        case 'time':
          aVal = a.timeWindow;
          bVal = b.timeWindow;
          break;
        case 'liquidity':
          aVal = a.liquidity;
          bVal = b.liquidity;
          break;
        default:
          aVal = a.potentialProfit;
          bVal = b.potentialProfit;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, searchTerm, filters, sortBy, sortOrder]);

  const handleExecuteOpportunity = (opportunityId: string) => {
    console.log('Executing opportunity:', opportunityId);
    // This would trigger the arbitrage execution
  };

  const toggleFavorite = (opportunityId: string) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunityId ? { ...opp, favorite: !opp.favorite } : opp
    ));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const activeOpportunities = filteredOpportunities.filter(opp => opp.executable);
  const totalPotentialProfit = activeOpportunities.reduce((sum, opp) => sum + opp.potentialProfit, 0);

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Arbitrage Opportunities</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Real-time cross-chain arbitrage opportunities scanner
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  autoRefresh ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"
                )}
                title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              >
                {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshOpportunities}
                loading={isScanning}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Opportunities</p>
                  <p className="text-2xl font-bold text-green-400">
                    {activeOpportunities.length}
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
                  <p className="text-sm text-gray-400">Total Opportunities</p>
                  <p className="text-2xl font-bold text-white">{filteredOpportunities.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Potential Profit</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(totalPotentialProfit)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg. Profit %</p>
                  <p className="text-2xl font-bold text-white">
                    {activeOpportunities.length > 0 
                      ? formatPercentage(activeOpportunities.reduce((sum, opp) => sum + opp.profitPercentage, 0) / activeOpportunities.length)
                      : '0%'
                    }
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by pair, chain, or platform..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={showFilters ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as 'profit' | 'percentage' | 'time' | 'liquidity');
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
                >
                  <option value="profit-desc">Highest Profit</option>
                  <option value="profit-asc">Lowest Profit</option>
                  <option value="percentage-desc">Highest %</option>
                  <option value="percentage-asc">Lowest %</option>
                  <option value="time-asc">Fastest Execution</option>
                  <option value="liquidity-desc">Highest Liquidity</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Min Profit ($)</label>
                    <Input
                      type="number"
                      value={filters.minProfit}
                      onChange={(e) => setFilters(prev => ({ ...prev, minProfit: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Min Profit (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={filters.minProfitPercentage}
                      onChange={(e) => setFilters(prev => ({ ...prev, minProfitPercentage: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Min Liquidity ($)</label>
                    <Input
                      type="number"
                      value={filters.minLiquidity}
                      onChange={(e) => setFilters(prev => ({ ...prev, minLiquidity: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities List */}
        <div className="space-y-4">
          {isScanning && (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">Scanning for new opportunities...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
              </CardContent>
            </Card>
          )}

          {filteredOpportunities.length === 0 && !isScanning ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">No opportunities found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or refresh to scan for new opportunities
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {filteredOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="relative">
                  <Card className={cn(
                    "hover:border-yellow-400/50 transition-colors duration-200",
                    opportunity.trending && "ring-1 ring-yellow-400/30",
                    !opportunity.executable && "opacity-60"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">{opportunity.tokenPair}</CardTitle>
                          {opportunity.trending && (
                            <Badge variant="default" size="sm" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFavorite(opportunity.id)}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                          >
                            {opportunity.favorite ? (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </button>
                          <Badge variant={opportunity.risk === 'low' ? 'success' : opportunity.risk === 'medium' ? 'warning' : 'error'} size="sm">
                            {opportunity.risk.toUpperCase()} RISK
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ArbitrageOpportunity 
                        opportunity={opportunity}
                        onExecute={handleExecuteOpportunity}
                      />
                      
                      {/* Additional Info */}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {Math.floor((Date.now() - opportunity.lastUpdated.getTime()) / 1000)}s ago</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!opportunity.executable && (
                            <span className="text-red-400">Not executable</span>
                          )}
                          <span className={getRiskColor(opportunity.risk)}>
                            {opportunity.risk} risk
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}