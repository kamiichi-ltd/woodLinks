'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'
import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/utils/supabase/server'

// Use Service Role Key for Admin Actions to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminEmail = process.env.ADMIN_EMAIL

if (!supabaseServiceKey || !adminEmail) {
    console.error('Admin Environment Variables are missing')
}

// Admin Service Role Client (for data access)
const adminDbClient = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function verifyAdmin() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL

    // 🔍 ターミナル（ブラウザではなく、VS Code側）に表示されます
    console.log("=== Admin Security Check ===");
    console.log("ログイン中のメール:", user?.email);
    console.log("設定された管理者メール:", adminEmail);
    console.log("一致判定:", user?.email === adminEmail);
    console.log("===========================");
    if (!user || user.email !== adminEmail) {
        throw new Error('Unauthorized: Admin access required')
    }
}

// src/app/actions/admin.ts

export async function getAdminOrders() {
    await verifyAdmin();

    const { data, error } = await adminDbClient
        .from('orders')
        .select(`
            *,
            profiles:user_id ( 
                id, 
                full_name, 
                email 
            ),
            cards:card_id ( 
                id, 
                title, 
                slug 
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Admin] Join Failed:', error.message);
        throw new Error(`Join Failed: ${error.message}`);
    }

    return data;
}

export async function updateOrderStatus(
    orderId: string,
    newStatus: Database['public']['Tables']['orders']['Row']['status'],
    trackingNumber?: string | null
) {
    await verifyAdmin() // Security Guard
    console.log(`[Admin] Updating order ${orderId} to ${newStatus}`)

    const { error } = await adminDbClient.rpc('admin_update_order_status', {
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
