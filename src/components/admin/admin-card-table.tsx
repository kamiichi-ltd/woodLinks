import Link from 'next/link'
import { ExternalLink, Pencil, QrCode } from 'lucide-react'
import type { AdminCardListItem } from '@/app/actions/admin-bulk'

function formatMaterial(materialType: string | null) {
    switch (materialType) {
        case 'sugi':
            return '杉'
        case 'hinoki':
            return 'ヒノキ'
        case 'walnut':
            return 'ウォールナット'
        case 'maple':
            return 'メープル'
        default:
            return '未設定'
    }
}

function formatStatus(card: AdminCardListItem) {
    if (card.status === 'published') {
        return '公開中'
    }

    if (!card.ownerId) {
        return '未割当'
    }

    if (card.status === 'draft') {
        return '下書き'
    }

    return card.status || '不明'
}

export function AdminCardTable({ cards }: { cards: AdminCardListItem[] }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg shadow-stone-200/40">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-stone-500">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold">カードID</th>
                            <th className="px-6 py-4 text-left font-semibold">素材</th>
                            <th className="px-6 py-4 text-left font-semibold">状態</th>
                            <th className="px-6 py-4 text-left font-semibold">初期アクセスURL</th>
                            <th className="px-6 py-4 text-left font-semibold">作成日</th>
                            <th className="px-6 py-4 text-right font-semibold">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {cards.map((card) => (
                            <tr key={card.id} className="hover:bg-stone-50/70">
                                <td className="px-6 py-4 align-top">
                                    <div className="font-mono text-xs font-bold text-stone-700">{card.id}</div>
                                    <div className="mt-1 text-xs text-stone-400">slug: {card.slug}</div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <span className="inline-flex rounded-full border border-[#d4c5ae] bg-[#faf9f6] px-3 py-1 text-xs font-bold text-[#5a4d41]">
                                        {formatMaterial(card.materialType)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                        card.status === 'published'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : !card.ownerId
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-stone-100 text-stone-700'
                                    }`}>
                                        {formatStatus(card)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 font-mono text-xs text-stone-700">
                                        <QrCode className="h-3.5 w-3.5 text-stone-400" />
                                        /c/{card.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-top text-stone-600">
                                    {new Date(card.createdAt).toLocaleDateString('ja-JP')}
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/cards/${card.id}`}
                                            className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            編集
                                        </Link>
                                        <a
                                            href={`/c/${card.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            確認
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {cards.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-stone-500">
                    まだカードは登録されていません。
                </div>
            )}
        </div>
    )
}
