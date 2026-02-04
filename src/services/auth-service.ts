'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type assertion for form data entries
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nextParam = formData.get('next') as string

    console.log('[Auth] Login attempt:', { email, next: nextParam })

    if (!email || !password) {
        throw new Error('Email and password are required')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Return error to be handled by the UI (though server actions usually throw or return data)
        // Here we throw to be caught by the client invocation
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')

    revalidatePath('/', 'layout')

    // Dynamic Redirect
    const next = formData.get('next') as string
    if (next && next.startsWith('/')) {
        redirect(next)
    }

    // Admin Redirect
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL

    if (user && adminEmail && user.email === adminEmail) {
        redirect('/admin/orders')
    }

    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        throw new Error('メールアドレスとパスワードは必須です')
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        throw new Error(error.message)
    }

    if (data.user) {
        console.log('[Auth] SignUp successful, User ID:', data.user.id)

        // Create or Update profile (upsert)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profilePayload: any = {
            id: data.user.id,
            email: email,
            full_name: email.split('@')[0],
            updated_at: new Date().toISOString(),
        }

        console.log('[Auth] Attempting to create profile for:', data.user.id)

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profilePayload)
            .select()

        if (profileError) {
            console.error('[Auth] Error creating/updating profile:', profileError)
            console.error('[Auth] Profile Payload:', profilePayload)
            // Ideally we might want to throw here to alert the user, 
            // but the auth user is already created. 
            // We'll log it and proceed, as the user can try to fix profile later or we rely on triggers.
        } else {
            console.log('[Auth] Profile created successfully')
        }
    } else {
        console.warn('[Auth] SignUp returned no user data')
    }

    revalidatePath('/', 'layout')

    // Dynamic Redirect
    const next = formData.get('next') as string
    if (next && next.startsWith('/')) {
        redirect(next)
    }

    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
