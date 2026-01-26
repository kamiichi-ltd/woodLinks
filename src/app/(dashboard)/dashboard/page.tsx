import { getCards } from '@/services/card-service'
import CreateCardForm from './create-card-form'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const cards = await getCards()

    return (
        <div>
            {/* Header Area */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e2d3] pb-6">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-[#3d3126]">Dashboard</h2>
                    <p className="mt-1 text-sm text-[#8c7b6c]">作成した名刺の管理・分析</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left Column: Create Form */}
                <div className="lg:col-span-2 xl:col-span-1">
                    <CreateCardForm />
                </div>

                {/* Right Column: Card List (or Full width if needed, but grid usually better) */}
                {/* Actually, let's keep the Create Form above or to the side? The request implies a list of cards. 
                    Let's put Create Form at the top or separately.  Existing layout had CreateForm then List.
                    Let's keep the vertical flow but style it better.
                 */}
            </div>

            <div className="space-y-12">
                {/* Create Area */}
                <section>
                    <CreateCardForm />
                </section>

                {/* List Area */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-xl font-bold text-[#3d3126]">Your Cards</h3>
                        <span className="text-sm text-[#8c7b6c] font-medium">/ 作成した名刺一覧</span>
                    </div>

                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((card) => (
                            <Link href={`/dashboard/cards/${card.id}`} key={card.id} className="block group relative">
                                {/* Card Body simulating Wood */}
                                <div className={`
                                    relative h-56 rounded-xl border-2 transition-all duration-300 overflow-hidden
                                    ${card.is_published
                                        ? 'bg-[#f4f0e6] border-[#d4c5ae] shadow-lg group-hover:shadow-xl group-hover:scale-[1.02] group-hover:border-[#cbb89d]'
                                        : 'bg-[#faf9f6] border-dashed border-[#e6e2d3] opacity-90 hover:opacity-100'}
                                `}>
                                    {/* Wood Grain Pattern (CSS Opacity) */}
                                    {card.is_published && (
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
                                    )}

                                    <div className="absolute px-6 py-6 inset-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-serif font-bold text-[#3d3126] group-hover:text-[#2c3e50] line-clamp-1">
                                                    {card.title}
                                                </h3>
                                                <span className={`
                                                    inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide border
                                                    ${card.is_published
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-50 text-gray-500 border-gray-200'}
                                                `}>
                                                    {card.is_published ? 'LIVE' : 'DRAFT'}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-[#8c7b6c] line-clamp-2">
                                                {card.description || 'No description / 説明文なし'}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-[#d4c5ae]/40 pt-4 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider text-[#8c7b6c]">Total Views</span>
                                                <span className="text-2xl font-bold text-[#3d3126] font-mono">
                                                    {card.view_count || 0}
                                                </span>
                                            </div>
                                            <span className="text-xs text-[#2c3e50] font-medium group-hover:underline underline-offset-2">
                                                Edit / 編集 &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {cards.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-[#e6e2d3] rounded-xl bg-[#faf9f6]">
                                <p className="text-[#8c7b6c]">No cards yet. / 名刺がまだありません。</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
