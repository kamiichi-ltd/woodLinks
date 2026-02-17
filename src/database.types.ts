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
                    updated_at: string | null
                    avatar_url: string | null
                    email: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    avatar_url?: string | null
                    email?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    avatar_url?: string | null
                    email?: string | null
                }
            }
            orders: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string | null
                    shipped_at: string | null
                    paid_at: string | null
                    user_id: string
                    slug: string
                    title: string | null
                    description: string | null
                    status: string | null
                    tracking_number: string | null
                    image_url: string | null
                    theme: string | null
                    social_links: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string | null
                    shipped_at?: string | null
                    paid_at?: string | null
                    user_id?: string
                    slug: string
                    title?: string | null
                    description?: string | null
                    status?: string | null
                    tracking_number?: string | null
                    image_url?: string | null
                    theme?: string | null
                    social_links?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string | null
                    shipped_at?: string | null
                    paid_at?: string | null
                    user_id?: string
                    slug?: string
                    title?: string | null
                    description?: string | null
                    status?: string | null
                    tracking_number?: string | null
                    image_url?: string | null
                    theme?: string | null
                    social_links?: Json | null
                }
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
        }
        Enums: {
            [_ in never]: never
        }
    }
}