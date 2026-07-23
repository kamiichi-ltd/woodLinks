# WoodLinks 限定検証 Release Runbook（非開発者向け）

最終確認は「スマホでNFCタップ → Activation → プロフィール確認」だけで済む状態にするための手順書。
コード改修は完了済み。残りは①環境変数 ②マイグレーション適用 ③法令ページ実値 ④実機確認。

---

## 0. 前提（人間が一度だけ行う）

### 0-1. 本番環境変数（Vercel の Environment Variables に設定）

| 変数 | 値 | 未設定だと壊れる場所 |
|---|---|---|
| `ADMIN_EMAIL` | 管理者のログインメール | `/admin/*` 全拒否＝生成・KPI不可 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase の service_role キー（**非公開**） | bulk生成・claim・リード取得が停止 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | 全DBアクセス不可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon キー | 認証・公開読取不可 |
| `NEXT_PUBLIC_BASE_URL` | 本番ドメイン（末尾スラッシュなし） | NFC/決済リンクが不正 |
| `STRIPE_SECRET_KEY` | `sk_live_...`（単品Stripe利用時のみ） | アプリ決済不可（請求書運用なら不要） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...`（単品Stripe利用時のみ） | 入金後の注文状態が自動更新されない |

> `SUPABASE_SERVICE_ROLE_KEY` に `NEXT_PUBLIC_` を**付けない**こと。

### 0-2. マイグレーション適用（Supabase SQL Editor）

`supabase/limited_release_hardening.sql` を貼り付けて1回実行する。
→ 公開読取が `status='published'` 基準に確定し、anon が公開カードを読めるようになる。

### 0-3. 法令ページの実値（コード内 `【要記入】` を差し替え）

`src/app/tokushoho/page.tsx` の事業者名・所在地・連絡先・引渡日数・返品方針・保証期間。
`src/app/privacy/page.tsx`・`src/app/terms/page.tsx` の問い合わせ窓口。

---

## 1. カード生成（admin）

1. `ADMIN_EMAIL` のアカウントでログイン → `/admin/cards`
2. 「Bulk Generate」をクリック
3. 枚数 = 10、素材 = sugi / hinoki / walnut（maple は選択肢に無い）
4. 生成モード = **「公開・未claim（検証用）」**（既定のまま）
5. CSV（ID / Material / URL）がダウンロードされる。URL列が `/c/[id]`

> 生成時点で `status='published'` / `owner_id=null` のため、手動の公開昇格は不要。

---

## 2. 公開到達の事前確認（重要）

ログアウトしたブラウザで `https://<本番>/c/<カードID>` を開く。
→ `/p/<slug>` に遷移し「Activate Your Card」画面が出れば **OK**。
→ 出ない（404/空）場合は 0-2 のマイグレーション適用を再確認（出荷を止める）。

---

## 3. NFC書込

各カードのNFCタグに CSV の URL（`/c/[id]`）を書き込む。
- 金属系塗料は使わない（電波を遮る）
- 書込後にスマホで読めることを確認

---

## 4. 実機タップ全数検品（人間）

iPhone と Android の両方で全カードをタップ。
- `/c` → `/p` → Activation画面 が出ることを1枚ずつ確認
- CSVのIDとカードをラベルで対応管理（取り違え防止）

---

## 5. 発送

- 同梱: 使い方カード（「タップ → ログイン → 有効化」）
- 配送先は受注台帳で管理（決済は住所を収集しないため）
- 法人ロットは請求書/振込（アプリ決済を使わない）

---

## 6. 顧客 Activation（顧客が行う）

1. カードをタップ → ログイン/新規登録
2. 「カードを有効化して開始」→ claim 成功
3. `owner_id` と `user_id` が顧客に付与され、`/dashboard/cards/[id]` へ
4. 顧客はそのまま自分のカード（タイトル・リンク等）を編集できる

---

## 7. KPI集計（admin）

Supabase SQL Editor で `supabase/kpi_queries.sql` を実行。
取得できるKPI: 発行数 / 公開数 / claim数 / Activation率 / view数 / contact_save数 / card_connections数 / カード別分析。

---

## トラブルシュート

| 症状 | 原因 | 対処 |
|---|---|---|
| `/c/[id]` が「Invalid Card」 | カードID誤り or RLS未適用 | IDを確認、0-2を適用 |
| `/c/[id]` が「Coming Soon」 | draft で生成された | 生成モードを「公開・未claim」にして再生成、または admin で公開へ |
| `/p/[slug]` が 404 | status≠published or RLS未適用 | 0-2を適用、status を確認 |
| Activationが出ず通常表示 | 既に claim 済み | owner_id を確認（別アカウントで claim 済み） |
| claim後ダッシュボードが空 | user_id 未移管（旧版） | 最新コードを確認（claim は user_id も付与する） |
| 「LINEで保存」が失敗 | LINE本番チャネル未設定 | vCard保存/メールログインで代替（検証では可） |

---

## Go / No-Go（5枚検証後）

- GO継続: Activation率 ≥ 80% / Contact保存率 ≥ 15% / 1枚粗利（実測）≥ ¥6,000
- 縮小: いずれかが基準未達だが需要の兆候あり
- 撤退: Activation率 < 50% または Contact保存率 < 5%
