'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

export async function saveCardConnection(cardId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data: card, error: cardError } = await supabase
        .from('cards')
        .select('id')
        .eq('id', cardId)
        .single()

    if (cardError || !card) {
        console.error('Error fetching card before connection save:', cardError)
        throw new Error('Card not found')
    }

    const adminSupabase = createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )

    const { data: existingConnection, error: existingError } = await adminSupabase
        .from('card_connections')
        .select('id')
        .eq('card_id', cardId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existingError) {
        console.error('Error checking existing card connection:', existingError)
        throw new Error('Failed to save this card')
    }

    if (existingConnection) {
        return { success: true, alreadySaved: true }
    }

    const { error } = await supabase
        .from('card_connections')
        .insert({
            card_id: cardId,
            user_id: user.id,
        })

    if (error) {
        console.error('Error saving card connection:', error)
        throw new Error(error.message || 'Failed to save this card')
    }

    return { success: true, alreadySaved: false }
}
