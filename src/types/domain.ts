import { Database } from '@/database.types'

/** Row type for the `analytics` table */
export type AnalyticsRecord = Database['public']['Tables']['analytics']['Row']

/** Row type for the `cards` table */
export type CardRow = Database['public']['Tables']['cards']['Row']

/** Application-level Card type with refined union fields */
export type Card = Omit<CardRow, 'status' | 'material_type'> & {
    status: 'published' | 'draft' | 'lost_reissued' | 'disabled' | 'transferred'
    material_type: 'sugi' | 'hinoki' | 'walnut' | null
    view_count?: number
    contents?: CardContent[]
    avatar_url?: string | null
}

/** Row type for the `card_contents` table */
export type CardContent = Database['public']['Tables']['card_contents']['Row']

/** Row type for the `orders` table */
export type Order = Database['public']['Tables']['orders']['Row']

/** Row type for the `profiles` table */
export type Profile = Database['public']['Tables']['profiles']['Row']

/** Row type for the `wood_inventory` table */
export type WoodInventory = Database['public']['Tables']['wood_inventory']['Row']
export type WoodInventoryInsert = Database['public']['Tables']['wood_inventory']['Insert']
