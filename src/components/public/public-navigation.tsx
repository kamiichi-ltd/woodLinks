'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, QrCode, X } from 'lucide-react'
import CardQRCode from '@/components/cards/card-qr-code'

interface PublicNavigationProps {
    isOwner: boolean
    cardId: string // For Edit link and QR
    cardSlug?: string // For Edit link (we use ID usually)
}

export default function PublicNavigation({ isOwner, cardId }: PublicNavigationProps) {
    const [showQR, setShowQR] = useState(false)

    return (
        <>
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between pointer-events-none">
                {/* Back Link (Pointer events enabled for button) */}
                <div className="pointer-events-auto">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-200 text-stone-600 hover:text-stone-900 hover:scale-105 transition-all"
                        aria-label="Back to Dashboard"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    {/* QR Code Button */}
                    <button
                        onClick={() => setShowQR(true)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-200 text-stone-600 hover:text-stone-900 hover:scale-105 transition-all"
                        aria-label="Show QR Code"
                    >
                        <QrCode className="h-5 w-5" />
                    </button>

                    {/* Owner Edit Button */}
                    {isOwner && (
                        <Link
                            href={`/dashboard/cards/${cardId}`}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-[#2c3e50]/90 backdrop-blur-md text-white text-sm font-bold shadow-md hover:bg-[#2c3e50] hover:scale-105 transition-all"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            <span>編集</span>
                        </Link>
                    )}
                </div>
            </nav>

            {/* QR Code Modal / Overlay */}
            {showQR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-[#fdfbf7] p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-[#e6e2d3] animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="text-center">
                            <h3 className="text-xl font-serif font-bold text-[#2c3e50] mb-2">名刺のQRコード</h3>
                            <p className="text-sm text-[#8c7b6c] mb-6">このコードをスキャンして名刺にアクセスできます。</p>

                            <div className="flex justify-center mb-6">
                                <CardQRCode cardId={cardId} size={200} />
                            </div>

                            <div className="text-xs text-stone-400 font-mono">
                                ID: {cardId.substring(0, 8)}...
                            </div>
                        </div>
                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setShowQR(false)}></div>
                </div>
            )}
        </>
    )
}
