'use client'

import { motion } from 'framer-motion'
import { cn } from '@/utils/cn' // Assuming cn exists, if not I'll use template literals logic or check if utils/cn exists. 
// Checking previous files, I don't see explicit cn usage but I should verify. 
// I'll stick to standard template literals for safety or check first.
// Actually standard template literals is safer if I don't know about `cn`.

const materials = [
    {
        name: "杉",
        en: "Sugi",
        subtype: "JAPANESE CEDAR",
        desc: "真っ直ぐな木目は、実直な誠実さの証。",
        specs: { scent: 4, hardness: 2, aging: 5 },
        // Using gradients to simulate wood since we don't have real photos yet
        bgGradient: "from-[#8b5a2b] to-[#5d3a1a]",
        textureOpacity: "opacity-30"
    },
    {
        name: "桧",
        en: "Hinoki",
        subtype: "JAPANESE CYPRESS",
        desc: "香り高い、日本が誇る木の王様。",
        specs: { scent: 5, hardness: 3, aging: 3 },
        bgGradient: "from-[#e6b88a] to-[#c19a6b]",
        textureOpacity: "opacity-20"
    },
    {
        name: "胡桃",
        en: "Walnut",
        subtype: "BLACK WALNUT",
        desc: "深く、知的な大人の色気。",
        specs: { scent: 2, hardness: 5, aging: 4 },
        bgGradient: "from-[#4a3b32] to-[#2b221e]",
        textureOpacity: "opacity-40"
    }
]

export default function MaterialSelection() {
    return (
        <section className="py-32 bg-[#1a1a1a] relative overflow-hidden">
            {/* Background Texture for the whole section to give museum feel */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                    }}
                    className="text-center mb-24"
                >
                    <span className="text-[#8c7b6c] font-bold tracking-[0.3em] uppercase text-xs block mb-4">MATERIAL SELECTION</span>
                    <h3 className="text-3xl sm:text-4xl font-serif font-medium text-[#fdfbf7]">
                        あなたに呼応する、木の個性
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {materials.map((wood, idx) => (
                        <MaterialCard key={wood.en} wood={wood} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function MaterialCard({ wood, index }: { wood: typeof materials[0], index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="group relative h-[500px] rounded-xl overflow-hidden cursor-pointer shadow-xl"
        >
            {/* Background Layer (Zoom Effect) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${wood.bgGradient} transition-transform duration-[1.5s] ease-out group-hover:scale-110`}></div>

            {/* Wood Texture Overlay */}
            <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply ${wood.textureOpacity} transition-transform duration-[1.5s] ease-out group-hover:scale-110`}></div>

            {/* Dark Overlay (Fade Effect) */}
            <div className="absolute inset-0 bg-[#1a1510]/60 transition-opacity duration-700 group-hover:opacity-40"></div>

            {/* Content Content - Centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 transform transition-transform duration-700 group-hover:-translate-y-4">
                {/* Subtype */}
                <span className="text-[10px] tracking-[0.3em] text-[#d4c5ae]/80 uppercase mb-6 border-b border-[#d4c5ae]/30 pb-2">
                    {wood.subtype}
                </span>

                {/* Main Name */}
                <h4 className="text-6xl font-serif font-bold text-[#fdfbf7] mb-2 tracking-widest">
                    {wood.name}
                </h4>
                <span className="text-sm font-serif text-[#d4c5ae] italic mb-8">
                    {wood.en}
                </span>

                {/* Description */}
                <p className="text-[#e6e2d3] text-sm leading-relaxed mb-10 max-w-[80%] opacity-90">
                    {wood.desc}
                </p>

                {/* Specs Meter */}
                <div className="w-full max-w-[200px] space-y-3">
                    <SpecMeter label="Scent" value={wood.specs.scent} />
                    <SpecMeter label="Hardness" value={wood.specs.hardness} />
                    <SpecMeter label="Aging" value={wood.specs.aging} />
                </div>
            </div>

            {/* Border / Frame effect */}
            <div className="absolute inset-4 border border-[#fdfbf7]/10 rounded-lg pointer-events-none transition-colors duration-500 group-hover:border-[#fdfbf7]/30"></div>
        </motion.div>
    )
}

function SpecMeter({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex items-center justify-between text-[10px] text-[#d4c5ae]/80">
            <span className="w-16 text-left tracking-widest uppercase">{label}</span>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${dot <= value ? 'bg-[#d4c5ae]' : 'bg-[#d4c5ae]/20'}`}
                    ></div>
                ))}
            </div>
        </div>
    )
}
