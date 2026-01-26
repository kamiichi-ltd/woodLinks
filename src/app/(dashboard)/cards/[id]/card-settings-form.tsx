'use client'

import { useState } from 'react'
import { updateCard } from '@/services/card-service'
import { useRouter } from 'next/navigation'

interface CardSettingsFormProps {
    cardId: string
    initialSlug: string
    initialDescription: string | null
}

export default function CardSettingsForm({ cardId, initialSlug, initialDescription }: CardSettingsFormProps) {
    const [slug, setSlug] = useState(initialSlug)
    const [description, setDescription] = useState(initialDescription || '')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            await updateCard(cardId, {
                slug,
                description,
            })
            setMessage({ type: 'success', text: 'Settings updated successfully' })
            router.refresh()
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings. Slug might be taken.' })
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Card Settings</h3>

            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label htmlFor="slug" className="block text-sm font-medium leading-6 text-gray-900">
                    Public URL Slug
                </label>
                <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">/p/</span>
                    <input
                        type="text"
                        name="slug"
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="your-custom-url"
                        pattern="^[a-z0-9-]+$"
                        title="Only lowercase alphanumeric characters and hyphens are allowed"
                        required
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">Only lowercase alphanumeric characters and hyphens.</p>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                    Description / Bio
                </label>
                <div className="mt-2">
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Job Title, Company, or Brief Bio"
                    />
                </div>
                <p className="mt-3 text-sm text-gray-600">Write a few sentences about yourself or your company.</p>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    )
}
