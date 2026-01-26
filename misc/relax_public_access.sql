-- Relax RLS directly for cards table (SELECT) to allow viewing drafts if you know the ID
-- This is necessary for Physical Card Entry Point to show status messages.
-- Content security is still maintained by the "card_contents" policy which enforces status='published'.

DROP POLICY IF EXISTS "Public cards are viewable by everyone" ON public.cards;

CREATE POLICY "Cards are viewable by everyone (Shell Only)" 
ON public.cards FOR SELECT 
TO public, anon, authenticated
USING (true);

-- NOTE: card_contents policy must remain strict:
-- DROP POLICY IF EXISTS "Public card contents are viewable by everyone" ON public.card_contents;
-- CREATE POLICY ... USING (EXISTS(SELECT 1 FROM cards WHERE id=card_contents.card_id AND status='published'))
-- This ensures that even though the card shell is visible, the details (SNS links etc) are hidden for drafts.
