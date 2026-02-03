import { getCardBySlug } from '@/services/card-service'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PublicCardClient from '@/components/public/public-card-client'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        return {
            title: 'Card Not Found',
        }
    }

    return {
        title: `${card.title} | WoodLinks`,
        description: card.description || 'Digital Business Card',
    }
}

export default async function PublicCardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        notFound()
    }

    // Check ownership
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === card.user_id

    return <PublicCardClient card={card} isOwner={isOwner} />
}
