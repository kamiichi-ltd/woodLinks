'use client'

import { logAnalyticsEvent } from '@/services/analytics-service'
import { UserPlus } from 'lucide-react'

export default function ContactSaveButton({ cardId, slug, themeButtonClass }: { cardId: string, slug: string, themeButtonClass: string }) {
    const handleClick = () => {
        logAnalyticsEvent({
            cardId,
            eventType: 'contact_save',
            userAgent: navigator.userAgent
        })
    }

    return (
        <a
            href={`/api/vcard/${slug}`}
            onClick={handleClick}
            className={`w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold tracking-wide transform transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${themeButtonClass}`}
        >
            <UserPlus className="h-4 w-4 mr-2" />
            Add to Contacts / 連絡先に追加
        </a>
    )
}
