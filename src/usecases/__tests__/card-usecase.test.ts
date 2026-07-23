import {
    updateCardUseCase,
    getCardUseCase,
    addCardContentUseCase,
    reorderCardContentsUseCase,
    createCardUseCase,
    deleteCardUseCase,
    PermissionError,
} from '../card-usecase'
import { createMockSupabase } from './card-usecase.helpers'

const baseCardData = {
    id: 'card-1',
    user_id: 'user-1',
    slug: 'my-card',
    title: 'My Card',
    description: null,
    status: 'draft',
    avatar_url: null,
    material_type: null,
    is_public: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: null,
    wood_origin: null,
    wood_age: null,
    wood_story: null,
    owner_id: null,
}

describe('カードのライフサイクル', () => {
    it('delete 後に getCardUseCase が null を返す', async () => {
        // Phase 1: create — slug 競合なし(count=0)、insert 結果を返す
        const createSupabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: {
                    count: 0,
                    single: { data: baseCardData, error: null },
                },
            },
        })
        const created = await createCardUseCase(createSupabase, 'My Card')
        expect(created.id).toBe('card-1')

        // Phase 2: get（削除前）— カードが取得できる
        const getBeforeSupabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { single: { data: baseCardData, error: null } },
                card_contents: { select: { data: [], error: null } },
            },
        })
        const before = await getCardUseCase(getBeforeSupabase, 'card-1')
        expect(before).not.toBeNull()

        // Phase 3: delete — エラーなしで完了する
        const deleteSupabase = createMockSupabase({
            user: { id: 'user-1' },
        })
        await deleteCardUseCase(deleteSupabase, 'card-1')

        // Phase 4: get（削除後）— DB が not found を返し null になる
        const getAfterSupabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { single: { data: null, error: { message: 'not found' } } },
            },
        })
        const after = await getCardUseCase(getAfterSupabase, 'card-1')
        expect(after).toBeNull()
    })
})

describe('getCardUseCase', () => {
    it('未認証ユーザーの場合 null を返す', async () => {
        const supabase = createMockSupabase({ user: null })

        const result = await getCardUseCase(supabase, 'card-1')

        expect(result).toBeNull()
    })

    it('自分のカードを取得できる', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: {
                    single: {
                        data: {
                            id: 'card-1',
                            user_id: 'user-1',
                            slug: 'my-card',
                            title: 'My Card',
                            description: null,
                            status: 'draft',
                            avatar_url: null,
                            material_type: null,
                            is_public: false,
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: null,
                            wood_origin: null,
                            wood_age: null,
                            wood_story: null,
                            owner_id: null,
                        },
                        error: null,
                    },
                },
                card_contents: {
                    select: {
                        data: [
                            { id: 'content-1', card_id: 'card-1', type: 'text', content: {}, order_index: 0 },
                            { id: 'content-2', card_id: 'card-1', type: 'sns_link', content: {}, order_index: 1 },
                        ],
                        error: null,
                    },
                },
            },
        })

        const result = await getCardUseCase(supabase, 'card-1')

        expect(result).not.toBeNull()
        expect(result!.id).toBe('card-1')
        expect(result!.contents).toHaveLength(2)
    })
})

describe('updateCardUseCase — concurrency limitation', () => {
    it('同時に同じ slug を取ろうとすると DB UNIQUE 制約により片方が失敗する', async () => {
        // 両者が assertSlugUnique で count=0 を見る（TOCTOU: 読み取り時点では重複なし）
        const firstSupabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: {
                    count: [0, 1], // [assertSlugUnique: 通過, assertCardOwnership: 通過]
                    single: { data: { id: 'card-1', slug: 'target-slug', user_id: 'user-1' }, error: null }, // 先着: 成功
                },
            },
        })

        const secondSupabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: {
                    count: [0, 1], // [assertSlugUnique: 通過（TOCTOU 競合の再現）, assertCardOwnership: 通過]
                    single: { // 後着: DB が UNIQUE 制約エラーを返す
                        data: null,
                        error: { code: '23505', message: 'duplicate key value violates unique constraint "cards_slug_unique"' },
                    },
                },
            },
        })

        const results = await Promise.allSettled([
            updateCardUseCase(firstSupabase,  'card-1', { slug: 'target-slug' }),
            updateCardUseCase(secondSupabase, 'card-2', { slug: 'target-slug' }),
        ])

        // DB UNIQUE 制約が最後の防衛線: 先着は成功、後着は失敗
        expect(results[0].status).toBe('fulfilled')
        expect(results[1].status).toBe('rejected')
        expect((results[1] as PromiseRejectedResult).reason.message).toBe('Failed to update card')
    })
})

describe('addCardContentUseCase — concurrency limitation', () => {
    it('同時実行で order_index が重複する（read-then-write 競合の既知の制限）', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { count: 1 }, // ownership OK
                card_contents: {
                    // 全3回の resolveNextOrderIndex が同じ max を読む → 競合を再現
                    select: { data: [{ order_index: 1 }], error: null },
                    single: {
                        data: { id: 'new', card_id: 'card-1', type: 'text', content: {}, order_index: 2 },
                        error: null,
                    },
                },
            },
        })

        await Promise.all([
            addCardContentUseCase(supabase, 'card-1', 'text', { text: 'A' }),
            addCardContentUseCase(supabase, 'card-1', 'text', { text: 'B' }),
            addCardContentUseCase(supabase, 'card-1', 'text', { text: 'C' }),
        ])

        // insert が呼ばれた card_contents チェーンの payload を収集する
        const fromMock = supabase.from as jest.Mock
        const insertPayloads: Array<Record<string, unknown>> = []
        for (let i = 0; i < fromMock.mock.calls.length; i++) {
            if (fromMock.mock.calls[i][0] === 'card_contents') {
                const chain = fromMock.mock.results[i].value as Record<string, unknown>
                const insertMock = chain.insert as jest.Mock
                if (insertMock.mock.calls.length > 0) {
                    insertPayloads.push(insertMock.mock.calls[0][0] as Record<string, unknown>)
                }
            }
        }

        const orderIndexes = insertPayloads.map((p) => p.order_index)
        expect(orderIndexes).toHaveLength(3)
        // 既知の制限: read-then-write 競合により全3件が同じ order_index を計算する
        expect(orderIndexes).toEqual([2, 2, 2])
    })
})

describe('addCardContentUseCase', () => {
    it('既存コンテンツが N 件あるとき order_index が N になる', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { count: 1 }, // ownership OK
                card_contents: {
                    select: { data: [{ order_index: 1 }], error: null }, // 最大 order_index = 1
                    single: {
                        data: {
                            id: 'new-content',
                            card_id: 'card-1',
                            type: 'text',
                            content: { text: 'new content' },
                            order_index: 2,
                            created_at: '2026-01-01T00:00:00Z',
                        },
                        error: null,
                    },
                },
            },
        })

        await addCardContentUseCase(supabase, 'card-1', 'text', { text: 'new content' })

        // from の呼び出し順: [0] cards(ownership), [1] card_contents(resolveNextOrderIndex), [2] card_contents(persistCardContent)
        const fromMock = supabase.from as jest.Mock
        const persistChain = fromMock.mock.results[2].value
        const insertPayload = (persistChain.insert as jest.Mock).mock.calls[0][0]
        expect(insertPayload.order_index).toBe(2)
    })
})

describe('reorderCardContentsUseCase', () => {
    it('別カードの content ID を items に含めても card_id で絞り込まれる', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { count: 1 }, // ownership OK
            },
        })

        await reorderCardContentsUseCase(supabase, 'card-1', [
            { id: 'content-x', order_index: 0 },
        ])

        // from の呼び出し順: [0] cards(ownership), [1] card_contents(updateOrderIndex)
        const fromMock = supabase.from as jest.Mock
        const updateChain = fromMock.mock.results[1].value

        expect(updateChain.eq).toHaveBeenCalledWith('id', 'content-x')
        expect(updateChain.eq).toHaveBeenCalledWith('card_id', 'card-1')
    })
})

describe('updateCardUseCase', () => {
    it('他ユーザーのカードを更新しようとすると PermissionError を throw する', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { count: 0 }, // ownership 確認: 該当行なし → PermissionError
            },
        })

        await expect(
            updateCardUseCase(supabase, 'other-card', { title: 'x' })
        ).rejects.toBeInstanceOf(PermissionError)
    })

    it('不正な slug format のとき Error を throw する', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
        })

        await expect(
            updateCardUseCase(supabase, 'card-1', { slug: 'Invalid Slug!!' })
        ).rejects.toThrow('Invalid slug format')
    })

    it('既存の別カードと同じ slug を指定すると Slug already exists を throw する', async () => {
        const supabase = createMockSupabase({
            user: { id: 'user-1' },
            tables: {
                cards: { count: 1 }, // slug 重複あり
            },
        })

        await expect(
            updateCardUseCase(supabase, 'card-1', { slug: 'existing-slug' })
        ).rejects.toThrow('Slug already exists')
    })
})
