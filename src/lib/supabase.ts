import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Type Definitions for the Supabase Tables ---

export type User = {
    id: string; // UUID
    wallet_address: string;
    username: string;
    x_username?: string;
    credits: number;
    mod_tokens: number;
    power_level: number;
    account_level: number;
    created_at: string;
};

export type Item = {
    id: number;
    name: string;
    description: string;
    price: number;
    currency_type: 'crypto' | 'credits';
    image_url: string;
    power_bonus: number;
    created_at: string;
}

export type InventoryItem = {
    id: string; // UUID
    user_wallet: string; // FK to Users
    item_id: number; // FK to Items
    acquired_at: string;
};

export type Activity = {
    id: string; // UUID
    user_wallet: string; // FK to Users
    action_type: string; // 'earn', 'spend', 'equip', 'mint'
    description: string;
    value: string; // e.g. '+50 MOD'
    created_at: string;
};

export type Announcement = {
    id: string; // UUID
    title: string;
    content: string;
    is_active: boolean;
    created_at: string;
}

export type SystemSettings = {
    id: number;
    admin_wallet_address: string;
    maintenance_mode: boolean;
    active_season: 'Pre-Season' | 'Season 1' | 'Season 2' | 'Season 3';
    season_countdown_end: string | null;
    updated_at: string;
}
