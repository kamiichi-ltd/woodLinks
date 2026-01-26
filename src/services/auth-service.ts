'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type assertion for form data entries
    const email = formData.get('email') as string
    const password = formData.get('password') as string

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
        // Create profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profilePayload: any = {
            id: data.user.id,
            email: email,
            full_name: email.split('@')[0],
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .insert(profilePayload)
            .select() // Ensure it was created

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // Continue even if profile creation fails? Ideally retry or fail. 
            // For MVP, we log it. In prod, maybe throw or use a trigger.
        }

        // Also create a default card for the user? 
        // Requirement said "profiles table", but cards are useful too. 
        // Let's stick to profiles first as requested.
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
