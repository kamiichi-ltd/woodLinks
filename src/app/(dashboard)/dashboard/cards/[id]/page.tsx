import { getCard } from '@/services/card-service'
import { notFound } from 'next/navigation'
import ContentEditor, { ContentItem } from './content-editor'
import CardSettingsForm from '@/components/forms/card-settings-form'
import Link from 'next/link'
import { ExternalLink, AlertTriangle } from 'lucide-react'

export default async function CardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const card = await getCard(resolvedParams.id)

    if (!card) {
        notFound()
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <nav className="sm:hidden" aria-label="Back">
                        <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                            ダッシュボードに戻る
                        </Link>
                    </nav>
                    <nav className="hidden sm:flex" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-4">
                            <li>
                                <div className="flex">
                                    <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">ダッシュボード</Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-gray-500">{card.title}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="mt-2 flex md:ml-4 md:mt-0">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${card.is_published ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'}`}>
                        {card.is_published ? '公開中' : '下書き'}
                    </span>
                    {card.slug && card.is_published && (
                        <a
                            href={`/p/${card.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                            公開ページを見る
                        </a>
                    )}
                </div>
            </div>

            {/* Validation Alert */}
            {(!card.is_published || !card.slug) && (
                <div className="mb-6 rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">名刺は公開されていません</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    他の人がアクセスできるようにするには、以下の設定で独自のURLスラッグを設定し、公開してください。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">コンテンツ編集</h2>
                    <ContentEditor cardId={card.id} initialContents={card.contents as unknown as ContentItem[]} />
                </div>

                <div>
                    {/* Preview or other details can go here */}
                    {/* Settings Form */}
                    <CardSettingsForm
                        cardId={card.id}
                        initialTitle={card.title || ''}
                        initialSlug={card.slug || ''}
                        initialDescription={card.description}
                        initialIsPublished={card.is_published}
                    />
                </div>
            </div>
        </div>
    )
}
