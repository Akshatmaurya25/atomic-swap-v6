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
CREATE INDEX idx_trading_bots_user_id ON trading_bots(user_id);
CREATE INDEX idx_opportunities_profit ON opportunities(potential_profit DESC);
CREATE INDEX idx_opportunities_updated ON opportunities(updated_at DESC);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON trading_bots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();