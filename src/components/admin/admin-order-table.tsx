'use client'

import { useState } from 'react'
import { Database } from '@/database.types'
import { StatusUpdateDialog } from './status-update-dialog'
import { ClipboardCopy, Check, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'

const STATUS_MAP: Record<string, string> = {
    pending_payment: '支払い待ち',
    paid: '支払い完了',
    in_production: '製作中',
    shipped: '発送済み',
    delivered: '到着済み',
    cancelled: 'キャンセル',
    refunded: '返金済み',
}

type Order = Database['public']['Tables']['orders']['Row'] & {
    profiles: {
        email: string | null
        full_name: string | null
    } | null
    cards: {
        id: string
        title: string | null
        slug: string | null
    } | null
}

export function AdminOrderTable({ orders }: { orders: Order[] }) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopyUrl = async (slug: string, orderId: string) => {
        if (!slug) return
        const url = `https://wood-links.vercel.app/p/${slug}`

        try {
            await navigator.clipboard.writeText(url)
            setCopiedId(orderId)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            alert('コピーに失敗しました')
        }
    }

    return (
        <div className="bg-white rounded-xl shadow border border-stone-200">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left whitespace-nowrap">注文ID / 受注日時</th>
                            <th className="px-6 py-3 text-left whitespace-nowrap">顧客名</th>
                            <th className="px-6 py-3 text-left whitespace-nowrap">注文内容</th>
                            <th className="px-6 py-3 text-left whitespace-nowrap">配送先住所</th>
                            <th className="px-6 py-3 text-left whitespace-nowrap">ステータス</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">更新</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.map((order: any) => (
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
                                        {order.profiles?.full_name || (order as any).shipping_name || order.profiles?.email || 'Unknown'}
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
                                        {order.cards && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-stone-400 text-xs">Card: {order.cards.title}</span>
                                                <button
                                                    onClick={() => handleCopyUrl(order.cards?.slug || '', order.id)}
                                                    className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-600 transition-colors relative group"
                                                    title="URLをコピー"
                                                >
                                                    {copiedId === order.id ? <Check className="h-3 w-3 text-green-500" /> : <ClipboardCopy className="h-3 w-3" />}
                                                    {copiedId === order.id && (
                                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                                                            Copied!
                                                        </span>
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/admin/cards/${order.cards?.id}`}
                                                    className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-600 transition-colors"
                                                    title="カード編集"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top text-stone-600 max-w-xs min-w-[200px]">
                                    <div className="font-bold">{(order as any).shipping_name}</div>
                                    <div>〒{(order as any).shipping_postal}</div>
                                    <div>{(order as any).shipping_address1}</div>
                                    {(order as any).shipping_address2 && <div>{(order as any).shipping_address2}</div>}
                                    <div className="text-xs text-stone-400 mt-1">📞 {(order as any).shipping_phone}</div>
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
                                            追跡番号: {order.tracking_number}
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
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4">
                {orders.map((order: any) => (
                    <div key={order.id} className="border border-stone-200 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
                        {/* Header: ID and Date */}
                        <div className="flex justify-between items-start border-b border-stone-100 pb-2">
                            <div className="font-mono text-xs text-stone-400">
                                #{order.id.slice(0, 8)}
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-medium text-stone-900">
                                    {new Date(order.created_at).toLocaleDateString('ja-JP')}
                                </div>
                                <div className="text-[10px] text-stone-400">
                                    {new Date(order.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <div className="font-bold text-lg text-stone-800">
                                {order.profiles?.full_name || (order as any).shipping_name || order.profiles?.email || 'Unknown'}
                            </div>
                            <div className="text-xs text-stone-500 truncate">
                                {order.profiles?.email}
                            </div>
                        </div>

                        {/* Type & Quantity */}
                        <div className="flex items-center justify-between bg-stone-50 p-2 rounded">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold
                                ${order.material === 'walnut' ? 'bg-[#4a3b32] text-[#e6e2d3]' :
                                    order.material === 'hinoki' ? 'bg-[#fdfbf7] text-[#2c3e50] border border-[#e9d8a6]' :
                                        'bg-[#faf9f6] text-[#5e5045] border border-[#d4a373]'}
                            `}>
                                {order.material === 'walnut' ? 'ウォールナット' : order.material === 'hinoki' ? '檜 (Hinoki)' : '杉 (Sugi)'}
                            </span>
                            <span className="font-bold text-stone-700">x {order.quantity}</span>
                        </div>
                        {order.cards && (
                            <div className="flex items-center justify-between text-xs text-stone-500">
                                <span>Card Plan: {order.cards.title}</span>
                                <button
                                    onClick={() => handleCopyUrl(order.cards?.slug || '', order.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full border transition-all ${copiedId === order.id
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                                        }`}
                                >
                                    {copiedId === order.id ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                                    <span className="font-medium">URLをコピー</span>
                                </button>
                            </div>
                        )}

                        {/* Status Badge */}
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-stone-500 font-medium">Status</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {STATUS_MAP[order.status] || order.status}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                            <StatusUpdateDialog
                                orderId={order.id}
                                currentStatus={order.status}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="p-8 text-center text-stone-400">
                    該当する注文は見つかりませんでした。
                </div>
            )}
        </div>
    )
}
