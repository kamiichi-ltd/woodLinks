'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(avatarUrl: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({
            id: user.id,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

    if (error) {
        console.error('Error updating profile:', error)
        throw new Error('Failed to update profile')
    }

    revalidatePath('/dashboard')
    revalidatePath('/p/[slug]', 'page')
}
