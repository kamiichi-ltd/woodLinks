'use client'

import { addCardContent, deleteCardContent } from '@/services/card-service'
import { useState, useTransition } from 'react'

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

export default function ContentEditor({ cardId, initialContents }: { cardId: string; initialContents: ContentItem[] }) {
    // We'll trust revalidatePath to update the props, but for immediate feedback we might want local state.
    // However, normally revalidatePath is fast enough. Let's rely on props update via parent re-render?
    // Actually, in client components receiving props from RSC, we usually don't need local state for the list if we use revalidatePath.
    // BUT the parent is an RSC... updates via Server Action + revalidatePath will cause RSC to re-render and send new props.

    const [isPending, startTransition] = useTransition()
    const [contentType, setContentType] = useState<'sns_link' | 'text'>('sns_link')

    // Form states
    const [platform, setPlatform] = useState('twitter')
    const [url, setUrl] = useState('')
    const [text, setText] = useState('')

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
        if (!confirm('Are you sure?')) return
        startTransition(async () => {
            await deleteCardContent(contentId, cardId)
        })
    }

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Manage Content</h3>

                {/* Add New Content Form */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-900">Add New Block</h4>
                    <form onSubmit={handleAdd} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Type</label>
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value as 'sns_link' | 'text')}
                                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value="sns_link">SNS Link</option>
                                <option value="text">Free Text</option>
                            </select>
                        </div>

                        {contentType === 'sns_link' && (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Platform</label>
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        )}

                        {contentType === 'text' && (
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Text Content</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {isPending ? 'Adding...' : 'Add Content'}
                        </button>
                    </form>
                </div>

                {/* Existing Contents List */}
                <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Current Blocks</h4>
                    <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                        {initialContents.length === 0 && (
                            <li className="p-4 text-center text-gray-500 text-sm">No content yet.</li>
                        )}
                        {initialContents.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-x-6 py-5 px-4">
                                <div className="min-w-0">
                                    <div className="flex items-start gap-x-3">
                                        <p className="text-sm font-semibold leading-6 text-gray-900">
                                            {item.type === 'sns_link' && isSnsContent(item.content) ? item.content.platform : 'Text Block'}
                                        </p>
                                        <p className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${item.type === 'sns_link' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
                                            {item.type === 'sns_link' ? 'Link' : 'Text'}
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
                                <div className="flex flex-none items-center gap-x-4">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isPending}
                                        className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
