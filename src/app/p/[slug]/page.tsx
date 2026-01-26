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

export default async function PublicCardPage({ params }: { params: { slug: string } }) {
    const card = await getCardBySlug(params.slug)

    if (!card) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 shadow-2xl rounded-xl">

                {/* Header */}
                <div className="text-center">
                    {/* Logo or Avatar placeholder can go here */}
                    <div className="mx-auto h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-4">
                        🏷️
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        {card.title}
                    </h1>
                    {card.description && (
                        <p className="mt-2 text-lg text-gray-500">
                            {card.description}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6">
                    <a
                        href={`/api/cards/${card.id}/vcard`}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Contacts
                    </a>
                </div>

                {/* Contents List */}
                <div className="mt-8 space-y-4">
                    {card.contents.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-sm">表示できる情報がありません</p>
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
                                    className="w-full flex items-center px-6 py-4 border border-gray-200 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group"
                                >
                                    <Icon className={`h-6 w-6 mr-4 ${config.color}`} />
                                    <span className="flex-1 capitalize">{config.label}</span>
                                    {platform !== 'phone' && platform !== 'email' && (
                                        <span className="text-gray-400 group-hover:text-gray-500">↗</span>
                                    )}
                                </a>
                            )
                        }

                        if (item.type === 'text' && isTextContent(item.content)) {
                            return (
                                <div key={item.id} className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-gray-700 whitespace-pre-wrap">{item.content.text}</p>
                                </div>
                            )
                        }

                        return null
                    })}
                </div>

                {/* Footer */}
                <div className="mt-10 text-center text-xs text-gray-400">
                    Powered by <Link href="/" className="hover:text-indigo-500">WoodLinks</Link>
                </div>

            </div>
        </div>
    )
}
