import { createClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

const adminDbClient = createClient<Database>('url', 'key')

type OrderWithJoins = { id: string, profiles: { full_name: string | null } | null }

export async function _test() {
    const { data } = await adminDbClient.from('orders').select('*, profiles(*)').returns<OrderWithJoins[]>()
    return data
}
