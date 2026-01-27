import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2025-01-27.acacia' as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    console.log('[Stripe Webhook] Received event')
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        if (!signature || !webhookSecret) {
            throw new Error('Missing signature or secret')
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error(`[Stripe Webhook] Error verifying webhook signature: ${err.message}`)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        console.log(`[Stripe Webhook] Processing checkout.session.completed for Order ID: ${orderId}`)

        if (orderId) {
            // Initialize Supabase Client (Service Role)
            // Note: If SUPABASE_SERVICE_ROLE_KEY is not set, this will fail or fallback to Anon (which might not have permission)
            // User requested to use "Admin RPC admin_update_order_status"
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

            const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

            // Call RPC
            const { error } = await supabase.rpc('admin_update_order_status', {
                p_order_id: orderId,
                p_new_status: 'paid',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)

            if (error) {
                console.error('[Stripe Webhook] Failed to update order status:', error)
                return new Response('Error updating order', { status: 500 })
            }

            console.log('[Stripe Webhook] Successfully updated order status to paid')
        }
    }

    return new Response(null, { status: 200 })
}
