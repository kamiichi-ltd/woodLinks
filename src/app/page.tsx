import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-[#fdfbf7] min-h-screen flex flex-col font-sans text-stone-800">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
          <span>🌲</span> WoodLinks
        </h1>
        <nav>
          <Link
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-stone-900 border border-stone-200 rounded-lg px-4 py-2 hover:bg-white hover:shadow-sm transition-all"
          >
            Log in
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
            Digital Business Cards<br />for Wood Professionals
          </h2>
          <p className="text-lg leading-8 text-stone-600 max-w-xl mx-auto">
            Share your expertise with a warm, natural touch. Create your digital profile in seconds and connect with clients effortlessly.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600 transition-all"
            >
              Get Started
            </Link>
            <Link href="/p/demo" className="text-sm font-semibold leading-6 text-stone-900 hover:underline underline-offset-4">
              View Demo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-stone-500">
        &copy; {new Date().getFullYear()} WoodLinks. All rights reserved.
      </footer>
    </div>
  )
}
