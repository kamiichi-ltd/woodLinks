-- 1. Reset Cards (Unclaim and Unpublish)
UPDATE cards
SET 
  owner_id = NULL,
  is_published = FALSE,
  title = 'Test Card',
  updated_at = NOW();

-- 2. Fix RLS for Admin Update
-- Allow the specified admin to UPDATE any card, regardless of owner
DROP POLICY IF EXISTS "Admins can update all cards" ON cards;

CREATE POLICY "Admins can update all cards"
ON cards
FOR UPDATE
TO authenticated
USING (
  auth.uid() = 'YOUR_ADMIN_UUID_HERE'::uuid
);

-- 3. Cleanup Test Users (Profiles)
-- Keep only the admin user
DELETE FROM profiles
WHERE id != 'YOUR_ADMIN_UUID_HERE'::uuid;

-- Optional: Verify results
SELECT id, title, is_published, owner_id FROM cards;
