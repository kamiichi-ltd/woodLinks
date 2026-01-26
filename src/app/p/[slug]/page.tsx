import { getCardBySlug } from '@/services/card-service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Database } from '@/database.types'
import { UserPlus, Link as LinkIcon, Phone, Mail, Instagram, Twitter, Facebook, Github, Globe, LucideIcon } from 'lucide-react'

import { ViewCounter } from '@/components/analytics/view-counter'

type CardContent = Database['public']['Tables']['card_contents']['Row']

// Helper guard
function isSnsContent(content: unknown): content is { platform: string; url: string } {
    return (
        typeof content === 'object' &&
        content !== null &&
        'platform' in content &&
        'url' in content
    )
}

function isTextContent(content: unknown): content is { text: string } {
    return typeof content === 'object' && content !== null && 'text' in content
}

const platformConfig: Record<string, { icon: LucideIcon, label: string, color: string }> = {
    twitter: { icon: Twitter, label: 'X (Twitter)', color: 'text-black' },
    instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-600' },
    facebook: { icon: Facebook, label: 'Facebook', color: 'text-[#1877F2]' },
    github: { icon: Github, label: 'GitHub', color: 'text-gray-900' },
    website: { icon: Globe, label: 'Website', color: 'text-gray-600' },
    phone: { icon: Phone, label: 'Phone', color: 'text-green-600' },
    email: { icon: Mail, label: 'Email', color: 'text-stone-600' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        return {
            title: 'Card Not Found',
        }
    }

    return {
        title: `${card.title} | WoodLinks`,
        description: card.description || 'Digital Business Card',
    }
}

// Theme Configurations
const themes = {
    sugi: {
        bg: 'bg-[#faf9f6]',
        text: 'text-stone-800',
        accent: 'text-[#d4a373]',
        border: 'border-[#d4a373]',
        fontHead: 'font-sans',
        pattern: 'opacity-10 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
        button: 'bg-[#d4a373] hover:bg-[#c5915d] text-white',
        cardBg: 'bg-white',
    },
    hinoki: {
        bg: 'bg-[#fdfbf7]',
        text: 'text-[#2c3e50]',
        accent: 'text-[#e9d8a6]',
        border: 'border-[#e9d8a6]',
        fontHead: 'font-serif',
        pattern: 'opacity-5 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
        button: 'bg-[#2c3e50] hover:bg-[#1a252f] text-[#fdfbf7]',
        cardBg: 'bg-[#ffffff]',
    },
    walnut: {
        bg: 'bg-[#1a1a1a]',
        text: 'text-[#e6e2d3]',
        accent: 'text-[#6b4c3e]',
        border: 'border-[#6b4c3e]',
        fontHead: 'font-serif',
        pattern: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
        button: 'bg-[#6b4c3e] hover:bg-[#5a3b2f] text-[#fdfbf7]',
        cardBg: 'bg-[#2c2c2c] border-[#444]',
    },
}

export default async function PublicCardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        notFound()
    }

    const material = card.material_type || 'sugi'
    const theme = themes[material]

    return (
        <div className={`min-h-screen ${theme.bg} flex flex-col items-center py-12 sm:px-6 lg:px-8 font-sans ${theme.text} relative overflow-hidden transition-colors duration-500`}>
            {/* Background Texture */}
            <div className={`absolute inset-0 ${theme.pattern} pointer-events-none mix-blend-multiply`}></div>

            <ViewCounter cardId={card.id} />

            <div className={`w-full max-w-sm space-y-6 ${theme.cardBg} p-8 shadow-2xl rounded-[2rem] border ${material === 'walnut' ? 'border-[#444]' : 'border-stone-100'} relative z-10`}>

                {/* Header */}
                <div className="text-center pt-2">
                    {/* Logo/Avatar */}
                    <div className={`mx-auto h-28 w-28 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg overflow-hidden relative border-4 ${material === 'walnut' ? 'border-[#3d3126]' : 'border-white'} bg-stone-100`}>
                        {(card as { avatar_url?: string | null } & typeof card).avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={(card as { avatar_url?: string | null } & typeof card).avatar_url!}
                                alt={card.title || 'Avatar'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl">
                                {card.title ? card.title.charAt(0).toUpperCase() : '🌲'}
                            </span>
                        )}
                    </div>
                    <h1 className={`text-3xl ${theme.fontHead} font-bold tracking-tight mb-3`}>
                        {card.title}
                    </h1>
                    {card.description && (
                        <p className={`text-sm ${material === 'walnut' ? 'text-stone-400' : 'text-stone-500'} whitespace-pre-wrap leading-relaxed`}>
                            {card.description}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8">
                    <a
                        href={`/api/cards/${card.id}/vcard`}
                        className={`w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-bold tracking-wide transform transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${theme.button}`}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Contacts
                    </a>
                </div>

                {/* Contents List */}
                <div className="mt-10 space-y-4">
                    {card.contents.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-stone-400 text-sm">表示できる情報がありません</p>
                        </div>
                    )}

                    {card.contents.map((item: CardContent) => {
                        if (item.type === 'sns_link' && isSnsContent(item.content)) {
                            const { platform, url } = item.content
                            const config = platformConfig[platform] || { icon: LinkIcon, label: platform, color: 'text-gray-600' }
                            const Icon = config.icon

                            // Customizing icon colors for walnut/dark theme if needed, or keeping brand colors
                            // For consistency, let's keep brand colors but ensure visibility

                            return (
                                <a
                                    key={item.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                        w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 group
                                        ${material === 'walnut'
                                            ? 'bg-[#333] border border-[#444] hover:bg-[#444] text-stone-300 hover:text-white shadow-none'
                                            : 'bg-white border border-stone-100 hover:bg-[#faf9f6] hover:shadow-md text-stone-700 hover:text-stone-900 shadow-sm'}
                                    `}
                                >
                                    <Icon className={`h-5 w-5 mr-4 ${config.color} ${material === 'walnut' ? 'opacity-90' : ''}`} />
                                    <span className="flex-1 text-base font-bold capitalize">{config.label}</span>
                                    <span className={`${material === 'walnut' ? 'text-stone-600' : 'text-stone-300'} group-hover:text-stone-500`}>↗</span>
                                </a>
                            )
                        }

                        if (item.type === 'text' && isTextContent(item.content)) {
                            return (
                                <div key={item.id} className={`rounded-xl p-6 text-center text-sm leading-relaxed border ${material === 'walnut' ? 'bg-[#333] border-[#444] text-stone-400' : 'bg-[#faf9f6] border-stone-100 text-stone-600'}`}>
                                    <p className="whitespace-pre-wrap">{item.content.text}</p>
                                </div>
                            )
                        }

                        return null
                    })}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs opacity-50">
                    <span className="font-serif">WoodLinks</span> Digital Card
                </div>

            </div>
        </div>
    )
}
