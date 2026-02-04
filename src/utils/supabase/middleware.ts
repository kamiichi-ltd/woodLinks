import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use ANON key for middleware to match client perspective
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

    // 1. Static/API Guard (Redundant with matcher but safe)
    if (request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/static')) {
        return response
    }

    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) {
        if (user) {
            // If user is already logged in, redirect them.
            // CHECK FOR NEXT PARAM
            const next = request.nextUrl.searchParams.get('next')
            if (next && next.startsWith('/')) {
                // LOOP PREVENTION: If target is same as current, don't redirect
                // Note: Since we are on /login, if next is /login, we should redirect to admin or dashboard to execute logout if needed, 
                // OR just prevent redirect.
                // If next is /login, we are in a loop if we defer to it.
                if (next === request.nextUrl.pathname) {
                    return response
                }
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
