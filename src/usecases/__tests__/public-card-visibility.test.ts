import { getCardBySlugUseCase, getPublicCardByIdUseCase } from '../card-usecase'
import { createMockSupabase } from './card-usecase.helpers'

// 限定検証チェーンの「使い始め」経路を保証するテスト。
// - /p/[slug] (getCardBySlugUseCase) は published のみ取得する
// - /c/[id]   (getPublicCardByIdUseCase) は全 status を取得する（NFC 入口）
// この2点が、bulk生成(draft)カードを published に昇格してから出荷する運用前提の根拠になる。

const publishedCard = {
    id: 'card-1',
    user_id: 'user-1',
    slug: 'my-card',
    title: 'My Card',
    description: null,
    status: 'published',
    material_type: 'sugi',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null,
    wood_origin: null,
    wood_age: null,
    wood_story: null,
    owner_id: 'owner-1',
}

describe('getCardBySlugUseCase — 公開ページ(/p/[slug])の取得条件', () => {
    it("status='published' で絞り込む（draft は公開取得されない）", async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { single: { data: publishedCard, error: null } },
                card_contents: { select: { data: [], error: null } },
                profiles: { single: { data: { avatar_url: null }, error: null } },
            },
        })

        const result = await getCardBySlugUseCase(supabase, 'my-card')

        expect(result).not.toBeNull()
        const fromMock = supabase.from as jest.Mock
        const cardsChain = fromMock.mock.results[0].value
        expect(cardsChain.eq).toHaveBeenCalledWith('slug', 'my-card')
        expect(cardsChain.eq).toHaveBeenCalledWith('status', 'published')
    })
})

describe('getPublicCardByIdUseCase — NFC入口(/c/[id])の取得条件', () => {
    it('status フィルタを適用しない（draft も含め全 status を解決する）', async () => {
        const draftCard = { ...publishedCard, status: 'draft', owner_id: null }
        const supabase = createMockSupabase({
            user: null,
            tables: {
                cards: { single: { data: draftCard, error: null } },
                card_contents: { select: { data: [], error: null } },
                profiles: { single: { data: { avatar_url: null }, error: null } },
            },
        })

        const result = await getPublicCardByIdUseCase(supabase, 'card-1')

        expect(result).not.toBeNull()
        expect(result!.status).toBe('draft')

        const fromMock = supabase.from as jest.Mock
        const cardsChain = fromMock.mock.results[0].value
        expect(cardsChain.eq).toHaveBeenCalledWith('id', 'card-1')

        const statusFilterCalls = (cardsChain.eq as jest.Mock).mock.calls.filter(
            (call: unknown[]) => call[0] === 'status',
        )
        expect(statusFilterCalls).toHaveLength(0)
    })
})
