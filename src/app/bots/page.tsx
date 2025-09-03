'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BotCreator } from '@/components/bots/BotCreator';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Plus,
  MoreVertical,
  DollarSign,
  Zap
} from 'lucide-react';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

interface TradingBot {
  id: string;
  name: string;
  strategy: 'arbitrage' | 'dca' | 'grid';
  status: 'active' | 'paused' | 'stopped';
  pairs: string[];
  chains: string[];
  created: Date;
  performance: {
    totalProfit: number;
    profitPercentage: number;
    trades: number;
    successRate: number;
    balance: number;
  };
  settings: {
    minProfitPercentage: number;
    maxInvestment: number;
    stopLoss: number;
  };
}

const mockBots: TradingBot[] = [
  {
    id: '1',
    name: 'ETH/USDC Arbitrage Master',
    strategy: 'arbitrage',
    status: 'active',
    pairs: ['ETH/USDC'],
    chains: ['Ethereum', 'Polygon', 'Arbitrum'],
    created: new Date('2024-01-15'),
    performance: {
      totalProfit: 2847.50,
      profitPercentage: 15.2,
      trades: 127,
      successRate: 94.5,
      balance: 18750.00
    },
    settings: {
      minProfitPercentage: 0.3,
      maxInvestment: 5000,
      stopLoss: -2.5
    }
  },
  {
    id: '2',
    name: 'Stablecoin Spread Hunter',
    strategy: 'arbitrage',
    status: 'active',
    pairs: ['USDT/USDC', 'USDC/DAI'],
    chains: ['BSC', 'Polygon'],
    created: new Date('2024-01-20'),
    performance: {
      totalProfit: 892.30,
      profitPercentage: 8.9,
      trades: 234,
      successRate: 98.1,
      balance: 10034.20
    },
    settings: {
      minProfitPercentage: 0.1,
      maxInvestment: 2000,
      stopLoss: -1.0
    }
  },
  {
    id: '3',
    name: 'DCA Bitcoin Strategy',
    strategy: 'dca',
    status: 'paused',
    pairs: ['BTC/USDC'],
    chains: ['Ethereum'],
    created: new Date('2024-01-10'),
    performance: {
      totalProfit: -234.50,
      profitPercentage: -2.3,
      trades: 45,
      successRate: 67.0,
      balance: 9765.50
    },
    settings: {
      minProfitPercentage: 0.0,
      maxInvestment: 1000,
      stopLoss: -5.0
    }
  }
];

export default function BotsPage() {
  const [bots, setBots] = useState(mockBots);
  const [showBotCreator, setShowBotCreator] = useState(false);

  const handleBotAction = (botId: string, action: 'start' | 'pause' | 'stop') => {
    setBots(prev => prev.map(bot => 
      bot.id === botId 
        ? { ...bot, status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'stopped' }
        : bot
    ));
  };

  const handleCreateBot = (botConfig: any) => {
    const newBot: TradingBot = {
      id: (bots.length + 1).toString(),
      name: botConfig.name,
      strategy: botConfig.strategy,
      status: 'stopped',
      pairs: botConfig.selectedPairs,
      chains: botConfig.selectedChains,
      created: botConfig.created,
      performance: {
        totalProfit: 0,
        profitPercentage: 0,
        trades: 0,
        successRate: 0,
        balance: 1000 // Starting balance
      },
      settings: botConfig.settings
    };
    setBots(prev => [...prev, newBot]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'stopped': return 'error';
      default: return 'default';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'arbitrage': return TrendingUp;
      case 'dca': return DollarSign;
      case 'grid': return Zap;
      default: return Bot;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Trading Bots</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Manage your automated trading strategies and monitor performance
            </p>
          </div>
          <Button className="flex-shrink-0" onClick={() => setShowBotCreator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Bot
          </Button>
        </div>

        {/* Bot Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Bots</p>
                  <p className="text-2xl font-bold text-white">{bots.length}</p>
                </div>
                <Bot className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Bots</p>
                  <p className="text-2xl font-bold text-green-400">
                    {bots.filter(bot => bot.status === 'active').length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(bots.reduce((acc, bot) => acc + bot.performance.totalProfit, 0))}
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
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {(bots.reduce((acc, bot) => acc + bot.performance.successRate, 0) / bots.length).toFixed(1)}%
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bots List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {bots.map((bot) => {
            const StrategyIcon = getStrategyIcon(bot.strategy);
            return (
              <Card key={bot.id} className="hover:border-yellow-400/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                        <StrategyIcon className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{bot.name}</CardTitle>
                        <p className="text-sm text-gray-400 capitalize">{bot.strategy} Strategy</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(bot.status) as any} size="sm">
                        {bot.status.toUpperCase()}
                      </Badge>
                      <button className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Performance */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Total Profit</p>
                      <p className={cn(
                        "font-semibold",
                        bot.performance.totalProfit >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {formatCurrency(bot.performance.totalProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Success Rate</p>
                      <p className="text-white font-semibold">
                        {bot.performance.successRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Trades</p>
                      <p className="text-white font-semibold">{bot.performance.trades}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(bot.performance.balance)}
                      </p>
                    </div>
                  </div>

                  {/* Pairs and Chains */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Trading Pairs</p>
                      <div className="flex flex-wrap gap-1">
                        {bot.pairs.map((pair, index) => (
                          <Badge key={index} variant="default" size="sm" className="text-xs">
                            {pair}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Chains</p>
                      <div className="flex flex-wrap gap-1">
                        {bot.chains.slice(0, 2).map((chain, index) => (
                          <Badge key={index} variant="outline" size="sm" className="text-xs">
                            {chain}
                          </Badge>
                        ))}
                        {bot.chains.length > 2 && (
                          <Badge variant="outline" size="sm" className="text-xs">
                            +{bot.chains.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      {bot.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBotAction(bot.id, 'pause')}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBotAction(bot.id, 'start')}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bot Creator Modal */}
        {showBotCreator && (
          <BotCreator
            onClose={() => setShowBotCreator(false)}
            onSubmit={handleCreateBot}
          />
        )}
      </div>
    </AppLayout>
  );
}