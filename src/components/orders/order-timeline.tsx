import { Database } from '@/database.types';
import { cn } from '@/lib/utils';


import { Check, Circle, Clock, Truck, Hammer, CreditCard, FileText } from 'lucide-react';

type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];

interface OrderTimelineProps {
    status: OrderStatus;
    className?: string;
}

const STEPS = [
    {
        id: 'placed',
        label: '注文受付',
        sub: 'Order Placed',
        icon: FileText,
        description: 'ご注文を受け付けました'
    },
    {
        id: 'payment',
        label: 'お支払い',
        sub: 'Payment',
        icon: CreditCard,
        description: 'ご入金を確認しています'
    },
    {
        id: 'production',
        label: '製作開始',
        sub: 'Production',
        icon: Hammer,
        description: '職人が木材を加工しています'
    },
    {
        id: 'shipped',
        label: '発送完了',
        sub: 'Shipped',
        icon: Truck,
        description: '商品をお届けに向かっています'
    }
] as const;

export function OrderTimeline({ status, className = '' }: OrderTimelineProps) {
    // Determine current active step index
    // Steps: 0: placed, 1: payment, 2: production, 3: shipped
    let currentIndex = 0;

    switch (status) {
        case 'pending_payment':
            currentIndex = 1;
            break;
        case 'paid':
        case 'in_production':
            currentIndex = 2;
            break;
        case 'shipped':
        case 'delivered':
            currentIndex = 3;
            break;
        case 'cancelled':
        case 'refunded':
            currentIndex = -1; // Special case
            break;
        default:
            currentIndex = 0;
    }

    if (currentIndex === -1) {
        return (
            <div className={`bg-stone-100 p-6 rounded-lg text-center ${className}`}>
                <p className="text-stone-500 font-medium">この注文はキャンセルまたは返金されました。</p>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <div className="relative flex flex-col md:flex-row justify-between w-full">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-stone-200 -z-0" />

                {/* Connecting Line (Mobile) - Left bar */}
                <div className="md:hidden absolute top-5 left-5 h-full w-0.5 bg-stone-200 -z-0" />

                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex md:flex-col items-start md:items-center md:flex-1 mb-8 md:mb-0 last:mb-0 group">

                            {/* Icon Circle */}
                            <div className={`
                                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 flex-shrink-0
                                ${isCompleted || isCurrent
                                    ? 'bg-[#d4a373] border-[#d4a373] text-white'
                                    : 'bg-white border-stone-300 text-stone-300'}
                            `}>
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="ml-4 md:ml-0 md:mt-3 md:text-center pt-1 md:pt-0">
                                <p className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-stone-800' : 'text-stone-400'}`}>
                                    {step.label}
                                </p>
                                <p className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-1">
                                    {step.sub}
                                </p>
                                {isCurrent && (
                                    <div className="mt-1 p-2 bg-stone-50 border border-stone-200 rounded text-xs text-stone-600 animate-in fade-in slide-in-from-top-1">
                                        {step.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
