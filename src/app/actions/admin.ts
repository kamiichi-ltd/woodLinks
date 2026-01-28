'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'
import { revalidatePath } from 'next/cache'

// Use Service Role Key for Admin Actions to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
}

// Admin Client
const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function getAdminOrders() {
    console.log('[Admin] Fetching all orders...')

    // Join with Profiles to get user email/name if not in shipping info
    // However, shipping info is in `orders`.
    // We mainly want `card` info and maybe `user` email for reference.
    // Supabase Join syntax:
    const { data, error } = await adminClient
        .from('orders')
        .select(`
            *,
            cards (
                title,
                slug,
                view_count
            ),
            profiles:user_id (
                email,
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[Admin] Error fetching orders:', error)
        throw new Error(error.message)
    }

    return data
}

export async function updateOrderStatus(
    orderId: string,
    newStatus: Database['public']['Tables']['orders']['Row']['status'],
    trackingNumber?: string | null
) {
    console.log(`[Admin] Updating order ${orderId} to ${newStatus}`)

    const { error } = await adminClient.rpc('admin_update_order_status', {
        p_order_id: orderId,
        p_new_status: newStatus,
        p_tracking_number: trackingNumber || undefined,
        p_shipped_at: newStatus === 'shipped' ? new Date().toISOString() : undefined
    } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error) {
        console.error('[Admin] Update failed:', error)
        throw new Error(error.message)
    }

    revalidatePath('/admin/orders')
    return { success: true }
}
