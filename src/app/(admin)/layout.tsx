import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Package, LayoutDashboard } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminEmail = process.env.ADMIN_EMAIL

    // Security Check
    // 1. Must be logged in
    // 2. Must match ADMIN_EMAIL
    if (!user || !adminEmail || user.email !== adminEmail) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
            {/* Admin Header */}
            <header className="bg-stone-900 text-stone-50 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-red-500" />
                        <span className="font-bold text-lg tracking-tight">WoodLinks Admin</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/admin/orders" className="hover:text-white transition-colors flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-md">
                            <Package className="h-4 w-4" />
                            Orders
                        </Link>
                        <Link href="/dashboard" className="text-stone-400 hover:text-white transition-colors flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            User Dashboard
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
