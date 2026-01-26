'use client'

import { createCard } from '@/services/card-service'
import { useRef } from 'react'

export default function CreateCardForm() {
    const ref = useRef<HTMLFormElement>(null)

    return (
        <div className="bg-white/50 backdrop-blur-sm shadow-sm border border-[#e6e2d3] sm:rounded-xl overflow-hidden">
            <div className="px-4 py-6 sm:p-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="max-w-xl">
                        <h3 className="text-lg font-bold leading-6 text-[#3d3126]">Create New Card / 新しい名刺を作成</h3>
                        <p className="mt-1 text-sm text-[#8c7b6c]">
                            Start your digital identity journey. / あなたのデジタルアイデンティティを作りましょう。
                        </p>
                    </div>
                </div>
                <form
                    ref={ref}
                    action={async (formData) => {
                        await createCard(formData)
                        ref.current?.reset()
                    }}
                    className="mt-6 sm:flex sm:items-end gap-4"
                >
                    <div className="w-full sm:max-w-md">
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-[#3d3126] mb-1.5">
                            Card Title <span className="text-[#8c7b6c] font-normal text-xs ml-1">名刺のタイトル</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="block w-full rounded-lg border-0 py-2.5 text-[#3d3126] shadow-sm ring-1 ring-inset ring-[#d4c5ae] placeholder:text-[#a4998e] focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6 bg-[#fdfbf7]"
                            placeholder="e.g. My Professional Profile"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 sm:mt-0 inline-flex w-full items-center justify-center rounded-lg bg-[#2c3e50] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1a252f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c3e50] sm:w-auto transition-all"
                    >
                        Create / 作成
                    </button>
                </form>
            </div>
        </div>
    )
}
