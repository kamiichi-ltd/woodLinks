-- Insert a test user (profile) - assumes auth.users link is loose or ignored for manual seed
-- **REPLACE 'YOUR_USER_ID' WITH YOUR ACTUAL SUPABASE USER ID FROM AUTH TAB**

-- 1. Insert Card
INSERT INTO public.cards (id, user_id, title, description, slug, is_published, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000000', -- REPLACE WITH YOUR USER ID of the currently logged in user
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
