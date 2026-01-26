import { getCards } from '@/services/card-service'
import CreateCardForm from './create-card-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const cards = await getCards()

    return (
        <div className="space-y-12">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#e6e2d3] pb-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-[#2c3e50]">My Studio</h2>
                    <p className="mt-1 text-sm text-[#8c7b6c] font-medium">Manage your wood cards. / 名刺の管理</p>
                </div>
            </div>

            {/* Create Area */}
            <section>
                <div className="bg-white/50 border border-[#e6e2d3] rounded-3xl p-1 shadow-sm">
                    <CreateCardForm />
                </div>
            </section>

            {/* List Area */}
            <section>
                <div className="flex items-center gap-2 mb-8">
                    <span className="w-1.5 h-6 bg-[#d4a373] rounded-full"></span>
                    <h3 className="text-xl font-serif font-bold text-[#2c3e50] tracking-tight">Collection</h3>
                    <span className="text-sm text-[#8c7b6c] font-medium ml-2">/ 作品一覧</span>
                </div>

                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Link href={`/dashboard/cards/${card.id}`} key={card.id} className="block group relative">
                            {/* Card Body with Wood Texture Simulation */}
                            <div className={`
                                relative h-60 rounded-[2rem] transition-all duration-500 ease-out overflow-hidden
                                ${card.status === 'published'
                                    ? 'bg-[#e8dec5] shadow-[0_10px_30px_-10px_rgba(140,123,108,0.4)] group-hover:shadow-[0_20px_40px_-10px_rgba(140,123,108,0.5)] group-hover:-translate-y-1 group-hover:scale-[1.01]'
                                    : 'bg-[#faf9f6]/80 border-2 border-dashed border-[#e6e2d3] hover:border-[#d4c5ae] hover:-translate-y-0.5'}
                            `}>
                                {/* Wood Grain Overlay for Published Cards */}
                                {card.status === 'published' && (
                                    <>
                                        {/* Grain 1: Fine texture */}
                                        <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
                                        {/* Grain 2: Warm gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#f4f0e6]/40 via-transparent to-[#d4c5ae]/30 pointer-events-none"></div>
                                    </>
                                )}

                                <div className="absolute inset-0 p-7 flex flex-col justify-between z-10">
                                    {/* Top: Status & Title */}
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`
                                                inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase
                                                ${card.status === 'published'
                                                    ? 'bg-[#2c3e50] text-[#fdfbf7] shadow-sm'
                                                    : 'bg-[#e6e2d3] text-[#8c7b6c]'}
                                            `}>
                                                {card.status === 'published' ? 'LIVE' : (card.status || 'DRAFT').toUpperCase()}
                                            </span>
                                            {card.status === 'published' && (
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
                                            )}
                                        </div>

                                        <h3 className={`text-2xl font-serif font-bold leading-tight group-hover:underline decoration-2 decoration-[#d4a373] underline-offset-4 ${card.status === 'published' ? 'text-[#3d3126]' : 'text-[#8c7b6c]'}`}>
                                            {card.title}
                                        </h3>
                                        <p className="mt-2 text-xs text-[#8c7b6c] line-clamp-2 opacity-80">
                                            {card.description || 'No description...'}
                                        </p>
                                    </div>

                                    {/* Bottom: Stats & Action */}
                                    <div className={`flex items-end justify-between pt-4 ${card.status === 'published' ? 'border-t border-[#3d3126]/10' : 'border-t border-[#e6e2d3]'}`}>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c7b6c] mb-0.5">Views</span>
                                            <span className="text-3xl font-serif font-bold text-[#2c3e50] leading-none">
                                                {card.view_count || 0}
                                            </span>
                                        </div>
                                        <span className="h-10 w-10 bg-[#fdfbf7]/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#2c3e50] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm hover:bg-[#2c3e50] hover:text-white">
                                            &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Empty State / Add New Placeholder */}
                    {cards.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-[#e6e2d3] rounded-[2rem] bg-[#faf9f6]/50">
                            <span className="block text-4xl mb-4 opacity-30">🌱</span>
                            <p className="text-[#3d3126] font-bold text-lg mb-1">Your studio is empty</p>
                            <p className="text-[#8c7b6c] text-sm">Create your first wood card above. / 新しい名刺を作りましょう</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
