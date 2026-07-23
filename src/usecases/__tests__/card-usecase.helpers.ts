import type { createClient } from '@/utils/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type TableName = 'cards' | 'card_contents' | 'profiles'

export type TableOverrides = {
    [T in TableName]?: {
        single?: { data: unknown; error: null } | { data: null; error: { message: string; code?: string } }
        select?: { data: unknown[]; error: null } | { data: null; error: { message: string; code?: string } }
        /** 単一値: 全 count クエリで同じ値を返す。配列: 呼び出し順に返し、末尾の値で固定する */
        count?: number | null | (number | null)[]
    }
}

// count クエリ専用チェーン。eq/neq が自己参照し then で { count } を解決する。
function makeCountChain(c: number | null) {
    const cc: Record<string, unknown> = { count: c }
    cc.eq  = jest.fn().mockImplementation(() => cc)
    cc.neq = jest.fn().mockImplementation(() => cc)
    Object.defineProperty(cc, 'then', {
        get() { return (resolve: (v: unknown) => void) => resolve({ count: c, data: null, error: null }) },
    })
    return cc
}

function makeChain(
    tableOverrides: TableOverrides[TableName] = {},
    getNextCount?: () => number | null,
) {
    const chain: Record<string, unknown> = {
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockReturnThis(),
        neq:    jest.fn().mockReturnThis(),
        order:  jest.fn().mockReturnThis(),
        limit:  jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(
            tableOverrides.single ?? { data: null, error: null }
        ),
    }

    // Allow awaiting the chain directly (for list queries without .single())
    const listResult = tableOverrides.select ?? { data: [], error: null }
    Object.defineProperty(chain, 'then', {
        get() {
            return (resolve: (v: unknown) => void) => resolve(listResult)
        },
    })

    // count queries: select('*', { count: 'exact', head: true })
    // 通常の select (insert/update 後の .select().single() 等) は chain に戻す。
    // カウンターは createMockSupabase 側でテーブル単位に共有し、from() 呼び出しをまたいで正確に採番する。
    if (getNextCount) {
        chain.select = jest.fn().mockImplementation((_cols: string, opts?: { count?: string }) => {
            if (opts?.count === 'exact') {
                return makeCountChain(getNextCount())
            }
            return chain
        })
    }

    return chain
}

export type MockSupabaseOptions = {
    user?: { id: string; email?: string } | null
    tables?: TableOverrides
    rpc?: { error: { message: string } | null }
}

export function createMockSupabase(options: MockSupabaseOptions = {}): SupabaseServerClient {
    const user = options.user !== undefined
        ? options.user
        : { id: 'user-1', email: 'test@example.com' }

    const tables = options.tables ?? {}

    // テーブル単位で count の呼び出し順を管理するクロージャを生成する。
    // from() が何度呼ばれても同じカウンターを共有するため、複数の from('cards') 呼び出しにまたがって
    // assertSlugUnique と assertCardOwnership が正しいシーケンスで count を受け取れる。
    const countGetters: Partial<Record<TableName, () => number | null>> = {}
    for (const [tableName, overrides] of Object.entries(tables) as [TableName, TableOverrides[TableName]][]) {
        if (overrides?.count !== undefined) {
            const counts = Array.isArray(overrides.count) ? overrides.count : [overrides.count]
            let idx = 0
            countGetters[tableName] = () => {
                const c = counts[Math.min(idx, counts.length - 1)]
                idx++
                return c
            }
        }
    }

    return {
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user },
            }),
        },
        from: jest.fn().mockImplementation((table: TableName) => {
            return makeChain(tables[table], countGetters[table])
        }),
        rpc: jest.fn().mockResolvedValue(
            options.rpc !== undefined ? options.rpc : { error: null }
        ),
    } as unknown as SupabaseServerClient
}
