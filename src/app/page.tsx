'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ArbitrageOpportunity } from '@/components/dashboard/ArbitrageOpportunity';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAccount, useBalance } from 'wagmi';
import { useAuth, useBots, useOpportunities, useActivities, useOpportunityOperations } from '@/hooks/useSupabase';
import { usePriceFeed } from '@/hooks/usePriceFeed';
import { AuthModal } from '@/components/auth/AuthModal';
import { DatabaseSetup } from '@/components/setup/DatabaseSetup';
import { testConnection, initializeSampleData, createSampleDataForUser } from '@/utils/initData';
import { 
  DollarSign, 
  TrendingUp, 
  Bot, 
  Zap,
  RefreshCw,
  Plus,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { user, isAuthenticated } = useAuth();
  
  // Supabase data hooks
  const { data: bots, loading: botsLoading, error: botsError, refetch: refetchBots } = useBots();
  const { data: opportunities, loading: opportunitiesLoading, error: opportunitiesError, refetch: refetchOpportunities } = useOpportunities();
  const { data: activities, loading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useActivities({ limit: 5 });
  const { toggleFavorite, loading: favoriteLoading } = useOpportunityOperations();
  const { isRunning: priceFeedRunning, lastUpdate, triggerUpdate } = usePriceFeed();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [needsDatabaseSetup, setNeedsDatabaseSetup] = useState(false);

  const handleExecuteArbitrage = async (opportunityId: string) => {
    console.log('Executing arbitrage for opportunity:', opportunityId);
    // This will be implemented when we add the execution logic
    // For now, just toggle favorite as a placeholder interaction
    await toggleFavorite(opportunityId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchBots(),
        refetchOpportunities(),
        refetchActivities(),
        triggerUpdate(), // Also trigger price feed update
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initialize database when user first authenticates
  useEffect(() => {
    const initializeApp = async () => {
      if (user && isConnected && !isInitializing && !needsDatabaseSetup) {
        setIsInitializing(true);
        try {
          console.log('🚀 Initializing app for user:', user.id);
          
          // Test connection first
          const connectionOk = await testConnection();
          if (!connectionOk) {
            console.error('Failed to connect to database');
            setNeedsDatabaseSetup(true);
            setIsInitializing(false);
            return;
          }

          // Try to initialize sample opportunities data (global)
          const dataInitialized = await initializeSampleData();
          if (!dataInitialized) {
            console.error('Failed to initialize sample data - database might need setup');
            setNeedsDatabaseSetup(true);
            setIsInitializing(false);
            return;
          }
          
          // Create sample data for this user if they don't have any bots
          if (!bots || bots.length === 0) {
            await createSampleDataForUser(user.id);
            // Refetch data after creating sample data
            setTimeout(() => {
              refetchBots();
              refetchActivities();
            }, 1000);
          }
        } catch (error) {
          console.error('Failed to initialize app:', error);
          setNeedsDatabaseSetup(true);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeApp();
  }, [user, isConnected, bots, needsDatabaseSetup]);

  // Check for database errors in the data hooks
  useEffect(() => {
    if (opportunitiesError?.includes('relation "opportunities" does not exist') ||
        opportunitiesError?.includes('permission denied') ||
        botsError?.includes('relation') ||
        activitiesError?.includes('relation')) {
      setNeedsDatabaseSetup(true);
    }
  }, [opportunitiesError, botsError, activitiesError]);

  // Calculate stats from real data
  const activeBots = bots?.filter(bot => bot.status === 'active').length || 0;
  const totalProfit = bots?.reduce((sum, bot) => sum + (bot.performance?.totalProfit || 0), 0) || 0;
  const successRate = bots && bots.length > 0 
    ? bots.reduce((sum, bot) => sum + (bot.performance?.successRate || 0), 0) / bots.length 
    : 0;

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-yellow-400" />
              </div>
              <CardTitle>Sign In to Your Account</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400">
                Please sign in to access your trading dashboard.
              </p>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black w-full"
              >
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </AppLayout>
    );
  }

  // Show wallet connection screen if authenticated but wallet not connected
  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400">
                Please connect your wallet to start trading with automated arbitrage strategies across multiple chains.
              </p>
              <div className="flex justify-center">
                {/* ConnectButton from RainbowKit will be rendered here */}
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Supported wallets: MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, and more
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Show database setup screen if database needs setup
  if (needsDatabaseSetup) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <DatabaseSetup 
            onSetupComplete={() => {
              setNeedsDatabaseSetup(false);
              // Refetch all data after setup
              setTimeout(() => {
                refetchBots();
                refetchOpportunities();
                refetchActivities();
              }, 1000);
            }} 
          />
        </div>
      </AppLayout>
    );
  }

  // Show loading screen while initializing
  if (isInitializing || (botsLoading && opportunitiesLoading && activitiesLoading)) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-400" />
              <h3 className="text-lg font-semibold mb-2">Setting up your dashboard...</h3>
              <p className="text-gray-400">
                {isInitializing ? 'Initializing your trading environment' : 'Loading your data'}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Monitor your arbitrage trading performance across Yellow Network
            </p>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing || opportunitiesLoading}
              className="flex-shrink-0"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin lg:mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 lg:mr-2" />
              )}
              <span className="hidden lg:inline">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </Button>
            <Button size="sm" className="flex-shrink-0">
              <Plus className="w-4 h-4 lg:mr-2" />
              <span className="hidden sm:inline">New Strategy</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Total Balance"
            value={balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '$0.00'}
            change={12.5}
            trend="up"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Profit"
            value={`$${totalProfit.toFixed(2)}`}
            change={totalProfit > 0 ? 8.2 : 0}
            trend={totalProfit > 0 ? "up" : "neutral"}
            icon={TrendingUp}
          />
          <StatsCard
            title="Active Bots"
            value={activeBots.toString()}
            change={activeBots}
            changeType="number"
            trend={activeBots > 0 ? "up" : "neutral"}
            icon={Bot}
          />
          <StatsCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            change={successRate > 80 ? 2.1 : successRate > 50 ? 0 : -1.5}
            trend={successRate > 80 ? "up" : successRate > 50 ? "neutral" : "down"}
            icon={Zap}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Arbitrage Opportunities */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <Card>
              <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
                <CardTitle className="text-lg lg:text-xl">Live Arbitrage Opportunities</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${priceFeedRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span>{priceFeedRunning ? 'Live Feed' : 'Feed Offline'}</span>
                  </div>
                  {lastUpdate && (
                    <div className="text-xs">
                      Updated {lastUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunitiesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-400" />
                    <p className="text-gray-400">Loading opportunities...</p>
                  </div>
                ) : opportunitiesError ? (
                  <div className="text-center py-8 text-red-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Failed to load opportunities</p>
                    <p className="text-sm mt-2">{opportunitiesError}</p>
                  </div>
                ) : !opportunities || opportunities.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No arbitrage opportunities found</p>
                    <p className="text-sm mt-2">Check back soon for new opportunities</p>
                  </div>
                ) : (
                  opportunities.map((opportunity) => (
                    <ArbitrageOpportunity
                      key={opportunity.id}
                      opportunity={opportunity}
                      onExecute={handleExecuteArbitrage}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4 lg:space-y-6">
            {activitiesLoading ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-400" />
                    <p className="text-gray-400">Loading activities...</p>
                  </div>
                </CardContent>
              </Card>
            ) : activitiesError ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-red-400">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-4 opacity-50" />
                    <p>Failed to load activities</p>
                    <p className="text-sm mt-2">{activitiesError}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RecentActivity activities={(activities || []).filter(activity => 
                ['arbitrage', 'deposit', 'withdrawal', 'bot_start', 'bot_stop', 'trade'].includes(activity.type)
              ).map(activity => ({
                ...activity,
                type: activity.type as 'arbitrage' | 'deposit' | 'withdrawal' | 'bot_start' | 'bot_stop' | 'trade',
                status: activity.status === 'completed' ? 'success' : activity.status as 'pending' | 'failed' | 'success'
              }))} maxItems={5} />
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </AppLayout>
  );
}
