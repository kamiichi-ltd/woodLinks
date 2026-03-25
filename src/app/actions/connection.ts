'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

export type CardLead = {
    userId: string
    fullName: string | null
    avatarUrl: string | null
    createdAt: string
}

type JoinedLeadRow = {
    created_at: string
    user_id: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
        email: string | null
    } | null
}

type LeadProfileRow = {
    id: string
    full_name: string | null
    avatar_url: string | null
    email: string | null
}

function createAdminSupabase() {
    return createAdminClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}

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

    const adminSupabase = createAdminSupabase()

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

export async function getCardLeads(cardId: string): Promise<CardLead[]> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const adminSupabase = createAdminSupabase()

    const { data: ownedCard, error: ownedCardError } = await adminSupabase
        .from('cards')
        .select('id')
        .eq('id', cardId)
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .maybeSingle()

    if (ownedCardError || !ownedCard) {
        if (ownedCardError) {
            console.error('Error verifying card ownership before lead fetch:', ownedCardError)
        }
        return []
    }

    const joinedLeadResult = await (adminSupabase
        .from('card_connections')
        .select(`
            created_at,
            user_id,
            profiles:user_id (
                full_name,
                avatar_url,
                email
            )
        `)
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })) as unknown as {
            data: JoinedLeadRow[] | null
            error: { message: string } | null
        }

    const { data: joinedLeads, error: joinedLeadsError } = joinedLeadResult

    if (!joinedLeadsError && joinedLeads) {
        return joinedLeads.map((lead) => ({
            userId: lead.user_id,
            fullName: lead.profiles?.full_name || lead.profiles?.email || null,
            avatarUrl: lead.profiles?.avatar_url || null,
            createdAt: lead.created_at,
        }))
    }

    if (joinedLeadsError) {
        console.error('Error fetching joined card leads, falling back to manual merge:', joinedLeadsError)
    }

    const { data: connections, error: connectionsError } = await adminSupabase
        .from('card_connections')
        .select('user_id, created_at')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })

    if (connectionsError || !connections) {
        console.error('Error fetching card connections:', connectionsError)
        return []
    }

    if (connections.length === 0) {
        return []
    }

    const userIds = Array.from(new Set(connections.map((connection) => connection.user_id)))
    const profileResult = await (adminSupabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds)) as unknown as {
            data: LeadProfileRow[] | null
            error: { message: string } | null
        }

    const { data: profiles, error: profilesError } = profileResult

    if (profilesError) {
        console.error('Error fetching lead profiles:', profilesError)
        return connections.map((connection) => ({
            userId: connection.user_id,
            fullName: null,
            avatarUrl: null,
            createdAt: connection.created_at,
        }))
    }

    const profileMap = new Map(
        (profiles || []).map((profile) => [
            profile.id,
            {
                fullName: profile.full_name || profile.email || null,
                avatarUrl: profile.avatar_url || null,
            },
        ])
    )

    return connections.map((connection) => {
        const profile = profileMap.get(connection.user_id)

        return {
            userId: connection.user_id,
            fullName: profile?.fullName || null,
            avatarUrl: profile?.avatarUrl || null,
            createdAt: connection.created_at,
        }
    })
}
