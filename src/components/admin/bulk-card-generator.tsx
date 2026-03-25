'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Boxes, Download, Loader2, Plus, X } from 'lucide-react'
import { BulkGeneratedCard, generateBulkCards } from '@/app/actions/admin-bulk'

const COUNT_OPTIONS = [10, 50, 100]

const MATERIAL_OPTIONS = [
    { value: 'sugi', label: '杉 (Sugi)' },
    { value: 'hinoki', label: 'ヒノキ (Hinoki)' },
    { value: 'walnut', label: 'ウォールナット (Walnut)' },
    { value: 'maple', label: 'メープル (Maple)' },
]

function escapeCsvValue(value: string) {
    return `"${value.replace(/"/g, '""')}"`
}

function downloadCsv(cards: BulkGeneratedCard[]) {
    const rows = [
        ['ID', 'Material', 'URL'],
        ...cards.map((card) => [card.id, card.materialType || '', card.url]),
    ]

    const csvContent = rows
        .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
        .join('\n')

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    link.href = href
    link.download = `woodlinks-bulk-cards-${timestamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
}

export function BulkCardGenerator() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [count, setCount] = useState<number>(10)
    const [materialType, setMaterialType] = useState<string>('sugi')
    const [error, setError] = useState<string | null>(null)
    const [generatedCards, setGeneratedCards] = useState<BulkGeneratedCard[]>([])
    const [isPending, startTransition] = useTransition()

    const handleGenerate = () => {
        setError(null)

        startTransition(async () => {
            try {
                const cards = await generateBulkCards(count, materialType)
                setGeneratedCards(cards)
                downloadCsv(cards)
                setIsOpen(false)
                router.refresh()
            } catch (generationError) {
                console.error(generationError)
                setError('カードの一括生成に失敗しました')
            }
        })
    }

    return (
        <>
            <div className="flex flex-col gap-4 rounded-3xl border border-[#e6e2d3] bg-white/90 p-6 shadow-lg shadow-stone-200/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f1ea] text-[#3d3126]">
                        <Boxes className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-serif font-bold text-[#2c3e50]">カード一括生成</h2>
                        <p className="mt-1 text-sm text-[#8c7b6c]">
                            量産用の空カードをまとめて発行し、加工用CSVをすぐにダウンロードできます。
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2c3e50] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#1a252f]"
                >
                    <Plus className="h-4 w-4" />
                    Bulk Generate
                </button>
            </div>

            {generatedCards.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {generatedCards.length}枚の空カードを生成し、CSVをダウンロードしました。
                </div>
            )}

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            onClick={() => {
                                if (!isPending) {
                                    setIsOpen(false)
                                }
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-xl rounded-[2rem] border border-[#e6e2d3] bg-[#fdfbf7] shadow-2xl">
                                <div className="flex items-start justify-between border-b border-stone-200 px-6 py-5">
                                    <div>
                                        <h3 className="text-xl font-serif font-bold text-[#2c3e50]">カード一括生成</h3>
                                        <p className="mt-1 text-sm text-[#8c7b6c]">
                                            生成後すぐに量産用CSVをダウンロードします。
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isPending}
                                        className="rounded-full p-2 text-[#8c7b6c] transition-colors hover:bg-black/5"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-6 px-6 py-6">
                                    <div>
                                        <label className="mb-3 block text-sm font-bold text-[#3d3126]">生成枚数</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {COUNT_OPTIONS.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setCount(option)}
                                                    className={`rounded-2xl border px-4 py-4 text-center text-lg font-bold transition-all ${
                                                        count === option
                                                            ? 'border-[#2c3e50] bg-[#2c3e50] text-white shadow-lg'
                                                            : 'border-[#d4c5ae] bg-white text-[#3d3126] hover:border-[#8c7b6c]'
                                                    }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="bulk-material" className="mb-3 block text-sm font-bold text-[#3d3126]">
                                            素材
                                        </label>
                                        <select
                                            id="bulk-material"
                                            value={materialType}
                                            onChange={(event) => setMaterialType(event.target.value)}
                                            className="w-full rounded-2xl border border-[#d4c5ae] bg-white px-4 py-3 text-sm font-medium text-[#3d3126] focus:outline-none focus:ring-2 focus:ring-[#8c7b6c]"
                                        >
                                            {MATERIAL_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {error && (
                                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-stone-200 px-6 py-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isPending}
                                        className="rounded-2xl px-5 py-3 text-sm font-bold text-[#8c7b6c] transition-colors hover:bg-white"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isPending}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2c3e50] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#1a252f] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {isPending ? '生成中...' : '生成してCSVをダウンロード'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
