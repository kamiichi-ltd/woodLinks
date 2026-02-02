import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
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
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

            if (!supabaseServiceKey) {
                console.error('[Stripe Webhook] Missing SUPABASE_SERVICE_ROLE_KEY')
                return new Response('Server Configuration Error', { status: 500 })
            }

            const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

            // Perform direct update using Service Role to ensure reliability
            // Using direct update instead of RPC to avoid signature issues and simplify debugging
            const { error } = await (supabase as any)
                .from('orders')
                .update({
                    status: 'paid',
                    // Optionally set paid_at if your schema supports it
                    paid_at: new Date().toISOString()
                })
                .eq('id', orderId)

            if (error) {
                console.error('[Stripe Webhook] Database Update Failed:', error)
                // Return specific error message to help debugging
                return new Response(`Error updating order: ${error.message} (Code: ${error.code})`, { status: 500 })
            }

            console.log('[Stripe Webhook] Successfully updated order status to paid')

            // Purge Admin Dashboard cache to ensure immediate update
            revalidatePath('/admin/orders')
            revalidatePath('/dashboard') // User dashboard as well
        }
    }

    return new Response(null, { status: 200 })
}
