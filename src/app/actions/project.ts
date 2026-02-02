'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteProject(cardId: string) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Not authenticated');
    }

    // 2. Check for Active Orders (Paid or later)
    // We want to prevent deletion if the user has paid for this card.
    const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('card_id', cardId)
        .in('status', ['paid', 'in_production', 'shipped', 'delivered']);

    if (countError) {
        console.error('Error checking active orders:', countError);
        throw new Error('Failed to verify project status');
    }

    if (count && count > 0) {
        throw new Error('Cannot delete project with active paid orders.');
    }

    // 3. Delete Card
    // Assuming Cascade Delete is set up for orders/contents/etc.
    // If not, we might hit constraint errors. 
    // Usually Supabase/Postgres FKs are set to NO ACTION or CASCADE.
    // If NO ACTION, we'd need to delete orders first.
    // Let's try deleting the card.

    // Safety: Verify ownership in the delete query or prior select.
    // We can do it in the delete query directly for atomic safety.
    const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

    if (deleteError) {
        console.error('Failed to delete project:', deleteError);
        throw new Error('Failed to delete project');
    }

    revalidatePath('/dashboard');
    return { success: true };
}
