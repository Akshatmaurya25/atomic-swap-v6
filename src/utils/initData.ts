import { supabase } from '@/lib/supabase';

// Sample opportunities data
const sampleOpportunities = [
  {
    token_pair: 'ETH/USDC',
    source_chain: 'Ethereum',
    target_chain: 'Polygon',
    source_platform: 'Uniswap V3',
    target_platform: 'QuickSwap',
    source_price: 2650.50,
    target_price: 2663.25,
    potential_profit: 127.50,
    profit_percentage: 0.48,
    liquidity: 150000,
    estimated_gas: 45.30,
    time_window: 180,
    risk: 'low',
    trending: true,
    executable: true
  },
  {
    token_pair: 'USDT/USDC',
    source_chain: 'BSC',
    target_chain: 'Arbitrum',
    source_platform: 'PancakeSwap',
    target_platform: 'SushiSwap',
    source_price: 1.0025,
    target_price: 1.0041,
    potential_profit: 32.00,
    profit_percentage: 0.16,
    liquidity: 89000,
    estimated_gas: 12.75,
    time_window: 120,
    risk: 'medium',
    trending: false,
    executable: true
  },
  {
    token_pair: 'BTC/USDT',
    source_chain: 'Ethereum',
    target_chain: 'Base',
    source_platform: 'Uniswap V2',
    target_platform: 'BaseSwap',
    source_price: 67250.00,
    target_price: 67489.50,
    potential_profit: 239.50,
    profit_percentage: 0.36,
    liquidity: 245000,
    estimated_gas: 52.80,
    time_window: 300,
    risk: 'low',
    trending: true,
    executable: true
  },
  {
    token_pair: 'MATIC/USDC',
    source_chain: 'Polygon',
    target_chain: 'Ethereum',
    source_platform: 'QuickSwap',
    target_platform: 'Uniswap V3',
    source_price: 0.8945,
    target_price: 0.9012,
    potential_profit: 67.00,
    profit_percentage: 0.75,
    liquidity: 45000,
    estimated_gas: 38.20,
    time_window: 90,
    risk: 'high',
    trending: false,
    executable: false
  },
  {
    token_pair: 'ARB/USDC',
    source_chain: 'Arbitrum',
    target_chain: 'Optimism',
    source_platform: 'Camelot',
    target_platform: 'Velodrome',
    source_price: 1.2456,
    target_price: 1.2523,
    potential_profit: 45.30,
    profit_percentage: 0.54,
    liquidity: 78000,
    estimated_gas: 18.90,
    time_window: 150,
    risk: 'medium',
    trending: false,
    executable: true
  }
];

export async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    // Simple test by trying to query opportunities table
    const { error } = await supabase
      .from('opportunities')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection error:', error);
      // If table doesn't exist, that's expected - connection is still OK
      if (error.message?.includes('relation "opportunities" does not exist')) {
        console.log('✅ Connection successful (tables need to be created)');
        return true;
      }
      return false;
    }
    
    console.log('✅ Connection and tables ready!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}

export async function initializeSampleData() {
  try {
    console.log('🚀 Initializing sample data...');

    // First check if data already exists
    const { data: existingOpps, error: checkError } = await supabase
      .from('opportunities')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing data:', checkError);
      throw checkError;
    }

    if (existingOpps && existingOpps.length > 0) {
      console.log('📊 Sample data already exists, skipping initialization');
      return true;
    }

    // Insert sample opportunities
    console.log('📈 Inserting sample opportunities...');
    const { data: oppData, error: oppError } = await supabase
      .from('opportunities')
      .insert(sampleOpportunities)
      .select();

    if (oppError) {
      console.error('Error inserting opportunities:', oppError);
      throw oppError;
    }

    console.log(`✅ Inserted ${oppData?.length || 0} sample opportunities`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error);
    return false;
  }
}

export async function createDefaultUserSettings(userId: string) {
  try {
    console.log('👤 Creating default settings for user:', userId);

    // Default user settings only - no sample data
    const defaultSettings = {
      user_id: userId,
      profile: {
        displayName: 'Yellow Trader',
        timezone: 'UTC',
        language: 'en'
      },
      trading: {
        defaultSlippage: 1.0,
        maxGasPrice: 50,
        autoExecuteLimit: 1000,
        riskTolerance: 'medium',
        enableMEV: false,
        preferredChains: ['Ethereum', 'Polygon', 'Arbitrum']
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        opportunities: true,
        botActions: true,
        priceAlerts: false,
        failedTrades: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 24,
        apiKeysEnabled: false,
        whitelistedIPs: []
      },
      appearance: {
        theme: 'dark',
        currency: 'USD',
        hideBalances: false,
        compactMode: false
      }
    };

    // Insert default settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert(defaultSettings);

    if (settingsError) {
      console.error('Error creating default settings:', settingsError);
      throw settingsError;
    }

    console.log('✅ Default user settings created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create default user settings:', error);
    return false;
  }
}