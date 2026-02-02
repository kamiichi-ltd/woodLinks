'use client'

import { useState, useEffect } from 'react'
import * as QRCode from 'qrcode.react'

interface CardQRCodeProps {
    cardId: string
    size?: number
    color?: string
    bgColor?: string
    className?: string
}

export default function CardQRCode({ cardId, size = 120, color = '#2c3e50', bgColor = '#ffffff', className = '' }: CardQRCodeProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const qrValue = isMounted
        ? `${window.location.origin}/c/${cardId}`
        : ''

    return (
        <div className={`p-4 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center ${className}`}>
            {isMounted && QRCode.QRCodeSVG ? (
                <QRCode.QRCodeSVG
                    value={qrValue}
                    size={size}
                    fgColor={color}
                    bgColor={bgColor}
                    level="M" // Medium error correction
                    includeMargin={false}
                />
            ) : (
                <div style={{ width: size, height: size }} className="bg-stone-100 rounded-md animate-pulse" />
            )}
        </div>
    )
}
