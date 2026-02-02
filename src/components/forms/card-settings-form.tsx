'use client'

import { useState } from 'react'
import { updateCard } from '@/services/card-service'
import { useRouter } from 'next/navigation'

interface CardSettingsFormProps {
    cardId: string
    initialTitle: string
    initialSlug: string
    initialDescription: string | null
    initialStatus: 'draft' | 'published' | 'lost_reissued' | 'disabled' | 'transferred'
    initialMaterialType: 'sugi' | 'hinoki' | 'walnut'
}

export default function CardSettingsForm({ cardId, initialTitle, initialSlug, initialDescription, initialStatus, initialMaterialType }: CardSettingsFormProps) {
    const [title, setTitle] = useState(initialTitle)
    const [slug, setSlug] = useState(initialSlug)
    const [description, setDescription] = useState(initialDescription || '')
    const [status, setStatus] = useState(initialStatus || 'draft')
    const [materialType, setMaterialType] = useState(initialMaterialType || 'sugi')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            await updateCard(cardId, {
                title,
                slug,
                description,
                status,
                material_type: materialType,
            })
            setMessage({ type: 'success', text: '設定を更新しました' })
            router.refresh()
        } catch (error) {
            setMessage({ type: 'error', text: '設定の更新に失敗しました。スラッグが既に使用されている可能性があります。' })
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md shadow-lg border border-[#e6e2d3] rounded-3xl p-6 sm:p-8 space-y-8 transition-all hover:shadow-xl">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <span>{message.type === 'success' ? '✓' : '!'}</span>
                    {message.text}
                </div>
            )}

            <div className="space-y-8">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold leading-6 text-[#2c3e50]">
                        名刺のタイトル（お名前など）
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full rounded-xl border-0 py-3 text-[#2c3e50] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6 font-medium bg-[#fcfbf9]"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-bold leading-6 text-[#2c3e50]">
                        公開URLスラッグ
                    </label>
                    <div className="mt-2 flex rounded-xl shadow-sm ring-1 ring-inset ring-[#d4c5ae] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#2c3e50] bg-[#fcfbf9] overflow-hidden">
                        <span className="flex select-none items-center pl-4 pr-1 bg-[#f4f1ea] text-[#8c7b6c] sm:text-sm font-mono border-r border-[#e6e2d3]">woodlinks.app/p/</span>
                        <input
                            type="text"
                            name="slug"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="block flex-1 border-0 bg-transparent py-3 pl-3 text-[#2c3e50] placeholder:text-[#a4998e] focus:ring-0 sm:text-sm sm:leading-6 font-mono"
                            placeholder="your-custom-url"
                            pattern="^[a-z0-9-]+$"
                            title="半角英数字とハイフンのみ使用可能です"
                            required
                        />
                    </div>
                    <p className="mt-2 text-xs text-[#8c7b6c] flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#d4c5ae]"></span>
                        半角英数字とハイフンのみ使用可能です
                    </p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold leading-6 text-[#2c3e50]">
                        自己紹介・プロフィール文
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-xl border-0 py-3 text-[#2c3e50] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-[#fcfbf9]"
                            placeholder="経歴、役職、一言メッセージなどを入力..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold leading-6 text-[#2c3e50] mb-3">
                        名刺の素材（テーマ）
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-3">
                        {/* Sugi */}
                        <label className={`
                            relative flex flex-col items-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200
                            ${materialType === 'sugi'
                                ? 'border-[#d4a373] bg-[#fdfbf7] ring-1 ring-[#d4a373]'
                                : 'border-[#e6e2d3] bg-white hover:border-[#d4c5ae]'}
                        `}>
                            <input
                                type="radio"
                                name="material_type"
                                value="sugi"
                                checked={materialType === 'sugi'}
                                onChange={(e) => setMaterialType(e.target.value as 'sugi' | 'hinoki' | 'walnut')}
                                className="sr-only"
                            />
                            <div className="w-full h-20 rounded-lg bg-[#fdfbf7] mb-2 relative overflow-hidden border border-[#e6e2d3]">
                                <div className="absolute inset-x-0 top-0 h-1 bg-[#d4a373]"></div>
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">🌲</div>
                            </div>
                            <span className="font-bold text-sm text-[#3d3126]">杉 (Sugi)</span>
                            <span className="text-[10px] text-[#8c7b6c] mt-0.5 text-center leading-tight">親しみやすさ</span>
                        </label>

                        {/* Hinoki */}
                        <label className={`
                            relative flex flex-col items-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200
                            ${materialType === 'hinoki'
                                ? 'border-[#e9d8a6] bg-[#fdfbf7] ring-1 ring-[#e9d8a6]'
                                : 'border-[#e6e2d3] bg-white hover:border-[#d4c5ae]'}
                        `}>
                            <input
                                type="radio"
                                name="material_type"
                                value="hinoki"
                                checked={materialType === 'hinoki'}
                                onChange={(e) => setMaterialType(e.target.value as 'sugi' | 'hinoki' | 'walnut')}
                                className="sr-only"
                            />
                            <div className="w-full h-20 rounded-lg bg-[#fdfbf7] mb-2 relative overflow-hidden border border-[#e6e2d3]">
                                <div className="absolute inset-x-0 top-0 h-1 bg-[#e9d8a6]"></div>
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl">🪵</div>
                            </div>
                            <span className="font-bold text-sm text-[#3d3126]">桧 (Hinoki)</span>
                            <span className="text-[10px] text-[#8c7b6c] mt-0.5 text-center leading-tight">高貴・清潔</span>
                        </label>

                        {/* Walnut */}
                        <label className={`
                            relative flex flex-col items-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200
                            ${materialType === 'walnut'
                                ? 'border-[#6b4c3e] bg-[#fdfbf7] ring-1 ring-[#6b4c3e]'
                                : 'border-[#e6e2d3] bg-white hover:border-[#d4c5ae]'}
                        `}>
                            <input
                                type="radio"
                                name="material_type"
                                value="walnut"
                                checked={materialType === 'walnut'}
                                onChange={(e) => setMaterialType(e.target.value as 'sugi' | 'hinoki' | 'walnut')}
                                className="sr-only"
                            />
                            <div className="w-full h-20 rounded-lg bg-[#2c1810] mb-2 relative overflow-hidden border border-[#6b4c3e]">
                                <div className="absolute inset-x-0 top-0 h-1 bg-[#6b4c3e]"></div>
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">🕰️</div>
                            </div>
                            <span className="font-bold text-sm text-[#3d3126]">胡桃 (Walnut)</span>
                            <span className="text-[10px] text-[#8c7b6c] mt-0.5 text-center leading-tight">重厚・モダン</span>
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-x-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#e6e2d3] hover:border-[#d4c5ae] transition-colors">
                    <div className="flex h-6 items-center">
                        <input
                            id="status"
                            name="status"
                            type="checkbox"
                            checked={status === 'published'}
                            onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                            disabled={['lost_reissued', 'disabled', 'transferred'].includes(status)}
                            className="h-5 w-5 rounded border-[#d4c5ae] text-[#2c3e50] focus:ring-[#2c3e50] cursor-pointer disabled:opacity-50"
                        />
                    </div>
                    <div className="text-sm leading-6">
                        <label htmlFor="status" className="font-bold text-[#2c3e50] cursor-pointer select-none">
                            名刺を公開する
                        </label>
                        <p className="text-[#8c7b6c] text-xs">
                            {status === 'published' ? '現在、あなたの名刺は世界中に公開されています。' : '現在、この名刺は非公開（下書き）です。'}
                        </p>
                        {['lost_reissued', 'disabled', 'transferred'].includes(status) && (
                            <p className="text-red-600 text-xs font-bold mt-1">
                                Status: {status.toUpperCase()} (変更不可)
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-[#e6e2d3]">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-xl bg-[#2c3e50] px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-lg shadow-[#2c3e50]/10 hover:bg-[#1a252f] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {isLoading ? '保存中...' : '設定を保存'}
                </button>
            </div>
        </form>
    )
}
