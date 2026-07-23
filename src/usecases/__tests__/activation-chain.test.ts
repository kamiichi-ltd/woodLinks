import {
    getPublicCardByIdUseCase,
    getCardBySlugUseCase,
    getCardUseCase,
} from '../card-usecase'
import { createMockSupabase } from './card-usecase.helpers'

// Activation チェーンの usecase レベル統合テスト。
// 物理 tap → /c → /p → claim → dashboard → /p の各分岐を駆動する usecase 出力を、
// 状態遷移に沿って検証する（live DB 不要。claim の遷移自体は activation.test.ts が担保）。

const publishedUnclaimed = {
    id: 'bulk-1',
    user_id: 'admin-1', // bulk 生成時は admin がプレースホルダ
    owner_id: null, // 未claim
    slug: 'bulk-abc',
    status: 'published', // published_unclaimed
    title: null,
    description: null,
    material_type: 'sugi',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null,
    wood_origin: null,
    wood_age: null,
    wood_story: null,
}

function mockWithCard(card: Record<string, unknown>, user: { id: string } | null) {
    return createMockSupabase({
        user,
        tables: {
            cards: { single: { data: card, error: null } },
            card_contents: { select: { data: [], error: null } },
            profiles: { single: { data: { avatar_url: null }, error: null } },
        },
    })
}

describe('Activation チェーン（usecase 統合）', () => {
    it('STEP /c: published_unclaimed は全status取得で解決し status=published（→ /p へ redirect）', async () => {
        const sb = mockWithCard(publishedUnclaimed, null)
        const card = await getPublicCardByIdUseCase(sb, 'bulk-1')
        expect(card).not.toBeNull()
        expect(card!.status).toBe('published')
    })

    it('STEP /p: published かつ owner_id=null → Activation 対象', async () => {
        const sb = mockWithCard(publishedUnclaimed, null)
        const card = await getCardBySlugUseCase(sb, 'bulk-abc')
        expect(card).not.toBeNull()
        expect(card!.owner_id).toBeNull()
    })

    it('STEP claim後 dashboard: user_id=購入者 なら getCardUseCase が返す（編集可能）', async () => {
        const claimed = { ...publishedUnclaimed, owner_id: 'buyer-1', user_id: 'buyer-1' }
        const sb = mockWithCard(claimed, { id: 'buyer-1' })
        const card = await getCardUseCase(sb, 'bulk-1')
        expect(card).not.toBeNull()
        expect(card!.id).toBe('bulk-1')
    })

    it('STEP claim後 /p: owner_id=購入者 → 公開プロフィール表示（再びActivationに戻らない）', async () => {
        const claimed = { ...publishedUnclaimed, owner_id: 'buyer-1', user_id: 'buyer-1' }
        const sb = mockWithCard(claimed, { id: 'buyer-1' })
        const card = await getCardBySlugUseCase(sb, 'bulk-abc')
        expect(card).not.toBeNull()
        expect(card!.owner_id).toBe('buyer-1')
    })
})
