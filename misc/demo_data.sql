-- Demo Data Creation Script
-- Usage: Run this in Supabase SQL Editor to create a demo user and card.

-- 1. Create a demo user in auth.users (if not exists)
-- Note: inserting into auth.users directly is generally reserved for internal/seed use. 
-- For safety in production, we should map this to an existing user id or create via API.
-- However, for a pure SQL demo setup:

DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Check if user exists, else create
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@woodlinks.com';
  
  IF demo_user_id IS NULL THEN
    demo_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      demo_user_id,
      'demo@woodlinks.com',
      crypt('demo1234', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    
    -- Insert profile
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (demo_user_id, 'Demo User', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop');
  END IF;

  -- 2. Create Demo Card
  INSERT INTO public.cards (user_id, slug, title, description, is_published, theme)
  VALUES (
    demo_user_id,
    'demo',
    'WoodLinks Demo',
    'これはWoodLinksのデモ名刺です。\n木の温もりとデジタル技術の融合を体験してください。',
    true,
    'wood'
  )
  ON CONFLICT (slug) DO UPDATE
  SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = true;

  -- 3. Add Content to Card
  DECLARE
    card_id_var uuid;
  BEGIN
    SELECT id INTO card_id_var FROM public.cards WHERE slug = 'demo';
    
    -- Clear existing contents to avoid duplicates on rerun
    DELETE FROM public.card_contents WHERE card_id = card_id_var;

    INSERT INTO public.card_contents (card_id, type, content, order_index)
    VALUES
    (card_id_var, 'text', '{"text": "森と都市をつなぐ、新しいコミュニケーションのかたち。"}', 0),
    (card_id_var, 'sns_link', '{"platform": "website", "url": "https://woodlinks.com"}', 1),
    (card_id_var, 'sns_link', '{"platform": "instagram", "url": "https://instagram.com"}', 2),
    (card_id_var, 'sns_link', '{"platform": "email", "url": "mailto:hello@woodlinks.com"}', 3);
  END;
END $$;
