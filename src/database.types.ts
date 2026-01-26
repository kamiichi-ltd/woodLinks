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
          is_published: boolean
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
          is_published?: boolean
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
          is_published?: boolean
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
    }
    Functions: {
      increment_view_count: {
        Args: {
          card_slug: string
        }
        Returns: void
      }
    }
  }
}
