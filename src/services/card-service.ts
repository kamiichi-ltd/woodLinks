'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCards() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching cards:', error)
        throw new Error('Failed to fetch cards')
    }

    return data
}

export async function createCard(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const title = formData.get('title') as string

    if (!title) {
        throw new Error('Title is required')
    }

    const { data, error } = await supabase
        .from('cards')
        .insert({
            user_id: user.id,
            title,
            is_published: false,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating card:', error)
        throw new Error('Failed to create card')
    }

    revalidatePath('/dashboard')
    return data
}

export async function updateCard(id: string, updates: { title?: string; description?: string; is_published?: boolean }) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating card:', error)
        throw new Error('Failed to update card')
    }

    revalidatePath('/dashboard')
    return data
}

export async function deleteCard(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting card:', error)
        throw new Error('Failed to delete card')
    }

    revalidatePath('/dashboard')
}
