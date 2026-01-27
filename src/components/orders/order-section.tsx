'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Database } from '@/database.types';
import { OrderForm } from './order-form';
import { OrderStatusView } from './order-status-view';
import { CheckCircle2, XCircle } from 'lucide-react';

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

    const handleOrderCreated = () => {
        router.refresh(); // Refresh Server Components to get new data
        // Optimistically update or just wait for refresh?
        // Since refresh is async, we might want to manually fetch or just wait.
        // For simpler UX, we can just rely on refresh, but it might be slow.
        // Ideally we should refetch orders here client side too or wait for the refresh.

        // Using router.refresh() is the Next.js way.
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
                <div className="space-y-4">
                    {/* If order is completed/cancelled, we might want to allow new order.
               For now, Simplest: Just show the status view.
            */}
                    <OrderStatusView order={activeOrder} />

                    {/* Allow re-order if cancelled or delivered (optional for now) 
               {(activeOrder.status === 'cancelled' || activeOrder.status === 'delivered') && (
                  <button onClick={() => setViewingForm(true)} ...>Order Again</button>
               )}
           */}
                </div>
            )}
        </div>
    );
}
