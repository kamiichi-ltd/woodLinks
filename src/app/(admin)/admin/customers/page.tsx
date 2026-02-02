import { Suspense } from 'react'
import { getAdminCustomers } from '@/app/actions/admin'
import { AdminCustomerTable } from '@/components/admin/admin-customer-table'

export const dynamic = 'force-dynamic'

async function CustomerTableWrapper() {
    const customers = await getAdminCustomers()
    return <AdminCustomerTable customers={customers} />
}

export default function AdminCustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">顧客リスト</h1>
                    <p className="mt-1 text-sm text-stone-500">
                        登録ユーザーと購入履歴（LTV順）を確認できます。
                    </p>
                </div>
                <div className="text-right text-xs text-stone-400">
                    <p>※ LTV = 支払い完了注文の合計金額</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-8 text-center text-stone-500">データを読み込み中...</div>}>
                <CustomerTableWrapper />
            </Suspense>
        </div>
    )
}
