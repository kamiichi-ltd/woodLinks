import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Leaf, Palette, UserCheck, ArrowRight, Smartphone } from 'lucide-react'

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
              href="/login"
              className="rounded-full bg-[#fdfbf7] text-[#3d3126] px-5 py-2.5 text-sm font-semibold hover:bg-[#eae0cf] transition-colors"
            >
              ログイン
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 lg:pb-40 overflow-hidden">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#d4c5ae] to-[#a4b494] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mx-auto max-w-3xl">
              <span className="inline-block py-1 px-3 rounded-full bg-[#f4f1ea] border border-[#e6e2d3] text-[#8c7b6c] text-xs font-bold tracking-widest uppercase mb-8">
                The Original Wood Card
              </span>
              <h2 className="text-5xl font-serif font-medium tracking-tight text-[#3d3126] sm:text-7xl mb-8 leading-tight">
                木に、デジタルという<br className="hidden sm:block" />命を宿す。
              </h2>
              <p className="mt-8 text-xl leading-8 text-[#5a4d41] mb-12 font-light">
                本物の木の温もりと、デジタル名刺の利便性を一つに。<br className="hidden sm:block" />
                NFC技術を内蔵したウッドカードで、<br className="sm:hidden" />一期一会の出会いを、一生のつながりに。
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-full bg-[#2c3e50] px-10 py-4 text-lg font-bold text-white shadow-xl shadow-[#2c3e50]/20 hover:bg-[#1a252f] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Create Your Card <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/p/demo" className="text-sm font-bold tracking-wide text-[#3d3126] hover:text-[#8c7b6c] transition-colors flex items-center gap-2 border-b border-transparent hover:border-[#8c7b6c] pb-0.5">
                  VIEW DEMO <Smartphone className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Wood Selection (Encyclopedia Style) */}
        <section className="py-32 bg-[#f4f1ea] border-y border-[#e6e2d3]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-[#8c7b6c] font-bold tracking-[0.2em] uppercase text-xs">Material Selection</span>
              <h3 className="mt-4 text-4xl font-serif font-medium text-[#3d3126]">
                あなたに呼応する、木の個性
              </h3>
              <p className="mt-6 text-[#5a4d41] max-w-2xl mx-auto">
                木にはそれぞれ、生まれた土地や育った環境による「性格」があります。<br />
                あなたのビジネススタイルに共鳴する一枚を見つけてください。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cedar */}
              <div className="group relative bg-[#fdfbf7] rounded-none sm:rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="h-2 bg-[#d4a373]"></div>
                <div className="p-10">
                  <span className="text-[#d4a373] text-xs font-bold tracking-widest mb-2 block">JAPANESE CEDAR</span>
                  <h4 className="text-3xl font-serif font-bold text-[#3d3126] mb-6">杉 <span className="text-lg font-normal text-[#8c7b6c] ml-2">- Sugi</span></h4>
                  <div className="w-12 h-0.5 bg-[#e6e2d3] mb-6 group-hover:w-full group-hover:bg-[#d4a373] transition-all duration-500"></div>
                  <p className="text-[#5a4d41] leading-relaxed mb-8">
                    真っ直ぐに伸びる木目は、嘘のない誠実さを表します。柔らかく温かみのある手触りは、初対面の相手にも安心感を与え、心の距離を縮めます。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">親しみやすさ</span>
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">直感</span>
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">スピード</span>
                  </div>
                </div>
              </div>

              {/* Cypress */}
              <div className="group relative bg-[#fdfbf7] rounded-none sm:rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden transform lg:-translate-y-4">
                <div className="h-2 bg-[#e9d8a6]"></div>
                <div className="p-10">
                  <span className="text-[#cbb89d] text-xs font-bold tracking-widest mb-2 block">JAPANESE CYPRESS</span>
                  <h4 className="text-3xl font-serif font-bold text-[#3d3126] mb-6">桧 <span className="text-lg font-normal text-[#8c7b6c] ml-2">- Hinoki</span></h4>
                  <div className="w-12 h-0.5 bg-[#e6e2d3] mb-6 group-hover:w-full group-hover:bg-[#e9d8a6] transition-all duration-500"></div>
                  <p className="text-[#5a4d41] leading-relaxed mb-8">
                    古来より寺社仏閣に使われてきた「木の王様」。その特有の香りと美しい白木の色合いは、揺るぎない信頼と品格を無言のうちに語ります。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">高貴</span>
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">信頼</span>
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">持続性</span>
                  </div>
                </div>
              </div>

              {/* Walnut */}
              <div className="group relative bg-[#fdfbf7] rounded-none sm:rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="h-2 bg-[#6b4c3e]"></div>
                <div className="p-10">
                  <span className="text-[#8c7b6c] text-xs font-bold tracking-widest mb-2 block">BLACK WALNUT</span>
                  <h4 className="text-3xl font-serif font-bold text-[#3d3126] mb-6">胡桃 <span className="text-lg font-normal text-[#8c7b6c] ml-2">- Walnut</span></h4>
                  <div className="w-12 h-0.5 bg-[#e6e2d3] mb-6 group-hover:w-full group-hover:bg-[#6b4c3e] transition-all duration-500"></div>
                  <p className="text-[#5a4d41] leading-relaxed mb-8">
                    深く濃い色合いと美しい縞模様は、成熟した大人の知性を演出します。使い込むほどに艶が増し、あなたのキャリアと共に深みを増していくでしょう。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">知性</span>
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">重厚</span>
                    <span className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium">モダン</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Aging Story Section (Revised Timeline) */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-24 items-center">
              <div className="order-2 lg:order-1 relative mt-16 lg:mt-0">
                {/* Abstract visualization of 0-3 years againg */}
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-[#e6e2d3]"></div>

                  {/* Year 0 */}
                  <div className="relative flex items-center gap-8 mb-12">
                    <div className="w-16 h-16 rounded-full bg-[#fdfbf7] border-2 border-[#e6e2d3] flex items-center justify-center relative z-10 font-serif font-bold text-[#8c7b6c]">0</div>
                    <div className="flex-1 bg-[#fdfbf7] p-6 rounded-xl border border-[#e6e2d3] shadow-sm">
                      <h5 className="font-bold text-[#3d3126] mb-1">Brand New</h5>
                      <p className="text-xs text-[#8c7b6c]">まだ若々しい、フレッシュな表情。</p>
                    </div>
                  </div>

                  {/* Year 1 */}
                  <div className="relative flex items-center gap-8 mb-12">
                    <div className="w-16 h-16 rounded-full bg-[#f4f1ea] border-2 border-[#d4c5ae] flex items-center justify-center relative z-10 font-serif font-bold text-[#5a4d41]">1</div>
                    <div className="flex-1 bg-[#f4f1ea] p-6 rounded-xl border border-[#d4c5ae] shadow-sm">
                      <h5 className="font-bold text-[#3d3126] mb-1">1 Year Later</h5>
                      <p className="text-xs text-[#5a4d41]">手の油分が馴染み、艶が生まれます。</p>
                    </div>
                  </div>

                  {/* Year 3 */}
                  <div className="relative flex items-center gap-8">
                    <div className="w-16 h-16 rounded-full bg-[#d4c5ae] border-2 border-[#8c7b6c] flex items-center justify-center relative z-10 font-serif font-bold text-[#3d3126]">3</div>
                    <div className="flex-1 bg-[#eae0cf] p-6 rounded-xl border border-[#8c7b6c] shadow-md">
                      <h5 className="font-bold text-[#3d3126] mb-1">3 Years Later</h5>
                      <p className="text-xs text-[#3d3126]">角が取れ、あなただけの色＝「飴色」へ。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="text-[#8c7b6c] font-bold tracking-[0.2em] uppercase text-xs">Aging Process</span>
                <h3 className="mt-4 text-4xl font-serif font-medium text-[#3d3126] mb-8">
                  「劣化」ではなく、「熟成」。
                </h3>
                <p className="text-[#5a4d41] leading-relaxed mb-6 text-lg">
                  プラスチックの名刺は傷つけば「劣化」しますが、木の名刺は傷さえも「味」になります。<br />
                </p>
                <p className="text-[#5a4d41] leading-relaxed mb-8">
                  手動でコーヒーを挽く時間を愛でるように、名刺が飴色に変わり、角が取れて手に馴染んでいく過程そのものを楽しんでください。
                  それは、あなたのビジネスが時間をかけて信頼を積み重ねていく姿と重なります。
                </p>
                <div className="inline-block p-4 border-l-2 border-[#d4c5ae] bg-[#fdfbf7]">
                  <p className="text-sm text-[#8c7b6c] italic font-serif">
                    &quot;世界に一つだけの、あなたと共に育つ名刺です。&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Roots Section (Kamiichi Lumber) */}
        <section className="py-32 bg-[#2c3e50] text-[#d4c5ae] relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[30rem] h-[30rem] bg-[#3e5266] rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[30rem] h-[30rem] bg-[#1a252f] rounded-full opacity-50 blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-[#8c7b6c] font-bold tracking-[0.2em] uppercase text-xs">Our Authenticity</span>
              <h3 className="mt-4 text-4xl font-serif font-medium text-white mb-10">
                大阪・北摂、上一木材の誇り。
              </h3>
              <p className="text-lg leading-8 text-[#d4c5ae]/90 mb-12 font-light">
                私たちはIT企業ではありません。<br />
                大阪・北摂（吹田）の地で代々続く、<span className="text-white font-medium border-b border-[#d4c5ae]/30 pb-0.5">材木屋</span>から生まれました。<br />
                デジタル全盛の今だからこそ、「本物の木の力」を届けたい。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="p-8 rounded-2xl bg-[#3e5266]/30 border border-[#3e5266] backdrop-blur-sm">
                  <h5 className="text-white font-serif text-lg mb-3">0.1ミリの職人技</h5>
                  <p className="text-sm text-[#d4c5ae]/80 leading-relaxed">
                    職人が一枚ずつ木目を読み、ICチップを埋め込む。その妥協なき精度は、単なるガジェットではなく、工芸品としての品格を宿します。
                  </p>
                </div>
                <div className="p-8 rounded-2xl bg-[#3e5266]/30 border border-[#3e5266] backdrop-blur-sm">
                  <h5 className="text-white font-serif text-lg mb-3">サステナブルな循環</h5>
                  <p className="text-sm text-[#d4c5ae]/80 leading-relaxed">
                    使用する木材は、適切な管理下にある国産材を中心に使用。木を使うことで森を守る、美しい循環の一部を担っています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-32 bg-[#fdfbf7]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h3 className="text-3xl font-serif font-bold text-[#3d3126]">
                あらゆるシーンで、<br className="sm:hidden" />あなたらしさを表現
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Business */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#e6e2d3] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 bg-[#2c3e50] rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-[#2c3e50] mb-4 font-serif">Business</h4>
                <p className="text-[#5a4d41] text-sm leading-relaxed">
                  商談や交流会で、信頼感を伝える唯一無二のツールとして。環境への配慮もアピールでき、企業のブランドイメージを高めます。
                </p>
              </div>

              {/* Creator */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#e6e2d3] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 bg-[#a4b494] rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  <Palette className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-[#2c3e50] mb-4 font-serif">Creator</h4>
                <p className="text-[#5a4d41] text-sm leading-relaxed">
                  作品への想いを、一枚の木に込めて。ポートフォリオサイトやSNSへのリンクをまとめ、あなたの世界観を余すことなく伝えます。
                </p>
              </div>

              {/* Personal */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#e6e2d3] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 bg-[#d4c5ae] rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                  <Leaf className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-[#2c3e50] mb-4 font-serif">Personal</h4>
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
