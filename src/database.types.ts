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
                    shipped_at: string | null // 追加
                    paid_at: string | null // 追加
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
                    shipped_at?: string | null // 追加
                    paid_at?: string | null // 追加
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
                    shipped_at?: string | null // 追加
                    paid_at?: string | null // 追加
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
            cards: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string | null
                    user_id: string
                    slug: string
                    title: string | null
                    description: string | null
                    avatar_url: string | null
                    material_type: string | null
                    is_public: boolean
                    wood_origin: string | null // NEW
                    wood_age: string | null // NEW
                    wood_story: string | null // NEW
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string | null
                    user_id?: string
                    slug: string
                    title?: string | null
                    description?: string | null
                    avatar_url?: string | null
                    material_type?: string | null
                    is_public?: boolean
                    wood_origin?: string | null
                    wood_age?: string | null
                    wood_story?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string | null
                    user_id?: string
                    slug?: string
                    title?: string | null
                    description?: string | null
                    avatar_url?: string | null
                    material_type?: string | null
                    is_public?: boolean
                    wood_origin?: string | null
                    wood_age?: string | null
                    wood_story?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}