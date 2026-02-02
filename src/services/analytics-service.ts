'use server'

import { createClient } from '@/utils/supabase/server'
import { UAParser } from 'ua-parser-js'

export type AnalyticsEvent = {
    cardId: string
    eventType: 'view' | 'contact_save'
    userAgent?: string
}

export async function logAnalyticsEvent(event: AnalyticsEvent) {
    const supabase = await createClient()

    let deviceType = 'desktop'
    let browserName = 'unknown'
    let osName = 'unknown'

    if (event.userAgent) {
        const parser = new UAParser(event.userAgent)
        const device = parser.getDevice()
        const browser = parser.getBrowser()
        const os = parser.getOS()

        deviceType = device.type || 'desktop' // ua-parser-js returns undefined for desktop usually
        browserName = browser.name || 'unknown'
        osName = os.name || 'unknown'
    }

    const { error } = await supabase.from('analytics').insert({
        card_id: event.cardId,
        event_type: event.eventType,
        device_type: deviceType,
        browser: browserName,
        os: osName
    })

    if (error) {
        console.error('Error logging analytics:', error)
    }
}

export type DailyViews = {
    date: string
    views: number
}

export type DashboardAnalytics = {
    totalViews: number
    totalSaves: number
    dailyViews: DailyViews[]
}

export async function getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
    const supabase = await createClient()

    // 1. Get all cards belonging to user
    const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id')
        .eq('user_id', userId)

    if (cardsError || !cards || cards.length === 0) {
        return { totalViews: 0, totalSaves: 0, dailyViews: [] }
    }

    const cardIds = cards.map(c => c.id)

    // 2. Fetch analytics for these cards (Last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .in('card_id', cardIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError)
        return { totalViews: 0, totalSaves: 0, dailyViews: [] }
    }

    // 3. Process Data
    const totalViews = analytics.filter(a => a.event_type === 'view').length
    const totalSaves = analytics.filter(a => a.event_type === 'contact_save').length

    // Group views by date
    const viewsMap = new Map<string, number>()

    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
        viewsMap.set(dateStr, 0)
    }

    analytics.forEach(record => {
        if (record.event_type === 'view') {
            const dateStr = new Date(record.created_at).toISOString().split('T')[0]
            if (viewsMap.has(dateStr)) {
                viewsMap.set(dateStr, viewsMap.get(dateStr)! + 1)
            }
        }
    })

    const dailyViews = Array.from(viewsMap.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))
        // Format date for display (e.g., "MM/DD")
        .map(item => ({
            date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
            views: item.views
        }))

    return {
        totalViews,
        totalSaves,
        dailyViews
    }
}
