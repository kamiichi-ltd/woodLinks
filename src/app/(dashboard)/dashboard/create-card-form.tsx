'use client'

import { createCard } from '@/services/card-service'
import { useRef } from 'react'

export default function CreateCardForm() {
    const ref = useRef<HTMLFormElement>(null)

    return (
        <div className="bg-[#fdfbf7] sm:rounded-3xl overflow-hidden relative border-2 border-[#d4c5ae] shadow-[0_8px_30px_rgb(212,197,174,0.3)] hover:shadow-[0_8px_30px_rgb(212,197,174,0.5)] transition-shadow duration-500">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>

            <div className="px-6 py-8 sm:px-10 relative z-10">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-[#2c3e50] flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6e2d3] text-[#8c7b6c] text-lg font-bold shadow-inner font-sans">+</span>
                            ＋ 新しい名刺を作る
                        </h3>
                    </div>
                </div>
                <form
                    ref={ref}
                    action={async (formData) => {
                        await createCard(formData)
                        ref.current?.reset()
                    }}
                    className="flex flex-col sm:flex-row items-stretch gap-4"
                >
                    <div className="w-full sm:max-w-md flex-1">
                        <label htmlFor="title" className="sr-only">Card Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="block w-full rounded-2xl border-0 py-4 px-6 text-[#2c3e50] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#8c7b6c] text-base bg-white/80 backdrop-blur-sm transition-all hover:bg-white"
                            placeholder="名刺のタイトル（例：株式会社上一木材）"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-2xl bg-[#2c3e50] px-8 py-4 text-base font-bold text-[#fdfbf7] shadow-lg shadow-[#2c3e50]/20 hover:bg-[#1a252f] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] transition-all duration-300 relative overflow-hidden group min-w-[120px]"
                    >
                        <span className="relative z-10">作成する</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/10 transition-transform duration-300 skew-x-12"></div>
                    </button>
                </form>
            </div>
        </div>
    )
}
