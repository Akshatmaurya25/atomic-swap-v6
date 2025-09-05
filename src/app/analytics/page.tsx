'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data for charts
const profitData = [
  { date: '2024-01-01', profit: 1200, trades: 15 },
  { date: '2024-01-02', profit: 1890, trades: 22 },
  { date: '2024-01-03', profit: 1560, trades: 18 },
  { date: '2024-01-04', profit: 2340, trades: 28 },
  { date: '2024-01-05', profit: 2100, trades: 25 },
  { date: '2024-01-06', profit: 2890, trades: 32 },
  { date: '2024-01-07', profit: 3200, trades: 35 },
];

const chainPerformance = [
  { name: 'Ethereum', profit: 12500, trades: 150, percentage: 35 },
  { name: 'Polygon', profit: 8900, trades: 220, percentage: 25 },
  { name: 'Arbitrum', profit: 7300, trades: 180, percentage: 20 },
  { name: 'BSC', profit: 4200, trades: 95, percentage: 12 },
  { name: 'Optimism', profit: 2800, trades: 65, percentage: 8 },
];

const strategyBreakdown = [
  { name: 'Arbitrage', value: 45, profit: 15600, color: '#FFEB3B' },
  { name: 'DCA', value: 30, profit: 8900, color: '#4CAF50' },
  { name: 'Grid Trading', value: 25, profit: 6200, color: '#2196F3' },
];

const hourlyActivity = [
  { hour: '00', volume: 1200, profit: 89 },
  { hour: '04', volume: 800, profit: 45 },
  { hour: '08', volume: 2400, profit: 156 },
  { hour: '12', volume: 3200, profit: 234 },
  { hour: '16', volume: 2800, profit: 198 },
  { hour: '20', volume: 2100, profit: 145 },
];

const pairPerformance = [
  { pair: 'ETH/USDC', profit: 8900, trades: 145, success: 94.5 },
  { pair: 'BTC/USDT', profit: 6700, trades: 112, success: 91.2 },
  { pair: 'USDT/USDC', profit: 4300, trades: 289, success: 98.1 },
  { pair: 'MATIC/USDC', profit: 3200, trades: 87, success: 89.7 },
  { pair: 'ARB/USDC', profit: 2100, trades: 65, success: 86.3 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { showDevelopmentToast } = useToast();

  // Show development toast when page loads
  useEffect(() => {
    showDevelopmentToast(
      '📊 Analytics Dashboard - In Development',
      'Real-time Yellow Network analytics are coming soon! This preview shows sample arbitrage performance data across multiple chains.'
    );
  }, [showDevelopmentToast]);

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  const totalProfit = profitData.reduce((sum, item) => sum + item.profit, 0);
  const totalTrades = profitData.reduce((sum, item) => sum + item.trades, 0);
  const avgProfit = totalProfit / profitData.length;

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 mt-2 text-sm lg:text-base">
              Deep insights into your trading performance and market opportunities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-md text-sm"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(totalProfit)}
                  </p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5% vs last period
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
                  <p className="text-sm text-gray-400">Total Trades</p>
                  <p className="text-2xl font-bold text-white">{totalTrades}</p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.2% vs last period
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Daily Profit</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(avgProfit)}
                  </p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.3% vs last period
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">94.2%</p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1% vs last period
                  </p>
                </div>
                <PieChartIcon className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Profit Over Time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Profit Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitData}>
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
                      formatter={(value) => [
                        formatCurrency(value as number),
                        'Profit'
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#FFEB3B" 
                      fill="rgba(255, 235, 59, 0.1)"
                      strokeWidth={2}
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chain Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Chain Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chainPerformance}>
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
                      formatter={(value) => [
                        formatCurrency(value as number),
                        'Profit'
                      ]}
                    />
                    <Bar dataKey="profit" fill="#FFEB3B" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5" />
                <span>Strategy Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={strategyBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {strategyBreakdown.map((entry, index) => (
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
                      formatter={(value) => [`${value}%`, 'Share']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Pairs Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Trading Pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Trading Pair</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Profit</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Trades</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Success Rate</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pairPerformance.map((pair, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{pair.pair}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-green-400 font-medium">
                          {formatCurrency(pair.profit)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{pair.trades}</td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{pair.success}%</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>24h Trading Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#F3F4F6'
                    }}
                    formatter={(value) => [
                      formatCurrency(value as number),
                      'Value'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#2196F3" 
                    strokeWidth={2}
                    name="Volume"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#FFEB3B" 
                    strokeWidth={2}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}