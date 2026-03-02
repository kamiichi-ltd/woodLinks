'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Order } from '@/types/domain';

export async function deleteOrder(orderId: string) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    // 2. Fetch Order to verify ownership and status
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (fetchError || !order) {
        throw new Error('Order not found');
    }

    const typedOrder = order as Order;

    if (typedOrder.user_id !== user.id) {
        throw new Error('Unauthorized');
    }

    if (typedOrder.status !== 'pending_payment') {
        throw new Error('Only pending orders can be deleted');
    }

    // 3. Delete Order
    const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

    if (deleteError) {
        console.error('Failed to delete order:', deleteError);
        throw new Error('Failed to delete order');
    }

    revalidatePath(`/dashboard/cards/${typedOrder.card_id}`);
    return { success: true };
}
