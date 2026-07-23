# card-usecase

woodLinks の名刺カード機能に関するユースケース層。
Supabase クライアントを受け取り、認証・認可・バリデーション・DB 操作を担う。

---

## ユースケース一覧

### Read

| 関数 | 責務 |
|---|---|
| `getCardsUseCase` | 認証済みユーザー自身のカード一覧を取得する |
| `getCardUseCase` | 指定 ID のカードを取得する（コンテンツ含む、自分のカードのみ） |
| `getCardBySlugUseCase` | slug でカードを取得する（published のみ、公開用） |
| `getPublicCardByIdUseCase` | ID でカードを取得する（全ステータス対象、NFC リダイレクト / 管理用） |
| `incrementViewCountUseCase` | 閲覧数をインクリメントする（RPC 経由、認証不要）※現在未使用、後述 |

### Mutation

| 関数 | 責務 |
|---|---|
| `createCardUseCase` | カードを作成する（title から slug を自動生成） |
| `updateCardUseCase` | カードのメタデータを更新する（slug / title / status / material_type 等） |
| `deleteCardUseCase` | カードを削除する |
| `addCardContentUseCase` | カードにコンテンツを追加する（order_index を自動採番） |
| `deleteCardContentUseCase` | カードのコンテンツを削除する |
| `reorderCardContentsUseCase` | カードのコンテンツ順序を一括更新する |

---

## エラー仕様

### `AuthError`

```ts
class AuthError extends Error { name = 'AuthError' }
```

- `supabase.auth.getUser()` が未認証を返したとき
- 対象: 全 mutation usecase（`requireAuth` 経由）
- read 系（`getCardUseCase` 等）は throw せず `null` / `[]` を返す（非対称、後述）

### `PermissionError`

```ts
class PermissionError extends Error { name = 'PermissionError' }
```

- 指定 cardId が認証ユーザーの所有でないとき
- 対象: `updateCardUseCase` / `addCardContentUseCase` / `deleteCardContentUseCase` / `reorderCardContentsUseCase`
- `assertCardOwnership` により `cards.user_id = 認証ユーザー ID` で確認

### `Error('Slug already exists')`

- `updateCardUseCase`: `assertSlugUnique` が重複を検出したとき（アプリレベルチェック）
- `updateCardUseCase`: DB UNIQUE 制約違反（`error.code === '23505'`）のとき
- `createCardUseCase`: DB UNIQUE 制約違反（`error.code === '23505'`）のとき

### `Error('Invalid slug format')`

- `updateCardUseCase`: slug が `^[a-z0-9]+(?:-[a-z0-9]+)*$` にマッチしないとき

### `Error('Failed to ...')`

- 上記以外の DB エラー（ネットワーク障害・権限エラー等）
- `Failed to create card` / `Failed to update card` / `Failed to delete card` 等

---

## テストで保証されている内容（Guarantee）

| ケース | 内容 |
|---|---|
| ライフサイクル | create → get → delete → get の状態遷移が正しく動く |
| 未認証アクセス | `getCardUseCase` に未認証を渡すと `null` を返す |
| ownership 境界 | 他ユーザーのカードを `updateCardUseCase` で更新しようとすると `PermissionError` を throw する |
| order_index 採番 | 既存コンテンツが N 件のとき `addCardContentUseCase` は `order_index = N` で insert する |
| card_id 絞り込み | `reorderCardContentsUseCase` は `eq('card_id', cardId)` で他カードのコンテンツを保護する |
| slug format バリデーション | 大文字・記号を含む slug で `updateCardUseCase` が `Invalid slug format` を throw する |
| slug 重複チェック | 既存 slug を指定した `updateCardUseCase` が `Slug already exists` を throw する |

---

## 既知の制限（Limitation）

### slug TOCTOU 競合（B-2-1）

`assertSlugUnique` は `count = 0` を確認してから UPDATE するが、複数リクエストが同時に `count = 0` を読んだ場合、両方がバリデーションを通過しうる。最終的には `cards.slug` の DB UNIQUE 制約が後者の INSERT/UPDATE を弾く（`error.code === '23505'`）。

- アプリレベルの slug チェックは "早期エラー" として機能するが、最終防衛線は DB 制約
- テストで再現済み

### order_index TOCTOU 競合（B-3-1 / B-3-2）

`resolveNextOrderIndex` は `MAX(order_index)` を読んでから `+ 1` を計算して insert するが、複数リクエストが同時に同じ最大値を読んだ場合、全件が同じ `order_index` で insert されうる。

- order_index には UNIQUE 制約がないため DB レベルでは弾かれない
- UI 側で並列追加は発生しにくいが、プログラム的に呼ぶと重複する
- テストで再現済み

### `reorderCardContentsUseCase` の非原子的更新

`Promise.all` で複数の `UPDATE` を並列実行するが、トランザクションを使っていない。途中の UPDATE が失敗すると一部だけ更新された中間状態で終わる。クライアントが再試行しても整合性は保証されない。

---

## 変更履歴

### 2026-04-09

**`src/services/card-service.ts` を削除**
全関数が `card-usecase.ts` に移行済みであることを確認し、397 行の dead code を削除した。インポート参照なし・型エラーなしを tsc で確認済み。

**view count のソースオブトゥルースを analytics に統一**
`ViewCounter` コンポーネントが `incrementViewCount`（`cards.view_count` RPC）と `logAnalyticsEvent`（analytics テーブル）を二重呼び出ししていた。analytics テーブルをソースオブトゥルースとし、`incrementViewCount` の呼び出しを削除した。

- 削除: `view-counter.tsx` の `incrementViewCount` 呼び出しと import
- 削除: `app/actions/cards.ts` の `incrementViewCount` action と `incrementViewCountUseCase` import

**`incrementViewCountUseCase` の保留**
`card-usecase.ts` 内の `incrementViewCountUseCase` 本体は現在呼び出し元がないが、将来 Supabase RPC 経由でカウントを復活させる際の参照として残している。不要と判断した時点で削除する。

---

## 今後の改善余地

### 優先度: 高

**read 系の AuthError 統一**
`getCardUseCase` / `getCardsUseCase` は未認証時に `null` / `[]` を返すが、mutation 系は `AuthError` を throw する。現在は middleware が認証を保証しているため実害はないが、usecase を直接呼ぶ文脈（テスト・バッチ・CLI）での挙動が予測しにくい。middleware の auth 保証が確立したタイミングで、read 系も `AuthError` に統一する。

### 優先度: 中

**`reorderCardContentsUseCase` のトランザクション化**
Supabase RPC または DB トランザクションに移行して原子性を確保する。現状は "部分更新の可能性あり" としてコード内にコメントを残している。

**`from().mock.results[n]` 依存テストの改善**
`addCardContentUseCase` の一部テストは `fromMock.mock.results[2].value` のように呼び出し順でチェーンを特定している。usecase 内部の `from()` 呼び出し順が変わると壊れる。戻り値や thrown error で検証する形に書き直すと耐性が上がる。

### 優先度: 低

**`resolveSlugForUpdate` の整理**
"title を更新したとき、slug が未設定なら自動生成する" というパスだが、slug は card 作成時に必ず生成されるため実質 dead path。削除するか、明示的な仕様としてテストを追加するかを決める。

**`generateUniqueSlug` のリトライ**
suffix 衝突時のリトライがない。現状は DB UNIQUE 制約が最終防衛線だが、衝突時に `createCardUseCase` が `Slug already exists` を返すだけで再試行はしない。ユーザー数が増えた場合に対処する。
