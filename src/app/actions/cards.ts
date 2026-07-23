'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    createCardUseCase,
    updateCardUseCase,
    deleteCardUseCase,
    addCardContentUseCase,
    deleteCardContentUseCase,
    reorderCardContentsUseCase,
} from '@/usecases/card-usecase'
import type { Json } from '@/database.types'

export async function createCard(formData: FormData) {
    const supabase = await createClient()
    const title = formData.get('title') as string
    const data = await createCardUseCase(supabase, title)
    revalidatePath('/dashboard')
    return data
}

export async function updateCard(
    id: string,
    updates: {
        title?: string
        description?: string
        status?: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'
        slug?: string
        material_type?: 'sugi' | 'hinoki' | 'walnut'
    }
) {
    const supabase = await createClient()
    const data = await updateCardUseCase(supabase, id, updates)
    revalidatePath('/dashboard')
    return data
}

export async function deleteCard(id: string) {
    const supabase = await createClient()
    await deleteCardUseCase(supabase, id)
    revalidatePath('/dashboard')
}

export async function addCardContent(cardId: string, type: 'sns_link' | 'text', content: Json) {
    const supabase = await createClient()
    const data = await addCardContentUseCase(supabase, cardId, type, content)
    revalidatePath(`/dashboard/cards/${cardId}`)
    return data
}

export async function deleteCardContent(contentId: string, cardId: string) {
    const supabase = await createClient()
    await deleteCardContentUseCase(supabase, contentId, cardId)
    revalidatePath(`/dashboard/cards/${cardId}`)
}

export async function reorderCardContents(cardId: string, items: { id: string; order_index: number }[]) {
    const supabase = await createClient()
    await reorderCardContentsUseCase(supabase, cardId, items)
    revalidatePath(`/dashboard/cards/${cardId}`)
}
