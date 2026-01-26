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
        <li ref={setNodeRef} style={style} className="flex items-center justify-between gap-x-6 py-4 px-6 bg-white border border-[#e6e2d3] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
            {/* Hover accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#d4c5ae] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center w-full min-w-0 gap-x-5">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="touch-none cursor-move text-[#d4c5ae] hover:text-[#2c3e50] focus:outline-none p-2 rounded-lg hover:bg-[#faf9f6] transition-colors"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-x-3 mb-1">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] uppercase font-bold tracking-wider ring-1 ring-inset ${item.type === 'sns_link' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'}`}>
                            {item.type === 'sns_link' ? 'LINK' : 'TEXT'}
                        </span>
                        <p className="text-sm font-bold text-[#2c3e50] truncate">
                            {item.type === 'sns_link' && isSnsContent(item.content) ? (
                                <span className="capitalize">{item.content.platform}</span>
                            ) : 'Free Text Block'}
                        </p>
                    </div>

                    <div className="text-sm text-[#5a4d41] pl-0.5">
                        {item.type === 'sns_link' && isSnsContent(item.content) ? (
                            <a href={item.content.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#2c3e50] hover:underline truncate block">
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
                    className="rounded-lg p-2.5 text-[#a4998e] hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
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
        <div className="bg-white/90 backdrop-blur-md shadow-lg border border-[#e6e2d3] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-6 sm:p-8">
                {/* Add New Content Form */}
                <div className="bg-[#fdfbf7] rounded-2xl p-6 mb-10 border border-[#e6e2d3] shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <span className="text-6xl">🌲</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[#2c3e50] mb-6 flex items-center gap-3 relative z-10">
                        <span className="w-2 h-2 rounded-full bg-[#d4a373]"></span>
                        Add New Block <span className="text-sm font-normal text-[#8c7b6c] ml-2">/ ブロックを追加</span>
                    </h4>
                    <form onSubmit={handleAdd} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                            <div className="sm:col-span-4">
                                <label className="block text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Type / 種類</label>
                                <div className="relative">
                                    <select
                                        value={contentType}
                                        onChange={(e) => setContentType(e.target.value as 'sns_link' | 'text')}
                                        className="block w-full rounded-xl border-0 py-3 pl-4 pr-10 text-[#2c3e50] ring-1 ring-inset ring-[#d4c5ae] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm font-medium bg-white shadow-sm transition-shadow"
                                    >
                                        <option value="sns_link">Link / リンク</option>
                                        <option value="text">Text / 自由入力</option>
                                    </select>
                                </div>
                            </div>

                            {contentType === 'sns_link' ? (
                                <>
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Platform</label>
                                        <select
                                            value={platform}
                                            onChange={(e) => setPlatform(e.target.value)}
                                            className="block w-full rounded-xl border-0 py-3 pl-4 pr-10 text-[#2c3e50] ring-1 ring-inset ring-[#d4c5ae] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm font-medium bg-white shadow-sm transition-shadow"
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
                                    <div className="sm:col-span-5">
                                        <label className="block text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">URL / Contact</label>
                                        <input
                                            type="text"
                                            required
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="block w-full rounded-xl border-0 py-3 pl-4 text-[#2c3e50] ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm bg-white shadow-sm transition-shadow"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="sm:col-span-8">
                                    <label className="block text-xs font-bold text-[#8c7b6c] uppercase tracking-wider mb-2">Text Content</label>
                                    <input
                                        type="text"
                                        required
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Enter your message... / メッセージを入力"
                                        className="block w-full rounded-xl border-0 py-3 pl-4 text-[#2c3e50] ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-[#2c3e50] sm:text-sm bg-white shadow-sm transition-shadow"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex justify-center items-center rounded-xl bg-[#2c3e50] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2c3e50]/20 hover:bg-[#1a252f] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300"
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Adding...
                                    </span>
                                ) : 'Add Block / ブロックを追加'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sortable List */}
                <div className="mt-10">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#e6e2d3]">
                        <h4 className="text-lg font-serif font-bold text-[#2c3e50]">Current Blocks <span className="text-sm font-normal text-[#8c7b6c] ml-2">/ 現在のブロック</span></h4>
                        <span className="text-xs text-[#8c7b6c] font-medium flex items-center gap-1 bg-[#fdfbf7] px-3 py-1 rounded-full border border-[#e6e2d3]">
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
                            <ul role="list" className="space-y-3">
                                {items.length === 0 && (
                                    <li className="p-12 text-center text-[#8c7b6c] text-base bg-[#faf9f6]/50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-[#e6e2d3]">
                                        <span className="block mb-4 text-4xl opacity-50">📭</span>
                                        <p className="font-semibold">No contents yet.</p>
                                        <p className="text-sm mt-1">Add your first block above to get started.</p>
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
