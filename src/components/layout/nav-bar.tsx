import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/services/auth-service'

export default function NavBar() {
    return (
        <header className="bg-[#2c3e50] shadow-md border-b border-[#3e5266] text-[#fdfbf7]">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center gap-x-8">
                    <h1 className="text-xl font-serif font-bold tracking-tight text-[#fdfbf7] flex items-center gap-2">
                        <img src="/logo.png" alt="WoodLinks Logo" className="h-8 w-8 object-contain" />
                        <span>WoodLinks</span>
                    </h1>
                    <nav className="hidden md:flex gap-x-6">
                        <Link href="/dashboard" className="text-[#aabdc1] hover:text-white transition-colors text-sm font-medium">Dashboard / ダッシュボード</Link>
                        {/* <Link href="/dashboard/templates" className="text-stone-300 hover:text-white transition-colors text-sm font-medium">Templates</Link> */}
                    </nav>
                </div>
                <div className="flex items-center gap-x-4">
                    <Link href="/dashboard/profile" className="text-[#aabdc1] hover:text-white transition-colors group" title="Account Settings / アカウント設定">
                        <div className="h-8 w-8 rounded-full bg-[#3e5266] flex items-center justify-center group-hover:bg-[#4e647a] transition-colors border border-[#aabdc1]/20">
                            <User className="h-4 w-4" />
                        </div>
                    </Link>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="text-[#aabdc1] hover:text-red-300 transition-colors flex items-center justify-center p-2 rounded-full hover:bg-[#3e5266]"
                            title="Sign Out / ログアウト"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    )
}
