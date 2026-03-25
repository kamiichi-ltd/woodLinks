import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { buildSafeNextPath } from '@/lib/auth-redirect'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next')
    const action = requestUrl.searchParams.get('action')
    const cardId = requestUrl.searchParams.get('cardId')

    const redirectTarget = buildSafeNextPath(next, {
        action,
        cardId,
    }) || '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            const loginUrl = new URL('/login', requestUrl.origin)

            if (next) {
                loginUrl.searchParams.set('next', next)
            }
            if (action) {
                loginUrl.searchParams.set('action', action)
            }
            if (cardId) {
                loginUrl.searchParams.set('cardId', cardId)
            }

            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin))
}
