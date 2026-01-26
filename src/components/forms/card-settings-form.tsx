'use client'

import { useState } from 'react'
import { updateCard } from '@/services/card-service'
import { useRouter } from 'next/navigation'

interface CardSettingsFormProps {
    cardId: string
    initialTitle: string
    initialSlug: string
    initialDescription: string | null
    initialIsPublished: boolean
}

export default function CardSettingsForm({ cardId, initialTitle, initialSlug, initialDescription, initialIsPublished }: CardSettingsFormProps) {
    const [title, setTitle] = useState(initialTitle)
    const [slug, setSlug] = useState(initialSlug)
    const [description, setDescription] = useState(initialDescription || '')
    const [isPublished, setIsPublished] = useState(initialIsPublished)
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
                is_published: isPublished,
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

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold leading-6 text-[#2c3e50] uppercase tracking-wider">
                        Card Title <span className="text-xs font-normal text-[#8c7b6c] ml-1 normal-case">/ 名刺のタイトル（お名前など）</span>
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
                    <label htmlFor="slug" className="block text-sm font-bold leading-6 text-[#2c3e50] uppercase tracking-wider">
                        Public URL Slug <span className="text-xs font-normal text-[#8c7b6c] ml-1 normal-case">/ 公開URLスラッグ</span>
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
                            title="Only lowercase alphanumeric characters and hyphens are allowed"
                            required
                        />
                    </div>
                    <p className="mt-2 text-xs text-[#8c7b6c] flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#d4c5ae]"></span>
                        Lowercase alphanumeric & hyphens only.
                    </p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold leading-6 text-[#2c3e50] uppercase tracking-wider">
                        Description / Bio <span className="text-xs font-normal text-[#8c7b6c] ml-1 normal-case">/ 自己紹介・プロフィール文</span>
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-xl border-0 py-3 text-[#2c3e50] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-[#fcfbf9]"
                            placeholder="Brief bio, title, or tagline..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-x-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#e6e2d3] hover:border-[#d4c5ae] transition-colors">
                    <div className="flex h-6 items-center">
                        <input
                            id="is_published"
                            name="is_published"
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="h-5 w-5 rounded border-[#d4c5ae] text-[#2c3e50] focus:ring-[#2c3e50] cursor-pointer"
                        />
                    </div>
                    <div className="text-sm leading-6">
                        <label htmlFor="is_published" className="font-bold text-[#2c3e50] cursor-pointer select-none">
                            Publish Card <span className="font-normal text-[#8c7b6c]">/ 名刺を公開する</span>
                        </label>
                        <p className="text-[#8c7b6c] text-xs">Make your card visible to the world.</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-[#e6e2d3]">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-xl bg-[#2c3e50] px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-lg shadow-[#2c3e50]/10 hover:bg-[#1a252f] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                    {isLoading ? 'Saving...' : 'Save Settings / 設定を保存'}
                </button>
            </div>
        </form>
    )
}
