'use server'

import { createClient } from '@/utils/supabase/server'

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

    const { data, error } = await supabase
        .from('card_connections')
        .insert({
            card_id: cardId,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving card connection:', error)
        throw new Error(error.message || 'Failed to save this card')
    }

    return data
}
