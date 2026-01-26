import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AvatarEditor from './avatar-editor'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single() as { data: { avatar_url: string | null } | null }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Settings</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Profile</h2>
                    <AvatarEditor
                        userId={user.id}
                        initialAvatarUrl={profile?.avatar_url || null}
                    />
                </section>
            </div>
        </div>
    )
}
