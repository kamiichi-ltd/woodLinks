'use server'

import { createClient } from '@/utils/supabase/server'
import { UAParser } from 'ua-parser-js'
import { headers } from 'next/headers'

export type AnalyticsEvent = {
    cardId: string
    eventType: 'view' | 'contact_save' | 'link_click'
    metaData?: Record<string, any>
}

export async function logEvent(cardId: string, eventType: 'view' | 'contact_save' | 'link_click', metaData?: Record<string, any>) {
    const supabase = await createClient()
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''

    let deviceType = 'desktop'
    let browserName = 'unknown'
    let osName = 'unknown'

    if (userAgent) {
        const parser = new UAParser(userAgent)
        const device = parser.getDevice()
        const browser = parser.getBrowser()
        const os = parser.getOS()

        deviceType = device.type || 'desktop'
        browserName = browser.name || 'unknown'
        osName = os.name || 'unknown'
    }

    const { error } = await (supabase as any).from('analytics').insert({
        card_id: cardId,
        event_type: eventType,
        device_type: deviceType,
        browser: browserName,
        os: osName,
        // If metaData column exists in future we can save it, current schema doesn't support it explicitly in analytics table
        // We might want to add a JSONB column later if needed. For now we just count events.
    })

    if (error) {
        console.error('Error logging analytics:', error)
    }
}

export async function getCardAnalytics(cardId: string) {
    const supabase = await createClient()

    // 1. Fetch last 30 days data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: analytics, error } = await (supabase as any)
        .from('analytics')
        .select('*')
        .eq('card_id', cardId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching analytics:', error)
        return null
    }

    // 2. Process Data
    const totalViews = analytics.filter((a: any) => a.event_type === 'view').length
    const totalSaves = analytics.filter((a: any) => a.event_type === 'contact_save').length
    const totalkliks = analytics.filter((a: any) => a.event_type === 'link_click').length

    // Today's Stats
    const today = new Date().toISOString().split('T')[0]
    const todayViews = analytics.filter((a: any) =>
        a.event_type === 'view' && a.created_at.startsWith(today)
    ).length

    // Click Rate (Clicks / Views)
    const clickRate = totalViews > 0 ? ((totalkliks / totalViews) * 100).toFixed(1) : '0.0'

    // Daily Views (Last 7 Days for Graph)
    const dailyViewsMap = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        dailyViewsMap.set(dateStr, 0)
    }

    analytics.forEach((record: any) => {
        if (record.event_type === 'view') {
            const dateStr = record.created_at.split('T')[0]
            if (dailyViewsMap.has(dateStr)) {
                dailyViewsMap.set(dateStr, dailyViewsMap.get(dateStr)! + 1)
            }
        }
    })

    const dailyViews = Array.from(dailyViewsMap.entries()).map(([date, views]) => ({
        date: new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        fullDate: date,
        views
    }))

    // Device Ratio
    const deviceCounts = {
        mobile: 0,
        desktop: 0,
        tablet: 0,
        other: 0
    }

    analytics.forEach((record: any) => {
        if (record.event_type === 'view') {
            const type = record.device_type || 'other'
            if (type === 'mobile') deviceCounts.mobile++
            else if (type === 'desktop') deviceCounts.desktop++
            else if (type === 'tablet') deviceCounts.tablet++
            else deviceCounts.other++
        }
    })

    const deviceRatio = [
        { name: 'Mobile', value: deviceCounts.mobile, fill: '#8884d8' },
        { name: 'Desktop', value: deviceCounts.desktop, fill: '#82ca9d' },
        { name: 'Tablet', value: deviceCounts.tablet, fill: '#ffc658' },
    ].filter(d => d.value > 0)

    return {
        totalViews,
        todayViews,
        totalSaves,
        clickRate,
        dailyViews,
        deviceRatio
    }
}
