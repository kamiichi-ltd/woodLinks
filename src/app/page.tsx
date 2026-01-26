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

        {/* Wood Personality Section */}
        <section className="py-24 bg-[#f4f1ea] border-y border-[#e6e2d3]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#8c7b6c] font-medium tracking-wider uppercase text-sm">Wood Personality</span>
              <h3 className="mt-3 text-3xl font-serif font-medium text-[#3d3126]">
                あなたに合う木を、選ぶ楽しみ
              </h3>
              <p className="mt-4 text-[#5a4d41]">
                木にはそれぞれ、生まれた土地や育った環境による「性格」があります。<br />
                あなたのビジネススタイルに共鳴する一枚を見つけてください。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cedar */}
              <div className="group relative bg-[#fdfbf7] p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-[#d4a373]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#d4a373] text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest">CEDAR</div>
                <h4 className="text-xl font-bold text-[#3d3126] text-center mt-4 mb-2">杉 (スギ)</h4>
                <p className="text-center text-xs text-[#8c7b6c] mb-6">親しみやすさ / 直感 / スピード</p>
                <p className="text-[#5a4d41] text-sm leading-relaxed text-center">
                  真っ直ぐに伸びる木目は、嘘のない誠実さを表します。柔らかく温かみのある手触りは、初対面の相手にも安心感を与え、心の距離を縮めます。
                </p>
              </div>

              {/* Cypress */}
              <div className="group relative bg-[#fdfbf7] p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-[#e9d8a6]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#e9d8a6] text-[#3d3126] px-4 py-1 rounded-full text-xs font-bold tracking-widest">CYPRESS</div>
                <h4 className="text-xl font-bold text-[#3d3126] text-center mt-4 mb-2">桧 (ヒノキ)</h4>
                <p className="text-center text-xs text-[#8c7b6c] mb-6">高貴 / 信頼 / 持続性</p>
                <p className="text-[#5a4d41] text-sm leading-relaxed text-center">
                  古来より寺社仏閣に使われてきた「木の王様」。その特有の香りと美しい白木の色合いは、揺るぎない信頼と品格を無言のうちに語ります。
                </p>
              </div>

              {/* Walnut */}
              <div className="group relative bg-[#fdfbf7] p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-t-4 border-[#6b4c3e]">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#6b4c3e] text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest">WALNUT</div>
                <h4 className="text-xl font-bold text-[#3d3126] text-center mt-4 mb-2">ウォールナット</h4>
                <p className="text-center text-xs text-[#8c7b6c] mb-6">知性 / 重厚 / モダン</p>
                <p className="text-[#5a4d41] text-sm leading-relaxed text-center">
                  深く濃い色合いと美しい縞模様は、成熟した大人の知性を演出します。使い込むほどに艶が増し、あなたのキャリアと共に深みを増していくでしょう。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Aging Story Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 relative mt-12 lg:mt-0">
                {/* Visual Representation of Aging using CSS shapes/gradients as abstraction */}
                <div className="relative h-80 w-full bg-[#fdfbf7] rounded-2xl overflow-hidden shadow-inner border border-[#e6e2d3] flex items-center justify-center">
                  <div className="absolute w-3/4 h-3/4 bg-[#d4c5ae] opacity-20 rounded-full blur-3xl"></div>
                  <div className="space-y-8 relative z-10 w-full px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#e6e2d3] flex items-center justify-center text-xs font-bold text-[#3d3126]">New</div>
                      <div className="h-2 flex-1 bg-gradient-to-r from-[#e6e2d3] to-[#cbb89d] rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#cbb89d] flex items-center justify-center text-xs font-bold text-[#3d3126] shadow-sm">1 Year</div>
                      <div className="h-2 flex-1 bg-gradient-to-r from-[#cbb89d] to-[#8c7b6c] rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#8c7b6c] flex items-center justify-center text-xs font-bold text-white shadow-md">10 Years</div>
                      <div className="h-2 flex-1 bg-gradient-to-r from-[#8c7b6c] to-[#3d3126] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <span className="text-[#8c7b6c] font-medium tracking-wider uppercase text-sm">Aging Story</span>
                <h3 className="mt-3 text-3xl font-serif font-medium text-[#3d3126] mb-6">
                  「劣化」ではなく、「熟成」。
                </h3>
                <p className="text-[#5a4d41] leading-relaxed mb-6">
                  プラスチックの名刺は傷つけば「劣化」しますが、木の名刺は傷さえも「味」になります。<br />
                  手動でコーヒーを挽く時間を愛でるように、名刺が飴色に変わり、角が取れて手に馴染んでいく過程そのものを楽しんでください。
                </p>
                <p className="text-[#5a4d41] leading-relaxed font-medium">
                  それは、あなたのビジネスが時間をかけて信頼を積み重ねていく姿と重なります。<br />
                  世界に一つだけの、あなたと共に育つ名刺です。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Roots Section */}
        <section className="py-24 bg-[#3d3126] text-[#d4c5ae] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#2c221b] rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#4e3d30] rounded-full opacity-50 blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-[#8c7b6c] font-medium tracking-wider uppercase text-sm">Our Roots</span>
              <h3 className="mt-3 text-3xl font-serif font-medium text-white mb-8">
                大阪・北摂、上一木材の誇り。
              </h3>
              <p className="text-lg leading-8 text-[#d4c5ae]/90 mb-10">
                私たちはIT企業ではありません。大阪・北摂（吹田）の地で代々続く、材木屋から生まれました。<br />
                デジタル全盛の今だからこそ、「本物の木の力」を届けたい。
              </p>
              <div className="bg-[#2c221b]/50 p-8 rounded-2xl border border-[#4e3d30] backdrop-blur-sm">
                <p className="italic text-white/80">
                  &quot;職人が一枚ずつ木目を読み、ICチップを埋め込む。その0.1ミリの精度にこだわるのは、<br className="hidden sm:block" />
                  それが単なるガジェットではなく、お客様の「顔」になるものだからです。&quot;
                </p>
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
