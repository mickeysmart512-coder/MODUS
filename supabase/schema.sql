-- SQL Schema for MODUS Backend

-- 0. Drop existing tables if they exist to allow clean reset
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    x_username TEXT,
    credits INTEGER DEFAULT 1500,     -- Used for in-game purchases/tasks
    mod_tokens INTEGER DEFAULT 0,     -- The actual crypto asset earned passively
    power_level INTEGER DEFAULT 0,    -- Increased by buying/equipping items
    account_level INTEGER DEFAULT 1,  -- 1 level per 50 Power Level points
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Items Table (Available for purchase)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    currency_type TEXT NOT NULL CHECK (currency_type IN ('crypto', 'credits')),
    image_url TEXT,
    power_bonus INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Inventory Table (Items owned by users)
CREATE TABLE inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_wallet TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Activities Table (For the Dashboard Activity Feed)
CREATE TABLE activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_wallet TEXT REFERENCES users(wallet_address) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- e.g. 'earn', 'spend', 'equip', 'mint'
    description TEXT NOT NULL, -- e.g. 'Minted Neon Visor'
    value TEXT NOT NULL,       -- e.g. '+50 MOD' or 'Premium'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Announcements Table
CREATE TABLE announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create System Settings Table (Singleton for global config)
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one row
    admin_wallet_address TEXT,
    maintenance_mode BOOLEAN DEFAULT false,
    active_season TEXT DEFAULT 'Pre-Season' CHECK (active_season IN ('Pre-Season', 'Season 1', 'Season 2', 'Season 3')),
    season_countdown_end TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default system settings
INSERT INTO system_settings (id, admin_wallet_address, maintenance_mode, active_season) VALUES (1, '9p1D4n8vNqX2L4ePz3n6Yk2JvR9m', false, 'Pre-Season') ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policies
-- Note: For development, we are allowing public read/write since authentication
-- is handled primarily via the Solana wallet signature on the frontend.
-- In production, you would want stricter RLS policies tied to an auth token.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to items" ON items FOR SELECT USING (true);
CREATE POLICY "Allow public insert to items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to items" ON items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to items" ON items FOR DELETE USING (true);

CREATE POLICY "Allow public read access to inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert to inventory" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to inventory" ON inventory FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert to activities" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to activities" ON activities FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert to announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to announcements" ON announcements FOR DELETE USING (true);

CREATE POLICY "Allow public read access to system_settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update to system_settings" ON system_settings FOR UPDATE USING (true);
