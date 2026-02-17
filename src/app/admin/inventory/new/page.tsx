import InventoryForm from '@/components/forms/InventoryForm'

export default function NewInventoryPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Add New Inventory</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Register a new wood item to the system.</p>
            </div>

            <InventoryForm />
        </div>
    )
}
