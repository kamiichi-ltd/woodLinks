'use client'

import { incrementViewCount } from '@/services/card-service'
import { useEffect, useRef } from 'react'

export function ViewCounter({ cardId }: { cardId: string }) {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (!hasIncremented.current) {
            incrementViewCount(cardId)
            hasIncremented.current = true
        }
    }, [cardId])

    return null
}
