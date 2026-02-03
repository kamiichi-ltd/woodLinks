import { getAdminCard } from '@/app/actions/admin'
import { getCardAnalytics } from '@/app/actions/analytics'
import { CardEditForm } from '@/components/admin/card-edit-form'
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminCardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    let card
    let analyticsData = null

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        card = await getAdminCard(id) as any
        analyticsData = await getCardAnalytics(id)
    } catch (e) {
        console.error(e)
        notFound()
    }

    if (!card) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <CardEditForm card={card} />

            <div className="border-t border-stone-200 my-8"></div>

            <AnalyticsDashboard data={analyticsData} />
        </div>
    )
}
