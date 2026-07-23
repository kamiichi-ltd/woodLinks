-- ============================================================================
-- WoodLinks 限定検証ハードニング マイグレーション
-- 目的: status を公開状態の唯一の正とし、anon が published カードを読める状態を確定する。
-- 安全性: 冪等（IF EXISTS / IF NOT EXISTS / DROP POLICY IF EXISTS）。既存の正常フローを壊さない。
-- 実行: Supabase SQL Editor で本ファイルを1回実行する。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. cards: アプリが依存するカラムを冪等に保証する
--    (init_database.sql は status / owner_id / material_type を作らない。後続migration依存を解消)
-- ----------------------------------------------------------------------------
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS material_type TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS wood_origin TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS wood_age TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS wood_story TEXT;

-- is_published は幽霊カラム（アプリ未参照）。残存していても INSERT を壊さないよう DEFAULT を保証する。
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.cards ALTER COLUMN is_published SET DEFAULT false;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. cards 公開SELECT: status = 'published' を正とする（is_published 基準から統一）
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public cards are viewable by everyone" ON public.cards;
CREATE POLICY "Public cards are viewable by everyone"
ON public.cards FOR SELECT
TO public, anon, authenticated
USING (status = 'published');

-- 所有者は自分のカードを管理できる（user_id 基準）。claim 後は user_id = 購入者になる。
DROP POLICY IF EXISTS "Users can manage their own cards" ON public.cards;
CREATE POLICY "Users can manage their own cards"
ON public.cards FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. card_contents 公開SELECT: 親カードが published のとき可視
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public card contents are viewable by everyone" ON public.card_contents;
CREATE POLICY "Public card contents are viewable by everyone"
ON public.card_contents FOR SELECT
TO public, anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards
    WHERE public.cards.id = public.card_contents.card_id
      AND public.cards.status = 'published'
  )
);

DROP POLICY IF EXISTS "Users can manage their own card contents" ON public.card_contents;
CREATE POLICY "Users can manage their own card contents"
ON public.card_contents FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cards
    WHERE public.cards.id = public.card_contents.card_id
      AND public.cards.user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- 4. profiles 公開SELECT: /p で avatar / 表示名を読むために必要
--    (注意: email 列も同テーブル。列単位制限は RLS では不可。privacy policy に明記すること)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable"
ON public.profiles FOR SELECT
TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 5. analytics 公開INSERT: guest の view/contact_save/link_click 記録に必要
--    (テーブルが存在する場合のみ。無い場合は misc/analytics_setup.sql を先に流す)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'analytics') THEN
    EXECUTE 'ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics';
    EXECUTE 'CREATE POLICY "Anyone can insert analytics" ON public.analytics
             FOR INSERT TO public, anon, authenticated WITH CHECK (true)';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. card_connections: 認証ユーザーが自分の保存を作成 / カード所有者が閲覧
--    (owner_id または user_id 所有を許可。claim 後は両方が購入者になる)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'card_connections') THEN
    EXECUTE 'ALTER TABLE public.card_connections ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own card connections" ON public.card_connections';
    EXECUTE 'CREATE POLICY "Users can insert their own card connections"
             ON public.card_connections FOR INSERT TO authenticated
             WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Card owners can view their connections" ON public.card_connections';
    EXECUTE 'CREATE POLICY "Card owners can view their connections"
             ON public.card_connections FOR SELECT TO authenticated
             USING (EXISTS (SELECT 1 FROM public.cards
                            WHERE public.cards.id = public.card_connections.card_id
                              AND (public.cards.user_id = auth.uid()
                                   OR public.cards.owner_id = auth.uid())))';
  END IF;
END $$;

-- ============================================================================
-- 検証: 以下が anon ロールで通ること（Supabase SQL Editor の "Run as" や匿名キーで確認）
--   SELECT id, slug, status FROM public.cards WHERE status = 'published';  -- 行が返る
--   SELECT id FROM public.cards WHERE status = 'draft';                     -- 0 行（anon は draft 不可視）
-- ============================================================================
