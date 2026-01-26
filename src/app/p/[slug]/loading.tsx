export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="w-full max-w-sm space-y-6 bg-white p-6 shadow-xl shadow-stone-200/50 rounded-2xl border border-stone-100">

                {/* Header Skeleton */}
                <div className="text-center pt-2 flex flex-col items-center">
                    {/* Avatar */}
                    <div className="h-24 w-24 rounded-full bg-stone-100 animate-pulse mb-6" />

                    {/* Title */}
                    <div className="h-8 w-48 bg-stone-100 rounded-lg animate-pulse mb-3" />

                    {/* Description */}
                    <div className="h-4 w-64 bg-stone-50 rounded animate-pulse mb-2" />
                    <div className="h-4 w-40 bg-stone-50 rounded animate-pulse" />
                </div>

                {/* Button Skeleton */}
                <div className="mt-6">
                    <div className="h-12 w-full bg-stone-100 rounded-xl animate-pulse" />
                </div>

                {/* List Skeleton */}
                <div className="mt-8 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-full bg-stone-50 rounded-xl animate-pulse" />
                    ))}
                </div>

                {/* Footer Skeleton */}
                <div className="mt-10 flex justify-center">
                    <div className="h-3 w-24 bg-stone-50 rounded animate-pulse" />
                </div>
            </div>
        </div>
    )
}
