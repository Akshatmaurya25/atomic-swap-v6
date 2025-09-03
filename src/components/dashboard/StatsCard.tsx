import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  changeType?: 'currency' | 'percentage' | 'number';
  icon?: React.ComponentType<React.ComponentProps<'svg'>>;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'percentage',
  icon: Icon,
  trend,
  className 
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const formatChange = (value: number) => {
    switch (changeType) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return value.toString();
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn('p-6', className)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {change !== undefined && (
              <div className="flex items-center space-x-2">
                <TrendIcon className={cn('h-4 w-4', getTrendColor())} />
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {formatChange(Math.abs(change))}
                </span>
                <span className="text-xs text-gray-500">vs last 24h</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}