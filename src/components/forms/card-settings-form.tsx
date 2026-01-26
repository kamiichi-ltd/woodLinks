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
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm shadow-sm border border-[#e6e2d3] sm:rounded-xl p-6 space-y-8">
            <h3 className="text-lg font-bold leading-6 text-[#3d3126] border-b border-[#e6e2d3] pb-4">
                Card Settings / 名刺の基本設定
            </h3>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold leading-6 text-[#3d3126]">
                        Card Title <span className="text-xs font-normal text-[#8c7b6c] ml-1">名刺のタイトル（お名前など）</span>
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 text-[#3d3126] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-bold leading-6 text-[#3d3126]">
                        Public URL Slug <span className="text-xs font-normal text-[#8c7b6c] ml-1">公開URLスラッグ</span>
                    </label>
                    <div className="mt-2 flex rounded-lg shadow-sm ring-1 ring-inset ring-[#d4c5ae] focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#2c3e50] sm:max-w-md bg-white">
                        <span className="flex select-none items-center pl-3 text-[#8c7b6c] sm:text-sm font-mono">/p/</span>
                        <input
                            type="text"
                            name="slug"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="block flex-1 border-0 bg-transparent py-2 pl-1 text-[#3d3126] placeholder:text-[#a4998e] focus:ring-0 sm:text-sm sm:leading-6 font-mono"
                            placeholder="your-custom-url"
                            pattern="^[a-z0-9-]+$"
                            title="Only lowercase alphanumeric characters and hyphens are allowed"
                            required
                        />
                    </div>
                    <p className="mt-1 text-xs text-[#8c7b6c]">Lowercase alphanumeric & hyphens only. / 半角英数字とハイフンのみ</p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold leading-6 text-[#3d3126]">
                        Description / Bio <span className="text-xs font-normal text-[#8c7b6c] ml-1">自己紹介・プロフィール文</span>
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 text-[#3d3126] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6"
                            placeholder="Brief bio, title, or tagline..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-x-3 bg-[#fdfbf7] p-4 rounded-lg border border-[#e6e2d3]">
                    <input
                        id="is_published"
                        name="is_published"
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="h-5 w-5 rounded border-[#d4c5ae] text-[#2c3e50] focus:ring-[#2c3e50] cursor-pointer"
                    />
                    <label htmlFor="is_published" className="block text-sm font-bold leading-6 text-[#3d3126] cursor-pointer select-none">
                        Publish Card <span className="font-normal text-[#8c7b6c] ml-1">/ 名刺を公開する</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-[#e6e2d3]">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-lg bg-[#2c3e50] px-4 py-2.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-[#1a252f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Saving...' : 'Save Settings / 設定を保存'}
                </button>
            </div>
        </form>
    )
}
