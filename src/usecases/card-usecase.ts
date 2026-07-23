import type { createClient } from '@/utils/supabase/server'
import { Database, Json } from '@/database.types'
import type { Card, CardContent, CardRow } from '@/types/domain'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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

async function generateUniqueSlug(supabase: SupabaseServerClient, title: string): Promise<string> {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    if (!baseSlug) {
        return Math.random().toString(36).substring(2, 7)
    }

    const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('slug', baseSlug)

    if (!count) {
        return baseSlug
    }

    return `${baseSlug}-${Math.random().toString(36).substring(2, 5)}`
}

async function fetchCardContents(supabase: SupabaseServerClient, cardId: string): Promise<CardContent[]> {
    const { data, error } = await supabase
        .from('card_contents')
        .select('*')
        .eq('card_id', cardId)
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching card contents:', error)
    }

    return data || []
}

async function fetchCardProfile(supabase: SupabaseServerClient, userId: string): Promise<{ avatar_url: string | null }> {
    const result = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()

    return { avatar_url: result.data?.avatar_url || null }
}

type FetchCardOptions =
    | { slug: string; id?: never; onlyPublished: boolean }
    | { id: string; slug?: never; onlyPublished: boolean }

async function fetchCardWithDetails(supabase: SupabaseServerClient, options: FetchCardOptions) {
    const withId = options.slug !== undefined
        ? supabase.from('cards').select('*').eq('slug', options.slug)
        : supabase.from('cards').select('*').eq('id', options.id)

    const withStatus = options.onlyPublished
        ? withId.eq('status', 'published')
        : withId

    const cardResult = await withStatus.single()

    if (cardResult.error || !cardResult.data) {
        if (cardResult.error) console.error('Error fetching card:', cardResult.error)
        return null
    }

    const contents = await fetchCardContents(supabase, cardResult.data.id)
    const profile = await fetchCardProfile(supabase, cardResult.data.user_id)

    return {
        ...normalizeCard(cardResult.data),
        contents,
        avatar_url: profile.avatar_url,
    }
}

// ---------------------------------------------------------------------------
// Read usecases
// ---------------------------------------------------------------------------

export async function getCardsUseCase(supabase: SupabaseServerClient): Promise<Card[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching cards:', error)
        throw new Error('Failed to fetch cards')
    }

    return data.map(card => ({
        ...normalizeCard(card),
        view_count: 0,
    }))
}

export async function getCardUseCase(supabase: SupabaseServerClient, id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

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

    const contents = await fetchCardContents(supabase, id)

    return {
        ...normalizeCard(result.data),
        contents,
    }
}

export async function getCardBySlugUseCase(supabase: SupabaseServerClient, slug: string) {
    return fetchCardWithDetails(supabase, { slug, onlyPublished: true })
}

export async function getPublicCardByIdUseCase(supabase: SupabaseServerClient, id: string) {
    // No status filter: used by NFC redirect (/c/[id]) and admin vCard — must see all statuses
    return fetchCardWithDetails(supabase, { id, onlyPublished: false })
}

// ---------------------------------------------------------------------------
// Mutation usecases
// ---------------------------------------------------------------------------

export async function createCardUseCase(supabase: SupabaseServerClient, title: string) {
    const user = await requireAuth(supabase)
    const slug = await generateUniqueSlug(supabase, title)

    const { data, error } = await supabase
        .from('cards')
        .insert({ user_id: user.id, title, slug, status: 'draft' })
        .select()
        .single()

    if (error) {
        console.error('Error creating card:', error)
        if (error.code === '23505') throw new Error('Slug already exists')
        throw new Error('Failed to create card')
    }

    return data
}

type CardUpdateInput = {
    title?: string
    description?: string
    status?: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'
    slug?: string
    material_type?: 'sugi' | 'hinoki' | 'walnut'
}

// --- validate ---

function validateSlugFormat(slug: string): void {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error('Invalid slug format. Use lowercase alphanumeric characters and hyphens (not at start/end).')
    }
}

async function assertSlugUnique(supabase: SupabaseServerClient, slug: string, excludeId: string): Promise<void> {
    const { count } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('slug', slug)
        .neq('id', excludeId)
    if (count) {
        throw new Error('Slug already exists')
    }
}

// --- transform ---

// Returns a new slug if the card currently has none and a title was provided.
// Returns undefined if no auto-generation is needed.
async function resolveSlugForUpdate(
    supabase: SupabaseServerClient,
    id: string,
    updates: CardUpdateInput,
): Promise<string | undefined> {
    if (!updates.title || updates.slug) return undefined
    const { data } = await supabase.from('cards').select('slug').eq('id', id).single()
    if (data && !data.slug) {
        return generateUniqueSlug(supabase, updates.title)
    }
    return undefined
}

// --- persist ---

async function persistCardUpdate(
    supabase: SupabaseServerClient,
    id: string,
    userId: string,
    payload: Database['public']['Tables']['cards']['Update'],
): Promise<CardRow> {
    const { data, error } = await supabase
        .from('cards')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating card:', error)
        throw new Error('Failed to update card')
    }

    return data
}

export async function updateCardUseCase(
    supabase: SupabaseServerClient,
    id: string,
    updates: CardUpdateInput,
) {
    const user = await requireAuth(supabase)

    if (updates.slug) {
        validateSlugFormat(updates.slug)
        await assertSlugUnique(supabase, updates.slug, id)
    }

    await assertCardOwnership(supabase, id, user.id)

    const autoSlug = await resolveSlugForUpdate(supabase, id, updates)

    const { status, ...rest } = updates
    const payload: Database['public']['Tables']['cards']['Update'] = { ...rest }
    if (status) payload.status = status
    if (autoSlug) payload.slug = autoSlug

    return persistCardUpdate(supabase, id, user.id, payload)
}

export async function deleteCardUseCase(supabase: SupabaseServerClient, id: string) {
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
}

type CardContentType = 'sns_link' | 'text'

// --- validate ---

function validateContentPayload(type: CardContentType, content: Json): void {
    if (!type) throw new Error('Content type is required')
    if (content === null || content === undefined) throw new Error('Content is required')
}

// --- transform ---

async function resolveNextOrderIndex(supabase: SupabaseServerClient, cardId: string): Promise<number> {
    const { data } = await supabase
        .from('card_contents')
        .select('order_index')
        .eq('card_id', cardId)
        .order('order_index', { ascending: false })
        .limit(1)

    return (data?.[0]?.order_index ?? -1) + 1
}

// --- persist ---

async function persistCardContent(
    supabase: SupabaseServerClient,
    cardId: string,
    type: CardContentType,
    content: Json,
    orderIndex: number,
): Promise<CardContent> {
    const { data, error } = await supabase
        .from('card_contents')
        .insert({ card_id: cardId, type, content, order_index: orderIndex })
        .select()
        .single()

    if (error) {
        console.error('Error adding content:', error)
        throw new Error('Failed to add content')
    }

    return data
}

export async function addCardContentUseCase(
    supabase: SupabaseServerClient,
    cardId: string,
    type: CardContentType,
    content: Json
) {
    const user = await requireAuth(supabase)
    await assertCardOwnership(supabase, cardId, user.id)
    validateContentPayload(type, content)
    const orderIndex = await resolveNextOrderIndex(supabase, cardId)
    return persistCardContent(supabase, cardId, type, content, orderIndex)
}

export async function deleteCardContentUseCase(
    supabase: SupabaseServerClient,
    contentId: string,
    cardId: string
) {
    const user = await requireAuth(supabase)
    await assertCardOwnership(supabase, cardId, user.id)

    const { error } = await supabase
        .from('card_contents')
        .delete()
        .eq('id', contentId)
        .eq('card_id', cardId)

    if (error) {
        console.error('Error deleting content:', error)
        throw new Error('Failed to delete content')
    }
}

async function updateOrderIndex(supabase: SupabaseServerClient, id: string, cardId: string, orderIndex: number): Promise<void> {
    const { error } = await supabase
        .from('card_contents')
        .update({ order_index: orderIndex })
        .eq('id', id)
        .eq('card_id', cardId)

    if (error) {
        console.error('Error updating order_index:', error)
        throw new Error(`Failed to update order_index for content ${id}`)
    }
}

export async function reorderCardContentsUseCase(
    supabase: SupabaseServerClient,
    cardId: string,
    items: { id: string; order_index: number }[]
) {
    const user = await requireAuth(supabase)
    await assertCardOwnership(supabase, cardId, user.id)

    // NOTE: 非原子的な並列更新
    // Promise.all で全 item を同時に UPDATE するが、トランザクションは使っていない。
    // 途中の UPDATE が失敗した場合、一部だけ更新された中間状態で終わる可能性がある。
    // クライアント側が再試行しても order_index の整合性は保証されない。
    // 将来的には Supabase RPC または DB トランザクションに移行して原子性を確保する。
    await Promise.all(items.map((item) => updateOrderIndex(supabase, item.id, cardId, item.order_index)))
}

export async function incrementViewCountUseCase(supabase: SupabaseServerClient, id: string) {
    const { error } = await supabase.rpc('increment_view_count', { card_id: id })
    if (error) {
        console.error('Error incrementing view count:', error)
    }
}
