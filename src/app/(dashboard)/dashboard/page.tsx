import { getCards } from '@/services/card-service'
import CreateCardForm from './create-card-form'
import Link from 'next/link'
import { DeleteProjectButton } from '@/components/dashboard/delete-project-button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const cards = await getCards()

    return (
        <div className="space-y-12 relative min-h-screen">
            {/* Global Background Texture */}
            <div className="fixed inset-0 bg-[#fbf9f5] -z-20"></div>
            <div className="fixed inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] -z-10 pointer-events-none"></div>

            {/* Header Area */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#e6e2d3]/30 via-[#faf9f6]/50 to-[#ffffff]/40 p-10 sm:p-14 border border-[#e6e2d3]/50 shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#2c3e50] tracking-tight">マイスタジオ</h2>
                    <p className="mt-4 text-base sm:text-lg text-[#8c7b6c] font-medium max-w-xl leading-relaxed">
                        デジタル木製名刺の管理。自然の温もりで、あなたらしさを表現しましょう。
                    </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <div className="h-64 w-64 rounded-full bg-[#d4a373] blur-3xl"></div>
                </div>
            </div>

            {/* Create Area */}
            <section className="relative z-10 -mt-8 mx-4">
                <CreateCardForm />
            </section>

            {/* List Area */}
            <section className="pt-8 px-2 sm:px-4">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-1.5 h-8 bg-[#d4a373] rounded-full shadow-sm"></div>
                    <h3 className="text-2xl font-serif font-bold text-[#2c3e50] tracking-tight">作品リスト</h3>
                </div>

                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Link href={`/dashboard/cards/${card.id}`} key={card.id} className="block group relative perspective-1000">
                            {/* Card Body with Wood Texture Simulation */}
                            <div className={`
                                relative h-64 rounded-[2rem] transition-all duration-500 ease-out overflow-hidden
                                ${card.status === 'published'
                                    ? 'bg-[#e8dec5] shadow-[0_15px_35px_-5px_rgba(140,123,108,0.3)] group-hover:shadow-[0_25px_50px_-10px_rgba(140,123,108,0.5)] group-hover:-translate-y-2 group-hover:scale-[1.02]'
                                    : 'bg-[#faf9f6]/80 border-2 border-dashed border-[#e6e2d3] hover:border-[#d4c5ae] hover:bg-[#faf9f6] hover:shadow-lg hover:-translate-y-2'}
                            `}>
                                {/* Wood Grain Overlay for Published Cards */}
                                {card.status === 'published' && (
                                    <>
                                        {/* Grain 1: Fine texture */}
                                        <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
                                        {/* Grain 2: Warm gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#f4f0e6]/40 via-transparent to-[#d4c5ae]/30 pointer-events-none"></div>
                                        {/* Highlight */}
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
                                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c7b6c] mb-0.5">Views</span>
                                            <span className="text-3xl font-serif font-bold text-[#2c3e50] leading-none">
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

                    {/* Empty State / Add New Placeholder */}
                    {cards.length === 0 && (
                        <div className="col-span-full py-24 text-center border-3 border-dashed border-[#e6e2d3] rounded-[2.5rem] bg-[#faf9f6]/30 flex flex-col items-center justify-center">
                            <span className="block text-5xl mb-6 opacity-40">🌱</span>
                            <p className="text-[#3d3126] font-bold text-xl mb-2">作品がありません</p>
                            <p className="text-[#8c7b6c] text-sm">新しい名刺を作成して、温かみのあるデジタル名刺を始めましょう。</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
