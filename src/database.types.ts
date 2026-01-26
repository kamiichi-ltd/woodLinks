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
          created_at: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          title: string | null
          description: string | null
          created_at: string
          updated_at: string
          slug: string | null
          view_count: number
          material_type: 'sugi' | 'hinoki' | 'walnut'
          status: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          slug?: string | null
          view_count?: number
          material_type?: 'sugi' | 'hinoki' | 'walnut'
          status?: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          slug?: string | null
          view_count?: number
          material_type?: 'sugi' | 'hinoki' | 'walnut'
          status?: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'
        }
      }
      card_contents: {
        Row: {
          id: string
          card_id: string
          type: string
          content: Json
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          type: string
          content?: Json
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          type?: string
          content?: Json
          order_index?: number
          created_at?: string
        }
      }
      card_lifecycle_logs: {
        Row: {
          id: string
          card_id: string
          event_type: string
          reason: string | null
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          event_type: string
          reason?: string | null
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          event_type?: string
          reason?: string | null
          meta?: Json | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          card_id: string
          status: 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          material: 'sugi' | 'hinoki' | 'walnut'
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          status?: 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          material: 'sugi' | 'hinoki' | 'walnut'
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          status?: 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          material?: 'sugi' | 'hinoki' | 'walnut'
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
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
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
      start_checkout: {
        Args: {
          p_order_id: string
        }
        Returns: string
      }
      admin_update_order_status: {
        Args: {
          p_order_id: string
          p_new_status: 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          p_tracking_number?: string
          p_shipped_at?: string
        }
        Returns: void
      }
    }
  }
}
