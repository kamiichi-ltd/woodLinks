import { Suspense } from 'react'
import { getAdminStats } from '@/app/actions/admin'
import { Banknote, Package, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function StatsCards() {
    const stats = await getAdminStats()

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Total Revenue */}
            <div className="overflow-hidden rounded-xl bg-white shadow shadow-stone-200 border border-stone-100">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Banknote className="h-6 w-6 text-stone-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="truncate text-sm font-medium text-stone-500">今月の売上 (概算)</dt>
                                <dd>
                                    <div className="text-lg font-bold text-stone-900">
                                        ¥{stats.totalRevenue.toLocaleString()}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Shipment */}
            <div className="overflow-hidden rounded-xl bg-white shadow shadow-stone-200 border border-stone-100">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Package className="h-6 w-6 text-stone-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="truncate text-sm font-medium text-stone-500">未発送の注文</dt>
                                <dd>
                                    <div className="text-lg font-bold text-stone-900">
                                        {stats.pendingShipmentCount} 件
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                    <div className="bg-stone-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/admin/orders" className="font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1">
                                注文を確認する <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Sold */}
            <div className="overflow-hidden rounded-xl bg-white shadow shadow-stone-200 border border-stone-100">
                <div className="p-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ShoppingBag className="h-6 w-6 text-stone-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="truncate text-sm font-medium text-stone-500">総販売枚数</dt>
                                <dd>
                                    <div className="text-lg font-bold text-stone-900">
                                        {stats.totalSoldCount} 枚
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-stone-900">ホーム (計器盤)</h1>
                <p className="mt-2 text-sm text-stone-500">
                    現在のショップの状況を確認できます。
                </p>
            </div>

            <Suspense fallback={<div className="text-stone-500">読み込み中...</div>}>
                <StatsCards />
            </Suspense>
        </div>
    )
}
