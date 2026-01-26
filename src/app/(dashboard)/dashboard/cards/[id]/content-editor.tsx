'use client'

import { addCardContent, deleteCardContent, reorderCardContents } from '@/services/card-service'
import { useState, useTransition, useEffect } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

export type ContentItem = {
    id: string
    type: string
    content: unknown
    order_index: number
}

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

function SortableItem({ item, onDelete, isPending }: { item: ContentItem; onDelete: (id: string) => void; isPending: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <li ref={setNodeRef} style={style} className="flex items-center justify-between gap-x-6 py-5 px-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center w-full min-w-0 gap-x-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="touch-none cursor-move text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-x-3">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                            {item.type === 'sns_link' && isSnsContent(item.content) ? item.content.platform : 'テキスト'}
                        </p>
                        <p className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${item.type === 'sns_link' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
                            {item.type === 'sns_link' ? 'リンク' : 'テキスト'}
                        </p>
                    </div>
                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        {item.type === 'sns_link' && isSnsContent(item.content) ? (
                            <a href={item.content.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                {item.content.url}
                            </a>
                        ) : item.type === 'text' && isTextContent(item.content) ? (
                            <p className="whitespace-pre-wrap line-clamp-2">{item.content.text}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex flex-none items-center gap-x-4">
                <button
                    onClick={() => onDelete(item.id)}
                    disabled={isPending}
                    className="rounded-md p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        </li>
    )
}

export default function ContentEditor({ cardId, initialContents }: { cardId: string; initialContents: ContentItem[] }) {
    const [items, setItems] = useState(initialContents)
    const [isPending, startTransition] = useTransition()
    const [contentType, setContentType] = useState<'sns_link' | 'text'>('sns_link')

    // Form states
    const [platform, setPlatform] = useState('twitter')
    const [url, setUrl] = useState('')
    const [text, setText] = useState('')

    // Sync items with props when they change (e.g. after refresh or add/delete)
    useEffect(() => {
        setItems(initialContents)
    }, [initialContents])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                // Trigger server update with new order indices
                startTransition(async () => {
                    const reorderedItems = newItems.map((item, index) => ({
                        id: item.id,
                        order_index: index
                    }))
                    await reorderCardContents(cardId, reorderedItems)
                })

                return newItems
            })
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            let contentPayload
            if (contentType === 'sns_link') {
                contentPayload = { platform, url }
            } else {
                contentPayload = { text }
            }

            await addCardContent(cardId, contentType, contentPayload)
            // Reset form
            setUrl('')
            setText('')
        })
    }

    const handleDelete = async (contentId: string) => {
        if (!confirm('本当に削除しますか？')) return
        startTransition(async () => {
            await deleteCardContent(contentId, cardId)
        })
    }

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-6">内容の管理</h3>

                {/* Add New Content Form */}
                <div className="bg-gray-50 rounded-lg p-5 mb-8 border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">新しいブロックを追加</h4>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">種類</label>
                                <select
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value as 'sns_link' | 'text')}
                                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="sns_link">SNSリンク</option>
                                    <option value="text">自由入力テキスト</option>
                                </select>
                            </div>

                            {contentType === 'sns_link' ? (
                                <>
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">プラットフォーム</label>
                                        <select
                                            value={platform}
                                            onChange={(e) => setPlatform(e.target.value)}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        >
                                            <option value="twitter">X (Twitter)</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="github">GitHub</option>
                                            <option value="website">Website</option>
                                            <option value="phone">Phone</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">URLまたは連絡先</label>
                                        <input
                                            type="text"
                                            required
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="sm:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">テキスト内容</label>
                                    <input
                                        type="text"
                                        required
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="メッセージを入力..."
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex justify-center rounded-md bg-stone-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600 disabled:opacity-50 transition-colors"
                            >
                                {isPending ? '追加中...' : '内容を追加'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sortable List */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900">現在のコンテンツ一覧</h4>
                        <span className="text-xs text-gray-500">ドラッグして順序を入れ替え</span>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul role="list" className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                                {items.length === 0 && (
                                    <li className="p-8 text-center text-gray-500 text-sm italic bg-gray-50">
                                        コンテンツがありません。上記から追加してください。
                                    </li>
                                )}
                                {items.map((item) => (
                                    <SortableItem key={item.id} item={item} onDelete={handleDelete} isPending={isPending} />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    )
}
