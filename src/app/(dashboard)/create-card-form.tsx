'use client'

import { createCard } from '@/services/card-service'
import { useRef } from 'react'

export default function CreateCardForm() {
    const ref = useRef<HTMLFormElement>(null)

    return (
        <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Create a New Card</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Start by giving your digital business card a title.</p>
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
                            Card Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. My Professional Profile"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    )
}
