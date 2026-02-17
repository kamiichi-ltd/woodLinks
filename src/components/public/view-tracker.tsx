'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ViewTracker({ slug }: { slug: string }) {
    const didRun = useRef(false)

    useEffect(() => {
        if (didRun.current) return
        didRun.current = true

        const supabase = createClient()

        // Fire and forget
        supabase.rpc('increment_wood_view', { slug_input: slug } as any).then(({ error }) => {
            if (error) console.error('Error tracking view:', error)
        })

    }, [slug])

    return null
}
