'use client'

import { createCard } from '@/services/card-service'
import { useRef } from 'react'

export default function CreateCardForm() {
    const ref = useRef<HTMLFormElement>(null)

    return (
        <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">新しい名刺を作成</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>まずはデジタル名刺に名前を付けましょう。</p>
                </div>
                <form
                    ref={ref}
                    action={async (formData) => {
                        await createCard(formData)
                        ref.current?.reset()
                    }}
                    className="mt-5 sm:flex sm:items-center"
                >
                    <div className="w-full sm:max-w-xs">
                        <label htmlFor="title" className="sr-only">
                            名刺のタイトル
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="例: 私のプロフィール名刺"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                    >
                        作成する
                    </button>
                </form>
            </div>
        </div>
    )
}
