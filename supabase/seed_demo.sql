-- Insert Demo Card
INSERT INTO public.cards (id, user_id, title, description, slug, is_published, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222', -- Explicit ID for demo card
    '00000000-0000-0000-0000-000000000000', -- Dummy User ID (must exist in auth.users from init_database.sql/seed.sql)
    'デモ 太郎 (Demo Taro)',
    'これはデモ用のカードです。\nLanding Pageの「デモを見る」ボタンからアクセスされました。',
    'demo',
    true,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Insert Demo Card Contents
-- Phone
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'sns_link',
    '{"platform": "phone", "url": "tel:090-1234-5678"}',
    0
);

-- Website
INSERT INTO public.card_contents (card_id, type, content, order_index)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'sns_link',
    '{"platform": "website", "url": "https://example.com"}',
    1
);
