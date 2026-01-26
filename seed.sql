-- Insert a test user (profile) - assumes auth.users link is loose or ignored for manual seed, 
-- or you might need to insert into auth.users first if foreign key constraints are strict. 
-- For Supabase local dev, usually we insert into public.profiles directly if trigger handles it, 
-- or we just insert into cards/contents skipping profile strictness if possible, but cards.user_id usually references auth.users.
-- Since we cannot easily seed auth.users with a known UUID without knowing the internal auth schema or using Supabase functions,
-- wE WILL ASSUME the user already exists or we use a placeholder UUID that matches your current login.
-- **REPLACE 'YOUR_USER_ID' WITH YOUR ACTUAL SUPABASE USER ID FROM AUTH TAB**

-- Example using a placeholder UUID (You MUST Update this before running if FK exists)
-- If you just want to see the UI and your table allows arbitrary UUIDs or you are testing:
-- SET session_replication_role = 'replica'; -- Only works if you are superuser to bypass FK triggers tentatively

-- 1. Insert Card
INSERT INTO public.cards (id, user_id, title, description, slug, is_published, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', -- REPLACE WITH YOUR USER ID
    '山田 太郎 (Yusuke Otani)', 
    '代表取締役 / CEO
株式会社 木材リンクス', 
    'test-profile', 
    true, 
    now(), 
    now()
);

-- 2. Insert Card Contents (SNS, Phone, Email, Text)

-- Phone
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "phone", "url": "tel:03-1234-5678"}',
    0
);

-- Email
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "email", "url": "mailto:taro.yamada@woodlinks.example.com"}',
    1
);

-- Website
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "website", "url": "https://woodlinks.example.com"}',
    2
);

-- Twitter/X
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "twitter", "url": "https://twitter.com/woodlinks_jp"}',
    3
);

-- Free Text (Greeting)
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'text',
    '{"text": "国産材を中心に取り扱っています。\n建築用材からDIY用まで、お気軽にご相談ください。"}',
    4
);

-- Instagram
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sns_link',
    '{"platform": "instagram", "url": "https://instagram.com/woodlinks_official"}',
    5
);
