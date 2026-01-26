import { getCardBySlug } from '@/services/card-service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Database } from '@/database.types'
import { UserPlus, Link as LinkIcon, Phone, Mail, Instagram, Twitter, Facebook, Github, Globe, LucideIcon } from 'lucide-react'

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
    facebook: { icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
    github: { icon: Github, label: 'GitHub', color: 'text-gray-900' },
    website: { icon: Globe, label: 'Website', color: 'text-gray-600' },
    phone: { icon: Phone, label: 'Phone', color: 'text-green-600' },
    email: { icon: Mail, label: 'Email', color: 'text-indigo-600' },
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

export default async function PublicCardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center py-12 sm:px-6 lg:px-8 font-sans text-stone-800">
            <div className="w-full max-w-sm space-y-6 bg-white p-6 shadow-xl shadow-stone-200/50 rounded-2xl border border-stone-100">

                {/* Header */}
                <div className="text-center pt-2">
                    {/* Logo/Avatar */}
                    <div className="mx-auto h-24 w-24 bg-gradient-to-br from-stone-100 to-stone-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner ring-4 ring-white">
                        🌲
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-900 leading-tight">
                        {card.title}
                    </h1>
                    {card.description && (
                        <p className="mt-3 text-sm text-stone-500 whitespace-pre-wrap leading-relaxed">
                            {card.description}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6">
                    <a
                        href={`/api/cards/${card.id}/vcard`}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-stone-800 hover:bg-stone-700 active:scale-[0.98] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Contacts
                    </a>
                </div>

                {/* Contents List */}
                <div className="mt-8 space-y-4">
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

                            return (
                                <a
                                    key={item.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center px-5 py-4 border border-stone-100 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white hover:bg-[#faf9f6 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 group"
                                >
                                    <Icon className={`h-5 w-5 mr-3 ${config.color}`} />
                                    <span className="flex-1 text-base font-medium text-stone-700 group-hover:text-stone-900 capitalize transition-colors">{config.label}</span>
                                    {platform !== 'phone' && platform !== 'email' && (
                                        <span className="text-stone-300 group-hover:text-stone-500 transition-colors">↗</span>
                                    )}
                                </a>
                            )
                        }

                        if (item.type === 'text' && isTextContent(item.content)) {
                            return (
                                <div key={item.id} className="bg-[#faf9f6] rounded-xl p-5 text-center text-sm text-stone-600 leading-relaxed border border-stone-100">
                                    <p className="whitespace-pre-wrap">{item.content.text}</p>
                                </div>
                            )
                        }

                        return null
                    })}
                </div>

                {/* Footer */}
                <div className="mt-10 text-center text-xs text-stone-400">
                    Powered by <Link href="/" className="hover:text-stone-600 transition-colors">WoodLinks</Link>
                </div>

            </div>
        </div>
    )
}
