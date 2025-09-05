'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  TrendingUp, 
  DollarSign, 
  Zap,
  X,
  Loader2,
  CheckCircle,
  Coins
} from 'lucide-react';
import { tokenAllocationService } from '@/services/tokenAllocation';
import { useAccount } from 'wagmi';

interface BotStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  features: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const strategies: BotStrategy[] = [
  {
    id: 'arbitrage',
    name: 'Arbitrage Bot',
    description: 'Exploits price differences across different exchanges and chains',
    icon: TrendingUp,
    features: ['Cross-chain trading', 'Real-time monitoring', 'High frequency'],
    riskLevel: 'medium'
  },
  {
    id: 'dca',
    name: 'DCA Bot',
    description: 'Dollar Cost Averaging - systematic buying at regular intervals',
    icon: DollarSign,
    features: ['Regular purchases', 'Risk mitigation', 'Long-term strategy'],
    riskLevel: 'low'
  },
  {
    id: 'grid',
    name: 'Grid Trading',
    description: 'Places buy and sell orders at predefined intervals',
    icon: Zap,
    features: ['Range trading', 'Automated rebalancing', 'Market neutral'],
    riskLevel: 'high'
  }
];

const availableChains = [
  'Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'BSC', 'Base'
];

const availablePairs = [
  'ETH/USDC', 'ETH/USDT', 'BTC/USDC', 'BTC/USDT', 
  'USDT/USDC', 'USDC/DAI', 'MATIC/USDC', 'ARB/USDC'
];

interface BotCreatorProps {
  onClose?: () => void;
  onSubmit?: (botConfig: {
    strategy: string;
    name: string;
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
    tokenAllocation?: unknown;
    created: Date;
  }) => Promise<void>;
}

export function BotCreator({ onClose, onSubmit }: BotCreatorProps) {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tokenAllocation, setTokenAllocation] = useState<{
    success: boolean;
    message?: string;
    data?: {
      transactionHash: string;
      allocatedAmount: string;
      recipientAddress: string;
    };
  } | null>(null);
  const [config, setConfig] = useState({
    name: '',
    selectedPairs: [] as string[],
    selectedChains: [] as string[],
    settings: {
      minProfitPercentage: 0.5,
      maxInvestment: 1000,
      stopLoss: -5.0,
      slippage: 1.0,
      gasLimit: 'auto' as 'auto' | 'manual',
      customGasLimit: 300000,
      tradingFunds: 2.0 // ETH amount to allocate for trading
    }
  });

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    setStep(2);
  };

  const togglePair = (pair: string) => {
    setConfig(prev => ({
      ...prev,
      selectedPairs: prev.selectedPairs.includes(pair)
        ? prev.selectedPairs.filter(p => p !== pair)
        : [...prev.selectedPairs, pair]
    }));
  };

  const toggleChain = (chain: string) => {
    setConfig(prev => ({
      ...prev,
      selectedChains: prev.selectedChains.includes(chain)
        ? prev.selectedChains.filter(c => c !== chain)
        : [...prev.selectedChains, chain]
    }));
  };

  const handleSubmit = async () => {
    if (!onSubmit || !address) return;
    
    setIsSubmitting(true);
    try {
      // First allocate tokens for the bot
      const allocationResult = await tokenAllocationService.allocateTestTokens({
        userAddress: address,
        botName: config.name,
        strategy: selectedStrategy,
        requestedAmount: config.settings.tradingFunds,
        chains: config.selectedChains
      });

      if (!allocationResult.success) {
        throw new Error(allocationResult.error || 'Token allocation failed');
      }

      setTokenAllocation(allocationResult);

      // Then create the bot with allocation info
      await onSubmit({
        strategy: selectedStrategy,
        ...config,
        tokenAllocation: allocationResult,
        created: new Date()
      });
      
      // Show success state briefly before closing
      setSubmitSuccess(true);
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000); // Longer delay to show allocation success
    } catch (error) {
      console.error('Failed to create bot:', error);
      alert(`Failed to create bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Create New Trading Bot</CardTitle>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNum ? 'bg-yellow-400' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Strategy Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white">Choose Trading Strategy</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Select the automated trading strategy that best fits your goals
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategies.map((strategy) => {
                  const Icon = strategy.icon;
                  return (
                    <Card 
                      key={strategy.id}
                      className={`cursor-pointer transition-all hover:border-yellow-400/50 ${
                        selectedStrategy === strategy.id ? 'border-yellow-400 bg-yellow-400/5' : ''
                      }`}
                      onClick={() => handleStrategySelect(strategy.id)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{strategy.name}</h4>
                            <p className={`text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                              {strategy.riskLevel.toUpperCase()} RISK
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{strategy.description}</p>
                        <div className="space-y-1">
                          {strategy.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                              <span className="text-xs text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white">Configure Your Bot</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Set up trading parameters and select supported pairs and chains
                </p>
              </div>
              
              {/* Bot Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bot Name</label>
                <Input 
                  placeholder="Enter bot name"
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Trading Pairs */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Trading Pairs</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availablePairs.map((pair) => (
                    <button
                      key={pair}
                      onClick={() => togglePair(pair)}
                      className={`p-2 text-sm rounded border transition-colors ${
                        config.selectedPairs.includes(pair)
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chains */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Supported Chains</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableChains.map((chain) => (
                    <button
                      key={chain}
                      onClick={() => toggleChain(chain)}
                      className={`p-2 text-sm rounded border transition-colors ${
                        config.selectedChains.includes(chain)
                          ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!config.name || config.selectedPairs.length === 0 || config.selectedChains.length === 0 || isSubmitting}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Advanced Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Fine-tune your bot&apos;s trading parameters and risk management
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Min Profit Percentage
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={config.settings.minProfitPercentage}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        settings: { ...prev.settings, minProfitPercentage: parseFloat(e.target.value) }
                      }))}
                      placeholder="0.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Trading Funds (ETH)
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5"
                      value={config.settings.tradingFunds}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        settings: { ...prev.settings, tradingFunds: parseFloat(e.target.value) || 0.1 }
                      }))}
                      placeholder="2.0"
                    />
                    <p className="text-xs text-gray-400">
                      Amount of Sepolia ETH to allocate for bot trading (max 5 ETH)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Max Investment per Trade
                    </label>
                    <Input 
                      type="number"
                      value={config.settings.maxInvestment}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        settings: { ...prev.settings, maxInvestment: parseFloat(e.target.value) }
                      }))}
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Stop Loss (%)
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={config.settings.stopLoss}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        settings: { ...prev.settings, stopLoss: parseFloat(e.target.value) }
                      }))}
                      placeholder="-5.0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Slippage Tolerance (%)
                    </label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={config.settings.slippage}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        settings: { ...prev.settings, slippage: parseFloat(e.target.value) }
                      }))}
                      placeholder="1.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Gas Limit
                    </label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, gasLimit: 'auto' }
                          }))}
                          className={`px-3 py-2 text-sm rounded ${
                            config.settings.gasLimit === 'auto'
                              ? 'bg-yellow-400 text-black'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, gasLimit: 'manual' }
                          }))}
                          className={`px-3 py-2 text-sm rounded ${
                            config.settings.gasLimit === 'manual'
                              ? 'bg-yellow-400 text-black'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                      {config.settings.gasLimit === 'manual' && (
                        <Input 
                          type="number"
                          value={config.settings.customGasLimit}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, customGasLimit: parseInt(e.target.value) }
                          }))}
                          placeholder="300000"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Configuration Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Strategy:</span>
                    <span className="text-white capitalize">{selectedStrategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trading Pairs:</span>
                    <span className="text-white">{config.selectedPairs.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chains:</span>
                    <span className="text-white">{config.selectedChains.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Profit:</span>
                    <span className="text-white">{config.settings.minProfitPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trading Funds:</span>
                    <span className="text-white">{config.settings.tradingFunds} ETH</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !config.name || !address}
                  className={submitSuccess ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {tokenAllocation ? 'Creating Bot...' : 'Allocating Tokens...'}
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Bot Created!
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Create Bot & Allocate Funds
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}