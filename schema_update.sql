-- Add Wood Traceability Columns to 'cards' table

ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS wood_origin text,
ADD COLUMN IF NOT EXISTS wood_age text,
ADD COLUMN IF NOT EXISTS wood_story text;

-- Add comments for documentation
COMMENT ON COLUMN public.cards.wood_origin IS '産地 (例: 奈良県吉野)';
COMMENT ON COLUMN public.cards.wood_age IS '樹齢 (例: 100年以上)';
COMMENT ON COLUMN public.cards.wood_story IS '木材に関するストーリー';
