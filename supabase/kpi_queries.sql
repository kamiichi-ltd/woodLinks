-- ============================================================================
-- WoodLinks 限定検証 KPI 集計クエリ
-- 使い方: Supabase SQL Editor で実行。検証ロットの slug は 'bulk-%'。
--         単品 dashboard 作成カードを含めたい場合は WHERE を調整する。
-- ============================================================================

-- 1. 発行・公開・claim・Activation率（ロット全体のサマリ）
SELECT
  count(*)                                         AS issued,        -- 発行枚数
  count(*) FILTER (WHERE status = 'published')     AS published,     -- published枚数
  count(*) FILTER (WHERE owner_id IS NOT NULL)      AS claimed,       -- claimed枚数
  round(
    100.0 * count(*) FILTER (WHERE owner_id IS NOT NULL)
    / NULLIF(count(*), 0), 1
  )                                                AS activation_rate -- Activation率(%)
FROM public.cards
WHERE slug LIKE 'bulk-%';

-- 2. イベント別の総数（view / contact_save / link_click）
SELECT event_type, count(*) AS events
FROM public.analytics
WHERE card_id IN (SELECT id FROM public.cards WHERE slug LIKE 'bulk-%')
GROUP BY event_type
ORDER BY event_type;

-- 3. card_connections（LINE/ログイン保存）総数
SELECT count(*) AS card_connections
FROM public.card_connections
WHERE card_id IN (SELECT id FROM public.cards WHERE slug LIKE 'bulk-%');

-- 4. card別 閲覧数・保存数（vCard保存 + connection保存）
SELECT
  c.id,
  c.slug,
  c.material_type,
  c.status,
  (c.owner_id IS NOT NULL)                                              AS claimed,
  count(a.*) FILTER (WHERE a.event_type = 'view')                       AS views,
  count(a.*) FILTER (WHERE a.event_type = 'contact_save')               AS vcard_saves,
  (SELECT count(*) FROM public.card_connections cc WHERE cc.card_id = c.id) AS connection_saves
FROM public.cards c
LEFT JOIN public.analytics a ON a.card_id = c.id
WHERE c.slug LIKE 'bulk-%'
GROUP BY c.id, c.slug, c.material_type, c.status, c.owner_id
ORDER BY views DESC;

-- 5. Contact保存率（保存合計 / view）= 物珍しさで終わらないかの分水嶺
SELECT
  count(*) FILTER (WHERE event_type = 'view')                          AS views,
  count(*) FILTER (WHERE event_type = 'contact_save')                  AS vcard_saves,
  (SELECT count(*) FROM public.card_connections
     WHERE card_id IN (SELECT id FROM public.cards WHERE slug LIKE 'bulk-%')) AS connection_saves,
  round(
    100.0 * (
      count(*) FILTER (WHERE event_type = 'contact_save')
      + (SELECT count(*) FROM public.card_connections
           WHERE card_id IN (SELECT id FROM public.cards WHERE slug LIKE 'bulk-%'))
    ) / NULLIF(count(*) FILTER (WHERE event_type = 'view'), 0), 1
  )                                                                    AS contact_save_rate
FROM public.analytics
WHERE card_id IN (SELECT id FROM public.cards WHERE slug LIKE 'bulk-%');
