import { Users } from 'lucide-react'
import type { CardLead } from '@/app/actions/connection'

function formatSavedAt(createdAt: string) {
    return new Date(createdAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function getDisplayName(lead: CardLead) {
    return lead.fullName || 'ユーザー'
}

export function LeadList({ leads }: { leads: CardLead[] }) {
    return (
        <div>
            <div className="flex items-end gap-3 mb-2">
                <h2 className="text-2xl font-serif font-bold text-[#2c3e50] leading-none">リード管理</h2>
                <span className="text-sm font-medium text-[#8c7b6c] mb-0.5">/ 保存してくれたユーザー</span>
            </div>

            <div className="bg-white/90 backdrop-blur-md shadow-lg border border-[#e6e2d3] rounded-3xl p-6 sm:p-8 transition-all hover:shadow-xl">
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f1ea] text-[#3d3126]">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#3d3126]">保存ユーザー一覧</p>
                            <p className="text-xs text-[#8c7b6c]">このカードを保存した見込み客の履歴です</p>
                        </div>
                    </div>
                    <div className="rounded-full bg-[#faf9f6] px-3 py-1 text-sm font-bold text-[#3d3126] border border-[#e6e2d3]">
                        {leads.length}件
                    </div>
                </div>

                {leads.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f1ea] text-[#8c7b6c]">
                            <Users className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-[#5a4d41]">まだ保存したユーザーはいません</p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100">
                        {leads.map((lead) => (
                            <div key={`${lead.userId}-${lead.createdAt}`} className="flex items-center gap-4 py-4 first:pt-6 last:pb-0">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f4f1ea] text-sm font-bold text-[#3d3126]">
                                    {lead.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={lead.avatarUrl}
                                            alt={getDisplayName(lead)}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        getDisplayName(lead).slice(0, 1).toUpperCase()
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-[#3d3126]">{getDisplayName(lead)}</p>
                                    <p className="text-xs text-[#8c7b6c]">保存日時: {formatSavedAt(lead.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
