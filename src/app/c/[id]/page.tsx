import { getCard } from '@/services/card-service'
import { redirect } from 'next/navigation'
import { AlertCircle, Clock, Construction } from 'lucide-react'

// Physical Card Entry Point
// This page handles the logic when a physical card QR code is scanned.
// It redirects or displays status messages based on the card's current status.

export default async function PhysicalCardEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const card = await getCard(id)

    if (!card) {
        // Unknown card - could be an invalid ID or deleted card
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 text-center">
                <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#e6e2d3]">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-[#2c3e50] mb-2">Invalid Card</h1>
                    <p className="text-[#8c7b6c]">The card you scanned does not exist or has been removed.<br />お探しのカードは見つかりませんでした。</p>
                </div>
            </div>
        )
    }

    // Status Handling Logic
    switch (card.status) {
        case 'published':
            // Redirect to the public profile page
            if (card.slug) {
                redirect(`/p/${card.slug}`)
            } else {
                // Should not happen for published cards due to validation, but safeguard
                return (
                    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 text-center">
                        <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#e6e2d3]">
                            <Construction className="h-12 w-12 text-[#d4a373] mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-[#2c3e50] mb-2">Setup Incomplete</h1>
                            <p className="text-[#8c7b6c]">This card is active but has not been fully configured.<br />公開設定に不備があります。</p>
                        </div>
                    </div>
                )
            }

        case 'draft':
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 text-center">
                    <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#e6e2d3]">
                        <Clock className="h-12 w-12 text-[#d4c5ae] mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-[#2c3e50] mb-2">Coming Soon</h1>
                        <p className="text-[#8c7b6c]">This card is currently being prepared.<br />現在準備中です。後ほど再度アクセスしてください。</p>
                    </div>
                </div>
            )

        case 'lost_reissued':
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 text-center">
                    <div className="max-w-md w-full p-8 rounded-3xl bg-stone-100 shadow-inner border border-stone-200 opacity-80">
                        <AlertCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-stone-600 mb-2">Card Disabled</h1>
                        <p className="text-stone-500 text-sm">This physical card has been reported lost and is no longer valid. Please scan the new card provided to the owner.<br />このカードは紛失届が出されたため無効です。新しいカードをご利用ください。</p>
                    </div>
                </div>
            )

        case 'disabled':
        case 'transferred':
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 text-center">
                    <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#e6e2d3]">
                        <AlertCircle className="h-12 w-12 text-[#d4a373] mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-[#2c3e50] mb-2">Card Unavailable</h1>
                        <p className="text-[#8c7b6c]">This card is currently unavailable.<br />現在利用できません。</p>
                    </div>
                </div>
            )

        default:
            // Fallback for unknown status
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 text-center">
                    <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-[#e6e2d3]">
                        <p className="text-[#8c7b6c]">Status: {card.status}</p>
                    </div>
                </div>
            )
    }
}
