import { createClient } from '@supabase/supabase-js';

// These will be set from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are required. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (will be auto-generated later with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      trading_bots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          strategy: 'arbitrage' | 'dca' | 'grid';
          status: 'active' | 'paused' | 'stopped';
          pairs: string[];
          chains: string[];
          settings: any;
          performance: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          strategy: 'arbitrage' | 'dca' | 'grid';
          status?: 'active' | 'paused' | 'stopped';
          pairs: string[];
          chains: string[];
          settings: any;
          performance?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          strategy?: 'arbitrage' | 'dca' | 'grid';
          status?: 'active' | 'paused' | 'stopped';
          pairs?: string[];
          chains?: string[];
          settings?: any;
          performance?: any;
          updated_at?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          token_pair: string;
          source_chain: string;
          target_chain: string;
          source_platform: string;
          target_platform: string;
          source_price: number;
          target_price: number;
          potential_profit: number;
          profit_percentage: number;
          liquidity: number;
          estimated_gas: number;
          time_window: number;
          risk: 'low' | 'medium' | 'high';
          trending: boolean;
          executable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          token_pair: string;
          source_chain: string;
          target_chain: string;
          source_platform: string;
          target_platform: string;
          source_price: number;
          target_price: number;
          potential_profit: number;
          profit_percentage: number;
          liquidity: number;
          estimated_gas: number;
          time_window: number;
          risk: 'low' | 'medium' | 'high';
          trending?: boolean;
          executable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          token_pair?: string;
          source_chain?: string;
          target_chain?: string;
          source_platform?: string;
          target_platform?: string;
          source_price?: number;
          target_price?: number;
          potential_profit?: number;
          profit_percentage?: number;
          liquidity?: number;
          estimated_gas?: number;
          time_window?: number;
          risk?: 'low' | 'medium' | 'high';
          trending?: boolean;
          executable?: boolean;
          updated_at?: string;
        };
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opportunity_id?: string;
        };
      };
      user_wallets: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          name: string;
          chain: string;
          assets: any;
          total_value: number;
          performance: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          name: string;
          chain: string;
          assets?: any;
          total_value?: number;
          performance?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address?: string;
          name?: string;
          chain?: string;
          assets?: any;
          total_value?: number;
          performance?: any;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          status: string;
          description: string;
          details: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          status: string;
          description: string;
          details?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          status?: string;
          description?: string;
          details?: any;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          profile: any;
          trading: any;
          notifications: any;
          security: any;
          appearance: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile?: any;
          trading?: any;
          notifications?: any;
          security?: any;
          appearance?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile?: any;
          trading?: any;
          notifications?: any;
          security?: any;
          appearance?: any;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];