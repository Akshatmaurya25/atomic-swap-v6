'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, AlertCircle, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { testConnection, initializeSampleData } from '@/utils/initData';

interface DatabaseSetupProps {
  onSetupComplete: () => void;
}

export function DatabaseSetup({ onSetupComplete }: DatabaseSetupProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const connected = await testConnection();
      if (connected) {
        setSuccess('✅ Connection successful!');
        setStep(2);
      } else {
        setError('❌ Failed to connect. Please check your database setup.');
      }
    } catch (err) {
      setError(`❌ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeData = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const initialized = await initializeSampleData();
      if (initialized) {
        setSuccess('✅ Sample data initialized successfully!');
        setStep(3);
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      } else {
        setError('❌ Failed to initialize data. Please run the SQL scripts manually.');
      }
    } catch (err) {
      setError(`❌ Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sqlScript = `-- Create the opportunities table and insert sample data
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_pair TEXT NOT NULL,
  source_chain TEXT NOT NULL,
  target_chain TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  target_platform TEXT NOT NULL,
  source_price DECIMAL(20,8) NOT NULL,
  target_price DECIMAL(20,8) NOT NULL,
  potential_profit DECIMAL(20,8) NOT NULL,
  profit_percentage DECIMAL(10,4) NOT NULL,
  liquidity DECIMAL(20,2) NOT NULL,
  estimated_gas DECIMAL(20,8) NOT NULL,
  time_window INTEGER NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('low', 'medium', 'high')),
  trending BOOLEAN DEFAULT FALSE,
  executable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view opportunities" ON opportunities FOR SELECT USING (true);

-- Insert sample data
INSERT INTO opportunities (token_pair, source_chain, target_chain, source_platform, target_platform, source_price, target_price, potential_profit, profit_percentage, liquidity, estimated_gas, time_window, risk, trending, executable) VALUES
('ETH/USDC', 'Ethereum', 'Polygon', 'Uniswap V3', 'QuickSwap', 2650.50, 2663.25, 127.50, 0.48, 150000, 45.30, 180, 'low', true, true),
('USDT/USDC', 'BSC', 'Arbitrum', 'PancakeSwap', 'SushiSwap', 1.0025, 1.0041, 32.00, 0.16, 89000, 12.75, 120, 'medium', false, true),
('BTC/USDT', 'Ethereum', 'Base', 'Uniswap V2', 'BaseSwap', 67250.00, 67489.50, 239.50, 0.36, 245000, 52.80, 300, 'low', true, true)
ON CONFLICT DO NOTHING;`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('📋 SQL copied to clipboard!');
    } catch (_err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="max-w-2xl w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="w-6 h-6 text-yellow-400" />
          <span>Database Setup Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-4">
              <p className="text-gray-300">
                It looks like your database tables haven&apos;t been created yet. Let&apos;s set up your database:
              </p>
              
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-yellow-400">Option 1: Automatic Setup (Recommended)</h4>
                <p className="text-sm text-gray-300">
                  Click below to test the connection and set up the basic tables automatically:
                </p>
                <Button 
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Testing Connection...
                    </>
                  ) : (
                    'Test Connection & Setup'
                  )}
                </Button>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-yellow-400">Option 2: Manual Setup</h4>
                <p className="text-sm text-gray-300">
                  Copy the SQL below and run it in your Supabase SQL Editor:
                </p>
                <div className="bg-gray-900 rounded p-3 text-xs font-mono max-h-48 overflow-y-auto">
                  <pre className="text-gray-300 whitespace-pre-wrap">{sqlScript}</pre>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(sqlScript)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy SQL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Supabase
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Database Connection Successful!</span>
            </div>
            <p className="text-gray-300">
              Now let&apos;s initialize your database with sample arbitrage opportunities:
            </p>
            <Button 
              onClick={handleInitializeData}
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Initializing Data...
                </>
              ) : (
                'Initialize Sample Data'
              )}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Setup Complete!</span>
            </div>
            <p className="text-gray-300">
              Your database has been set up successfully. Redirecting to dashboard...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}