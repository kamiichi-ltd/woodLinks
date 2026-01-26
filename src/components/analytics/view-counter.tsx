'use client'

import { incrementViewCount } from '@/services/card-service'
import { useEffect, useRef } from 'react'

export function ViewCounter({ slug }: { slug: string }) {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (!hasIncremented.current) {
            incrementViewCount(slug)
            hasIncremented.current = true
        }
    }, [slug])

    return null
}
