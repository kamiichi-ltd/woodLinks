'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Smartphone,
  Leaf,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  UserCheck,
  Briefcase,
  Palette,
  User,
  Plus,
  Minus,
  Check,
  X,
  Droplets,
  Hammer,
  Award
} from 'lucide-react'

// --- Animation Variants ---
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

// --- Components ---
const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#e6e2d3] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex lg:items-center justify-between text-left gap-4 focus:outline-none group"
      >
        <span className="text-lg font-bold text-[#3d3126] group-hover:text-[#2c3e50] transition-colors">{question}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#d4c5ae] flex items-center justify-center transition-colors ${isOpen ? 'bg-[#2c3e50] border-[#2c3e50] text-[#fdfbf7]' : 'text-[#8c7b6c]'}`}>
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#5a4d41] leading-relaxed pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  return (
    <div className="bg-[#fdfbf7] min-h-screen flex flex-col font-sans text-[#2c3e50] selection:bg-[#d4c5ae] selection:text-[#2c3e50]">
      {/* --- Header (Glassmorphism) --- */}
      <header className="fixed w-full z-50 bg-[#fdfbf7]/80 backdrop-blur-md border-b border-[#e6e2d3]/50 supports-[backdrop-filter]:bg-[#fdfbf7]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Logo Icon */}
            <div className="relative h-10 w-10 overflow-hidden rounded-lg">
              <img src="/logo.png" alt="WoodLinks Logo" className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#3d3126]">WoodLinks</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/p/demo" className="text-sm font-medium text-[#8c7b6c] hover:text-[#3d3126] transition-colors hidden sm:block">
              デモを見る
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#2c3e50] text-[#fdfbf7] px-6 py-2.5 text-sm font-bold hover:bg-[#1a252f] transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              ログイン
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* --- Hero Section --- */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#e6e2d3]/30 to-transparent rounded-[100%] blur-3xl opacity-50"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.span variants={fadeIn} className="inline-block py-1 px-3 rounded-full bg-[#f4f1ea] border border-[#e6e2d3] text-[#8c7b6c] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                TACTILE DIGITAL
              </motion.span>
              <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-[#3d3126] mb-8 leading-[1.1]">
                木に、<br />デジタルという<br />命を宿す。
              </motion.h1>
              <motion.p variants={fadeIn} className="text-lg sm:text-xl text-[#5a4d41] mb-10 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                本物の木の温もりと、最先端のデジタル技術が融合。<br />
                名刺交換の瞬間を、記憶に残る「体験」へ。
              </motion.p>

              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                <Link
                  href="/login"
                  className="w-full sm:w-auto h-14 px-8 rounded-full bg-[#2c3e50] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#1a252f] transition-all shadow-xl shadow-[#2c3e50]/20 hover:-translate-y-1"
                >
                  カードを作成する <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/p/demo"
                  className="w-full sm:w-auto h-14 px-8 rounded-full border border-[#d4c5ae] text-[#3d3126] font-bold flex items-center justify-center gap-2 hover:bg-[#eae0cf] transition-all"
                >
                  デモを見る <Smartphone className="h-5 w-5" />
                </Link>
              </motion.div>

              {/* [NEW] Compatibility Badge */}
              <motion.div variants={fadeIn} className="flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#8c7b6c] opacity-80">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#a4b494]" />
                  Works with iPhone & Android
                </div>
                <span className="w-1 h-1 rounded-full bg-[#e6e2d3]"></span>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#a4b494]" />
                  No App Needed
                </div>
              </motion.div>
            </motion.div>

            {/* Visual / 3D-like Animation */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: 30 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative lg:h-[600px] flex items-center justify-center perspective-1000"
            >
              {/* Visual */}
              <div className="relative w-80 h-[500px] bg-[#d4a373] rounded-3xl shadow-[0_30px_60px_-15px_rgba(44,62,80,0.3)] border-[6px] border-white/20 overflow-hidden transform rotate-[-6deg] hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
                <div className="absolute top-10 left-10 right-10">
                  <div className="h-12 w-12 bg-[#3d3126] rounded-full mb-6"></div>
                  <div className="h-4 w-32 bg-[#3d3126]/20 rounded-full mb-3"></div>
                  <div className="h-3 w-20 bg-[#3d3126]/10 rounded-full"></div>
                </div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="h-10 w-10 border-2 border-[#3d3126] rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#3d3126]" />
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 flex items-center justify-center animate-bounce duration-[3000ms]">
                <Smartphone className="h-8 w-8 text-[#2c3e50]" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- How It Works --- */}
        <section className="py-24 bg-white border-y border-[#e6e2d3]/50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3d3126] mb-4">かざす、伝わる、繋がる。</h2>
              <p className="text-[#8c7b6c]">アプリは不要。直感的な3ステップ。</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-12 relative"
            >
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-[#e6e2d3] -z-10"></div>
              {[
                { title: "Tap", subtitle: "かざす", desc: "相手のスマホにカードをかざすだけ。", icon: Zap },
                { title: "Showcase", subtitle: "伝わる", desc: "あなたのプロフィールが瞬時に開きます。", icon: Globe },
                { title: "Connect", subtitle: "繋がる", desc: "ワンタップで連絡先を保存。", icon: UserCheck }
              ].map((step, idx) => (
                <motion.div key={idx} variants={fadeIn} className="flex flex-col items-center text-center bg-white p-6">
                  <div className="w-24 h-24 rounded-full bg-[#fdfbf7] border border-[#e6e2d3] flex items-center justify-center mb-6 shadow-sm relative group">
                    <step.icon className="h-8 w-8 text-[#2c3e50] group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#d4a373] text-white text-sm font-bold flex items-center justify-center border-2 border-white">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#2c3e50] mb-1">{step.subtitle}</h3>
                  <span className="text-xs font-bold tracking-widest text-[#d4c5ae] uppercase mb-3">{step.title}</span>
                  <p className="text-[#5a4d41] text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- Features (Bento Grid) --- */}
        <section className="py-32 bg-[#fdfbf7]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mb-16"
            >
              <span className="text-[#8c7b6c] font-bold tracking-[0.2em] uppercase text-xs block mb-3">FEATURES</span>
              <h2 className="text-4xl font-serif font-bold text-[#3d3126]">機能美という、おもてなし。</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
              <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#e6e2d3] hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#2c3e50] rounded-xl flex items-center justify-center text-white mb-6">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#3d3126] mb-3">No App Required</h3>
                  <p className="text-[#5a4d41] max-w-md">専用アプリのインストールは一切不要。<br />スマホ標準搭載のNFC機能で、誰とでもスムーズに繋がれます。</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <Zap className="w-64 h-64 text-[#2c3e50]" />
                </div>
              </div>
              <div className="md:row-span-2 bg-[#2c3e50] rounded-3xl p-8 text-[#fdfbf7] flex flex-col relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#fdfbf7]/10 rounded-xl flex items-center justify-center text-[#fdfbf7] mb-6">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Analytics</h3>
                  <p className="text-[#d4c5ae] text-sm leading-relaxed mb-6">
                    「いつ、誰に、どこで」見られたか。<br />
                    アクセス解析機能で、出会いの価値を可視化します。
                  </p>
                  <div className="mt-auto bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-end justify-between h-32 gap-2">
                      {[30, 50, 45, 80, 60, 90, 75].map((h, i) => (
                        <div key={i} className="w-full bg-[#d4c5ae] opacity-50 rounded-t-sm hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#f4f1ea] rounded-3xl p-8 border border-[#d4c5ae] hover:border-[#8c7b6c] transition-colors group">
                <Globe className="h-8 w-8 text-[#8c7b6c] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-[#3d3126] mb-2">Real-time Update</h3>
                <p className="text-xs text-[#5a4d41]">情報はダッシュボードから即更新。名刺の刷り直しはもう不要です。</p>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-[#e6e2d3] flex flex-col justify-between group hover:bg-[#faf9f6] transition-colors">
                <div>
                  <div className="flex gap-4 mb-4">
                    <Leaf className="h-6 w-6 text-[#a4b494]" />
                    <ShieldCheck className="h-6 w-6 text-[#d4a373]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#3d3126] mb-2">Eco & Secure</h3>
                  <p className="text-xs text-[#5a4d41]">ペーパーレスで環境に優しく。<br />紛失時もリモートロックで安心。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Brand Story Section --- */}
        <section className="py-32 bg-[#2c3e50] text-[#fdfbf7] relative overflow-hidden">
          {/* Shapes */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#3e5266] rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#1a252f] rounded-full blur-[100px] opacity-40"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <span className="text-[#d4c5ae] font-bold tracking-[0.2em] uppercase text-xs block mb-3">OUR AUTHENTICITY</span>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-10 leading-tight">大阪・北摂、<br className="sm:hidden" />上一木材の誇り。</h2>
              <p className="text-lg sm:text-xl text-[#d4c5ae] font-light leading-relaxed max-w-3xl mx-auto mb-12">
                私たちはITベンチャーではありません。<br className="hidden sm:block" />
                大阪・北摂（吹田）の地で代々続く、材木屋です。<br />
                デジタル全盛の今だからこそ、「本物の木の力」を届けたい。<br />
                0.1ミリの職人技と、最新のNFC技術の融合。
              </p>
              <div className="inline-block p-6 border border-[#d4c5ae]/30 rounded-xl bg-white/5 backdrop-blur-sm">
                <p className="font-serif text-[#fdfbf7] text-lg">
                  &quot;手に取った瞬間、違いがわかる。それが私たちの品質です。&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- [NEW] Comparison Section (ROI) --- */}
        <section className="py-24 bg-white border-b border-[#e6e2d3]">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-serif font-bold text-[#3d3126] mb-4">コストも、資源も、無駄にしない。</h2>
              <p className="text-[#8c7b6c]">使い捨ての時代に、一生モノの選択を。</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Paper Card */}
              <div className="p-8 rounded-2xl bg-[#f4f4f4] border border-[#dddddd] text-[#777777]">
                <h4 className="text-xl font-bold mb-6 text-center">一般的な紙名刺</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <X className="h-5 w-5 text-red-400 shrink-0" />
                    <span>終わりのない印刷コスト</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="h-5 w-5 text-red-400 shrink-0" />
                    <span>情報変更のたびに廃棄</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="h-5 w-5 text-red-400 shrink-0" />
                    <span>90%は1週間以内に捨てられる</span>
                  </li>
                </ul>
              </div>

              {/* WoodLinks Card */}
              <div className="p-8 rounded-2xl bg-white border-2 border-[#d4a373] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#d4a373] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                <h4 className="text-xl font-bold mb-6 text-center text-[#3d3126]">WoodLinks</h4>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#d4a373] shrink-0" />
                    <span className="font-bold text-[#2c3e50]">一度の投資で、半永久的に</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#d4a373] shrink-0" />
                    <span className="font-bold text-[#2c3e50]">リアルタイムで情報更新</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#d4a373] shrink-0" />
                    <span className="font-bold text-[#2c3e50]">相手のスマホに確実に残る</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- Material Selection --- */}
        <section className="py-32 bg-[#f4f1ea] border-y border-[#e6e2d3]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-20"
            >
              <span className="text-[#8c7b6c] font-bold tracking-[0.2em] uppercase text-xs">MATERIAL SELECTION</span>
              <h3 className="mt-4 text-4xl font-serif font-medium text-[#3d3126]">
                あなたに呼応する、木の個性
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {[
                { name: "杉", en: "Sugi", subtype: "JAPANESE CEDAR", color: "#d4a373", desc: "真っ直ぐな木目は誠実さの証。", tags: ["親しみ", "直感"] },
                { name: "桧", en: "Hinoki", subtype: "JAPANESE CYPRESS", color: "#e9d8a6", desc: "香り高い、木の王様。", tags: ["高貴", "信頼"] },
                { name: "胡桃", en: "Walnut", subtype: "BLACK WALNUT", color: "#6b4c3e", desc: "深く、知的な大人の色気。", tags: ["知性", "モダン"] }
              ].map((wood) => (
                <motion.div
                  key={wood.en}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  className="group relative bg-[#fdfbf7] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden rounded-xl"
                >
                  <div className="h-2 w-full" style={{ backgroundColor: wood.color }}></div>
                  <div className="p-10 relative z-10">
                    <span className="text-xs font-bold tracking-widest mb-2 block" style={{ color: wood.color }}>{wood.subtype}</span>
                    <h4 className="text-3xl font-serif font-bold text-[#3d3126] mb-6">{wood.name} <span className="text-lg font-normal text-[#8c7b6c] ml-2 font-sans">- {wood.en}</span></h4>
                    <div className="w-12 h-0.5 bg-[#e6e2d3] mb-6 group-hover:w-full transition-all duration-500" style={{ backgroundColor: wood.color }}></div>
                    <p className="text-[#5a4d41] leading-relaxed mb-8 min-h-[3rem]">{wood.desc}</p>
                    <div className="flex gap-2">
                      {wood.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-[#f4f1ea] text-[#5a4d41] text-xs font-medium rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Use Cases Section --- */}
        <section className="py-32 bg-[#fdfbf7]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-20"
            >
              <h3 className="text-3xl font-serif font-bold text-[#3d3126]">
                あらゆるシーンで、<br className="sm:hidden" />あなたらしさを表現。
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Business", icon: Briefcase, desc: "商談や交流会で。信頼感を伝える唯一無二のツール。" },
                { title: "Creator", icon: Palette, desc: "作品への想いを、一枚の木に込めて。ポートフォリオへのリンク。" },
                { title: "Personal", icon: User, desc: "趣味やSNSを、自然な形で共有。" }
              ].map((useCase) => (
                <motion.div
                  key={useCase.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  className="bg-white p-10 rounded-3xl border border-[#e6e2d3] shadow-sm hover:shadow-lg transition-shadow duration-300 text-center group"
                >
                  <div className="w-16 h-16 mx-auto bg-[#fdfbf7] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#2c3e50] group-hover:text-white transition-colors duration-300">
                    <useCase.icon className="h-7 w-7 text-[#2c3e50] group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-[#2c3e50] mb-4 font-serif">{useCase.title}</h4>
                  <p className="text-[#5a4d41] text-sm leading-relaxed">{useCase.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- [NEW] Specs & Warranty --- */}
        <section className="py-20 bg-white border-t border-[#e6e2d3]">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-12"
            >
              <h3 className="text-2xl font-bold text-[#3d3126] mb-2 font-serif">材木屋の品質保証</h3>
              <p className="text-sm text-[#8c7b6c]">長く愛用していただくための、こだわり。</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#ecf4ff] rounded-full flex items-center justify-center text-[#4a90e2] mb-4">
                  <Droplets className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-[#2c3e50] mb-2">Water Resistant</h4>
                <p className="text-xs text-[#5a4d41] leading-relaxed max-w-xs">独自のウレタン/オイル塗装で、水濡れや汚れに強い。</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#fff4e5] rounded-full flex items-center justify-center text-[#f5a623] mb-4">
                  <Hammer className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-[#2c3e50] mb-2">Durable</h4>
                <p className="text-xs text-[#5a4d41] leading-relaxed max-w-xs">特殊乾燥技術により、木の反りや割れを極限まで抑制。</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#e8f5e9] rounded-full flex items-center justify-center text-[#66bb6a] mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-[#2c3e50] mb-2">1-Year Warranty</h4>
                <p className="text-xs text-[#5a4d41] leading-relaxed max-w-xs">万が一のNFCチップ不良には、1年間の無料交換保証。</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section className="py-24 bg-white border-y border-[#e6e2d3]/50">
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-2xl font-bold text-[#3d3126]">よくある質問</h2>
            </motion.div>

            <div className="space-y-2">
              <FaqItem
                question="アプリのインストールは必要ですか？"
                answer="必要ありません。相手のスマートフォンのNFC読み取り部分（上部背面など）にかざすだけで、標準ブラウザにてプロフィールが表示されます。"
              />
              <FaqItem
                question="電池交換は必要ですか？"
                answer="いいえ、不要です。スマートフォンから発せられる微弱な電波で動作するNFC技術を使用しているため、充電や電池交換なしで半永久的にご使用いただけます。"
              />
              <FaqItem
                question="水に濡れても大丈夫ですか？"
                answer="生活防水レベルのコーティングを施しておりますので、多少の水濡れは問題ありません。ただし、天然木を使用しているため、長時間の水没や高温多湿な環境は避けてください。"
              />
              <FaqItem
                question="名刺の内容は後から変更できますか？"
                answer="はい、可能です。専用のダッシュボードにログインしていただくことで、いつでもリアルタイムに登録情報を変更・更新できます。相手に再配布する必要はありません。"
              />
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="py-32 bg-[#2c3e50] text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-4xl sm:text-5xl font-serif font-bold text-[#fdfbf7] mb-8"
            >
              最初で最後の、名刺を持とう。
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#d4a373] text-[#2c3e50] px-12 py-5 text-xl font-bold hover:bg-[#e6b88a] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                無料でカードを作成 <ArrowRight className="h-6 w-6" />
              </Link>
            </motion.div>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <footer className="bg-[#3d3126] py-12 px-6 text-[#d4c5ae] border-t border-[#d4c5ae]/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="WoodLinks Logo" className="h-8 w-8 object-contain opacity-80" />
            <span className="font-serif text-xl font-bold text-white tracking-wide">WoodLinks</span>
          </div>
          <p className="text-sm opacity-60">
            &copy; {new Date().getFullYear()} WoodLinks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
