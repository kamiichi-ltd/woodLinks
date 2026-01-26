import { getCard } from '@/services/card-service'
import { notFound } from 'next/navigation'
import ContentEditor, { ContentItem } from './content-editor'
import CardSettingsForm from '@/components/forms/card-settings-form'
import Link from 'next/link'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import CardQRCode from '@/components/cards/card-qr-code'
import { createClient } from '@/utils/supabase/server'
import { OrderSection } from '@/components/orders/order-section'
import { Database } from '@/database.types'

type Order = Database['public']['Tables']['orders']['Row']


export default async function CardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const card = await getCard(resolvedParams.id)

    const supabase = await createClient()
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('card_id', resolvedParams.id)
        .order('created_at', { ascending: false })

    if (!card) {
        notFound()
    }

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <nav className="sm:hidden" aria-label="Back">
                        <Link href="/dashboard" className="flex items-center text-sm font-medium text-[#8c7b6c] hover:text-[#3d3126]">
                            &larr; Back to Dashboard
                        </Link>
                    </nav>
                    <nav className="hidden sm:flex" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-4">
                            <li>
                                <div className="flex">
                                    <Link href="/dashboard" className="text-sm font-medium text-[#8c7b6c] hover:text-[#3d3126] transition-colors">Dashboard</Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="text-[#d4c5ae] mx-4">/</span>
                                    <span className="text-sm font-bold text-[#3d3126]">{card.title}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide border ${card.status === 'published' ? 'bg-[#f4f1ea] text-[#3d3126] border-[#3d3126]' : 'bg-[#e6e2d3] text-[#8c7b6c] border-transparent'}`}>
                        {card.status === 'published' ? 'LIVE' : card.status.toUpperCase()}
                    </span>
                    {card.slug && card.status === 'published' && (
                        <a
                            href={`/p/${card.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#3d3126] shadow-sm ring-1 ring-inset ring-[#d4c5ae] hover:bg-[#faf9f6] transition-colors"
                        >
                            <ExternalLink className="h-4 w-4 mr-2 text-[#8c7b6c]" />
                            View Page / 公開ページ
                        </a>
                    )}
                </div>
            </div>

            {/* Validation Alert */}
            {(card.status !== 'published' || !card.slug) && (
                <div className="mb-8 rounded-lg bg-[#faf9f6] p-4 border-l-4 border-[#d4a373] shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-[#d4a373]" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-[#3d3126]">公開設定が必要です</h3>
                            <div className="mt-1 text-sm text-[#5a4d41]">
                                <p>
                                    名刺を公開するには、以下の設定でスラッグを決め、公開モードをONにしてください。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    <div className="flex items-end gap-3 mb-2">
                        <h2 className="text-2xl font-serif font-bold text-[#2c3e50] leading-none">Content Editor</h2>
                        <span className="text-sm font-medium text-[#8c7b6c] mb-0.5">/ コンテンツ編集</span>
                    </div>
                    <ContentEditor cardId={card.id} initialContents={card.contents as unknown as ContentItem[]} />
                </div>

                <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-8">
                    {/* Order Section */}
                    <OrderSection cardId={card.id} initialOrders={(orders as Order[]) || []} />

                    {/* QR Code Section */}
                    <div>
                        <div className="flex items-end gap-3 mb-2">
                            <h2 className="text-2xl font-serif font-bold text-[#2c3e50] leading-none">QR Code</h2>
                            <span className="text-sm font-medium text-[#8c7b6c] mb-0.5">/ 繋がり</span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-md shadow-lg border border-[#e6e2d3] rounded-3xl p-6 sm:p-8 transition-all hover:shadow-xl">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <CardQRCode cardId={card.id} size={120} className="flex-shrink-0" />
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-[#3d3126] mb-1">物理カード用リンク</h3>
                                    <p className="text-xs text-[#8c7b6c] mb-3 leading-relaxed">QRコードまたはNFCには<br />この不変リンクを使用してください。</p>
                                    <div className="inline-flex items-center px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-mono text-stone-600 select-all">
                                        /c/{card.id.substring(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end gap-3 mb-2">
                        <h2 className="text-2xl font-serif font-bold text-[#2c3e50] leading-none">Card Settings</h2>
                        <span className="text-sm font-medium text-[#8c7b6c] mb-0.5">/ 名刺設定</span>
                    </div>
                    <CardSettingsForm
                        cardId={card.id}
                        initialTitle={card.title || ''}
                        initialSlug={card.slug || ''}
                        initialDescription={card.description}
                        initialStatus={card.status}
                        initialMaterialType={card.material_type || 'sugi'}
                    />
                </div>
            </div>

        </div>

    )
}
