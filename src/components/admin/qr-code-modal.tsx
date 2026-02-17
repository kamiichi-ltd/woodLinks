'use client'

import React from 'react'
import QRCode from "react-qr-code"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Database } from '@/database.types'

type WoodInventory = Database['public']['Tables']['wood_inventory']['Row']

interface QRCodeModalProps {
    isOpen: boolean
    onClose: () => void
    wood: WoodInventory | null
}

export default function QRCodeModal({ isOpen, onClose, wood }: QRCodeModalProps) {
    if (!wood) return null

    // Use current origin if possible, otherwise fallback or relative
    // In client component, window.location.origin is available
    // But we need to be careful about hydration mismatches. Use a useEffect or just render on client.
    // Dialog is client-side anyway.

    // Construct URL. We'll use relative URL but display full logic might be tricky without full origin context,
    // but typically QR scanners need absolute URL.
    // We can guess origin or use an env var. NEXT_PUBLIC_BASE_URL is usually good.

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://woodlinks.app' // Fallback
    const publicUrl = `${baseUrl}/wood/${wood.nfc_slug}`

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QRコード発行</DialogTitle>
                    <DialogDescription>
                        {wood.name} の物理接続用QRコードです。
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-inner border border-stone-200">
                        <QRCode
                            value={publicUrl}
                            size={200}
                            viewBox={`0 0 256 256`}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded select-all">
                            {publicUrl}
                        </p>
                        <p className="text-xs text-gray-500">
                            このQRコードを印刷して、木材に貼り付けてください。<br />
                            スキャンすると公開ページが表示されます。
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
