-- Add views column
ALTER TABLE public.wood_inventory 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0 NOT NULL;

-- Create atomic increment function
CREATE OR REPLACE FUNCTION increment_wood_view(slug_input TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (postgres/admin) to bypass RLS if needed, though public has read.
AS $$
BEGIN
  UPDATE public.wood_inventory
  SET views = views + 1
  WHERE nfc_slug = slug_input;
END;
$$;
