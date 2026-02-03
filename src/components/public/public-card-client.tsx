'use client'

import { useState } from 'react'
import { Link as LinkIcon, Phone, Mail, Instagram, Twitter, Facebook, Github, Globe, LucideIcon, Palette } from 'lucide-react'
import ContactSaveButton from '@/components/public/contact-save-button'
import PublicNavigation from '@/components/public/public-navigation'
import { ViewCounter } from '@/components/analytics/view-counter'

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
    twitter: { icon: Twitter, label: 'X (Twitter)', color: 'text-stone-700' },
    instagram: { icon: Instagram, label: 'Instagram', color: 'text-rose-600' },
    facebook: { icon: Facebook, label: 'Facebook', color: 'text-blue-700' },
    github: { icon: Github, label: 'GitHub', color: 'text-stone-800' },
    website: { icon: Globe, label: 'Website', color: 'text-stone-600' },
    phone: { icon: Phone, label: 'Phone', color: 'text-green-700' },
    email: { icon: Mail, label: 'Email', color: 'text-stone-600' },
}

const getMaterialTheme = (material: string = 'walnut') => {
    const defaultTheme = {
        name: 'Walnut',
        headerBg: 'bg-stone-800',
        textColor: 'text-white',
        buttonClass: 'bg-stone-800 text-white',
        texture: 'opacity-30 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
    }

    const themes: Record<string, typeof defaultTheme> = {
        walnut: {
            ...defaultTheme,
            headerBg: 'bg-amber-950', // Very dark brown
            buttonClass: 'bg-amber-950 text-amber-50',
            textColor: 'text-amber-50', // Warm white
        },
        maple: {
            name: 'Maple',
            headerBg: 'bg-amber-200', // Honey gold
            textColor: 'text-amber-950',
            buttonClass: 'bg-amber-200 text-amber-950',
            texture: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
        },
        hinoki: {
            name: 'Hinoki',
            headerBg: 'bg-yellow-100', // Pale cream
            textColor: 'text-stone-900',
            buttonClass: 'bg-yellow-100 text-stone-900 border border-stone-200',
            texture: 'opacity-10 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
        },
        sugi: {
            name: 'Sugi',
            headerBg: 'bg-[#d4a373]',
            textColor: 'text-white',
            buttonClass: 'bg-[#d4a373] text-white',
            texture: 'opacity-20 bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]',
        }
    }

    return themes[material] || defaultTheme
}

type PublicCardClientProps = {
    card: any
    isOwner: boolean
}

export default function PublicCardClient({ card, isOwner }: PublicCardClientProps) {
    // State management for material switcher
    const [currentMaterial, setCurrentMaterial] = useState(card.material_type || 'walnut')
    const theme = getMaterialTheme(currentMaterial)

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
            {/* Global Noise Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-50 z-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] mix-blend-multiply"></div>

            {/* Navigation & Actions */}
            <PublicNavigation isOwner={isOwner} cardId={card.id} />
            <ViewCounter cardId={card.id} />

            {/* Main Card Container */}
            <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden relative z-10 transform transition-all duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.2)]">

                {/* Wood Accent Header */}
                <div className={`h-32 w-full relative ${theme.headerBg} overflow-hidden transition-colors duration-500`}>
                    <div className={`absolute inset-0 ${theme.texture} mix-blend-multiply transition-opacity duration-500`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>

                {/* Profile Avatar (Floating over header) */}
                <div className="px-8 relative -mt-16 text-center">
                    <div className="mx-auto h-32 w-32 rounded-full p-1.5 bg-white shadow-lg">
                        <div className="h-full w-full rounded-full overflow-hidden bg-stone-100 flex items-center justify-center relative">
                            {card.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={card.avatar_url}
                                    alt={card.title || 'Avatar'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl text-stone-400">
                                    {card.title ? card.title.charAt(0).toUpperCase() : '🌲'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="mt-4 mb-8">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2c3e50] tracking-wide mb-3">
                            {card.title}
                        </h1>
                        {card.description && (
                            <p className="text-sm text-[#8c7b6c] whitespace-pre-wrap leading-relaxed font-medium">
                                {card.description}
                            </p>
                        )}
                    </div>

                    {/* CTA Button */}
                    <ContactSaveButton
                        cardId={card.id}
                        themeButtonClass={`${theme.buttonClass} shadow-lg flex items-center justify-center gap-2 group hover:shadow-xl transition-colors duration-500`}
                    />
                </div>

                {/* Links Section */}
                <div className="px-6 py-8 space-y-4 bg-gradient-to-b from-white to-[#faf9f6]">
                    {(!card.contents || card.contents.length === 0) && (
                        <div className="text-center py-6 border-2 border-dashed border-stone-200 rounded-xl">
                            <p className="text-stone-400 text-sm font-sans">情報がまだありません</p>
                        </div>
                    )}

                    {card.contents?.map((item: any) => {
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
                                    className="group flex items-center p-1 rounded-xl bg-white border border-[#e6e2d3] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-[#fdfbf7] flex items-center justify-center border border-[#f0ebe0] group-hover:bg-[#f4f1ea] transition-colors">
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <span className="block text-sm font-bold text-[#3d3126] group-hover:text-black transition-colors">{config.label}</span>
                                    </div>
                                    <div className="mr-4 text-stone-300 group-hover:text-[#d4a373] transition-colors">
                                        <ArrowUpRightIcon />
                                    </div>
                                </a>
                            )
                        }

                        if (item.type === 'text' && isTextContent(item.content)) {
                            return (
                                <div key={item.id} className="relative p-6 rounded-xl bg-[#fdfbf7] border border-[#e6e2d3] shadow-inner text-center">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e6e2d3] to-transparent opacity-50"></div>
                                    <p className="text-[#5a4d41] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                        {item.content.text}
                                    </p>
                                </div>
                            )
                        }
                        return null
                    })}
                </div>

                {/* Footer Brand */}
                <div className="pb-6 text-center">
                    <p className="text-[10px] text-[#d4c5ae] font-bold tracking-[0.2em] uppercase">POWERED BY WOODLINKS</p>
                </div>
            </div>

            {/* DEMO SWITCHER - Fixed at bottom */}
            {card.slug === 'demo' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
                    <div className="bg-white/90 backdrop-blur-md rounded-full border border-stone-200 shadow-2xl p-2 flex items-center gap-2 pr-4">
                        <div className="pl-3 pr-2 text-[10px] font-bold text-stone-400 tracking-wider uppercase flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            Theme
                        </div>
                        <div className="w-px h-4 bg-stone-200"></div>
                        <button
                            onClick={() => setCurrentMaterial('walnut')}
                            className={`w-6 h-6 rounded-full bg-amber-950 ring-2 ring-offset-2 transition-all hover:scale-110 ${currentMaterial === 'walnut' ? 'ring-amber-950' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                            title="Walnut"
                        />
                        <button
                            onClick={() => setCurrentMaterial('maple')}
                            className={`w-6 h-6 rounded-full bg-amber-200 ring-2 ring-offset-2 transition-all hover:scale-110 ${currentMaterial === 'maple' ? 'ring-amber-300' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                            title="Maple"
                        />
                        <button
                            onClick={() => setCurrentMaterial('hinoki')}
                            className={`w-6 h-6 rounded-full bg-yellow-100 border border-stone-200 ring-2 ring-offset-2 transition-all hover:scale-110 ${currentMaterial === 'hinoki' ? 'ring-stone-300' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                            title="Hinoki"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function ArrowUpRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
    )
}
