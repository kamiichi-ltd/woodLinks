import { ReactNode } from 'react'

import NavBar from '@/components/layout/nav-bar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
            <NavBar />
            <main className="flex-1 py-10 bg-[#fdfbf7]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    )
}
