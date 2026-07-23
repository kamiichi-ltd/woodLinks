# woodLinks 公開前チェックリスト

> 単体テスト・usecase / middleware / analytics / slug UNIQUE は整理済み。
> 本チェックリストは手動確認・インフラ確認・公開判定に使う。

---

## 1. 手動確認

### 認証フロー
- [ ] 未ログイン状態で `/dashboard` にアクセス → `/login?next=/dashboard` にリダイレクトされる
- [ ] 未ログイン状態で `/admin/orders` にアクセス → `/login` にリダイレクトされる
- [ ] ログイン後 → `ADMIN_EMAIL` 一致なら `/admin/orders`、不一致なら `/dashboard` へ遷移する
- [ ] ログアウト後にブラウザバックしても保護ページが表示されない

### カード操作（dashboard）
- [ ] カード作成 → slug が自動生成される
- [ ] slug に大文字・スペース・記号を入力 → バリデーションエラーが表示される
- [ ] 既存 slug と同じ値を入力して更新 → "Slug already exists" エラーが表示される
- [ ] カード削除後にカード一覧から消える
- [ ] コンテンツ追加 → order_index 順に表示される
- [ ] コンテンツ並び替え → 保存後に順序が維持される

### 公開カードページ
- [ ] `/p/[slug]` — published カードが表示される
- [ ] `/p/[slug]` — draft カードにアクセス → 404 になる
- [ ] `/c/[id]` — NFC リダイレクト用。全ステータスのカードが表示される
- [ ] vCard ダウンロード（`/api/cards/[id]/vcard` と `/api/vcard/[slug]`）が正常にファイルを返す

### 管理画面
- [ ] `ADMIN_EMAIL` のアカウントのみ `/admin/*` にアクセスできる
- [ ] 一般ユーザーが `/admin/*` にアクセス → `/dashboard` にリダイレクトされる
- [ ] 在庫一覧・注文一覧が表示される

---

## 2. 本番環境変数確認

| 変数 | 用途 | 確認 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | [ ] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key（公開可） | [ ] |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバーサイド専用。クライアントに露出しないこと | [ ] |
| `NEXT_PUBLIC_BASE_URL` | 本番ドメイン（`https://...`、末尾スラッシュなし） | [ ] |
| `ADMIN_EMAIL` | 管理者メールアドレス。未設定だと `/admin` が全員拒否になる | [ ] |
| `STRIPE_SECRET_KEY` | 本番キー（`sk_live_...`）であること | [ ] |
| `STRIPE_WEBHOOK_SECRET` | Stripe ダッシュボードの本番 webhook と一致すること | [ ] |

- [ ] `SUPABASE_SERVICE_ROLE_KEY` が `NEXT_PUBLIC_` プレフィックスを持っていないこと
- [ ] Stripe キーが `sk_test_` / `whsec_test_` でないこと

---

## 3. DB 確認

- [ ] `cards.slug` に UNIQUE 制約が存在する（`init_database.sql` 参照）
- [ ] `card_contents` テーブルが存在し `order_index` カラムを持つ
- [ ] `analytics` テーブルが存在し `card_id` / `event_type` / `user_agent` カラムを持つ
- [ ] `profiles` テーブルが存在し `avatar_url` カラムを持つ
- [ ] Row Level Security (RLS) が全テーブルで有効になっている
- [ ] Supabase Auth のメール確認設定が本番要件に合っている（確認必須 or スキップ）
- [ ] `increment_view_count` RPC 関数が存在する（将来の復活に備えて保持）

---

## 4. エラー表示確認

- [ ] 存在しない slug `/p/not-found-slug` → 404 ページが表示される（500 にならない）
- [ ] 存在しない ID `/c/invalid-id` → 404 ページが表示される
- [ ] ネットワーク断状態でカード更新 → "Failed to update card" がユーザーに伝わる
- [ ] 未認証で Server Action を直接呼ぶ → `AuthError` が返り、クライアントがクラッシュしない
- [ ] Stripe webhook に不正なシグネチャを送る → 400 が返る（500 にならない）
- [ ] 本番ログ（Vercel / Supabase）に `console.error` が過剰に出力されていない

---

## 5. analytics 確認

> `cards.view_count` は廃止。view のソースオブトゥルースは `analytics` テーブル。

- [ ] `/p/[slug]` を表示したとき `analytics` テーブルに `event_type = 'view'` のレコードが挿入される
- [ ] `ViewCounter` コンポーネントが重複カウントしない（`hasIncremented.current` ガードが機能している）
- [ ] `/c/[id]` 経由のアクセスも analytics に記録される
- [ ] `cards.view_count` が更新されていないこと（廃止済み）
- [ ] 管理画面の analytics 表示が `analytics` テーブルを参照していること

---

## 6. ロールバック確認

- [ ] 直前のデプロイ済みコミット SHA を手元に記録している
- [ ] Vercel の "Instant Rollback" が使える状態か確認している
- [ ] DB マイグレーションを行った場合、DOWN マイグレーションが存在するか確認している
- [ ] Stripe webhook URL が旧バージョンにも対応できるか確認している
- [ ] ロールバック後に `ADMIN_EMAIL` 等の環境変数が旧バージョンと互換性があるか確認している

---

## 7. 公開判定基準

以下をすべて満たした場合のみ公開する。

| 条件 | 判定 |
|---|---|
| 単体テスト 10/10 passed | [ ] |
| `tsc --noEmit` エラーなし（既知の `client.ts` を除く） | [ ] |
| 環境変数 7 項目すべて本番値が設定済み | [ ] |
| DB UNIQUE 制約・RLS を本番 DB で確認済み | [ ] |
| `/p/[slug]`・`/c/[id]`・dashboard の手動確認完了 | [ ] |
| analytics テーブルへの書き込みを本番環境で確認済み | [ ] |
| ロールバック手順を確認済み | [ ] |

**上記のいずれか1つでも未チェックの場合は公開しない。**
