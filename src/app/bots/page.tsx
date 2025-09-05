'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BotCreator } from '@/components/bots/BotCreator';
import { useApp } from '@/providers/AppProvider';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Plus,
  MoreVertical,
  DollarSign,
  Zap,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';


export default function BotsPage() {
  const {
    bots,
    botsLoading,
    botsError,
    createBot,
    startBot,
    pauseBot,
    stopBot,
    isAuthenticated,
    authLoading
  } = useApp();
  const [showBotCreator, setShowBotCreator] = useState(false);

  const handleBotAction = async (botId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      switch (action) {
        case 'start':
          await startBot(botId);
          break;
        case 'pause':
          await pauseBot(botId);
          break;
        case 'stop':
          await stopBot(botId);
          break;
      }
    } catch (error) {
      console.error('Failed to perform bot action:', error);
    }
  };

  const handleCreateBot = async (botConfig: {
    name: string;
    strategy: string;
    selectedPairs: string[];
    selectedChains: string[];
    settings: {
      minProfitPercentage: number;
      maxInvestment: number;
      stopLoss: number;
      slippage: number;
      gasLimit: 'auto' | 'manual';
      customGasLimit: number;
      tradingFunds: number;
    };
  }) => {
    try {
      const botData = {
        name: botConfig.name,
        strategy: botConfig.strategy as 'arbitrage' | 'dca' | 'grid',
        status: 'stopped' as const,
        pairs: botConfig.selectedPairs,
        chains: botConfig.selectedChains,
        performance: {
          totalProfit: 0,
          profitPercentage: 0,
          trades: 0,
          successRate: 0,
          balance: 1000 // Starting balance
        },
        settings: botConfig.settings
      };
      
      const result = await createBot(botData);
      if (result) {
        console.log('Bot created successfully:', result);
      } else {
        console.error('Failed to create bot');
      }
    } catch (error) {
      console.error('Error creating bot:', error);
    }
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

  // Show loading screen if not authenticated
  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-400" />
              <h3 className="text-lg font-semibold mb-2">Loading...</h3>
              <p className="text-gray-400">
                Please wait while we load your bot data
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-yellow-400" />
              </div>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400">
                Please sign in to manage your trading bots.
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-yellow-400 hover:bg-yellow-500 text-black w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const userBots = bots || [];

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
        {botsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded animate-pulse" />
                      <div className="h-8 bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : botsError ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400 opacity-50" />
              <p className="text-red-400 mb-2">Failed to load bots</p>
              <p className="text-sm text-gray-400">{botsError}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Bots</p>
                    <p className="text-2xl font-bold text-white">{userBots.length}</p>
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
                      {userBots.filter(bot => bot.status === 'active').length}
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
                      {formatCurrency(userBots.reduce((acc, bot) => acc + (bot.performance?.totalProfit || 0), 0))}
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
                      {userBots.length > 0 
                        ? (userBots.reduce((acc, bot) => acc + (bot.performance?.successRate || 0), 0) / userBots.length).toFixed(1)
                        : '0.0'
                      }%
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bots List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {botsLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-700 rounded" />
                        <div className="h-3 w-24 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-3 w-16 bg-gray-700 rounded" />
                        <div className="h-4 w-12 bg-gray-700 rounded" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : botsError ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400 opacity-50" />
                  <p className="text-red-400 mb-2">Failed to load bots</p>
                  <p className="text-sm text-gray-400">{botsError}</p>
                </CardContent>
              </Card>
            </div>
          ) : userBots.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-500 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No Bots Created Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first trading bot to start automated arbitrage trading across multiple chains.
                  </p>
                  <Button 
                    onClick={() => setShowBotCreator(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Bot
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            userBots.map((bot) => {
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
                      <Badge variant={getStatusColor(bot.status) as 'success' | 'warning' | 'error' | 'default'} size="sm">
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
                        (bot.performance?.totalProfit || 0) >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {formatCurrency(bot.performance?.totalProfit || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Success Rate</p>
                      <p className="text-white font-semibold">
                        {bot.performance?.successRate || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Trades</p>
                      <p className="text-white font-semibold">{bot.performance?.trades || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(bot.performance?.balance || 0)}
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
                          <Badge key={index} variant="default" size="sm" className="text-xs">
                            {chain}
                          </Badge>
                        ))}
                        {bot.chains.length > 2 && (
                          <Badge variant="default" size="sm" className="text-xs">
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
          })
          )}
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