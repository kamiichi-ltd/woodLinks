'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/database.types'

export async function toggleCardStatus(cardId: string, isPublished: boolean) {
    console.log('🔘 Toggle Action Called:', { cardId, isPublished })

    const supabase = await createClient()

    // Assuming we want to bypass RLS here too? 
    // The user didn't explicitly say "Admin Action" but implied it's for the admin form.
    // However, the provided snippet uses `createClient` from `@/utils/supabase/server`, which usually uses the standard client (subject to RLS).
    // If RLS is fixed (per previous turn), this should work for the owner/admin.
    // If not, we might need Service Role. But let's follow the snippet provided by the user first.
    // UPDATE: The user provided snippet imports `createClient` from `@/utils/supabase/server`.

    const { data, error } = await supabase
        .from('cards')
        .update({
            is_published: isPublished,
            status: isPublished ? 'published' : 'draft', // Sync status column
            updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .select()
        .single()

    if (error) {
        console.error('❌ Toggle Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/cards/${cardId}`)
    return { success: true, data }
}
