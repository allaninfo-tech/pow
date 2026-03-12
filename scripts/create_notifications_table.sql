-- Create notifications table
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        text NOT NULL, -- e.g., 'new_challenge', 'score_ready', 'announcement'
    title       text NOT NULL,
    message     text,
    link        text,          -- optional URL to click through
    read        boolean DEFAULT false,
    created_at  timestamptz DEFAULT now()
);

-- Index for fast lookups by user and unread status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
    ON notifications(user_id, read, created_at DESC);

-- Enable Realtime for this table so users get live bell updates
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- RLS: only auth users can read/update their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);
