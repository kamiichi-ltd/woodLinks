import { getCardBySlug } from '@/services/card-service'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PublicCardClient from '@/components/public/public-card-client'
import { Metadata } from 'next'
import { logEvent } from '@/app/actions/analytics'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        return {
            title: 'Card Not Found - WoodLinks',
        }
    }

    return {
        title: `${card.title} | WoodLinks`,
        description: card.description || 'Digital Business Card by WoodLinks',
        openGraph: {
            title: card.title || 'WoodLinks Profile',
            description: card.description || '',
            images: card.avatar_url ? [card.avatar_url] : [],
        },
    }
}

export default async function PublicCardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        notFound()
    }

    // Log View (Server Side)
    // await is used as requested to ensure logging happens
    await logEvent(card.id, 'view')

    // Check ownership
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === card.user_id

    return <PublicCardClient card={card} isOwner={isOwner} />
}
