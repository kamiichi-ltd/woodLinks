'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Database } from '@/database.types'

export async function claimCard(cardId: string) {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Should trigger login flow in UI, or redirect here
        redirect('/login')
    }

    // 2. Check Card Status (Must be unowned)
    const { data: cardData, error: fetchError } = await supabase
        .from('cards')
        .select('owner_id')
        .eq('id', cardId)
        .single()

    if (fetchError || !cardData) {
        throw new Error('Card not found')
    }

    if (cardData.owner_id) {
        throw new Error('Card is already claimed')
    }

    // 3. Claim Card
    // Using Service Role (Admin) for explicit "Claim" action to bypass RLS
    // where updates might only be permitted if owner_id = author.uid()
    const supabaseAdmin = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const updatePayload: Database['public']['Tables']['cards']['Update'] = {
        owner_id: user.id,
        updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
        .from('cards')
        .update(updatePayload)
        .eq('id', cardId)
        .is('owner_id', null) // Double check concurrency

    if (updateError) {
        console.error('Claim failed:', updateError)
        throw new Error('Failed to claim card')
    }

    // 4. Redirect to Edit Page
    // IMPORTANT: Redirect must be outside of any try-catch block.
    redirect(`/admin/cards/${cardId}`)
}
