-- Create challenge_comments table
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS challenge_comments (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content     text NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- Index for fast lookups by challenge and ordering
CREATE INDEX IF NOT EXISTS idx_challenge_comments_challenge_created
    ON challenge_comments(challenge_id, created_at DESC);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_comments;

-- RLS: anyone can read, only auth users can insert their own comments
ALTER TABLE challenge_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
    ON challenge_comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments"
    ON challenge_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON challenge_comments FOR DELETE
    USING (auth.uid() = user_id);
