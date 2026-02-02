import { getCards } from '@/services/card-service'
import { getDashboardAnalytics } from '@/services/analytics-service'
import { createClient } from '@/utils/supabase/server'
import CreateCardForm from './create-card-form'
import Link from 'next/link'
import { DeleteProjectButton } from '@/components/dashboard/delete-project-button'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import { Eye, UserCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in.</div>
    }

    const cards = await getCards()
    const analytics = await getDashboardAnalytics(user.id)

    return (
        <div className="relative min-h-screen pb-20">
            {/* Global Background Texture */}
            <div className="fixed inset-0 bg-[#fbf9f5] -z-20"></div>
            <div className="fixed inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] -z-10 pointer-events-none"></div>

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">

                {/* Header & Analytics Section */}
                <div className="space-y-8">
                    {/* Header */}
                    <div className="relative rounded-[2rem] bg-[#fff] border border-[#e6e2d3] shadow-sm overflow-hidden p-8 sm:p-10">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.03] mix-blend-multiply"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c3e50] tracking-tight">マイスタジオ</h2>
                            <p className="mt-2 text-[#8c7b6c] font-medium leading-relaxed">
                                あなたの作品と、その反響を一目で確認できます。
                            </p>
                        </div>
                    </div>

                    {/* Analytics Bento Grid */}
                    {cards.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Stat 1: Views */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-[#e6e2d3]/50 shadow-sm flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-[#f4f1ea] rounded-full text-[#3d3126]">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-[#8c7b6c] tracking-widest uppercase">直近30日の閲覧数</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-serif font-bold text-[#2c3e50]">{analytics.totalViews}</span>
                                    <span className="text-sm font-bold text-[#8c7b6c]">回</span>
                                </div>
                            </div>

                            {/* Stat 2: Saves */}
                            <div className="bg-white rounded-[1.5rem] p-6 border border-[#e6e2d3]/50 shadow-sm flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-[#ecf4ff] rounded-full text-[#4a90e2]">
                                        <UserCheck className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-[#8c7b6c] tracking-widest uppercase">連絡先の保存回数</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-serif font-bold text-[#2c3e50]">{analytics.totalSaves}</span>
                                    <span className="text-sm font-bold text-[#8c7b6c]">回</span>
                                </div>
                            </div>

                            {/* Stat 3: Chart (Spans 2 cols on LG) */}
                            <div className="md:col-span-2 lg:col-span-2 bg-white rounded-[1.5rem] p-6 border border-[#e6e2d3]/50 shadow-sm h-full min-h-[160px] flex flex-col">
                                <AnalyticsChart data={analytics.dailyViews} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Collection Grid */}
                <section>
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* 1. Create New Card (Trigger) */}
                        <div className="h-64">
                            <CreateCardForm />
                        </div>

                        {/* Existing Cards */}
                        {cards.map((card) => (
                            <Link href={`/dashboard/cards/${card.id}`} key={card.id} className="block group relative perspective-1000 h-64">
                                {/* Card Body with Wood Texture Simulation */}
                                <div className={`
                                    relative h-full rounded-[2rem] transition-all duration-500 ease-out overflow-hidden
                                    ${card.status === 'published'
                                        ? 'bg-[#e8dec5] shadow-[0_15px_35px_-5px_rgba(140,123,108,0.2)] group-hover:shadow-[0_25px_50px_-10px_rgba(140,123,108,0.4)] group-hover:-translate-y-2 group-hover:scale-[1.02]'
                                        : 'bg-white border-2 border-dashed border-[#e6e2d3] hover:border-[#d4c5ae] hover:shadow-lg hover:-translate-y-2'}
                                `}>
                                    {/* Wood Grain Overlay for Published Cards */}
                                    {card.status === 'published' && (
                                        <>
                                            <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#f4f0e6]/40 via-transparent to-[#d4c5ae]/30 pointer-events-none"></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </>
                                    )}

                                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                        {/* Top: Status & Title */}
                                        <div>
                                            <div className="flex justify-between items-start mb-5">
                                                <span className={`
                                                    inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-sm
                                                    ${card.status === 'published'
                                                        ? 'bg-[#2c3e50] text-[#fdfbf7]'
                                                        : 'bg-[#e6e2d3] text-[#8c7b6c]'}
                                                `}>
                                                    {card.status === 'published' ? 'LIVE' : (card.status || 'DRAFT').toUpperCase()}
                                                </span>
                                                {card.status === 'published' && (
                                                    <div className="relative">
                                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className={`text-2xl font-serif font-bold leading-tight group-hover:text-[#d4a373] transition-colors duration-300 ${card.status === 'published' ? 'text-[#3d3126]' : 'text-[#8c7b6c]'}`}>
                                                {card.title}
                                            </h3>
                                            <p className="mt-3 text-xs text-[#8c7b6c] line-clamp-2 opacity-80 font-medium leading-relaxed">
                                                {card.description || 'No description...'}
                                            </p>
                                        </div>

                                        {/* Bottom: Stats & Action */}
                                        <div className={`flex items-end justify-between pt-5 ${card.status === 'published' ? 'border-t border-[#3d3126]/10' : 'border-t border-[#e6e2d3]'}`}>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c7b6c] mb-0.5">Total Views</span>
                                                <span className="text-2xl font-serif font-bold text-[#2c3e50] leading-none">
                                                    {card.view_count || 0}
                                                </span>
                                            </div>
                                            <span className="h-10 w-10 bg-[#fdfbf7]/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#2c3e50] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-md hover:bg-[#2c3e50] hover:text-white">
                                                <span className="sr-only">Open</span>
                                                &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Button (Overlay) */}
                                <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                    <DeleteProjectButton cardId={card.id} layout="icon" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
