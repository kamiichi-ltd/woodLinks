-- Enable RLS on analytics table
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon and authenticated) to insert events
-- We want public users to view cards and log events
DROP POLICY IF EXISTS "Allow public insert to analytics" ON analytics;

CREATE POLICY "Allow public insert to analytics"
ON analytics
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins/owners to view analytics (Select)
-- For simplicity, allow authenticated users to SELECT (or restrict to owner via card_id join?)
-- Currently getCardAnalytics runs with adminDbClient?
-- No, getCardAnalytics uses createClient() (Standard).
-- So we need a SELECT policy.
-- Policy: Users can select analytics for cards they own.
-- This requires a join or subquery.
-- Or just allow service role (admin) which bypasses RLS?
-- getCardAnalytics uses `supabase` (standard).
-- If we want standard users to see dashboard, we need SELECT policy.

DROP POLICY IF EXISTS "Allow owners to view their card analytics" ON analytics;

CREATE POLICY "Allow owners to view their card analytics"
ON analytics
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from cards
    where cards.id = analytics.card_id
    and cards.owner_id = auth.uid()
  )
);
