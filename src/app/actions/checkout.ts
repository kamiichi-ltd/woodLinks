'use server'

import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'
import { Database } from '@/database.types'

type OrderWithCard = Database['public']['Tables']['orders']['Row'] & {
    // cardsテーブルは廃止され、ordersテーブルに統合されました
    cards: Pick<Database['public']['Tables']['orders']['Row'], 'id' | 'title' | 'user_id'>
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2025-01-27.acacia' as any, // Bypass strict type check for now to match installed SDK
})

import { MATERIAL_PRICES, MaterialType } from '@/constants/prices';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Safe Input Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createStripeCheckoutSession(orderIdInput: string | { id: string } | any) {
    // Sanitize Input: If object is passed (e.g. from RPC return), extract ID
    const orderId = typeof orderIdInput === 'object' && orderIdInput?.id
        ? orderIdInput.id
        : typeof orderIdInput === 'string'
            ? orderIdInput
            : null;

    if (!orderId) {
        throw new Error(`Invalid Order ID format: ${JSON.stringify(orderIdInput)}`);
    }

    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    // 2. Fetch Order
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            cards (
                id,
                title,
                user_id
            )
        `)
        .eq('id', orderId)
        .single()

    const orderData = order as unknown as OrderWithCard

    if (error || !orderData) {
        console.error('[Checkout] Order not found or error:', error)
        console.error('[Checkout] Requested Order ID:', orderId)
        console.error('[Checkout] Authenticated User ID:', user.id)
        throw new Error('Order not found')
    }

    // 3. Verify Ownership
    if (orderData.user_id !== user.id) {
        throw new Error('Unauthorized')
    }

    // 4. Calculate Price
    // Logic: Price is per 100 cards (implied by user request "5000JPY / 100 cards")
    // If quantity is e.g. 100, price is PRICES[material]
    // If quantity is e.g. 200, price is PRICES[material] * 2?
    // For PoC, let's assume quantity is always a multiple of 100 or calculate prorated?
    // User request said: "Sugi: 5000 JPY / 100 cards"
    // Let's treat it as (Price / 100) * quantity

    // Validate material
    const material = orderData.material as MaterialType;

    // Force quantity to 1 for "One Card Project" model
    const quantity = 1;

    if (!MATERIAL_PRICES[material]) {
        throw new Error('Invalid material')
    }

    const price = MATERIAL_PRICES[material];

    // Check strict positive just in case
    if (price <= 0) {
        throw new Error('Invalid price')
    }

    // Stripe expects amount in smallest currency unit (JPY is 1 unit = 1 JPY)
    const amount = price;

    // 5. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'jpy',
                    product_data: {
                        name: `WoodLinks Device - ${orderData.material}`,
                        description: `Digital Business Card Device (${orderData.cards.title})`,
                        metadata: {
                            card_id: orderData.card_id,
                        },
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${BASE_URL}/dashboard/cards/${orderData.card_id}?status=success`,
        cancel_url: `${BASE_URL}/dashboard/cards/${orderData.card_id}?status=cancel`,
        metadata: {
            order_id: orderData.id,
            user_id: user.id,
            card_id: orderData.card_id
        },
        customer_email: user.email, // Pre-fill email
    })

    if (!session.url) {
        throw new Error('Failed to create session')
    }

    // 6. Update Order with Session ID
    const { error: updateError } = await supabase
        .from('orders')
        // @ts-expect-error: checkout_session_id column exists in DB but might be missing in types
        .update({ checkout_session_id: session.id })
        .eq('id', orderData.id)

    if (updateError) {
        console.error('Failed to update order with session ID:', updateError)
        // We still return the URL, but analytics/tracking might be slightly off if this fails.
        // Criticality: Medium. Webhook relies on metadata, so this is okay.
    }

    return session.url
}
