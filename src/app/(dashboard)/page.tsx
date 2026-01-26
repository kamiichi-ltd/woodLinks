import { getCards } from '@/services/card-service'
import CreateCardForm from './create-card-form'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const cards = await getCards()

    return (
        <div>
            <CreateCardForm />

            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Your Cards</h2>
                <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <div key={card.id} className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">{card.title}</h3>
                            <p className="mt-1 text-sm text-gray-500 truncate pb-4">
                                {card.description || 'No description'}
                            </p>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${card.is_published ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'}`}>
                                {card.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    ))}
                    {cards.length === 0 && (
                        <p className="text-gray-500">No cards yet. Create one above!</p>
                    )}
                </div>
            </div>
        </div>
    )
}
