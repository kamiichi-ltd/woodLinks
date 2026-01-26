'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database, Json } from '@/database.types'

type Card = Database['public']['Tables']['cards']['Row']
type CardContent = Database['public']['Tables']['card_contents']['Row']

// Helper to generate unique slug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateUniqueSlug(supabase: any, title: string): Promise<string> {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    if (!baseSlug) {
        return Math.random().toString(36).substring(2, 7)
    }

    // Check if baseSlug exists
    const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('slug', baseSlug)

    if (!count) {
        return baseSlug
    }

    // Append random suffix if exists
    return `${baseSlug}-${Math.random().toString(36).substring(2, 5)}`
}

export async function getCards(): Promise<Card[]> {
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

    return (data as unknown as Card[]) ?? []
}

export async function getCard(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: card, error: cardError } = await supabase
        .from('cards')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('*' as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (cardError) {
        console.error('Error fetching card:', cardError)
        return null
    }

    const { data: contents, error: contentError } = await supabase
        .from('card_contents')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('*' as any)
        .eq('card_id', id)
        .order('order_index', { ascending: true })

    if (contentError) {
        console.error('Error fetching card contents:', contentError)
        // defaulting to empty contents if fetch fails
    }

    return {
        ...(card as unknown as Card),
        contents: (contents as unknown as CardContent[]) || []
    }
}

export async function getCardBySlug(slug: string) {
    const supabase = await createClient()

    // No auth check needed for public access, RLS should handle 'is_published' check or we do it explicitly
    // Explicit check is safer given we are in a server action/component context where RLS might depend on role
    // But for public access using anon key, RLS for 'select' on 'cards' should allow if is_published is true.
    // However, since we are using the service role or anon key server-side, it's best to be explicit in the query too.

    const { data: card, error: cardError } = await supabase
        .from('cards')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('*' as any)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (cardError || !card) {
        if (cardError) console.error('Error fetching public card:', cardError)
        return null
    }

    const { data: contents, error: contentError } = await supabase
        .from('card_contents')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('*' as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('card_id', (card as any).id)
        .order('order_index', { ascending: true })

    if (contentError) {
        console.error('Error fetching public card contents:', contentError)
    }

    return {
        ...(card as unknown as Card),
        contents: (contents as unknown as CardContent[]) || []
    }
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

    const slug = await generateUniqueSlug(supabase, title)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertPayload: any = {
        user_id: user.id,
        title,
        slug,
        is_published: false,
    }

    const { data, error } = await supabase
        .from('cards')
        .insert(insertPayload)
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

    const updatePayload: { title?: string; description?: string; is_published?: boolean; slug?: string } = { ...updates }

    // Logic to ensure slug exists if not already, or if title changes and slug is empty (though slug is usually persistent)
    // For now, if we are updating title, let's check if we want to regenerate slug? 
    // Requirement says: "cards table slug is empty, auto generate from title at create or update"
    if (updates.title) {
        const { data: currentCard } = await supabase.from('cards').select('slug').eq('id', id).single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (currentCard && !(currentCard as any).slug) {
            updatePayload.slug = await generateUniqueSlug(supabase, updates.title)
        }
    }

    const { data, error } = await supabase
        .from('cards')
        // @ts-expect-error Supabase types issue
        .update(updatePayload)
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

export async function addCardContent(cardId: string, type: 'sns_link' | 'text', content: Json) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Checking ownership
    const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true }).eq('id', cardId).eq('user_id', user.id)
    if (!count) {
        throw new Error('Card not found or access denied')
    }

    // Get current max order
    const { data: maxOrderData } = await supabase
        .from('card_contents')
        .select('order_index')
        .eq('card_id', cardId)
        .order('order_index', { ascending: false })
        .limit(1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextOrder = ((maxOrderData?.[0] as any)?.order_index ?? -1) + 1

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentPayload: any = {
        card_id: cardId,
        type,
        content,
        order_index: nextOrder,
    }

    const { data, error } = await supabase
        .from('card_contents')
        .insert(contentPayload)
        .select()
        .single()

    if (error) {
        console.error('Error adding content:', error)
        throw new Error('Failed to add content')
    }

    revalidatePath(`/dashboard/cards/${cardId}`)
    return data
}

export async function deleteCardContent(contentId: string, cardId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Verify ownership of the card via the content relation is tricky without a join or multiple queries 
    // or RLS (which should handle it, but we are in server action)
    // Let's verify card ownership first
    const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true }).eq('id', cardId).eq('user_id', user.id)

    if (!count) {
        throw new Error('Card not found or access denied')
    }

    const { error } = await supabase
        .from('card_contents')
        .delete()
        .eq('id', contentId)
        .eq('card_id', cardId) // Extra safety to ensure it belongs to the card we checked

    if (error) {
        console.error('Error deleting content:', error)
        throw new Error('Failed to delete content')
    }

    revalidatePath(`/dashboard/cards/${cardId}`)
}

export async function getPublicCardById(id: string) {
    const supabase = await createClient()

    const { data: card, error: cardError } = await supabase
        .from('cards')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('*' as any)
        .eq('id', id)
        .eq('is_published', true)
        .single()

    if (cardError || !card) {
        if (cardError) console.error('Error fetching public card by ID:', cardError)
        return null
    }

    const { data: contents, error: contentError } = await supabase
        .from('card_contents')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select('*' as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('card_id', (card as any).id)
        .order('order_index', { ascending: true })

    if (contentError) {
        console.error('Error fetching public card contents:', contentError)
    }

    return {
        ...(card as unknown as Card),
        contents: (contents as unknown as CardContent[]) || []
    }
}
