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

    // Debug: Check total count without joins first
    const { count, error: countError } = await adminDbClient
        .from('orders')
        .select('*', { count: 'exact', head: true });

    console.log('[Admin] 注文総数 (Raw Count):', count);
    if (countError) console.error('[Admin] カウント取得エラー:', countError);

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

    console.log('[Admin] 結合後の取得件数:', data?.length);
    return data;
}

export async function updateOrderStatus(
    orderId: string,
    newStatus: Database['public']['Tables']['orders']['Row']['status'],
    trackingNumber?: string | null
) {
    await verifyAdmin() // Security Guard
    console.log(`[Admin] Updating order ${orderId} to ${newStatus}`)

    // Direct Update via Service Role (Bypassing RLS)
    const updateData: Database['public']['Tables']['orders']['Update'] = {
        status: newStatus,
        updated_at: new Date().toISOString()
    }

    if (trackingNumber !== undefined) {
        updateData.tracking_number = trackingNumber
    }

    if (newStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString()
    }

    // Auto-fill paid_at if manual status change to paid
    if (newStatus === 'paid') {
        // Keep existing paid_at if possible? For simplicity, we just update it.
        // If stricter logic needed, we'd fetch first.
        updateData.paid_at = new Date().toISOString()
    }

    const { error } = await adminDbClient
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

    if (error) {
        console.error('[Admin] Update failed:', error)
        throw new Error(error.message)
    }

    revalidatePath('/admin/orders')
    return { success: true }
}
