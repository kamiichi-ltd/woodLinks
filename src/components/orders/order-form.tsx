'use client';

import { useState } from 'react';
import { createOrder, startCheckout } from '@/services/order-service';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderFormProps {
    cardId: string;
    onOrderCreated: () => void;
}

export function OrderForm({ cardId, onOrderCreated }: OrderFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Form States
    const [material, setMaterial] = useState<'sugi' | 'hinoki' | 'walnut'>('sugi');
    const [quantity, setQuantity] = useState(100);
    const [shippingName, setShippingName] = useState('');
    const [shippingPostal, setShippingPostal] = useState('');
    const [shippingAddress1, setShippingAddress1] = useState('');
    const [shippingAddress2, setShippingAddress2] = useState('');
    const [shippingPhone, setShippingPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[OrderForm] Submitting order...');
        setLoading(true);
        setError(null);

        try {
            // 1. Create Order
            console.log('[OrderForm] Calling createOrder...');
            const orderId = await createOrder({
                card_id: cardId,
                material,
                quantity,
                shipping_name: shippingName,
                shipping_postal: shippingPostal,
                shipping_address1: shippingAddress1,
                shipping_address2: shippingAddress2,
                shipping_phone: shippingPhone,
            });
            console.log('[OrderForm] Order created. ID:', orderId);

            if (!orderId) {
                throw new Error('Order creation returned no ID');
            }

            // 2. Initiate Checkout (Server Action)
            console.log('[OrderForm] Starting checkout flow...');
            const checkoutUrl = await startCheckout(orderId);
            console.log('[OrderForm] Checkout URL received:', checkoutUrl);

            if (checkoutUrl) {
                // 3. Redirect to Stripe
                console.log('[OrderForm] Redirecting to Stripe...');
                window.location.href = checkoutUrl;
            } else {
                throw new Error('Failed to retrieve checkout URL');
            }

            onOrderCreated(); // Optional: Refresh parent state (background)
        } catch (err: any) {
            console.error('[OrderForm] Error:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).message || '注文の作成に失敗しました。');
            setLoading(false); // Only stop loading on error. On success, we redirect.
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 mb-4">木の名刺を注文する</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Material Selection */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">材質</label>
                    <select
                        value={material}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setMaterial(e.target.value as any)}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    >
                        <option value="sugi">杉 (Sugi)</option>
                        <option value="hinoki">檜 (Hinoki)</option>
                        <option value="walnut">ウォールナット (Walnut)</option>
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">枚数</label>
                    <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    >
                        <option value={100}>100枚</option>
                        <option value={200}>200枚</option>
                        <option value={300}>300枚</option>
                    </select>
                </div>

                <div className="border-t border-stone-200 my-4" />

                <h4 className="font-medium text-stone-800">配送先情報</h4>

                {/* Shipping Name */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">お名前</label>
                    <input
                        type="text"
                        required
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    />
                </div>

                {/* Postal Code */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">郵便番号</label>
                    <input
                        type="text"
                        required
                        placeholder="123-4567"
                        value={shippingPostal}
                        onChange={(e) => setShippingPostal(e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    />
                </div>

                {/* Address 1 */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">住所1 (都道府県・市区町村・番地)</label>
                    <input
                        type="text"
                        required
                        value={shippingAddress1}
                        onChange={(e) => setShippingAddress1(e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    />
                </div>

                {/* Address 2 */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">住所2 (建物名・部屋番号)</label>
                    <input
                        type="text"
                        value={shippingAddress2}
                        onChange={(e) => setShippingAddress2(e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">電話番号</label>
                    <input
                        type="tel"
                        required
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="w-full border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-500 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-900 text-white font-bold py-3 rounded hover:bg-stone-700 transition-colors disabled:opacity-50 flex justify-center items-center mt-6"
                >
                    {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : '注文を確定する'}
                </button>
            </form>
        </div>
    );
}
