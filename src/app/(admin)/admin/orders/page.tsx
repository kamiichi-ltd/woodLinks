import { getAdminOrders } from '@/app/actions/admin'
import { AdminOrderTable } from '@/components/admin/admin-order-table'
import { Package } from 'lucide-react'

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
    // Fetch orders via Server Action (using Service Role)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = await getAdminOrders() as any
    // Type casting needed because the Join result type is separate from simpler DB types, 
    // or I can refine the type in the component. For now casting for speed, 
    // the Table component defines specific shape expectation.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="text-stone-400" />
                        注文管理
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        すべての注文状況を確認・管理します。
                    </p>
                </div>
                <div className="bg-stone-100 px-4 py-2 rounded-lg text-sm font-medium">
                    受注件数: <span className="text-stone-900 font-bold ml-1">{orders.length}</span>
                </div>
            </div>

            <AdminOrderTable orders={orders} />
        </div>
    )
}
