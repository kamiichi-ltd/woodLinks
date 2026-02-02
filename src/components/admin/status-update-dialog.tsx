'use client'

import { useState } from 'react'
import { Database } from '@/database.types'
import { updateOrderStatus } from '@/app/actions/admin'
import { Truck, Check, Loader2, AlertCircle } from 'lucide-react'

type OrderStatus = Database['public']['Tables']['orders']['Row']['status']

interface StatusUpdateDialogProps {
    orderId: string
    currentStatus: OrderStatus
    onUpdate?: () => void
}

const ALL_STATUSES: OrderStatus[] = [
    'pending_payment',
    'paid',
    'in_production',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
]

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending_payment: '支払い待ち',
    paid: '支払い完了',
    in_production: '製作中',
    shipped: '発送済み',
    delivered: '到着済み',
    cancelled: 'キャンセル',
    refunded: '返金済み',
}

export function StatusUpdateDialog({ orderId, currentStatus, onUpdate }: StatusUpdateDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = async () => {
        setError(null)
        setIsPending(true)

        try {
            await updateOrderStatus(orderId, newStatus, trackingNumber || null)
            setIsOpen(false)
            if (onUpdate) onUpdate()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to update')
        } finally {
            setIsPending(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs border border-stone-300 rounded px-2 py-1 hover:bg-stone-100 transition-colors font-medium text-stone-600"
            >
                詳細・更新
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="font-bold text-stone-800">ステータス更新</h3>
                    <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Status Select */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Status</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                            className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 text-sm focus:ring-2 focus:ring-stone-400 focus:outline-none"
                        >
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tracking Number Input (Conditional) */}
                    {newStatus === 'shipped' && (
                        <div className="space-y-1 animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                                <Truck className="h-3 w-3" /> 追跡番号 (Tracking Number)
                            </label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="1234-5678-9012"
                                className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none text-sm"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-xs flex items-center gap-1 bg-red-50 p-2 rounded">
                            <AlertCircle className="h-3 w-3" /> {error}
                        </div>
                    )}
                </div>

                <div className="bg-stone-50 px-6 py-4 flex justify-end gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                        disabled={isPending}
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isPending}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-stone-900 hover:bg-black transition-colors flex items-center gap-2"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        更新する
                    </button>
                </div>
            </div>
        </div>
    )
}
