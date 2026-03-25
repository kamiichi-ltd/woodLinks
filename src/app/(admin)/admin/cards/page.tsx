import { Layers3 } from 'lucide-react'
import { getAdminCards } from '@/app/actions/admin-bulk'
import { AdminCardTable } from '@/components/admin/admin-card-table'
import { BulkCardGenerator } from '@/components/admin/bulk-card-generator'

export const dynamic = 'force-dynamic'

export default async function AdminCardsPage() {
    const cards = await getAdminCards()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-900">
                        <Layers3 className="text-stone-400" />
                        カード管理
                    </h1>
                    <p className="mt-1 text-sm text-stone-500">
                        量産用の空カード生成と、既存カードの編集導線をまとめて管理します。
                    </p>
                </div>
                <div className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                    登録カード数: <span className="ml-1 font-bold text-stone-900">{cards.length}</span>
                </div>
            </div>

            <BulkCardGenerator />

            <AdminCardTable cards={cards} />
        </div>
    )
}
