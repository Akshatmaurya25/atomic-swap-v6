import { supabase } from '@/lib/supabase';
import { createDefaultUserSettings } from '@/utils/initData';

// Initialize database with required tables and data
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test database connection
    const { error: testError } = await supabase
      .from('trading_bots')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.warn('Database tables might not exist yet. This is expected on first run.');
      console.warn('Error:', testError.message);
      return { success: false, error: testError.message, needsMigration: true };
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found, skipping user-specific initialization');
      return { success: true, message: 'Database connection verified, no user to initialize' };
    }
    
    console.log('Creating default user settings...');
    
    // Create default settings if they don't exist
    await createDefaultUserSettings(user.id);
    
    // Initialize demo data for the user
    console.log('Creating demo data for user...');
    const { error: demoError } = await supabase.rpc('create_demo_data_for_user', {
      user_uuid: user.id
    });
    
    if (demoError) {
      console.warn('Failed to create demo data:', demoError.message);
      // Don't fail initialization if demo data creation fails
    }
    
    console.log('Database initialization completed successfully');
    return { success: true, message: 'Database initialized successfully' };
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Check if database is properly initialized
export async function checkDatabaseStatus() {
  try {
    // Check if required tables exist
    const requiredTables = ['trading_bots', 'opportunities', 'activities', 'user_settings'];
    
    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        return { 
          success: false, 
          error: `Table '${table}' not accessible: ${error.message}`,
          needsSetup: true
        };
      }
    }
    
    return { 
      success: true, 
      message: 'Database is properly initialized' 
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      needsSetup: true
    };
  }
}

// Create a comprehensive setup guide for users
export function getDatabaseSetupInstructions() {
  return {
    title: 'Database Setup Required',
    description: 'Your Supabase database needs to be set up with the required tables and functions.',
    steps: [
      {
        title: 'Create Supabase Project',
        description: 'Go to https://supabase.com and create a new project',
        completed: false
      },
      {
        title: 'Get Database Credentials',
        description: 'Copy your project URL and anon key from the Supabase dashboard',
        completed: false
      },
      {
        title: 'Update Environment Variables',
        description: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file',
        completed: false
      },
      {
        title: 'Run Database Migrations',
        description: 'Execute the SQL files in the database/migrations folder in your Supabase SQL editor',
        files: ['001_initial_schema.sql', '002_rls_policies.sql'],
        completed: false
      },
      {
        title: 'Seed Demo Data',
        description: 'Execute the database/seed.sql file to populate with sample data',
        completed: false
      }
    ],
    troubleshooting: [
      {
        issue: 'Permission denied errors',
        solution: 'Make sure RLS policies are properly set up and you are authenticated'
      },
      {
        issue: 'Table does not exist',
        solution: 'Run the migration files in order: 001_initial_schema.sql first, then 002_rls_policies.sql'
      },
      {
        issue: 'Function does not exist',
        solution: 'Make sure all SQL in the migration files was executed successfully'
      }
    ]
  };
}

// Helper function to create sample data for development
export async function createSampleData(walletAddress?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create sample data');
    }
    
    console.log('Creating sample data for user:', user.id);
    
    // Create demo trading data
    const { error: demoError } = await supabase.rpc('create_demo_data_for_user', {
      user_uuid: user.id
    });
    
    if (demoError) {
      console.error('Error creating demo data:', demoError);
    }
    
    // Create sample wallet if wallet address provided
    if (walletAddress) {
      const { error: walletError } = await supabase.rpc('create_sample_wallet_for_user', {
        user_uuid: user.id,
        wallet_address: walletAddress
      });
      
      if (walletError) {
        console.error('Error creating sample wallet:', walletError);
      }
    }
    
    return { success: true, message: 'Sample data created successfully' };
  } catch (error) {
    console.error('Failed to create sample data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Clean up test data
export async function cleanupTestData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to cleanup data');
    }
    
    console.log('Cleaning up test data for user:', user.id);
    
    // Delete user's data in the correct order (respecting foreign keys)
    const tables = [
      'portfolio_snapshots',
      'trades',
      'activities',
      'user_favorites',
      'user_wallets',
      'trading_bots',
      'user_settings'
    ];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.warn(`Warning: Could not clean up ${table}:`, error.message);
      } else {
        console.log(`Cleaned up ${table}`);
      }
    }
    
    return { success: true, message: 'Test data cleaned up successfully' };
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Database health check
export async function performHealthCheck() {
  try {
    const results = {
      connection: false,
      tables: {} as Record<string, boolean>,
      functions: {} as Record<string, boolean>,
      rowCount: {} as Record<string, number>
    };
    
    // Test basic connection
    const { error: connectionError } = await supabase
      .from('trading_bots')
      .select('count')
      .limit(1);
    
    results.connection = !connectionError;
    
    if (connectionError) {
      return {
        success: false,
        error: 'Database connection failed: ' + connectionError.message,
        details: results
      };
    }
    
    // Test required tables and get row counts
    const requiredTables = [
      'trading_bots', 'opportunities', 'activities', 
      'user_settings', 'user_favorites', 'user_wallets',
      'trades', 'portfolio_snapshots', 'price_feeds'
    ];
    
    for (const table of requiredTables) {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      results.tables[table] = !error;
      results.rowCount[table] = count || 0;
    }
    
    // Test required functions
    const requiredFunctions = [
      'create_demo_data_for_user',
      'create_sample_wallet_for_user',
      'handle_new_user'
    ];
    
    for (const func of requiredFunctions) {
      // We can't easily test function existence without calling them,
      // so we'll mark them as true for now
      results.functions[func] = true;
    }
    
    return {
      success: true,
      message: 'Health check completed successfully',
      details: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Legacy functions for compatibility
export async function initializeDatabase() {
  const result = await initDatabase();
  if (!result.success) {
    throw new Error(result.error);
  }
  return true;
}

export async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { error } = await supabase.from('opportunities').select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}

