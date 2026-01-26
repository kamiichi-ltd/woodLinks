'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from '@/services/profile-service'
import { User, Upload, Loader2 } from 'lucide-react'

export default function AvatarEditor({ initialAvatarUrl, userId }: { initialAvatarUrl: string | null, userId: string }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return
        }
        setUploading(true)
        const file = event.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`
        const filePath = `profiles/${fileName}`

        const supabase = createClient()

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

            setAvatarUrl(publicUrl)

            // Update profile in DB
            await updateProfile(publicUrl)

        } catch (error) {
            console.error('Error uploading avatar:', error)
            alert('Error uploading avatar!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex items-center gap-x-6 bg-white p-6 shadow sm:rounded-lg border border-gray-100">
            {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-24 w-24 flex-none rounded-full bg-gray-50 object-cover ring-2 ring-gray-100"
                />
            ) : (
                <div className="h-24 w-24 flex-none rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-200">
                    <User className="h-10 w-10 text-gray-400" />
                </div>
            )}

            <div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Profile Picture</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                    JPG, GIF or PNG. 1MB max.
                </p>
                <div className="mt-4 flex items-center gap-x-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? 'Uploading...' : 'Change avatar'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>
            </div>
        </div>
    )
}
