-- Modus: The Chronos Breach Database Migration

-- 1. Create the daily_missions table
CREATE TABLE daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    active_date DATE NOT NULL UNIQUE,
    title TEXT NOT NULL,
    fragment_name TEXT NOT NULL,
    briefing_dialogue TEXT[] NOT NULL DEFAULT '{}',
    success_dialogue TEXT[] NOT NULL DEFAULT '{}',
    failure_dialogue TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add fragments_secured to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS fragments_secured TEXT[] DEFAULT '{}';

-- 3. Row Level Security (RLS) for daily_missions
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read daily missions
CREATE POLICY "Allow public read access to daily_missions"
    ON daily_missions FOR SELECT
    USING (true);

-- Allow authenticated users to update their own fragments
-- (Note: Actual user RLS might be more complex, ensure users table RLS allows users to update fragments_secured)
