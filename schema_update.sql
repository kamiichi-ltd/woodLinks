-- Add owner_id column to cards table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'owner_id') THEN
        ALTER TABLE cards ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Backfill owner_id with user_id for existing cards
UPDATE cards SET owner_id = user_id WHERE owner_id IS NULL;

-- Enable RLS (if not already enabled)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to claim unowned cards
-- They can UPDATE rows where owner_id IS NULL
-- The CHECK ensures they set themselves as the owner (and don't mess up other things ideally, but Postgres RLS CHECK applies to the NEW row)
DROP POLICY IF EXISTS "Allow claim unowned cards" ON cards;

CREATE POLICY "Allow claim unowned cards"
ON cards
FOR UPDATE
TO authenticated
USING (owner_id IS NULL)
WITH CHECK (owner_id = auth.uid());
