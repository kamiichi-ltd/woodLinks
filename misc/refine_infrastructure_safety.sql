-- 1) RLS: Owner Policy (Review & Add)
-- Owners can view/edit their cards regardless of status
DROP POLICY IF EXISTS "Owners can view their own cards" ON public.cards;
CREATE POLICY "Owners can view their own cards" 
ON public.cards FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update their own cards" ON public.cards;
CREATE POLICY "Owners can update their own cards" 
ON public.cards FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their own cards" ON public.cards;
CREATE POLICY "Owners can delete their own cards" 
ON public.cards FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can insert their own cards" ON public.cards;
CREATE POLICY "Owners can insert their own cards" 
ON public.cards FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Owners can view/edit their card contents regardless of status
DROP POLICY IF EXISTS "Owners can view their own card contents" ON public.card_contents;
CREATE POLICY "Owners can view their own card contents" 
ON public.card_contents FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards 
    WHERE public.cards.id = public.card_contents.card_id 
    AND public.cards.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can edit their own card contents" ON public.card_contents;
CREATE POLICY "Owners can edit their own card contents" 
ON public.card_contents FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards 
    WHERE public.cards.id = public.card_contents.card_id 
    AND public.cards.user_id = auth.uid()
  )
);

-- 2) Migration Safety
-- Only update if status is 'draft' (default) to avoid overwriting manually changed statuses (e.g. disabled)
-- Assuming is_published column still exists for migration purposes
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'is_published') THEN
        UPDATE public.cards 
        SET status = 'published'
        WHERE is_published = true AND status = 'draft';
    END IF;
END $$;

-- 3) View Count: ID-based RPC
-- Drop old slug-based function if conflicts, or create new one
CREATE OR REPLACE FUNCTION public.increment_view_count(card_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cards
  SET view_count = view_count + 1
  WHERE id = card_id;
END;
$$;
