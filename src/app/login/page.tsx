'use client'

import { useState, useTransition } from 'react'
import { login, signup } from '@/services/auth-service'
import { LogIn, UserPlus, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [isPending, startTransition] = useTransition()
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        startTransition(async () => {
            try {
                if (isLogin) {
                    await login(formData)
                } else {
                    await signup(formData)
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('予期せぬエラーが発生しました')
                }
            }
        })
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#2c3e50]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="WoodLinks Logo" className="h-20 w-20 object-contain" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-tight text-[#3d3126]">
                    WoodLinks
                </h2>
                <p className="mt-2 text-center text-sm text-[#5a4d41]">
                    {isLogin ? '木製デジタル名刺の管理画面へ' : '新しいアカウントを作成'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-stone-200/50 sm:rounded-2xl sm:px-10 border border-[#e6e2d3]">
                    <form action={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {isLogin ? 'ログイン失敗' : '登録失敗'}
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-[#3d3126]">
                                メールアドレス
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-[#3d3126]">
                                パスワード
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#2c3e50] sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full justify-center rounded-md bg-[#3d3126] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#2c221b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3126] disabled:opacity-70 transition-colors items-center gap-2"
                            >
                                {isPending ? (isLogin ? 'ログイン中...' : '登録処理中...') : (
                                    <>
                                        {isLogin ? 'ログイン' : 'アカウント作成'}
                                        {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">または</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center space-y-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError(null)
                                }}
                                className="text-sm font-medium text-[#2c3e50] hover:text-[#1a252f] hover:underline"
                            >
                                {isLogin
                                    ? 'アカウントをお持ちでない方はこちら (新規登録)'
                                    : 'すでにアカウントをお持ちの方はこちら (ログイン)'}
                            </button>

                            <div className="block">
                                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                                    TOPに戻る
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
