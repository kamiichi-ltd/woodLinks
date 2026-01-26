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

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
