-- 1. Table Definitions

-- Create profiles table (public profile info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  description TEXT,
  slug TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create card_contents table
CREATE TABLE IF NOT EXISTS public.card_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'sns_link', 'text', etc.
  content JSONB NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. RLS Policies

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Public cards are viewable by everyone
CREATE POLICY "Public cards are viewable by everyone" 
ON public.cards FOR SELECT 
USING (is_published = true);

-- Policy: Card contents are viewable if the parent card is published
CREATE POLICY "Public card contents are viewable by everyone" 
ON public.card_contents FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.cards 
    WHERE public.cards.id = public.card_contents.card_id 
    AND public.cards.is_published = true
  )
);

-- (Optional) Policy: Owners can view/edit their own data
CREATE POLICY "Users can manage their own cards" 
ON public.cards FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own card contents" 
ON public.card_contents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.cards 
    WHERE public.cards.id = public.card_contents.card_id 
    AND public.cards.user_id = auth.uid()
  )
);

-- 3. Test Data Seeding

-- Note: This requires a valid user_id. 
-- If you are running this in Supabase SQL Editor, you can use a placeholder or your actual UID.
-- Here we use a placeholder UUID.

INSERT INTO public.cards (id, user_id, title, description, slug, is_published)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', -- REPLACE THIS WITH YOUR AUTH.UID()
    '山田 太郎 (Yusuke Otani)', 
    '代表取締役 / CEO
株式会社 木材リンクス', 
    'test-profile', 
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "phone", "url": "tel:03-1234-5678"}',
    0
),
(
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "email", "url": "mailto:taro.yamada@woodlinks.example.com"}',
    1
),
(
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "website", "url": "https://woodlinks.example.com"}',
    2
),
(
    '11111111-1111-1111-1111-111111111111',
    'text',
    '{"text": "国産材を中心に取り扱っています。\n建築用材からDIY用まで、お気軽にご相談ください。"}',
    3
);
