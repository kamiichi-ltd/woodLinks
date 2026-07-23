import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/database.types'

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

type LineOAuthParams = {
    next?: string | null
    action?: string | null
    cardId?: string | null
}

export async function signInWithLine({ next, action, cardId }: LineOAuthParams = {}) {
    const supabase = createClient()
    const redirectTo = new URL('/auth/callback', window.location.origin)

    if (next) {
        redirectTo.searchParams.set('next', next)
    }
    if (action) {
        redirectTo.searchParams.set('action', action)
    }
    if (cardId) {
        redirectTo.searchParams.set('cardId', cardId)
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        // 'line' は Supabase が実行時サポートする OAuth provider だが、インストール済み型の
        // Provider union に未収載のため型エラーになる。実行時の値は 'line' のままで正しい。
        // @ts-expect-error provider 'line' is valid at runtime, missing from the Provider type
        provider: 'line',
        options: {
            redirectTo: redirectTo.toString(),
        },
    })

    if (error) {
        throw error
    }

    return data
}
