-- Add view_count to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;
