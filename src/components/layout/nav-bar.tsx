import Link from 'next/link'
import { User } from 'lucide-react'

export default function NavBar() {
    return (
        <header className="bg-stone-800 shadow-sm text-white">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center gap-x-8">
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span>🌲</span> WoodLinks
                    </h1>
                    <nav className="hidden md:flex gap-x-6">
                        <Link href="/dashboard" className="text-stone-300 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
                        {/* <Link href="/dashboard/templates" className="text-stone-300 hover:text-white transition-colors text-sm font-medium">Templates</Link> */}
                    </nav>
                </div>
                <div className="flex items-center gap-x-4">
                    <Link href="/dashboard/profile" className="text-stone-300 hover:text-white transition-colors group" title="Profile & Settings">
                        <div className="h-8 w-8 rounded-full bg-stone-700 flex items-center justify-center group-hover:bg-stone-600 transition-colors">
                            <User className="h-4 w-4" />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    )
}
