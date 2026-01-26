'use client'

import { QRCodeSVG } from 'qrcode.react'

interface CardQRCodeProps {
    cardId: string
    size?: number
    color?: string
    bgColor?: string
    className?: string
}

export default function CardQRCode({ cardId, size = 120, color = '#2c3e50', bgColor = '#ffffff', className = '' }: CardQRCodeProps) {
    // Physical Entry Point URL
    // In production, this should be the full URL (e.g. https://woodlinks.com/c/...)
    // For now, we use a relative path if handled by client or constructing full URL if possible.
    // QR codes work best with absolute URLs.
    // We'll assume the host is accessible via window.location.origin in client effect, or just use a placeholder base for now.
    // BETTER: Use a helper or env var. For this demo, let's try to construct it or just use the path if the scanner is smart (scan opens browser to relative? No).
    // It MUST be absolute.

    // We can use a client-side effect to get origin, OR pass it in.
    // Let's use origin if available, or a default.

    const qrValue = typeof window !== 'undefined'
        ? `${window.location.origin}/c/${cardId}`
        : `https://woodlinks.app/c/${cardId}` // Fallback generic domain

    return (
        <div className={`p-4 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center ${className}`}>
            <QRCodeSVG
                value={qrValue}
                size={size}
                fgColor={color}
                bgColor={bgColor}
                level="M" // Medium error correction
                includeMargin={false}
            />
        </div>
    )
}
