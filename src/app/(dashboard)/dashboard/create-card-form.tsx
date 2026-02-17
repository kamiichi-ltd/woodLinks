'use client'

import { createCard } from '@/services/card-service'
import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateCardFormProps {
    initialWood?: {
        name: string
        slug: string
        species: string
    }
}

export default function CreateCardForm({ initialWood }: CreateCardFormProps) {
    const [isOpen, setIsOpen] = useState(!!initialWood)
    const ref = useRef<HTMLFormElement>(null)

    return (
        <>
            {/* Trigger Card */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative h-64 w-full rounded-[2rem] border-2 border-dashed border-[#d6cbb6] hover:border-[#bdae93] hover:bg-[#bdae93]/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 focus:outline-none focus:ring-2 focus:ring-[#8c7b6c] focus:ring-offset-2"
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6e2d3] text-[#8c7b6c] group-hover:bg-[#d4a373] group-hover:text-white transition-colors duration-300 shadow-inner">
                    <Plus className="h-6 w-6" />
                </div>
                <span className="font-serif font-bold text-[#8c7b6c] group-hover:text-[#5d4037] transition-colors">新しい名刺を作る</span>
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-[#2c3e50]/40 backdrop-blur-sm z-50 transition-opacity"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-[#fdfbf7] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto relative border border-[#fff]">
                                {/* Texture */}
                                <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 text-[#8c7b6c] transition-colors z-20"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="p-8 sm:p-10 relative z-10">
                                    <h3 className="text-2xl font-serif font-bold text-[#2c3e50] mb-2">新しい名刺を作成</h3>

                                    {initialWood ? (
                                        <div className="mb-6 p-4 bg-stone-100 rounded-xl border border-stone-200">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#8c7b6c] block mb-1">Based on</span>
                                            <div className="font-bold text-[#3d3126] flex items-center gap-2">
                                                <span>{initialWood.name}</span>
                                                <span className="text-xs font-normal text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">{initialWood.species}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[#8c7b6c] text-sm mb-8">プロジェクトの名前を入力してください。</p>
                                    )}

                                    <form
                                        ref={ref}
                                        action={async (formData) => {
                                            await createCard(formData)
                                            ref.current?.reset()
                                            setIsOpen(false)
                                        }}
                                        className="flex flex-col gap-6"
                                    >
                                        <div>
                                            <label htmlFor="title" className="sr-only">Card Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                id="title"
                                                defaultValue={initialWood ? `${initialWood.name}` : ''}
                                                className="block w-full rounded-2xl border-0 py-4 px-6 text-[#2c3e50] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#8c7b6c] text-lg bg-white/80 backdrop-blur-sm transition-all hover:bg-white"
                                                placeholder="例：株式会社上一木材"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full inline-flex items-center justify-center rounded-2xl bg-[#2c3e50] px-8 py-4 text-lg font-bold text-[#fdfbf7] shadow-lg shadow-[#2c3e50]/20 hover:bg-[#1a252f] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300"
                                        >
                                            作成する
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
