'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateAdminCard } from '@/app/actions/admin'
import { Loader2, Save, ArrowLeft, ExternalLink } from 'lucide-react'

type CardData = {
    id: string
    title: string | null
    description: string | null
    slug: string
    material_type: string | null
    wood_origin: string | null
    wood_age: string | null
    wood_story: string | null
}

const MATERIAL_OPTIONS = [
    { value: 'walnut', label: 'Walnut (ウォールナット)' },
    { value: 'maple', label: 'Maple (メープル)' },
    { value: 'hinoki', label: 'Hinoki (檜)' },
    { value: 'sugi', label: 'Sugi (杉)' },
]

export function CardEditForm({ card }: { card: CardData }) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [formData, setFormData] = useState({
        title: card.title || '',
        description: card.description || '',
        slug: card.slug || '',
        material_type: card.material_type || 'walnut',
        wood_origin: card.wood_origin || '',
        wood_age: card.wood_age || '',
        wood_story: card.wood_story || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            await updateAdminCard(card.id, formData)
            alert('更新しました')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('更新に失敗しました')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-stone-500 hover:text-stone-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    戻る
                </button>
                <a
                    href={`/p/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-stone-500 hover:text-stone-800 transition-colors text-sm"
                >
                    公開ページを確認
                    <ExternalLink className="w-3 h-3 ml-1" />
                </a>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-stone-50">
                    <h2 className="text-xl font-bold text-stone-800">カード情報編集</h2>
                    <p className="text-sm text-stone-500 mt-1">ID: {card.id}</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">基本情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-stone-700">タイトル (表示名)</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-stone-700">スラッグ (URL)</label>
                                <div className="flex items-center">
                                    <span className="text-stone-400 text-sm mr-1">/p/</span>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="flex-1 p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700">説明文 (自己紹介)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Material & Traceability Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">素材・トレーサビリティ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-stone-700">素材タイプ</label>
                                <select
                                    name="material_type"
                                    value={formData.material_type}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-stone-400 focus:outline-none"
                                >
                                    {MATERIAL_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-stone-700">産地 (Wood Origin)</label>
                                <input
                                    type="text"
                                    name="wood_origin"
                                    value={formData.wood_origin}
                                    onChange={handleChange}
                                    placeholder="例: 奈良県吉野"
                                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-stone-700">樹齢 (Wood Age)</label>
                                <input
                                    type="text"
                                    name="wood_age"
                                    value={formData.wood_age}
                                    onChange={handleChange}
                                    placeholder="例: 100年以上"
                                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700">木の物語 (Wood Story)</label>
                                <textarea
                                    name="wood_story"
                                    value={formData.wood_story}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="この木材にまつわるストーリーや特徴を記述..."
                                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium mr-4 transition-colors"
                        disabled={isPending}
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-stone-800 text-white rounded-lg font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        保存する
                    </button>
                </div>
            </form>
        </div>
    )
}
