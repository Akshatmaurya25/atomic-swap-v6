import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ArrowRight, Clock, Zap } from 'lucide-react';

interface ArbitrageOpportunityData {
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
  timeWindow: number; // in seconds
  risk: 'low' | 'medium' | 'high';
}

interface ArbitrageOpportunityProps {
  opportunity: ArbitrageOpportunityData;
  onExecute?: (opportunityId: string) => void;
}

export function ArbitrageOpportunity({ opportunity, onExecute }: ArbitrageOpportunityProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute(opportunity.id);
    }
  };

  return (
    <Card className="hover:border-yellow-400/50 transition-colors duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{opportunity.tokenPair}</CardTitle>
          <Badge variant={getRiskColor(opportunity.risk) as "default" | "success" | "warning" | "error"} size="sm">
            {opportunity.risk.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chain and Platform Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-gray-400 flex-shrink-0">From:</span>
            <span className="text-white truncate">{opportunity.sourcePlatform}</span>
            <Badge variant="default" size="sm" className="flex-shrink-0">{opportunity.sourceChain}</Badge>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 self-center sm:block hidden" />
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-gray-400 flex-shrink-0">To:</span>
            <span className="text-white truncate">{opportunity.targetPlatform}</span>
            <Badge variant="default" size="sm" className="flex-shrink-0">{opportunity.targetChain}</Badge>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Source Price</p>
            <p className="text-white font-mono">{formatCurrency(opportunity.sourcePrice)}</p>
          </div>
          <div>
            <p className="text-gray-400">Target Price</p>
            <p className="text-white font-mono">{formatCurrency(opportunity.targetPrice)}</p>
          </div>
        </div>

        {/* Profit Information */}
        <div className="bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 font-medium">Potential Profit</p>
              <p className="text-white text-lg font-mono">
                {formatCurrency(opportunity.potentialProfit)} 
                <span className="text-green-400 ml-2">
                  ({formatPercentage(opportunity.profitPercentage)})
                </span>
              </p>
            </div>
            <Zap className="h-6 w-6 text-green-400" />
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="min-w-0">
            <p>Liquidity</p>
            <p className="text-white text-xs sm:text-sm truncate">{formatCurrency(opportunity.liquidity)}</p>
          </div>
          <div className="min-w-0">
            <p>Est. Gas</p>
            <p className="text-white text-xs sm:text-sm truncate">{formatCurrency(opportunity.estimatedGas)}</p>
          </div>
          <div className="flex items-center space-x-1 col-span-2 sm:col-span-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <p>{opportunity.timeWindow}s</p>
          </div>
        </div>

        {/* Execute Button */}
        <Button 
          onClick={handleExecute}
          className="w-full"
          size="sm"
        >
          Execute Arbitrage
        </Button>
      </CardContent>
    </Card>
  );
}