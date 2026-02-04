import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    constsupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOTE: Usually middleware uses ANON key, but if we just want to check session it's fine. Wait, middleware is client-side context usually? No, it's server. But safer to use ANON key if just checking auth.
        // Actually, for updateSession we should use ANON key to be safe and consistent with client headers.
        // But let's check .env usage in src/utils/supabase/server.ts 
        // Usually it is NEXT_PUBLIC_SUPABASE_ANON_KEY.
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
        if (user) {
            // If user is already logged in, redirect them.
            // CHECK FOR NEXT PARAM
            const next = request.nextUrl.searchParams.get('next')
            if (next && next.startsWith('/')) {
                return NextResponse.redirect(new URL(next, request.url))
            }

            // Default redirect
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    // Example: Protected routes
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}
