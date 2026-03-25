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
