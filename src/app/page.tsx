import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Leaf, Palette, UserCheck, ArrowRight, Smartphone, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen flex flex-col font-sans text-[#2c3e50]">
      {/* Header */}
      <header className="fixed w-full z-50 bg-[#fdfbf7]/80 backdrop-blur-md border-b border-[#e6e2d3]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#3d3126] flex items-center gap-2">
            <span className="text-3xl">🌲</span> <span className="font-serif">WoodLinks</span>
          </h1>
          <nav className="flex items-center gap-4">
            <Link href="/p/demo" className="text-sm font-medium text-[#5a4d41] hover:text-[#3d3126] transition-colors hidden sm:block">
              デモを見る
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold leading-6 text-[#fdfbf7] bg-[#3d3126] px-5 py-2.5 rounded-full hover:bg-[#2c221b] transition-all shadow-sm"
            >
              ログイン
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 lg:pb-40 overflow-hidden">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d4c5ae] to-[#a4b494] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-5xl font-serif font-medium tracking-tight text-[#3d3126] sm:text-6xl mb-8 leading-tight">
                木に、デジタルという<br className="hidden sm:block" />命を宿す。
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5a4d41] mb-10">
                本物の木の温もりと、デジタル名刺の利便性を一つに。<br className="hidden sm:block" />
                NFC技術を内蔵したウッドカードで、一期一会の出会いを、一生のつながりに変えましょう。
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#2c3e50] px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-[#1a252f] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  今すぐ名刺を作成 <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/p/demo" className="text-sm font-semibold leading-6 text-[#3d3126] hover:underline underline-offset-4 flex items-center gap-1">
                  デモ体験 <Smartphone className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Concept Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h3 className="text-3xl font-serif font-medium text-[#3d3126] mb-6">
                  ただのデータではない、<br />触れられる記憶。
                </h3>
                <p className="text-[#5a4d41] leading-relaxed mb-6">
                  通常の名刺交換は、数日経てば誰のものかわからなくなってしまいがちです。<br />
                  WoodLinksは、手に触れた瞬間の木の質感と、スマホにかざすだけの魔法のような体験で、相手の記憶に深く刻まれます。
                </p>
                <ul className="space-y-4 mt-8">
                  <li className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f4f1ea] flex items-center justify-center text-[#3d3126]">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <span className="text-[#3d3126] font-medium">100% 天然木材を使用</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#f4f1ea] flex items-center justify-center text-[#3d3126]">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-[#3d3126] font-medium">アプリ不要、かざすだけで転送</span>
                  </li>
                </ul>
              </div>
              <div className="mt-12 lg:mt-0 relative">
                <div className="aspect-[4/3] bg-[#e6e2d3] rounded-2xl overflow-hidden shadow-2xl relative">
                  {/* Placeholder for Card Image */}
                  <div className="absolute inset-0 flex items-center justify-center text-[#a4998e] bg-stone-100">
                    <span className="text-lg">Product Image Placeholder</span>
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-[#2c3e50] text-white p-6 rounded-lg shadow-xl max-w-xs">
                    <p className="text-sm font-medium">&quot;この名刺、素敵ですね&quot;</p>
                    <p className="text-xs text-gray-300 mt-1">そこから会話が始まる、新しいコミュニケーション。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 bg-[#fdfbf7]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-2xl font-serif font-bold text-[#3d3126]">
                あらゆるシーンで、<br className="sm:hidden" />あなたらしさを表現
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Business */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e6e2d3] hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-[#2c3e50] rounded-xl flex items-center justify-center text-white mb-6">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-[#3d3126] mb-3">ビジネスの第一線で</h4>
                <p className="text-[#5a4d41] text-sm leading-relaxed">
                  商談や交流会で、信頼感を伝える唯一無二のツールとして。環境への配慮もアピールでき、企業のブランドイメージを高めます。
                </p>
              </div>

              {/* Creator */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e6e2d3] hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-[#a4b494] rounded-xl flex items-center justify-center text-white mb-6">
                  <Palette className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-[#3d3126] mb-3">クリエイターのポートフォリオに</h4>
                <p className="text-[#5a4d41] text-sm leading-relaxed">
                  作品への想いを、一枚の木に込めて。ポートフォリオサイトやSNSへのリンクをまとめ、あなたの世界観を余すことなく伝えます。
                </p>
              </div>

              {/* Personal */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e6e2d3] hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-[#d4c5ae] rounded-xl flex items-center justify-center text-white mb-6">
                  <Leaf className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-[#3d3126] mb-3">個人の特別な紹介に</h4>
                <p className="text-[#5a4d41] text-sm leading-relaxed">
                  趣味やSNSを、自然な形で共有。無機質なQRコードではなく、温かみのある木の名刺で、より親密なつながりを築きましょう。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#3d3126] py-12 px-6 text-[#d4c5ae]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌲</span>
            <span className="font-serif text-xl font-bold text-white">WoodLinks</span>
          </div>
          <p className="text-sm opacity-60">
            &copy; {new Date().getFullYear()} WoodLinks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
