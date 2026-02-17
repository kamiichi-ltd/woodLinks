import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AvatarEditor from './avatar-editor'
import { getCards } from '@/services/card-service'
import CardSettingsForm from '@/components/forms/card-settings-form'

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

    const cards = await getCards()
    const primaryCard = cards[0] // Assuming single card for now

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">名刺の設定</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">プロフィール画像</h2>
                    <AvatarEditor
                        userId={user.id}
                        initialAvatarUrl={profile?.avatar_url || null}
                    />
                </section>

                <section>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
                    {primaryCard ? (
                        <CardSettingsForm
                            cardId={primaryCard.id}
                            initialTitle={primaryCard.title || ''}
                            initialSlug={primaryCard.slug || ''}
                            initialDescription={primaryCard.description}
                            initialStatus={primaryCard.status}
                            initialMaterialType={(primaryCard.material_type as 'sugi' | 'hinoki' | 'walnut') || 'sugi'}
                        />
                    ) : (
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">名刺が見つかりません</h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>名刺の設定を編集するには、まず名刺を作成してください。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
