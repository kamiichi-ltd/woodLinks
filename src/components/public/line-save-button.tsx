'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Loader2, MessageCircle } from 'lucide-react'
import { saveCardConnection } from '@/app/actions/connection'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface LineSaveButtonProps {
    cardId: string
    slug: string
    isLoggedIn: boolean
    autoSave?: boolean
    initialSaved?: boolean
}

function buildLoginHref(slug: string, cardId: string) {
    const params = new URLSearchParams({
        next: `/p/${slug}`,
        action: 'save',
        cardId,
    })

    return `/login?${params.toString()}`
}

export default function LineSaveButton({
    cardId,
    slug,
    isLoggedIn,
    autoSave = false,
    initialSaved = false,
}: LineSaveButtonProps) {
    const router = useRouter()
    const autoSaveTriggered = useRef(false)
    const [saveState, setSaveState] = useState<SaveState>(initialSaved ? 'saved' : 'idle')

    const replaceWithSavedQuery = () => {
        const params = new URLSearchParams(window.location.search)
        params.delete('action')
        params.delete('cardId')
        params.set('saved', '1')

        const query = params.toString()
        const href = query ? `/p/${slug}?${query}` : `/p/${slug}`
        router.replace(href, { scroll: false })
    }

    const handleSave = async () => {
        if (saveState === 'saving' || saveState === 'saved') {
            return
        }

        setSaveState('saving')

        try {
            await saveCardConnection(cardId)
            setSaveState('saved')
            replaceWithSavedQuery()
        } catch (error) {
            console.error('Failed to save card connection:', error)
            setSaveState('error')
        }
    }

    useEffect(() => {
        if (!autoSave || !isLoggedIn || initialSaved || autoSaveTriggered.current) {
            return
        }

        autoSaveTriggered.current = true
        void handleSave()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSave, isLoggedIn, initialSaved])

    const buttonContent = () => {
        switch (saveState) {
            case 'saving':
                return (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        保存中...
                    </>
                )
            case 'saved':
                return (
                    <>
                        <Check className="h-4 w-4" />
                        LINEで保存済み
                    </>
                )
            case 'error':
                return (
                    <>
                        <MessageCircle className="h-4 w-4" />
                        もう一度保存
                    </>
                )
            default:
                return (
                    <>
                        <MessageCircle className="h-4 w-4" />
                        LINEでこのカードを保存
                    </>
                )
        }
    }

    const commonClassName = 'flex min-h-[58px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold tracking-wide shadow-md transition-all duration-200'

    if (!isLoggedIn) {
        return (
            <Link
                href={buildLoginHref(slug, cardId)}
                className={`${commonClassName} bg-[#06C755] text-white hover:bg-[#05b34c] hover:-translate-y-0.5 active:scale-[0.98]`}
            >
                <MessageCircle className="h-4 w-4" />
                LINEでこのカードを保存
            </Link>
        )
    }

    return (
        <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveState === 'saving' || saveState === 'saved'}
            className={`${commonClassName} ${saveState === 'saved'
                ? 'bg-[#05b34c] text-white'
                : 'bg-[#06C755] text-white hover:bg-[#05b34c] hover:-translate-y-0.5 active:scale-[0.98]'
                } disabled:cursor-default disabled:opacity-90`}
        >
            {buttonContent()}
        </button>
    )
}
