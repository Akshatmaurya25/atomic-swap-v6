-- Sample Arbitrage Opportunities Data
-- Note: These will be public and visible to all users

INSERT INTO opportunities (token_pair, source_chain, target_chain, source_platform, target_platform, source_price, target_price, potential_profit, profit_percentage, liquidity, estimated_gas, time_window, risk, trending, executable) VALUES
('ETH/USDC', 'Ethereum', 'Polygon', 'Uniswap V3', 'QuickSwap', 2650.50, 2663.25, 127.50, 0.48, 150000, 45.30, 180, 'low', true, true),
('USDT/USDC', 'BSC', 'Arbitrum', 'PancakeSwap', 'SushiSwap', 1.0025, 1.0041, 32.00, 0.16, 89000, 12.75, 120, 'medium', false, true),
('BTC/USDT', 'Ethereum', 'Base', 'Uniswap V2', 'BaseSwap', 67250.00, 67489.50, 239.50, 0.36, 245000, 52.80, 300, 'low', true, true),
('MATIC/USDC', 'Polygon', 'Ethereum', 'QuickSwap', 'Uniswap V3', 0.8945, 0.9012, 67.00, 0.75, 45000, 38.20, 90, 'high', false, false),
('ARB/USDC', 'Arbitrum', 'Optimism', 'Camelot', 'Velodrome', 1.2456, 1.2523, 45.30, 0.54, 78000, 18.90, 150, 'medium', false, true),
('LINK/USDC', 'Ethereum', 'Polygon', 'Uniswap V3', 'QuickSwap', 18.45, 18.62, 89.50, 0.92, 125000, 32.10, 200, 'low', true, true),
('UNI/USDT', 'Ethereum', 'BSC', 'Uniswap V2', 'PancakeSwap', 8.95, 9.12, 34.80, 1.90, 67000, 28.50, 165, 'medium', false, true),
('AAVE/USDC', 'Ethereum', 'Arbitrum', 'Uniswap V3', 'SushiSwap', 142.30, 143.85, 76.20, 1.09, 95000, 41.75, 180, 'medium', true, true),
('CRV/USDT', 'Ethereum', 'Polygon', 'Curve', 'QuickSwap', 0.68, 0.69, 28.40, 1.47, 34000, 25.60, 120, 'high', false, true),
('COMP/USDC', 'Ethereum', 'Optimism', 'Uniswap V3', 'Velodrome', 52.80, 53.45, 42.30, 1.23, 56000, 35.40, 210, 'medium', false, true);

-- Function to simulate price updates (you can run this periodically)
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

-- Sample Trading Bot Templates (these will be created per-user)
-- You can use these as templates when users create their first bots

-- Create a function to insert sample bot for a user
CREATE OR REPLACE FUNCTION create_sample_bots_for_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO trading_bots (user_id, name, strategy, status, pairs, chains, settings, performance) VALUES
  (user_uuid, 'ETH/USDC Arbitrage Master', 'arbitrage', 'stopped', ARRAY['ETH/USDC'], ARRAY['Ethereum', 'Polygon', 'Arbitrum'], 
   '{"minProfitPercentage": 0.3, "maxInvestment": 5000, "stopLoss": -2.5, "slippage": 1.0, "gasLimit": "auto"}',
   '{"totalProfit": 2847.50, "profitPercentage": 15.2, "trades": 127, "successRate": 94.5, "balance": 18750.00}'),
  
  (user_uuid, 'Stablecoin Spread Hunter', 'arbitrage', 'stopped', ARRAY['USDT/USDC', 'USDC/DAI'], ARRAY['BSC', 'Polygon'], 
   '{"minProfitPercentage": 0.1, "maxInvestment": 2000, "stopLoss": -1.0, "slippage": 0.5, "gasLimit": "auto"}',
   '{"totalProfit": 892.30, "profitPercentage": 8.9, "trades": 234, "successRate": 98.1, "balance": 10034.20}'),
  
  (user_uuid, 'DCA Bitcoin Strategy', 'dca', 'paused', ARRAY['BTC/USDC'], ARRAY['Ethereum'], 
   '{"minProfitPercentage": 0.0, "maxInvestment": 1000, "stopLoss": -5.0, "interval": "weekly", "amount": 100}',
   '{"totalProfit": -234.50, "profitPercentage": -2.3, "trades": 45, "successRate": 67.0, "balance": 9765.50}');
END;
$$ LANGUAGE plpgsql;

-- Sample Activities Template
CREATE OR REPLACE FUNCTION create_sample_activities_for_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO activities (user_id, type, status, description, details) VALUES
  (user_uuid, 'arbitrage', 'completed', 'ETH/USDC arbitrage executed successfully',
   '{"fromToken": "ETH", "toToken": "USDC", "fromAmount": 5.0, "toAmount": 13250.00, "fromChain": "Ethereum", "toChain": "Polygon", "platform": "Uniswap V3 → QuickSwap", "txHash": "0x1234567890abcdef1234567890abcdef12345678", "gasUsed": 180000, "gasFee": 45.30, "profit": 127.50, "profitPercentage": 0.96}'),
  
  (user_uuid, 'bot_action', 'completed', 'ETH/USDC Arbitrage Master bot started',
   '{"botId": "1", "botName": "ETH/USDC Arbitrage Master", "walletAddress": "0x1234567890123456789012345678901234567890"}'),
  
  (user_uuid, 'transfer', 'completed', 'USDC transferred to arbitrage wallet',
   '{"fromToken": "USDC", "fromAmount": 5000.00, "fromChain": "Ethereum", "toChain": "Polygon", "txHash": "0xabcdef1234567890abcdef1234567890abcdef12", "gasFee": 12.50, "walletAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"}'),
  
  (user_uuid, 'arbitrage', 'failed', 'USDT/USDC arbitrage failed due to insufficient liquidity',
   '{"fromToken": "USDT", "toToken": "USDC", "fromAmount": 2000.00, "fromChain": "BSC", "toChain": "Arbitrum", "platform": "PancakeSwap → SushiSwap", "txHash": "0xfailed123456789abcdef1234567890abcdef123", "gasFee": 8.75}'),
  
  (user_uuid, 'deposit', 'completed', 'Deposited funds to trading wallet',
   '{"fromToken": "ETH", "fromAmount": 10.0, "fromChain": "Ethereum", "txHash": "0x890abcdef1234567890abcdef1234567890abcdef", "gasFee": 25.60, "walletAddress": "0x1234567890123456789012345678901234567890"}');
END;
$$ LANGUAGE plpgsql;

-- Sample Wallet Data Template
CREATE OR REPLACE FUNCTION create_sample_wallets_for_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_wallets (user_id, address, name, chain, assets, total_value, performance) VALUES
  (user_uuid, '0x1234567890123456789012345678901234567890', 'Main Trading Wallet', 'Ethereum',
   '[{"symbol": "ETH", "name": "Ethereum", "balance": 12.5, "value": 33125.00, "price": 2650.00, "change24h": 5.2, "chain": "Ethereum", "color": "#627EEA"}, {"symbol": "USDC", "name": "USD Coin", "balance": 8950.25, "value": 8950.25, "price": 1.00, "change24h": 0.1, "chain": "Ethereum", "color": "#2775CA"}]',
   47500.50, '{"daily": 2.1, "weekly": 8.5, "monthly": 15.2}'),
  
  (user_uuid, '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'Arbitrage Bot Wallet', 'Polygon',
   '[{"symbol": "MATIC", "name": "Polygon", "balance": 15000.00, "value": 13425.00, "price": 0.895, "change24h": -2.3, "chain": "Polygon", "color": "#8247E5"}, {"symbol": "USDC", "name": "USD Coin", "balance": 10025.75, "value": 10025.75, "price": 1.00, "change24h": 0.1, "chain": "Polygon", "color": "#2775CA"}]',
   23450.75, '{"daily": -0.5, "weekly": 3.2, "monthly": 12.8}');
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create sample data for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Wait a moment to ensure the user is fully created
  PERFORM pg_sleep(0.1);
  
  -- Create sample data for the new user
  PERFORM create_sample_bots_for_user(NEW.id);
  PERFORM create_sample_activities_for_user(NEW.id);
  PERFORM create_sample_wallets_for_user(NEW.id);
  
  -- Create default settings
  INSERT INTO user_settings (user_id, profile, trading, notifications, security, appearance)
  VALUES (NEW.id,
    '{"displayName": "Yellow Trader", "email": "' || COALESCE(NEW.email, '') || '", "timezone": "UTC", "language": "en"}',
    '{"defaultSlippage": 1.0, "maxGasPrice": 50, "autoExecuteLimit": 1000, "riskTolerance": "medium", "enableMEV": false, "preferredChains": ["Ethereum", "Polygon", "Arbitrum"]}',
    '{"email": true, "push": true, "sms": false, "opportunities": true, "botActions": true, "priceAlerts": false, "failedTrades": true}',
    '{"twoFactorEnabled": false, "sessionTimeout": 24, "apiKeysEnabled": false, "whitelistedIPs": []}',
    '{"theme": "dark", "currency": "USD", "hideBalances": false, "compactMode": false}'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (this requires Supabase Auth schema access)
-- You'll need to run this in the Supabase SQL editor:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Periodic update function (call this via a cron job or Edge Function)
CREATE OR REPLACE FUNCTION periodic_data_update()
RETURNS void AS $$
BEGIN
  -- Update opportunity prices
  PERFORM update_opportunity_prices();
  
  -- Add some randomization to make data feel more live
  UPDATE opportunities 
  SET 
    liquidity = liquidity * (0.95 + random() * 0.1),
    time_window = GREATEST(60, time_window + (random() - 0.5) * 30)::integer
  WHERE random() > 0.8;
END;
$$ LANGUAGE plpgsql;