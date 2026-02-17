
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import InventoryTable from '@/components/admin/inventory-table'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Resolve search params
    const resolvedParams = await searchParams
    const statusFilter = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined

    let query = supabase
        .from('wood_inventory')
        .select('*')
        .order('created_at', { ascending: false })

    if (statusFilter) {
        query = query.eq('status', statusFilter)
    }

    const { data: inventory, error } = await query

    if (error) {
        console.error('Error fetching inventory:', error)
        return <div>Error loading inventory</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">在庫管理</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        登録された木材の管理、編集、削除、QRコード発行を行います。
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/admin/inventory/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            新規登録
                        </Link>
                    </Button>
                </div>
            </div>

            <InventoryTable
                initialData={inventory || []}
                initialStatus={statusFilter}
            />
        </div>
    )
}
