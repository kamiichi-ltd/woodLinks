import { getAdminCard } from '@/app/actions/admin'
import { CardEditForm } from '@/components/admin/card-edit-form'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminCardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    let card
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        card = await getAdminCard(id) as any
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
        </div>
    )
}
