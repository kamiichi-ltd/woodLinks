'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { Database } from '@/database.types'

const adminDbClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

export type BulkGeneratedCard = {
    id: string
    slug: string
    materialType: string | null
    url: string
}

export type AdminCardListItem = {
    id: string
    slug: string
    title: string | null
    status: string | null
    materialType: string | null
    ownerId: string | null
    createdAt: string
}

async function verifyAdmin() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL

    if (!user || !adminEmail || user.email !== adminEmail) {
        throw new Error('Unauthorized: Admin access required')
    }

    return user
}

function createBulkSlug() {
    return `bulk-${crypto.randomUUID().replace(/-/g, '')}`
}

export async function getAdminCards(): Promise<AdminCardListItem[]> {
    await verifyAdmin()

    const { data, error } = await adminDbClient
        .from('cards')
        .select('id, slug, title, status, material_type, owner_id, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[Admin Bulk] Card list fetch failed:', error)
        throw new Error('Failed to fetch admin cards')
    }

    return (data || []).map((card) => ({
        id: card.id,
        slug: card.slug,
        title: card.title,
        status: card.status,
        materialType: card.material_type,
        ownerId: card.owner_id,
        createdAt: card.created_at,
    }))
}

export async function generateBulkCards(count: number, materialType: string): Promise<BulkGeneratedCard[]> {
    const user = await verifyAdmin()

    const normalizedCount = Number(count)
    const normalizedMaterialType = materialType.trim().toLowerCase()
    const allowedCounts = new Set([10, 50, 100])
    const allowedMaterials = new Set(['sugi', 'hinoki', 'walnut', 'maple'])

    if (!allowedCounts.has(normalizedCount)) {
        throw new Error('Unsupported bulk generation count')
    }

    if (!allowedMaterials.has(normalizedMaterialType)) {
        throw new Error('Unsupported material type')
    }

    const insertPayload: Database['public']['Tables']['cards']['Insert'][] = Array.from(
        { length: normalizedCount },
        () => ({
            user_id: user.id,
            owner_id: null,
            status: 'draft',
            slug: createBulkSlug(),
            material_type: normalizedMaterialType,
            title: null,
            description: null,
        })
    )

    const { data, error } = await adminDbClient
        .from('cards')
        .insert(insertPayload)
        .select('id, slug, material_type')

    if (error || !data) {
        console.error('[Admin Bulk] Card generation failed:', error)
        throw new Error('Failed to generate bulk cards')
    }

    revalidatePath('/admin/cards')

    return data.map((card) => ({
        id: card.id,
        slug: card.slug,
        materialType: card.material_type,
        url: `/c/${card.id}`,
    }))
}
