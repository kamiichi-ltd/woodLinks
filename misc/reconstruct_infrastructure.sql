-- 1) カード状態（Status）の定義
DO $$ BEGIN
    CREATE TYPE public.card_status AS ENUM (
        'draft',        -- 下書き
        'published',    -- 公開中
        'lost_reissued',-- 紛失・再発行済み（旧カード無効化）
        'disabled',     -- 停止
        'transferred'   -- 譲渡プロセス中
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2) cards テーブルの改修
ALTER TABLE public.cards 
  ADD COLUMN IF NOT EXISTS status public.card_status NOT NULL DEFAULT 'draft';

-- 既存データの移行（is_published を status に反映）
UPDATE public.cards 
SET status = CASE WHEN is_published = true THEN 'published'::public.card_status ELSE 'draft'::public.card_status END;

-- 3) ライフサイクルログ（再発行履歴）テーブルの新設
CREATE TABLE IF NOT EXISTS public.card_lifecycle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'created', 'published', 'lost_reported', 'reissued' 等
    reason TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) 制約の強化（事故防止）
-- Slugの一意性強制
CREATE UNIQUE INDEX IF NOT EXISTS cards_slug_unique ON public.cards (slug);

-- 表示順の重複禁止（D&D時の事故防止）
-- ※DEFERRABLE INITIALLY DEFERRED をつけることで、一括更新中の「一時的な重複」を許容し、トランザクション終了時にチェックします
ALTER TABLE public.card_contents
  DROP CONSTRAINT IF EXISTS card_order_unique;

ALTER TABLE public.card_contents
  ADD CONSTRAINT card_order_unique UNIQUE (card_id, order_index)
  DEFERRABLE INITIALLY DEFERRED;

-- 5) RLS（セキュリティ）の更新
-- ※ status = 'published' の場合のみ誰でも見れるように変更
DROP POLICY IF EXISTS "Public cards are viewable by everyone" ON public.cards;
CREATE POLICY "Public cards are viewable by everyone" 
ON public.cards FOR SELECT 
TO public, anon, authenticated
USING (status = 'published');

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
