export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    created_at: string | null
                    updated_at: string | null
                    full_name: string | null
                    avatar_url: string | null
                    email: string | null
                }
                Insert: {
                    id: string
                    created_at?: string | null
                    updated_at?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    email?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    updated_at?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    email?: string | null
                }
                Relationships: []
            }
            card_connections: {
                Row: {
                    id: string
                    card_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    card_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    card_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    user_id: string
                    card_id: string
                    status: string
                    material: string
                    quantity: number
                    currency: string | null
                    unit_price: number | null
                    subtotal: number | null
                    tax: number | null
                    shipping_fee: number | null
                    total: number | null
                    payment_provider: string | null
                    payment_intent_id: string | null
                    checkout_session_id: string | null
                    paid_at: string | null
                    shipping_name: string
                    shipping_postal: string
                    shipping_address1: string
                    shipping_address2: string | null
                    shipping_phone: string
                    shipping_carrier: string | null
                    tracking_number: string | null
                    shipped_at: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    user_id: string
                    card_id: string
                    status?: string
                    material: string
                    quantity: number
                    currency?: string | null
                    unit_price?: number | null
                    subtotal?: number | null
                    tax?: number | null
                    shipping_fee?: number | null
                    total?: number | null
                    payment_provider?: string | null
                    payment_intent_id?: string | null
                    checkout_session_id?: string | null
                    paid_at?: string | null
                    shipping_name: string
                    shipping_postal: string
                    shipping_address1: string
                    shipping_address2?: string | null
                    shipping_phone: string
                    shipping_carrier?: string | null
                    tracking_number?: string | null
                    shipped_at?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                    card_id?: string
                    status?: string
                    material?: string
                    quantity?: number
                    currency?: string | null
                    unit_price?: number | null
                    subtotal?: number | null
                    tax?: number | null
                    shipping_fee?: number | null
                    total?: number | null
                    payment_provider?: string | null
                    payment_intent_id?: string | null
                    checkout_session_id?: string | null
                    paid_at?: string | null
                    shipping_name?: string
                    shipping_postal?: string
                    shipping_address1?: string
                    shipping_address2?: string | null
                    shipping_phone?: string
                    shipping_carrier?: string | null
                    tracking_number?: string | null
                    shipped_at?: string | null
                }
                Relationships: []
            }
            analytics: {
                Row: {
                    id: string
                    created_at: string
                    card_id: string
                    event_type: string
                    device_type: string | null
                    browser: string | null
                    os: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    card_id: string
                    event_type: string
                    device_type?: string | null
                    browser?: string | null
                    os?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    card_id?: string
                    event_type?: string
                    device_type?: string | null
                    browser?: string | null
                    os?: string | null
                }
                Relationships: []
            }
            card_contents: {
                Row: {
                    id: string
                    created_at: string
                    card_id: string
                    type: string
                    content: Json
                    order_index: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    card_id: string
                    type: string
                    content: Json
                    order_index?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    card_id?: string
                    type?: string
                    content?: Json
                    order_index?: number
                }
                Relationships: []
            }
            cards: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string | null
                    user_id: string
                    slug: string
                    title: string | null
                    description: string | null
                    status: string | null
                    avatar_url: string | null
                    material_type: string | null
                    is_public: boolean
                    is_published: boolean
                    wood_origin: string | null
                    wood_age: string | null
                    wood_story: string | null
                    owner_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string | null
                    user_id?: string
                    slug: string
                    title?: string | null
                    description?: string | null
                    status?: string | null
                    avatar_url?: string | null
                    material_type?: string | null
                    is_public?: boolean
                    is_published?: boolean
                    wood_origin?: string | null
                    wood_age?: string | null
                    wood_story?: string | null
                    owner_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string | null
                    user_id?: string
                    slug?: string
                    title?: string | null
                    description?: string | null
                    status?: string | null
                    avatar_url?: string | null
                    material_type?: string | null
                    is_public?: boolean
                    is_published?: boolean
                    wood_origin?: string | null
                    wood_age?: string | null
                    wood_story?: string | null
                    owner_id?: string | null
                }
                Relationships: []
            }
            wood_inventory: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    nfc_slug: string
                    name: string
                    species: string
                    grade: string | null
                    dimensions: { length: number; width: number; thickness: number } | Json
                    price: number
                    stock: number
                    status: string
                    story: string | null
                    images: string[] | null
                    origin: string | null
                    age: string | null
                    views: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    nfc_slug: string
                    name: string
                    species: string
                    grade?: string | null
                    dimensions?: { length: number; width: number; thickness: number } | Json
                    price?: number
                    stock?: number
                    status?: string
                    story?: string | null
                    images?: string[] | null
                    origin?: string | null
                    age?: string | null
                    views?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    nfc_slug?: string
                    name?: string
                    species?: string
                    grade?: string | null
                    dimensions?: { length: number; width: number; thickness: number } | Json
                    price?: number
                    stock?: number
                    status?: string
                    story?: string | null
                    images?: string[] | null
                    origin?: string | null
                    age?: string | null
                    views?: number
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_wood_view: {
                Args: {
                    slug_input: string
                }
                Returns: void
            }
            increment_view_count: {
                Args: {
                    card_id: string
                }
                Returns: void
            }
            create_order: {
                Args: {
                    p_card_id: string
                    p_material: string
                    p_quantity: number
                    p_shipping_name: string
                    p_shipping_postal: string
                    p_shipping_address1: string
                    p_shipping_address2: string
                    p_shipping_phone: string
                }
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
