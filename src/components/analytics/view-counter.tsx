'use client'

import { logAnalyticsEvent } from '@/services/analytics-service'
import { incrementViewCount } from '@/services/card-service'
import { useEffect, useRef } from 'react'

export function ViewCounter({ cardId }: { cardId: string }) {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (!hasIncremented.current) {
            // Legacy increment (cards table)
            incrementViewCount(cardId)

            // New Analytics increment
            logAnalyticsEvent({
                cardId,
                eventType: 'view',
                userAgent: navigator.userAgent
            })

            hasIncremented.current = true
        }
    }, [cardId])

    return null
}
