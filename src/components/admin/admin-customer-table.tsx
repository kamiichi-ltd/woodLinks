'use client'

interface Customer {
    id: string
    email: string | null
    displayName: string
    orderCount: number
    totalSpend: number
    registeredAt: string | null
    latestOrderAt: string | null
}

export function AdminCustomerTable({ customers }: { customers: Customer[] }) {
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-stone-200">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-50 text-stone-500 font-medium">
                    <tr>
                        <th className="px-6 py-3 text-left">顧客名 / メール</th>
                        <th className="px-6 py-3 text-left">注文回数 (Paid)</th>
                        <th className="px-6 py-3 text-left">総購入額 (LTV)</th>
                        <th className="px-6 py-3 text-left">最終注文日</th>
                        <th className="px-6 py-3 text-left">登録日</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4 align-top">
                                <div className="font-bold text-stone-900">
                                    {customer.displayName}
                                </div>
                                <div className="text-stone-500 text-xs font-mono">
                                    {customer.email}
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top text-stone-700">
                                {customer.orderCount} 回
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="font-bold text-stone-900">
                                    ¥{customer.totalSpend.toLocaleString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top text-stone-600">
                                {customer.latestOrderAt ? (
                                    <>
                                        {new Date(customer.latestOrderAt).toLocaleDateString('ja-JP')}
                                        <div className="text-xs text-stone-400">
                                            {new Date(customer.latestOrderAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-stone-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top text-stone-500 text-xs">
                                {customer.registeredAt ? new Date(customer.registeredAt).toLocaleDateString('ja-JP') : '-'}
                            </td>
                        </tr>
                    ))}
                    {customers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-stone-400">
                                顧客データが見つかりませんでした。
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
