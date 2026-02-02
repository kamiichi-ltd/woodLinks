'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '@/database.types';
import { OrderForm } from './order-form';
import { OrderStatusView } from './order-status-view';
import { OrderTimeline } from './order-timeline';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { deleteOrder } from '@/app/actions/order';

type Order = Database['public']['Tables']['orders']['Row'];

interface OrderSectionProps {
    cardId: string;
    initialOrders: Order[];
}

export function OrderSection({ cardId, initialOrders }: OrderSectionProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    // For now, simpler handling: just take the most recent order if exists.
    // Ideally, if a previous order is 'delivered' / 'cancelled', we might allow re-ordering.
    // But for this version, let's just show the latest order if it exists and is active.

    // Logic:
    // If no orders -> Show Form
    // If pending/paid/in_production/shipped -> Show Status View
    // If cancelled/delivered -> Maybe show Status View with "Order Again" button?

    // Implementation: Just show the latest order. If the user wants to order again, we need a button to reset "viewing mode" to form.

    const [orders, setOrders] = useState<Order[]>(initialOrders);

    // Find the active order
    const activeOrder = orders[0]; // Assuming sorted by created_at desc from server

    // Poll for status update if payment was successful but DB is not yet updated
    useEffect(() => {
        if (status === 'success' && activeOrder?.status === 'pending_payment') {
            const interval = setInterval(() => {
                console.log('[OrderSection] Polling for payment status...');
                router.refresh();
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [status, activeOrder?.status, router]);

    const handleOrderCreated = () => {
        router.refresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-3 mb-2">
                <h2 className="text-2xl font-serif font-bold text-[#2c3e50] leading-none">Order Physical Card</h2>
                <span className="text-sm font-medium text-[#8c7b6c] mb-0.5">/ 木の名刺を注文</span>
            </div>

            {status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-green-800">お支払いが完了しました</h3>
                        <p className="text-sm text-green-700 mt-1">
                            ご注文ありがとうございます。製作を開始いたします。詳細は下記ステータスをご確認ください。
                        </p>
                    </div>
                </div>
            )}

            {status === 'cancel' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-800">決済がキャンセルされました</h3>
                        <p className="text-sm text-red-700 mt-1">
                            お支払いは完了していません。再度お試しください。
                        </p>
                    </div>
                </div>
            )}

            {!activeOrder ? (
                <OrderForm cardId={cardId} onOrderCreated={handleOrderCreated} />
            ) : (
                <div className="space-y-6">
                    {/* Payment Success Polling View */}
                    {status === 'success' && activeOrder?.status === 'pending_payment' ? (
                        <div className="bg-white p-8 rounded-lg shadow border border-stone-200 text-center">
                            <Loader2 className="h-8 w-8 text-[#d4a373] animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-stone-800">お支払いを確認中...</h3>
                            <p className="text-stone-500 text-sm mt-2">
                                決済システムの応答を待機しています。<br />
                                画面を閉じずにお待ちください。通常数秒で完了します。
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <OrderTimeline status={activeOrder.status} />
                            <OrderStatusView order={activeOrder} />

                            {/* Delete Option for Pending Orders */}
                            {activeOrder.status === 'pending_payment' && (
                                <div className="text-center pt-4 border-t border-stone-200">
                                    <button
                                        onClick={async () => {
                                            if (confirm('本当にこの名刺プロジェクトを削除しますか？\nこの操作は取り消せません。')) {
                                                try {
                                                    await deleteOrder(activeOrder.id);
                                                    router.refresh();
                                                } catch (e) {
                                                    alert('削除に失敗しました');
                                                    console.error(e);
                                                }
                                            }
                                        }}
                                        className="text-sm text-red-500 hover:text-red-700 hover:underline font-medium"
                                    >
                                        この名刺プロジェクトを削除する
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
