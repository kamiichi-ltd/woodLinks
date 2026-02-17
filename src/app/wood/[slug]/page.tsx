import { getWoodBySlug } from '@/app/actions/inventory'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ViewTracker from '@/components/public/view-tracker'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

interface PageProps {
    params: {
        slug: string
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const wood = await getWoodBySlug(slug)

    if (!wood) {
        return {
            title: 'Wood Not Found',
        }
    }

    return {
        title: `${wood.name} | WoodLinks`,
        description: wood.story?.slice(0, 160) || `Details about ${wood.name}`,
    }
}

export default async function WoodPage({ params }: PageProps) {
    const { slug } = await params
    const wood = await getWoodBySlug(slug)

    if (!wood) {
        notFound()
    }

    // Cast dimensions safely
    const dims = wood.dimensions as { length: number; width: number; thickness: number }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const purchaseLink = user
        ? `/dashboard?create_from=${slug}`
        : `/signup?next=${encodeURIComponent(`/dashboard?create_from=${slug}`)}`

    return (
        <div className="min-h-screen bg-[#fdfbf7] text-zinc-900 font-sans pb-24 md:pb-0"> {/* Add padding bottom for mobile sticky bar */}
            <ViewTracker slug={slug} />
            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] w-full bg-zinc-200 overflow-hidden">
                {wood.images && wood.images.length > 0 ? (
                    <img
                        src={wood.images[0]}
                        alt={wood.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-300 text-zinc-500">
                        <span className="text-lg">No Image Available</span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 text-white bg-gradient-to-t from-black/90 to-transparent">
                    <div className="container mx-auto">
                        <span className="inline-block px-3 py-1 mb-2 text-xs font-medium tracking-wider uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/10">
                            {wood.species}
                        </span>
                        <h1 className="text-3xl md:text-6xl font-serif font-bold tracking-tight mb-2 text-shadow-sm">
                            {wood.name}
                        </h1>
                        <p className="text-lg md:text-2xl text-white/90 font-light flex items-center gap-2">
                            <span>{wood.origin || 'Unknown Origin'}</span>
                            {wood.age && (
                                <>
                                    <span className="opacity-50">/</span>
                                    <span>{wood.age}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Story (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-serif italic text-zinc-500 mb-4 md:mb-6 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-zinc-300 inline-block"></span>
                            The Story
                        </h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-800 leading-relaxed whitespace-pre-wrap font-serif">
                            {wood.story || "This wood has no recorded story yet."}
                        </div>
                    </section>

                    {/* Mobile Only Specs Summary */}
                    <div className="lg:hidden p-4 bg-white rounded-lg border border-zinc-100 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-3">Quick Specs</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-zinc-500 text-xs">Dimensions</div>
                                <div className="font-medium">{dims?.length ?? '-'} x {dims?.width ?? '-'} x {dims?.thickness ?? '-'} mm</div>
                            </div>
                            <div>
                                <div className="text-zinc-500 text-xs">Stock</div>
                                <div className="font-medium">{wood.stock}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specs & Commerce (Right 1 col - Desktop Sticky) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        {/* Specs Card */}
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-100">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-400 mb-4">Specifications</h3>

                            <dl className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <dt className="text-zinc-500">Dimensions</dt>
                                    <dd className="font-medium text-zinc-900">
                                        L{dims?.length ?? '-'} x W{dims?.width ?? '-'} x T{dims?.thickness ?? '-'} mm
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-zinc-500">Species</dt>
                                    <dd className="font-medium text-zinc-900 capitalize">{wood.species}</dd>
                                </div>
                                <div>
                                    <dt className="text-zinc-500">Grade</dt>
                                    <dd className="font-medium text-zinc-900">{wood.grade || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-zinc-500">Stock</dt>
                                    <dd className="font-medium text-zinc-900">{wood.stock}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Buy Card */}
                        <div className="p-6 bg-zinc-900 text-white rounded-xl shadow-xl">
                            <div className="mb-6">
                                <span className="text-zinc-400 text-sm">Price</span>
                                <div className="text-3xl font-bold">
                                    ¥{wood.price.toLocaleString()}
                                </div>
                            </div>

                            {wood.status === 'available' ? (
                                <Link
                                    href={purchaseLink}
                                    className="block w-full py-4 bg-white text-zinc-900 font-bold rounded-lg hover:bg-zinc-100 transition-colors text-center"
                                >
                                    Purchase / Inquire
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-4 bg-zinc-800 text-zinc-500 font-bold rounded-lg cursor-not-allowed"
                                >
                                    Sold Out
                                </button>
                            )}

                            <p className="mt-4 text-xs text-zinc-500 text-center">
                                * Shipping calculated at checkout
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="text-xs text-zinc-500">Price</div>
                        <div className="text-xl font-bold text-zinc-900">¥{wood.price.toLocaleString()}</div>
                    </div>
                    {wood.status === 'available' ? (
                        <Link
                            href={purchaseLink}
                            className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-lg flex items-center justify-center text-sm"
                        >
                            Purchase
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="flex-1 py-3 bg-zinc-800 text-zinc-500 font-bold rounded-lg cursor-not-allowed text-sm"
                        >
                            Sold Out
                        </button>
                    )}
                </div>
                <div className="text-[10px] text-zinc-400 text-center mt-2">
                    {wood.stock > 0 ? `${wood.stock} in stock` : 'Out of stock'}
                </div>
            </div>
        </div>
    )
}
