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
        <li ref={setNodeRef} style={style} className="flex items-center justify-between gap-x-6 py-4 px-4 bg-[#fdfbf7] border-b border-[#e6e2d3] last:border-0 hover:bg-[#faf9f6] transition-colors group">
            <div className="flex items-center w-full min-w-0 gap-x-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="touch-none cursor-move text-[#a4998e] hover:text-[#3d3126] focus:outline-none p-1 rounded hover:bg-[#e6e2d3]/50 transition-colors"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-x-3">
                        <p className="text-sm font-bold leading-6 text-[#3d3126]">
                            {item.type === 'sns_link' && isSnsContent(item.content) ? item.content.platform : 'Free Text'}
                        </p>
                        <p className={`rounded-full whitespace-nowrap mt-0.5 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold border ${item.type === 'sns_link' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-stone-100 text-[#5a4d41] border-[#d4c5ae]'}`}>
                            {item.type === 'sns_link' ? 'LINK' : 'TEXT'}
                        </p>
                    </div>
                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-[#8c7b6c]">
                        {item.type === 'sns_link' && isSnsContent(item.content) ? (
                            <a href={item.content.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#3d3126] hover:underline truncate">
                                {item.content.url}
                            </a>
                        ) : item.type === 'text' && isTextContent(item.content) ? (
                            <p className="whitespace-pre-wrap line-clamp-2 text-[#5a4d41]">{item.content.text}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex flex-none items-center gap-x-4">
                <button
                    onClick={() => onDelete(item.id)}
                    disabled={isPending}
                    className="rounded-md p-2 text-[#a4998e] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
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
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border border-[#e6e2d3] sm:rounded-xl overflow-hidden">
            <div className="px-4 py-6 sm:p-8">
                {/* Add New Content Form */}
                <div className="bg-[#fdfbf7] rounded-xl p-6 mb-8 border border-[#e6e2d3] shadow-inner">
                    <h4 className="text-sm font-bold text-[#3d3126] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4a373]"></span>
                        Add New Block / ブロックを追加
                    </h4>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-[#8c7b6c] mb-1">Type / 種類</label>
                                <select
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value as 'sns_link' | 'text')}
                                    className="block w-full rounded-lg border-0 py-2 pl-3 pr-8 text-[#3d3126] ring-1 ring-inset ring-[#d4c5ae] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-white"
                                >
                                    <option value="sns_link">Link / リンク</option>
                                    <option value="text">Text / 自由入力</option>
                                </select>
                            </div>

                            {contentType === 'sns_link' ? (
                                <>
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-bold text-[#8c7b6c] mb-1">Platform</label>
                                        <select
                                            value={platform}
                                            onChange={(e) => setPlatform(e.target.value)}
                                            className="block w-full rounded-lg border-0 py-2 text-[#3d3126] ring-1 ring-inset ring-[#d4c5ae] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-white"
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
                                        <label className="block text-xs font-bold text-[#8c7b6c] mb-1">URL / Contact</label>
                                        <input
                                            type="text"
                                            required
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="block w-full rounded-lg border-0 py-2 text-[#3d3126] ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-white"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="sm:col-span-3">
                                    <label className="block text-xs font-bold text-[#8c7b6c] mb-1">Text Content</label>
                                    <input
                                        type="text"
                                        required
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Enter your message... / メッセージを入力"
                                        className="block w-full rounded-lg border-0 py-2 text-[#3d3126] ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex justify-center rounded-lg bg-[#2c3e50] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#1a252f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] disabled:opacity-50 transition-all"
                            >
                                {isPending ? 'Adding...' : 'Add Block / 追加'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sortable List */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-[#3d3126]">Current Blocks / 現在のブロック</h4>
                        <span className="text-xs text-[#8c7b6c] font-medium flex items-center gap-1">
                            <GripVertical className="h-3 w-3" /> Drag to reorder
                        </span>
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
                            <ul role="list" className="divide-y divide-[#e6e2d3] rounded-xl border border-[#e6e2d3] overflow-hidden bg-white shadow-sm">
                                {items.length === 0 && (
                                    <li className="p-12 text-center text-[#8c7b6c] text-sm bg-[#faf9f6] flex flex-col items-center justify-center dashed-border">
                                        <span className="block mb-2 text-2xl">📭</span>
                                        No contents yet. <br />Add your first block above.
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
