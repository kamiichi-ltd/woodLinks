'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/database.types'

type WoodInventory = Database['public']['Tables']['wood_inventory']['Row']
type WoodInventoryInsert = Database['public']['Tables']['wood_inventory']['Insert']

// Helper to generate unique slug
async function generateUniqueSlug(baseName: string): Promise<string> {
    const supabase = await createClient()
    const baseSlug = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    if (!baseSlug) return Math.random().toString(36).substring(2, 7)

    const { count } = await supabase
        .from('wood_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('nfc_slug', baseSlug)

    if (!count) return baseSlug

    return `${baseSlug}-${Math.random().toString(36).substring(2, 5)}`
}

export async function createWood(data: Omit<WoodInventoryInsert, 'id' | 'created_at' | 'updated_at' | 'nfc_slug'>) {
    const supabase = await createClient()

    // Auto-generate slug from name
    const nfc_slug = await generateUniqueSlug(data.name)

    const { data: stringData, error } = await supabase
        .from('wood_inventory')
        .insert({
            ...data,
            nfc_slug,
            stock: data.stock ?? 1,
            price: data.price ?? 0,
            status: data.status ?? 'available',
            dimensions: (data.dimensions as any) || { length: 91, width: 55, thickness: 3 }
        } as any)
        .select()
        .single()

    if (error) {
        console.error('Error creating wood:', error)
        throw new Error('Failed to create wood')
    }

    revalidatePath('/admin/inventory')
    revalidatePath('/wood')
    return stringData
}

export async function getWoodList() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('wood_inventory')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching wood list:', error)
        return []
    }

    return data as WoodInventory[]
}

export async function getWoodBySlug(slug: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('wood_inventory')
        .select('*')
        .eq('nfc_slug', slug)
        .single()

    if (error) {
        console.error('Error fetching wood by slug:', error)
        return null
    }

    return data as WoodInventory
}
