import { supabase } from '@/lib/supabase';

const schema = `
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trading Bots
CREATE TABLE IF NOT EXISTS trading_bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('arbitrage', 'dca', 'grid')),
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('active', 'paused', 'stopped')),
  pairs TEXT[] NOT NULL,
  chains TEXT[] NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  performance JSONB DEFAULT '{"totalProfit": 0, "profitPercentage": 0, "trades": 0, "successRate": 0, "balance": 1000}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arbitrage Opportunities
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

-- User Favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- User Wallets
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  assets JSONB DEFAULT '[]',
  total_value DECIMAL(20,2) DEFAULT 0,
  performance JSONB DEFAULT '{"daily": 0, "weekly": 0, "monthly": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile JSONB DEFAULT '{}',
  trading JSONB DEFAULT '{}',
  notifications JSONB DEFAULT '{}',
  security JSONB DEFAULT '{}',
  appearance JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE trading_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for trading_bots
CREATE POLICY "Users can view own bots" ON trading_bots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bots" ON trading_bots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bots" ON trading_bots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bots" ON trading_bots FOR DELETE USING (auth.uid() = user_id);

-- Policies for opportunities (public read)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view opportunities" ON opportunities FOR SELECT USING (true);

-- Policies for user_favorites
CREATE POLICY "Users can view own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_wallets
CREATE POLICY "Users can view own wallets" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets" ON user_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallets" ON user_wallets FOR DELETE USING (auth.uid() = user_id);

-- Policies for activities
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_bots_user_id ON trading_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_profit ON opportunities(potential_profit DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_updated ON opportunities(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
DROP TRIGGER IF EXISTS update_trading_bots_updated_at ON trading_bots;
CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON trading_bots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_wallets_updated_at ON user_wallets;
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

const sampleData = `
-- Sample Arbitrage Opportunities Data
INSERT INTO opportunities (token_pair, source_chain, target_chain, source_platform, target_platform, source_price, target_price, potential_profit, profit_percentage, liquidity, estimated_gas, time_window, risk, trending, executable) VALUES
('ETH/USDC', 'Ethereum', 'Polygon', 'Uniswap V3', 'QuickSwap', 2650.50, 2663.25, 127.50, 0.48, 150000, 45.30, 180, 'low', true, true),
('USDT/USDC', 'BSC', 'Arbitrum', 'PancakeSwap', 'SushiSwap', 1.0025, 1.0041, 32.00, 0.16, 89000, 12.75, 120, 'medium', false, true),
('BTC/USDT', 'Ethereum', 'Base', 'Uniswap V2', 'BaseSwap', 67250.00, 67489.50, 239.50, 0.36, 245000, 52.80, 300, 'low', true, true),
('MATIC/USDC', 'Polygon', 'Ethereum', 'QuickSwap', 'Uniswap V3', 0.8945, 0.9012, 67.00, 0.75, 45000, 38.20, 90, 'high', false, false),
('ARB/USDC', 'Arbitrum', 'Optimism', 'Camelot', 'Velodrome', 1.2456, 1.2523, 45.30, 0.54, 78000, 18.90, 150, 'medium', false, true)
ON CONFLICT DO NOTHING;

-- Function to simulate price updates
CREATE OR REPLACE FUNCTION update_opportunity_prices()
RETURNS void AS $$
BEGIN
  UPDATE opportunities 
  SET 
    source_price = source_price * (1 + (random() - 0.5) * 0.002),
    target_price = target_price * (1 + (random() - 0.5) * 0.002),
    updated_at = NOW()
  WHERE executable = true;
  
  -- Recalculate profit based on new prices
  UPDATE opportunities 
  SET 
    potential_profit = (target_price - source_price) * (liquidity / source_price * 0.1),
    profit_percentage = ((target_price - source_price) / source_price * 100)
  WHERE executable = true;
  
  -- Randomly toggle trending status
  UPDATE opportunities 
  SET trending = (random() > 0.7)
  WHERE executable = true;
END;
$$ LANGUAGE plpgsql;

-- Periodic update function
CREATE OR REPLACE FUNCTION periodic_data_update()
RETURNS void AS $$
BEGIN
  PERFORM update_opportunity_prices();
  
  UPDATE opportunities 
  SET 
    liquidity = liquidity * (0.95 + random() * 0.1),
    time_window = GREATEST(60, time_window + (random() - 0.5) * 30)::integer
  WHERE random() > 0.8;
END;
$$ LANGUAGE plpgsql;
`;

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Execute schema
    console.log('📋 Creating tables and policies...');
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schema });
    if (schemaError) {
      console.error('Schema error:', schemaError);
      throw schemaError;
    }

    // Execute sample data
    console.log('📊 Inserting sample data...');
    const { error: dataError } = await supabase.rpc('exec_sql', { sql: sampleData });
    if (dataError) {
      console.error('Data error:', dataError);
      throw dataError;
    }

    console.log('✅ Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('opportunities').select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Connection successful!', { count: data });
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}