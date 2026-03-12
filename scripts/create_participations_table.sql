-- Create participations table
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS participations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at   timestamptz DEFAULT now(),
    UNIQUE (challenge_id, user_id)   -- a user can only join once per challenge
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS participations_challenge_idx ON participations(challenge_id);
CREATE INDEX IF NOT EXISTS participations_user_idx ON participations(user_id);

-- RLS: anyone can read, only auth user can insert their own row, no deletes
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participations"
    ON participations FOR SELECT USING (true);

CREATE POLICY "Users can join challenges"
    ON participations FOR INSERT
    WITH CHECK (auth.uid() = user_id);
