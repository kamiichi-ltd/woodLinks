-- Add owner_id column to cards table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'owner_id') THEN
        ALTER TABLE cards ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Backfill owner_id with user_id for existing cards (Assume existing cards are owned by their creator)
UPDATE cards SET owner_id = user_id WHERE owner_id IS NULL;

-- Note: We do NOT set NOT NULL constraint because future inventory cards will have owner_id = NULL
