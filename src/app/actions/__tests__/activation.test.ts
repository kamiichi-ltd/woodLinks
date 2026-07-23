// claimCard の所有権付与と遷移先を検証する。
// 外部依存（supabase server / service-role / next redirect）はモックする。
// jest の制約上、factory が参照する変数は `mock` プレフィックス必須。

const mockRedirect = jest.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
})
const mockGetUser = jest.fn()
const mockSingle = jest.fn()
const mockAdminUpdate = jest.fn()

jest.mock('next/navigation', () => ({
    redirect: (path: string) => mockRedirect(path),
}))

jest.mock('@/utils/supabase/server', () => ({
    createClient: async () => ({
        auth: { getUser: mockGetUser },
        from: () => ({
            select: () => ({
                eq: () => ({ single: mockSingle }),
            }),
        }),
    }),
}))

jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: () => ({ update: mockAdminUpdate }),
    }),
}))

import { claimCard } from '@/app/actions/activation'

describe('claimCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // update(payload).eq('id', cardId).is('owner_id', null) → { error: null }
        mockAdminUpdate.mockReturnValue({
            eq: () => ({ is: () => Promise.resolve({ error: null }) }),
        })
    })

    it('未claimカードに owner_id と user_id を購入者で付与し、編集ページへ遷移する', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'buyer-1' } } })
        mockSingle.mockResolvedValue({ data: { owner_id: null }, error: null })

        await expect(claimCard('card-1')).rejects.toThrow('NEXT_REDIRECT:/dashboard/cards/card-1')

        expect(mockAdminUpdate).toHaveBeenCalledTimes(1)
        const payload = mockAdminUpdate.mock.calls[0][0]
        expect(payload).toMatchObject({ owner_id: 'buyer-1', user_id: 'buyer-1' })
    })

    it('既に claim 済みのカードは更新せず例外を投げる', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'buyer-1' } } })
        mockSingle.mockResolvedValue({ data: { owner_id: 'someone-else' }, error: null })

        await expect(claimCard('card-1')).rejects.toThrow('Card is already claimed')
        expect(mockAdminUpdate).not.toHaveBeenCalled()
    })
})
