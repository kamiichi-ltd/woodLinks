-- Lead capture table for saved public cards
CREATE TABLE IF NOT EXISTS public.card_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_connections_card_id
  ON public.card_connections(card_id);

CREATE INDEX IF NOT EXISTS idx_card_connections_user_id
  ON public.card_connections(user_id);

ALTER TABLE public.card_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own card connections" ON public.card_connections;
CREATE POLICY "Users can insert their own card connections"
ON public.card_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Card owners can view their connections" ON public.card_connections;
CREATE POLICY "Card owners can view their connections"
ON public.card_connections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.cards
    WHERE public.cards.id = public.card_connections.card_id
      AND (
        public.cards.user_id = auth.uid()
        OR public.cards.owner_id = auth.uid()
      )
  )
);
