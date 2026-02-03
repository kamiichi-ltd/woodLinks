import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/admin-nav'

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
            <AdminNav />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
