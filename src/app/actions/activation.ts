'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function claimCard(cardId: string) {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Should trigger login flow in UI, or redirect here
        redirect('/login')
    }

    // 2. Check Card Status (Must be unowned)
    // We use a separate query or enforce in update to be safe
    // Ideally we check first to provide good error message
    // Use 'as any' to bypass strict inference if column is missing from local types during update
    const { data: card, error: fetchError } = await (supabase as any)
        .from('cards')
        .select('owner_id')
        .eq('id', cardId)
        .single()

    if (fetchError || !card) {
        throw new Error('Card not found')
    }

    if (card.owner_id) {
        throw new Error('Card is already claimed')
    }

    // 3. Claim Card
    // Using Supabase client with user context. 
    // RLS usually allows UPDATE if you are owner OR if no owner?
    // We might need to ensure RLS policies allow 'claiming' (UPDATE where owner_id is null).
    // If standard RLS only allows owner to update, this might fail unless we have a specific policy 
    // OR we use Service Role (Admin).
    // **Decision**: Safe to use Service Role for this explicit "Claim" action to bypass RLS complexity for now,
    // assuming valid user and valid card logic is checked.
    // However, clean way is RLS: "Allow Update if owner_id is NULL".

    // For this implementation, let's use the standard client first. If RLS blocks, we might need adjustments.
    // Spec says: "Update owner_id to user ID".

    // NOTE: If RLS prevents update, we'll need to use adminClient. 
    // Given the previous pattern in `admin.ts`, we have access to keys. 
    // But this is a USER action.
    // Let's try standard client. If RLS is stricter (e.g. `using (auth.uid() = user_id)`), this will fail.
    // Since `user_id` was the old owner column, existing RLS likely checks `user_id`.
    // But `owner_id` is the NEW owner column.
    // For "Activation", the card has `owner_id = NULL`.

    // Let's use `adminDbClient` pattern if we have it, OR just assume an "Unclaimed" card is public writable? No.
    // We will use the SERVICE KEY here to guarantee the claim succeeds, 
    // because regular users shouldn't be able to update arbitrary cards unless they own them.
    // But "Claiming" is a special transition.

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // Using `as any` to bypass generic type mismatch if strict
    const { error: updateError } = await (supabaseAdmin as any)
        .from('cards')
        .update({
            owner_id: user.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .is('owner_id', null) // Double check concurrency

    if (updateError) {
        console.error('Claim failed:', updateError)
        throw new Error('Failed to claim card')
    }

    // 4. Redirect to Edit Page
    redirect(`/admin/cards/${cardId}`)
}
