'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database, Json } from '@/database.types'
import type { Card, CardRow, CardContent } from '@/types/domain'

export type { Card, CardContent } from '@/types/domain'

export class AuthError extends Error {
    constructor(message = 'Unauthorized') {
        super(message)
        this.name = 'AuthError'
    }
}

export class PermissionError extends Error {
    constructor(message = 'Permission denied') {
        super(message)
        this.name = 'PermissionError'
    }
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

async function requireAuth(supabase: SupabaseServerClient) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AuthError()
    return user
}

async function assertCardOwnership(supabase: SupabaseServerClient, cardId: string, userId: string) {
    const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('id', cardId)
        .eq('user_id', userId)
    if (!count) throw new PermissionError('Card not found or access denied')
}

function normalizeCard(row: CardRow) {
    return {
        ...row,
        status: row.status as Card['status'],
        material_type: row.material_type as Card['material_type'],
    }
}

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

    return rows.map(card => ({
        ...normalizeCard(card),
        view_count: 0
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
        ...normalizeCard(cardRow),
        contents: (contents as CardContent[]) || []
    }
}

export async function getCardBySlug(slug: string) {
    const supabase = await createClient()

    // No auth required. Explicit status filter is the source of truth for public visibility.
    const cardResult = await supabase
        .from('cards')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
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
        ...normalizeCard(cardRow),
        contents: (contents as CardContent[]) || [],
        avatar_url: profileResult.data?.avatar_url || null
    }
}

export async function createCard(formData: FormData) {
    const supabase = await createClient()
    const user = await requireAuth(supabase)

    const title = formData.get('title') as string

    if (!title) {
        throw new Error('Title is required')
    }

    const slug = await generateUniqueSlug(supabase, title)

    const insertPayload: Database['public']['Tables']['cards']['Insert'] = {
        user_id: user.id,
        title,
        slug,
        status: 'draft',
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
    const user = await requireAuth(supabase)

    const { status, ...rest } = updates

    // We strictly type payload using the DB update type
    const updatePayload: Database['public']['Tables']['cards']['Update'] = { ...rest }

    if (status) {
        updatePayload.status = status
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
    const user = await requireAuth(supabase)

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
    const user = await requireAuth(supabase)

    await assertCardOwnership(supabase, cardId, user.id)

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
    const user = await requireAuth(supabase)

    await assertCardOwnership(supabase, cardId, user.id)

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
        ...normalizeCard(cardRow),
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
    const user = await requireAuth(supabase)

    await assertCardOwnership(supabase, cardId, user.id)

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
