'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteWood(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('wood_inventory')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting wood:', error)
        throw new Error('Failed to delete wood')
    }

    revalidatePath('/admin/inventory')
    revalidatePath('/wood')
}
