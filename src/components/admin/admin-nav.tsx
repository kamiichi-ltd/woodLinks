'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Package, LayoutDashboard, ArrowRight, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
    { label: 'ホーム (計器盤)', href: '/admin', icon: LayoutDashboard },
    { label: '注文管理', href: '/admin/orders', icon: Package },
    { label: '顧客リスト', href: '/admin/customers', icon: User },
    { label: 'ユーザー画面へ', href: '/dashboard', icon: ArrowRight },
]

export function AdminNav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="bg-stone-900 text-stone-50 shadow-md relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo / Title */}
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-red-500" />
                    <span className="font-bold text-lg tracking-tight">WoodLinks Admin</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-stone-400 hover:text-white hover:bg-stone-800"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-stone-400 hover:text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Overlay Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-stone-800 border-t border-stone-700 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 space-y-2">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-stone-300 hover:text-white hover:bg-stone-700"
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-base font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    )
}
