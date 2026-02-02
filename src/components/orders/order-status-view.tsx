'use client';

import { useState } from 'react';
import { Database } from '@/database.types';
import { startCheckout } from '@/services/order-service';
import { Loader2, CreditCard, CheckCircle, Truck, Package } from 'lucide-react';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderStatusViewProps {
    order: Order;
}

export function OrderStatusView({ order }: OrderStatusViewProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const url = await startCheckout(order.id);
            if (url) {
                window.location.href = url; // Redirect to checkout
            }
        } catch (err) {
            console.error(err);
            alert('決済の開始に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const statusLabels: Record<string, string> = {
        pending_payment: 'お支払い待ち',
        paid: '製作準備中',
        in_production: '製作中',
        shipped: '発送済み',
        delivered: '配達完了',
        cancelled: 'キャンセル',
        refunded: '返金済み',
    };

    const materialLabels: Record<string, string> = {
        sugi: '杉 (Sugi)',
        hinoki: '桧 (Hinoki)',
        walnut: '胡桃 (Walnut)',
    };

    const StatusIcon = () => {
        switch (order.status) {
            case 'pending_payment': return <CreditCard className="h-6 w-6 text-amber-500" />;
            case 'paid':
            case 'in_production': return <Package className="h-6 w-6 text-blue-500" />;
            case 'shipped':
            case 'delivered': return <Truck className="h-6 w-6 text-green-500" />;
            default: return <CheckCircle className="h-6 w-6 text-stone-500" />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
                <StatusIcon />
                <h3 className="text-lg font-bold text-stone-800">
                    ステータス: {statusLabels[order.status || ''] || order.status || '未設定'}
                </h3>
            </div>

            <div className="space-y-3 text-sm text-stone-600 mb-6">
                <p>注文ID: <span className="font-mono">{order.id}</span></p>
                <p>材質: {materialLabels[(order as any).material] || (order as any).material}</p>
                <p>枚数: {(order as any).quantity}枚</p>
                <p>配送先: {(order as any).shipping_name} 様</p>

                {order.status === 'shipped' && order.tracking_number && (
                    <div className="p-3 bg-blue-50 text-blue-800 rounded mt-2">
                        <p className="font-bold">追跡番号</p>
                        <p className="font-mono text-lg">{order.tracking_number}</p>
                    </div>
                )}
            </div>

            {order.status === 'pending_payment' && (
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : '支払いに進む'}
                </button>
            )}
        </div>
    );
}
