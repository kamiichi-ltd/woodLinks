import Link from 'next/link'
import { User, LogOut, ShieldCheck } from 'lucide-react'
import { logout } from '@/services/auth-service'
import { createClient } from '@/utils/supabase/server'

export default async function NavBar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = user?.email && process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL

    return (
        <header className="bg-[#2c3e50] shadow-md border-b border-[#3e5266] text-[#fdfbf7]">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center gap-x-8">
                    <h1 className="text-xl font-serif font-bold tracking-tight text-[#fdfbf7]">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <img src="/logo.png" alt="WoodLinks Logo" className="h-8 w-8 object-contain" />
                            <span>WoodLinks</span>
                        </Link>
                    </h1>
                    <nav className="hidden md:flex gap-x-6 items-center">
                        <Link href="/dashboard" className="text-[#aabdc1] hover:text-white transition-colors text-sm font-medium">ダッシュボード</Link>
                        {isAdmin && (
                            <Link href="/admin/orders" className="text-red-300 hover:text-red-100 transition-colors text-sm font-bold flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4" />
                                管理画面
                            </Link>
                        )}
                        {/* <Link href="/dashboard/templates" className="text-stone-300 hover:text-white transition-colors text-sm font-medium">Templates</Link> */}
                    </nav>
                </div>
                <div className="flex items-center gap-x-4">
                    <Link href="/dashboard/profile" className="text-[#aabdc1] hover:text-white transition-colors group" title="アカウント設定">
                        <div className="h-8 w-8 rounded-full bg-[#3e5266] flex items-center justify-center group-hover:bg-[#4e647a] transition-colors border border-[#aabdc1]/20">
                            <User className="h-4 w-4" />
                        </div>
                    </Link>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="text-[#aabdc1] hover:text-red-300 transition-colors flex items-center justify-center p-2 rounded-full hover:bg-[#3e5266]"
                            title="ログアウト"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    )
}
