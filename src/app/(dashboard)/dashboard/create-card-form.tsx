'use client'

import { createCard } from '@/services/card-service'
import { useRef } from 'react'

export default function CreateCardForm() {
    const ref = useRef<HTMLFormElement>(null)

    return (
        <div className="bg-[#fdfbf7] sm:rounded-3xl overflow-hidden relative">
            <div className="px-6 py-8 sm:px-10">
                <div className="sm:flex sm:items-center sm:justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-[#2c3e50] flex items-center gap-2">
                            <span>+</span> Create New Piece <span className="text-sm font-normal text-[#8c7b6c] ml-2">/ 新しい名刺を作成</span>
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
                            className="block w-full rounded-2xl border-0 py-4 px-6 text-[#2c3e50] shadow-sm ring-1 ring-inset ring-[#e6e2d3] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] text-base bg-white transition-shadow"
                            placeholder="Type a title for your new card... / 名刺のタイトル"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-2xl bg-[#2c3e50] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#2c3e50]/20 hover:bg-[#1a252f] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] transition-all duration-300"
                    >
                        Create Project
                    </button>
                </form>
            </div>
        </div>
    )
}
