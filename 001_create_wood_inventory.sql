-- Create wood_inventory table
CREATE TABLE IF NOT EXISTS public.wood_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Core Identification
  nfc_slug TEXT UNIQUE NOT NULL, -- URL compatible slug
  name TEXT NOT NULL,           -- e.g. "Yoshino Cedar #100"
  
  -- Wood Attributes
  species TEXT NOT NULL,        -- Sugi, Hinoki, Walnut, etc.
  grade TEXT,                   -- A, B, Knotty, etc.
  
  -- Dimensions & Specs (Stored as structured JSON or separate columns?)
  -- Using JSONB for dimensions to be flexible (length, width, thickness)
  dimensions JSONB NOT NULL DEFAULT '{"length": 0, "width": 0, "thickness": 0}',
  
  -- Commerce
  price INTEGER DEFAULT 0 NOT NULL,
  stock INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'available' NOT NULL, -- available, sold, reserved
  
  -- Content
  story TEXT,                   -- The story behind the wood
  images TEXT[],                -- Array of image URLs
  
  -- Metadata
  origin TEXT,                  -- Where it came from
  age TEXT                      -- Age of the tree/wood
);

-- Enable RLS
ALTER TABLE public.wood_inventory ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can view available wood
DROP POLICY IF EXISTS "Public can view available wood" ON public.wood_inventory;
CREATE POLICY "Public can view available wood" 
ON public.wood_inventory FOR SELECT 
TO public, anon, authenticated
USING (true); -- Publicly visible for now, or restrict to status='available' if desired

-- Admins (authenticated) can do everything
-- Note: In a real app, restrict this to specific admin roles. For now, all auth users = admin.
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.wood_inventory;
CREATE POLICY "Admins can manage inventory" 
ON public.wood_inventory FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
