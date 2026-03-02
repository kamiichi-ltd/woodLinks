'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database, Json } from '@/database.types'
import type { Card, CardRow, CardContent } from '@/types/domain'

export type { Card, CardContent }

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

// Helper to generate unique slug
async function generateUniqueSlug(supabase: SupabaseServerClient, title: string): Promise<string> {
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

    const rows = data as CardRow[]

    // Map is_published to status for UI compatibility
    return rows.map(card => ({
        ...card,
        status: (card.is_published ? 'published' : 'draft') as Card['status'],
        material_type: card.material_type as Card['material_type'],
        view_count: 0 // Default to 0 as it's not in the table yet
    }))
}

export async function getCard(id: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const result = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (result.error) {
        console.error('Error fetching card:', result.error)
        return null
    }

    const cardRow = result.data as CardRow

    const { data: contents, error: contentError } = await supabase
        .from('card_contents')
        .select('*')
        .eq('card_id', id)
        .order('order_index', { ascending: true })

    if (contentError) {
        console.error('Error fetching card contents:', contentError)
        // defaulting to empty contents if fetch fails
    }

    return {
        ...cardRow,
        status: (cardRow.is_published ? 'published' : 'draft') as Card['status'], // Polyfill status
        contents: (contents as CardContent[]) || []
    }
}

export async function getCardBySlug(slug: string) {
    const supabase = await createClient()

    // No auth check needed for public access, RLS should handle 'is_published' check or we do it explicitly
    // Explicit check is safer given we are in a server action/component context where RLS might depend on role
    // But for public access using anon key, RLS for 'select' on 'cards' should allow if is_published is true.
    // However, since we are using the service role or anon key server-side, it's best to be explicit in the query too.

    const cardResult = await supabase
        .from('cards')
        .select('*')
        .eq('slug', slug)
        // .eq('status', 'published') // Wrong column
        .eq('is_published', true) // Correct column from init_database.sql
        .single()

    if (cardResult.error || !cardResult.data) {
        if (cardResult.error) console.error('Error fetching public card:', cardResult.error)
        return null
    }

    const cardRow = cardResult.data as CardRow

    const { data: contents, error: contentError } = await supabase
        .from('card_contents')
        .select('*')
        .eq('card_id', cardRow.id)
        .order('order_index', { ascending: true })

    if (contentError) {
        console.error('Error fetching public card contents:', contentError)
    }

    // Fetch profile avatar
    const profileResult = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', cardRow.user_id)
        .single()

    return {
        ...cardRow,
        status: (cardRow.is_published ? 'published' : 'draft') as Card['status'], // Polyfill status
        contents: (contents as CardContent[]) || [],
        avatar_url: profileResult.data?.avatar_url || null
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

    const insertPayload: Database['public']['Tables']['cards']['Insert'] = {
        user_id: user.id,
        title,
        slug,
        is_published: false, // Default to draft (false)
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

export async function updateCard(id: string, updates: { title?: string; description?: string; status?: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'; slug?: string; material_type?: 'sugi' | 'hinoki' | 'walnut' }) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Map 'status' to 'is_published' if it exists in updates
    // The signature uses 'status' string, but DB has 'is_published' boolean.
    // We need to transform it.
    const { status, ...rest } = updates

    // We strictly type payload using the DB update type
    const updatePayload: Database['public']['Tables']['cards']['Update'] = { ...rest }

    if (status) {
        if (status === 'published') {
            updatePayload.is_published = true
        } else {
            // draft, disabled, etc map to false for now, or we need a status column if we want to differentiate
            updatePayload.is_published = false
        }
    }

    // Logic to ensure slug exists if not already, or if title changes and slug is empty (though slug is usually persistent)
    // For now, if we are updating title, let's check if we want to regenerate slug? 
    // Requirement says: "cards table slug is empty, auto generate from title at create or update"
    if (updates.slug) {
        // Regex: Alphanumeric, can contain hyphens but not at start/end, no consecutive hyphens
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updates.slug)) {
            throw new Error('Invalid slug format. Use lowercase alphanumeric characters and hyphens (not at start/end).')
        }

        // Check uniqueness if slug changed
        const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true }).eq('slug', updates.slug).neq('id', id)
        if (count) {
            throw new Error('Slug already exists')
        }
    }

    // Auto-generate if title changed and no slug exists (fallback logic)
    if (updates.title) {
        const slugResult = await supabase.from('cards').select('slug').eq('id', id).single()
        const currentCard = slugResult.data as CardRow | null
        if (currentCard && !currentCard.slug && !updates.slug) {
            updatePayload.slug = await generateUniqueSlug(supabase, updates.title)
        }
    }

    const { data, error } = await supabase
        .from('cards')
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

    const maxOrderRows = maxOrderData as CardContent[] | null
    const nextOrder = (maxOrderRows?.[0]?.order_index ?? -1) + 1

    const contentPayload: Database['public']['Tables']['card_contents']['Insert'] = {
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

    const cardResult = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .single()

    if (cardResult.error || !cardResult.data) {
        if (cardResult.error) console.error('Error fetching public card by ID:', cardResult.error)
        return null
    }

    const cardRow = cardResult.data as CardRow

    const { data: contents, error: contentError } = await supabase
        .from('card_contents')
        .select('*')
        .eq('card_id', cardRow.id)
        .order('order_index', { ascending: true })

    if (contentError) {
        console.error('Error fetching public card contents:', contentError)
    }

    // Fetch profile avatar
    const profileResult = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', cardRow.user_id)
        .single()

    return {
        ...cardRow,
        status: (cardRow.is_published ? 'published' : 'draft') as Card['status'], // Polyfill statuses
        contents: (contents as CardContent[]) || [],
        avatar_url: profileResult.data?.avatar_url || null
    }
}

export async function incrementViewCount(id: string) {
    const supabase = await createClient()

    // RPC now accepts card_id directly (after running refine_infrastructure_safety.sql)
    const { error } = await supabase.rpc('increment_view_count', { card_id: id })

    if (error) {
        console.error('Error incrementing view count:', error)
    }
}

export async function reorderCardContents(cardId: string, items: { id: string; order_index: number }[]) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Verify ownership
    const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true }).eq('id', cardId).eq('user_id', user.id)
    if (!count) {
        throw new Error('Card not found or access denied')
    }

    const upsertPayload: Database['public']['Tables']['card_contents']['Insert'][] = items.map((item) => ({
        id: item.id,
        card_id: cardId,
        type: '', // Required by Insert type but won't be overwritten on upsert conflict
        content: '' as Json, // Required by Insert type but won't be overwritten on upsert conflict
        order_index: item.order_index,
    }))

    const { error } = await supabase
        .from('card_contents')
        .upsert(upsertPayload)
        .select()

    if (error) {
        console.error('Error reordering contents:', error)
        throw new Error('Failed to reorder contents')
    }

    revalidatePath(`/dashboard/cards/${cardId}`)
}
