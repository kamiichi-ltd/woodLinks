'use client'

import { useState } from 'react'
import { createWood } from '@/app/actions/inventory'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'

export default function InventoryForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const rawData = {
            name: formData.get('name') as string,
            species: formData.get('species') as string,
            price: Number(formData.get('price')),
            stock: Number(formData.get('stock')),
            story: formData.get('story') as string,
            origin: formData.get('origin') as string,
            age: formData.get('age') as string,
        }

        try {
            await createWood(rawData)
            router.push('/admin/inventory') // Redirect to list (need to create list later or just fallback)
            // For now, maybe redirect to the new wood page?
            // createWood returns the object, we can use the slug
        } catch (e) {
            console.error(e)
            setError('Failed to create inventory item')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 gap-6">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b pb-2">Basic Info</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                            <input name="name" required className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md" placeholder="e.g. Yoshino Cedar #100" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Species</label>
                            <select name="species" className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md">
                                <option value="sugi">Sugi (Cedar)</option>
                                <option value="hinoki">Hinoki (Cypress)</option>
                                <option value="walnut">Walnut</option>
                                <option value="oak">Oak</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Story & Metadata - Moved up for emphasis */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b pb-2">Story & Origin</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Story</label>
                        <textarea name="story" rows={6} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md" placeholder="Tell the story of this wood..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Origin</label>
                            <input name="origin" className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md" placeholder="Nara, Japan" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Age</label>
                            <input name="age" className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md" placeholder="80 years" />
                        </div>
                    </div>
                </div>

                {/* Commerce */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b pb-2">Commerce</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price (JPY)</label>
                            <input type="number" name="price" required className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md" placeholder="50000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Stock</label>
                            <input type="number" name="stock" defaultValue={1} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md" />
                        </div>
                    </div>
                </div>

            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Register Inventory
                </button>
            </div>
        </form>
    )
}
