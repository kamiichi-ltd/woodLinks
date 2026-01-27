import { createClient } from '@/utils/supabase/client';
import { Database } from '@/database.types';
import { createStripeCheckoutSession } from '@/app/actions/checkout';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];

export interface CreateOrderParams {
    card_id: string;
    material: 'sugi' | 'hinoki' | 'walnut';
    quantity: number;
    shipping_name: string;
    shipping_postal: string;
    shipping_address1: string;
    shipping_address2?: string;
    shipping_phone: string;
}

const supabase = createClient();

/**
 * createOrder
 * Calls the `create_order` RPC to create a new order record.
 */
export async function createOrder(params: CreateOrderParams) {
    const { data, error } = await supabase.rpc('create_order', {
        p_card_id: params.card_id,
        p_material: params.material,
        p_quantity: params.quantity,
        p_shipping_name: params.shipping_name,
        p_shipping_postal: params.shipping_postal,
        p_shipping_address1: params.shipping_address1,
        p_shipping_address2: params.shipping_address2 || '',
        p_shipping_phone: params.shipping_phone,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error) {
        console.error('Error creating order:', error);
        throw new Error(error.message);
    }

    return data; // Returns the new order UUID
}

/**
 * startCheckout
 * Calls the `start_checkout` RPC to initiate payment flow.
 * Calls the Server Action `createStripeCheckoutSession` to initiate payment flow.
 */
export async function startCheckout(orderId: string) {
    const url = await createStripeCheckoutSession(orderId);
    return url;
}

/**
 * getOrdersByCardId
 * Fetches orders associated with a specific card.
 */
export async function getOrdersByCardId(cardId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * getOrderById
 * Fetches a single order by ID.
 */
export async function getOrderById(orderId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        throw new Error(error.message);
    }

    return data;
}
