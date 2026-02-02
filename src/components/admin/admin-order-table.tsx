'use client'

import { Database } from '@/database.types'
import { StatusUpdateDialog } from './status-update-dialog'

const STATUS_MAP: Record<string, string> = {
    pending_payment: '支払い待ち',
    paid: '支払い完了',
    in_production: '製作中',
    shipped: '発送済み',
    delivered: '到着済み',
    cancelled: 'キャンセル',
    refunded: '返金済み',
}

// If date-fns not available, use simple formatter
// Checking package.json... I will stick to standard Intl for zero dependency risk

type Order = Database['public']['Tables']['orders']['Row'] & {
    profiles: {
        email: string | null
        full_name: string | null
    } | null
    cards: {
        title: string | null
    } | null
}

export function AdminOrderTable({ orders }: { orders: Order[] }) {
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-stone-200">
            <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-50 text-stone-500 font-medium">
                    <tr>
                        <th className="px-6 py-3 text-left">注文ID / 受注日時</th>
                        <th className="px-6 py-3 text-left">顧客名</th>
                        <th className="px-6 py-3 text-left">注文内容</th>
                        <th className="px-6 py-3 text-left">配送先住所</th>
                        <th className="px-6 py-3 text-left">状態</th>
                        <th className="px-6 py-3 text-right">ステータス更新</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4 align-top">
                                <div className="font-mono text-xs text-stone-400 mb-1">
                                    {order.id.slice(0, 8)}...
                                </div>
                                <div className="text-stone-900 font-medium">
                                    {new Date(order.created_at).toLocaleDateString('ja-JP')}
                                    <span className="text-stone-400 text-xs ml-1">
                                        {new Date(order.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="font-bold text-stone-800">
                                    {order.profiles?.full_name || 'Unknown'}
                                </div>
                                <div className="text-stone-500 text-xs">
                                    {order.profiles?.email}
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit
                                        ${order.material === 'walnut' ? 'bg-[#4a3b32] text-[#e6e2d3]' :
                                            order.material === 'hinoki' ? 'bg-[#fdfbf7] text-[#2c3e50] border border-[#e9d8a6]' :
                                                'bg-[#faf9f6] text-[#5e5045] border border-[#d4a373]'}
                                    `}>
                                        {order.material === 'walnut' ? 'ウォールナット' : order.material === 'hinoki' ? '檜 (Hinoki)' : '杉 (Sugi)'}
                                    </span>
                                    <span className="text-stone-600 font-medium">x {order.quantity}枚</span>
                                    <span className="text-stone-400 text-xs">Card: {order.cards?.title}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top text-stone-600 max-w-xs">
                                <div className="font-bold">{order.shipping_name}</div>
                                <div>〒{order.shipping_postal}</div>
                                <div>{order.shipping_address1}</div>
                                {order.shipping_address2 && <div>{order.shipping_address2}</div>}
                                <div className="text-xs text-stone-400 mt-1">📞 {order.shipping_phone}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {STATUS_MAP[order.status] || order.status}
                                </span>
                                {order.tracking_number && (
                                    <div className="text-xs text-stone-500 mt-1 font-mono">
                                        Tracking: {order.tracking_number}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 align-top text-right">
                                <StatusUpdateDialog
                                    orderId={order.id}
                                    currentStatus={order.status}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && (
                <div className="p-8 text-center text-stone-400">
                    No orders found.
                </div>
            )}
        </div>
    )
}
