-- Safe Status Migration SQL
-- 1. Ensure status column exists and has defaults
ALTER TABLE public.cards 
  ADD COLUMN IF NOT EXISTS status public.card_status NOT NULL DEFAULT 'draft';

-- 2. Populate null status with 'draft'
UPDATE public.cards
SET status = 'draft'
WHERE status IS NULL;

-- 3. Migrate from is_published if column exists (Safe Update)
--    Only update if current status is 'draft' OR NULL, to preserve any manual updates to other statuses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'is_published') THEN
        UPDATE public.cards 
        SET status = 'published'
        WHERE is_published = true AND (status = 'draft' OR status IS NULL);
    END IF;
END $$;
