'use client'

import { useState } from 'react'
import { claimCard } from '@/app/actions/activation'
import { Loader2, Sparkles } from 'lucide-react'

// Using strict typing from database type if available, or just partial
type Card = {
    id: string
    slug: string
}

export default function CardActivation({ card }: { card: Card }) {
    const [isClaiming, setIsClaiming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleClaim = async () => {
        setIsClaiming(true)
        setError(null)
        try {
            await claimCard(card.id)
        } catch (e) {
            console.error(e)
            setError('エラーが発生しました。ログインしているか確認してください。')
            setIsClaiming(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <Sparkles className="w-8 h-8" />
                    </div>
                </div>

                <h1 className="text-2xl font-serif font-bold text-stone-800 mb-4">
                    Welcome to WoodLinks
                </h1>

                <p className="text-stone-600 mb-8 leading-relaxed">
                    このウッドカードを有効化して、<br />
                    あなただけの名刺を作りましょう。
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full bg-stone-800 text-stone-50 hover:bg-stone-700 disabled:opacity-70 disabled:cursor-not-allowed py-4 px-6 rounded-xl font-bold transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
                >
                    {isClaiming ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            セットアップ中...
                        </>
                    ) : (
                        'セットアップを開始する'
                    )}
                </button>

                <p className="mt-6 text-xs text-stone-400">
                    ※ログインまたはアカウント登録が必要です
                </p>
            </div>

            <div className="mt-8 text-stone-400 text-xs tracking-widest uppercase">
                WoodLinks by Kamiichi
            </div>
        </div>
    )
}
