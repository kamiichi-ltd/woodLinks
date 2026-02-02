import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Package, LayoutDashboard, ArrowRight, User } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminEmail = process.env.ADMIN_EMAIL

    const NAV_ITEMS = [
        { label: 'ホーム (計器盤)', href: '/admin', icon: LayoutDashboard, active: false },
        { label: '注文管理', href: '/admin/orders', icon: Package, active: false },
        { label: '顧客リスト', href: '/admin/customers', icon: User, active: false },
        { label: 'ユーザー画面へ', href: '/dashboard', icon: ArrowRight, active: false },
    ]


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
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                // Simple active check: strictly equal or starts with for nested routes?
                                // For now, simple check. Since we are in Layout, we can't easily get access to pathname directly without client component hook.
                                // But this is a Server Component layout. 
                                // We can't know the current path here to determine 'active' dynamically without `usePathname` (Client).
                                // Let's simplify: Remove 'active' logic from Server Layout or convert Sidebar to Client Component.
                                // Quick fix: Just use hover styles for now as we don't want to refactor to Client Component yet.
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
                                    text-stone-400 hover:text-white hover:bg-stone-800
                                `}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
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
