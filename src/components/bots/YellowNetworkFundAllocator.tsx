'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAccount, useBalance } from 'wagmi';
import { 
  yellowNetworkAllocationService,
  type FundAllocationRequest,
  type YellowNetworkAllocationResult,
  type SupportedToken
} from '@/services/yellowNetworkAllocation';
import { 
  Coins,
  Network,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface YellowNetworkFundAllocatorProps {
  botConfig: {
    name: string;
    strategy: 'arbitrage' | 'dca' | 'grid';
    selectedPairs: string[];
    selectedChains: string[];
  };
  onAllocationComplete: (allocation: YellowNetworkAllocationResult) => void;
  onCancel: () => void;
}

export function YellowNetworkFundAllocator({ 
  botConfig, 
  onAllocationComplete, 
  onCancel 
}: YellowNetworkFundAllocatorProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const [step, setStep] = useState(1);
  const [collateralAmount, setCollateralAmount] = useState(1000);
  const [preferredToken, setPreferredToken] = useState('USDC');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState<YellowNetworkAllocationResult | null>(null);
  const [supportedTokens, setSupportedTokens] = useState<SupportedToken[]>([]);
  
  useEffect(() => {
    const tokens = yellowNetworkAllocationService.getSupportedTokens(botConfig.selectedChains);
    setSupportedTokens(tokens);
  }, [botConfig.selectedChains]);

  const handleAllocateFunds = async () => {
    if (!address) return;
    
    setIsAllocating(true);
    try {
      const request: FundAllocationRequest = {
        userAddress: address,
        botName: botConfig.name,
        strategy: botConfig.strategy,
        tradingPairs: botConfig.selectedPairs,
        supportedChains: botConfig.selectedChains,
        collateralAmount,
        preferredCollateralToken: preferredToken,
        riskTolerance
      };

      const result = await yellowNetworkAllocationService.allocateYellowNetworkFunds(request);
      setAllocationResult(result);
      
      if (result.success) {
        setStep(3); // Success step
        setTimeout(() => {
          onAllocationComplete(result);
        }, 2000);
      } else {
        setStep(4); // Error step
      }
    } catch (error) {
      console.error('Fund allocation error:', error);
      setAllocationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setStep(4);
    } finally {
      setIsAllocating(false);
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

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case 'low': return 'Conservative approach with higher margin requirements (85% collateral ratio)';
      case 'medium': return 'Balanced risk with standard margin requirements (80% collateral ratio)';
      case 'high': return 'Aggressive trading with lower margin requirements (70% collateral ratio)';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Yellow Network Fund Allocation</CardTitle>
              <p className="text-sm text-gray-400">Set up state channels and collateral for &quot;{botConfig.name}&quot;</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Progress Indicator */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= stepNum 
                    ? "bg-yellow-400 text-black" 
                    : "bg-gray-700 text-gray-400"
                )}>
                  {stepNum === 3 && step >= 3 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 3 && (
                  <div className={cn(
                    "w-12 h-0.5",
                    step > stepNum ? "bg-yellow-400" : "bg-gray-700"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Collateral Configuration */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Configure Collateral</h3>
                <p className="text-sm text-gray-400">
                  Set up your state channel collateral using Yellow Network&apos;s ClearSync protocol
                </p>
              </div>

              {/* Current Wallet Balance */}
              {balance && (
                <Card className="bg-gray-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">Wallet Balance:</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                        </div>
                        <div className="text-xs text-gray-400">
                          ≈ {formatCurrency(parseFloat(balance.formatted) * 2650)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Collateral Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Collateral Amount (USD)
                </label>
                <Input 
                  type="number"
                  min="100"
                  max="50000"
                  step="100"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(parseInt(e.target.value) || 0)}
                  placeholder="1000"
                />
                <p className="text-xs text-gray-400">
                  Minimum: $100 • Maximum: $50,000 • Recommended: $1,000-$10,000
                </p>
              </div>

              {/* Preferred Collateral Token */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Preferred Collateral Token
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {supportedTokens.filter(t => t.isCollateral).map((token) => (
                    <button
                      key={`${token.symbol}-${token.chain}`}
                      onClick={() => setPreferredToken(token.symbol)}
                      className={cn(
                        "p-3 rounded border transition-colors flex items-center gap-2",
                        preferredToken === token.symbol
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                          : "border-gray-600 text-gray-400 hover:border-gray-500"
                      )}
                    >
                      <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{token.symbol.charAt(0)}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{token.symbol}</div>
                        <div className="text-xs opacity-60">{token.chain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Risk Tolerance & Margin Requirements
                </label>
                <div className="space-y-3">
                  {(['low', 'medium', 'high'] as const).map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setRiskTolerance(risk)}
                      className={cn(
                        "w-full p-3 rounded border transition-colors text-left",
                        riskTolerance === risk
                          ? "border-yellow-400 bg-yellow-400/5"
                          : "border-gray-600 hover:border-gray-500"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("font-medium capitalize", getRiskColor(risk))}>
                          {risk} Risk
                        </span>
                        <Shield className={cn("w-4 h-4", getRiskColor(risk))} />
                      </div>
                      <p className="text-xs text-gray-400">
                        {getRiskDescription(risk)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                disabled={!collateralAmount || collateralAmount < 100}
                className="w-full"
              >
                Continue to Review
              </Button>
            </div>
          )}

          {/* Step 2: Review & Allocate */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Review Allocation</h3>
                <p className="text-sm text-gray-400">
                  Confirm your Yellow Network state channel configuration
                </p>
              </div>

              {/* Allocation Summary */}
              <Card className="bg-gray-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Allocation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Bot Strategy:</p>
                      <p className="text-white font-medium capitalize">{botConfig.strategy}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Collateral Amount:</p>
                      <p className="text-white font-medium">{formatCurrency(collateralAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Preferred Token:</p>
                      <p className="text-white font-medium">{preferredToken}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Risk Level:</p>
                      <p className={cn("font-medium capitalize", getRiskColor(riskTolerance))}>
                        {riskTolerance}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Network className="w-4 h-4" />
                      <span>Supported Chains:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {botConfig.selectedChains.map(chain => (
                        <Badge key={chain} variant="default" size="sm">
                          {chain}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Zap className="w-4 h-4" />
                      <span>Trading Pairs:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {botConfig.selectedPairs.map(pair => (
                        <Badge key={pair} variant="default" size="sm">
                          {pair}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expected Network Setup */}
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-blue-300 font-medium mb-1">Yellow Network Setup</h4>
                      <p className="text-sm text-blue-200/80 mb-3">
                        This will create state channels with peer nodes and deposit your collateral using the ClearSync protocol.
                      </p>
                      <ul className="text-xs text-blue-200/60 space-y-1">
                        <li>• State channel formation with 2-3 high-reputation peers</li>
                        <li>• Collateral locked in smart contract for dispute resolution</li>
                        <li>• Real-time liability tracking and margin call protection</li>
                        <li>• Cross-chain asset virtualization capabilities</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleAllocateFunds}
                  disabled={isAllocating}
                  className="flex-1"
                >
                  {isAllocating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating State Channels...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Allocate Funds
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && allocationResult?.success && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Yellow Network Allocation Successful!
                </h3>
                <p className="text-gray-400">
                  Your state channels have been created and collateral deposited.
                </p>
              </div>

              {/* State Channel Info */}
              <Card className="bg-green-900/20 border-green-500/30">
                <CardContent className="p-4">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-300">State Channel ID:</span>
                      <code className="text-green-200 font-mono text-xs">
                        {allocationResult.stateChannelId}
                      </code>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-300">Connected Peers:</span>
                      <span className="text-green-200">
                        {allocationResult.networkPeers?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-300">Collateral Deposits:</span>
                      <span className="text-green-200">
                        {allocationResult.collateralDeposits?.length || 0} channels
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Optimizations */}
              {allocationResult?.optimizations && (
                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <h4 className="font-semibold text-blue-400">Transaction Optimizations</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fast Lane:</span>
                        <Badge variant={allocationResult.optimizations.enableFastLane ? 'default' : 'default'} size="sm">
                          {allocationResult.optimizations.enableFastLane ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Priority Boost:</span>
                        <span className="text-yellow-400">{allocationResult.optimizations.priorityFeeBoost}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Batch Txns:</span>
                        <Badge variant={allocationResult.optimizations.batchTransactions ? 'default' : 'default'} size="sm">
                          {allocationResult.optimizations.batchTransactions ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected Time:</span>
                        <span className="text-green-400">~{allocationResult.optimizations.expectedConfirmationTime}s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-gray-500">
                Redirecting to bot configuration...
              </p>
            </div>
          )}

          {/* Step 4: Error */}
          {step === 4 && !allocationResult?.success && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Allocation Failed
                </h3>
                <p className="text-red-400 mb-4">
                  {allocationResult?.error || 'Unknown error occurred'}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setStep(1)} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}