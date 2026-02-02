-- RLS Policy for Orders Table
-- Allow users to view their own orders

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Also ensure INSERT is allowed (usually handled by RPC "SECURITY DEFINER", but good to have if using client directly)
-- For now, RPC handles INSERT, so SELECT is the main missing piece for Server Actions doing "supabase.auth.getUser()" then select.
