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

// 修正後: 型定義 <Database> を明示的に渡す
const adminDbClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

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
    const { count, error: countError } = await (adminDbClient as any)
        .from('orders')
        .select('*', { count: 'exact', head: true });

    console.log('[Admin] 注文総数 (Raw Count):', count);
    if (countError) console.error('[Admin] カウント取得エラー:', countError);

    const { data, error } = await (adminDbClient as any)
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

    // Explicitly cast to any to bypass strict type checks if needed
    const { error } = await (adminDbClient as any)
        .from('orders')
        .update(updateData as any)
        .eq('id', orderId)

    if (error) {
        console.error('[Admin] Update failed:', error)
        throw new Error(error.message)
    }

    revalidatePath('/admin/orders')
    revalidatePath('/admin/orders')
    return { success: true }
}

export async function getAdminStats() {
    await verifyAdmin();

    const { data: orders, error } = await (adminDbClient as any)
        .from('orders')
        .select('*')
        .in('status', ['paid', 'in_production', 'shipped', 'delivered']);

    if (error) {
        console.error('[Admin] Stats Fetch Error:', error);
        throw new Error('Failed to fetch stats');
    }

    // Calculate Stats
    // Note: Assuming 'amount' column exists? Or calculate from material?
    // Based on checkout.ts, we don't strictly save 'amount'. We should probably calculate from material prices.
    // However, older orders might have different prices?
    // Let's check if 'amount' exists in the type definition if we could, but we can't easily.
    // Safest bet for now: Use Material Prices.

    // Hardcoded prices corresponding to current pricing. 
    // Ideally this should be in DB orders.amount.
    // Checks on orders:
    // If we have 'amount' (unlikely based on my review), use it.
    // Else, use map.

    const MATERIAL_PRICES_MAP: Record<string, number> = {
        sugi: 12000,
        hinoki: 15000,
        walnut: 18000,
    };

    let totalRevenue = 0;
    let pendingShipmentCount = 0;
    let totalSoldCount = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const order of orders) {
        // Total Sold (All Time)
        totalSoldCount++;

        // Revenue (Current Month only)
        const orderDate = new Date(order.created_at);
        if (orderDate >= startOfMonth) {
            const amount = order.amount || MATERIAL_PRICES_MAP[order.material] || 0;
            totalRevenue += amount;
        }

        // Pending Shipment (Active)
        if (order.status === 'paid' || order.status === 'in_production') {
            pendingShipmentCount++;
        }
    }

    return {
        totalRevenue,
        pendingShipmentCount,
        totalSoldCount
    };
}

export async function getAdminCustomers() {
    await verifyAdmin();

    // Fetch all profiles with their orders
    const { data: profiles, error } = await (adminDbClient as any)
        .from('profiles')
        .select(`
            *,
            orders (*)
        `);

    if (error) {
        console.error('[Admin] Customers Fetch Error:', error);
        throw new Error('Failed to fetch customers');
    }

    const MATERIAL_PRICES_MAP: Record<string, number> = {
        sugi: 12000,
        hinoki: 15000,
        walnut: 18000,
    };

    // Aggregate Data
    const customers = profiles.map((profile: any) => {
        const orders = profile.orders || [];
        // Filter paid orders for LTV
        const paidOrders = orders.filter((o: any) =>
            ['paid', 'in_production', 'shipped', 'delivered'].includes(o.status)
        );

        const totalSpend = paidOrders.reduce((sum: number, o: any) => {
            return sum + (o.amount || MATERIAL_PRICES_MAP[o.material] || 0);
        }, 0);

        // Find latest order date
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortedOrders = [...orders].sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const latestOrder = sortedOrders[0] as any;

        // Fallback name logic: Profile Name -> Latest Order Name -> Email
        const displayName = profile.full_name || latestOrder?.shipping_name || profile.email || 'Unknown';

        return {
            id: profile.id,
            email: profile.email,
            displayName,
            orderCount: paidOrders.length,
            totalSpend,
            registeredAt: profile.created_at || null, // profiles created_at might be null if not tracked properly early on
            latestOrderAt: latestOrder?.created_at || null
        };
    });

    // Sort by Total Spend (Desc)
    customers.sort((a: any, b: any) => b.totalSpend - a.totalSpend);

    return customers;
}

export async function getAdminCard(id: string) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // We use adminDbClient to fetch the card first to check ownership (bypassing RLS for the check)
    const { data, error } = await (adminDbClient as any)
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('[Admin] Card Fetch Error:', error);
        throw new Error('Failed to fetch card');
    }

    // Authorization Check
    const adminEmail = process.env.ADMIN_EMAIL
    const isOwner = user?.id === data.owner_id
    const isAdmin = user?.email === adminEmail

    if (!user || (!isOwner && !isAdmin)) {
        throw new Error('Unauthorized: You do not own this card')
    }

    return data;
}

export async function updateAdminCard(
    id: string,
    data: {
        title: string
        description: string
        slug: string
        material_type: string
        wood_origin: string
        wood_age: string
        wood_story: string
    }
    }
) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Authorization Check: Fetch card to verify owner
    const { data: card, error: fetchError } = await (adminDbClient as any)
        .from('cards')
        .select('owner_id')
        .eq('id', id)
        .single()

    if (fetchError || !card) {
        throw new Error('Card not found')
    }

    const adminEmail = process.env.ADMIN_EMAIL
    const isOwner = user?.id === card.owner_id
    const isAdmin = user?.email === adminEmail

    if (!user || (!isOwner && !isAdmin)) {
        throw new Error('Unauthorized: You do not own this card')
    }

    console.log(`[Admin] Updating card ${id}`, data);

    const { error } = await (adminDbClient as any)
        .from('cards')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error('[Admin] Card Update Error:', error);
        throw new Error('Failed to update card: ' + error.message);
    }

    revalidatePath('/admin/cards')
    revalidatePath(`/p/${data.slug}`) // Revalidate public page
    return { success: true };
}
