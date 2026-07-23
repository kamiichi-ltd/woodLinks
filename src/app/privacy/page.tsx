import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'プライバシーポリシー | WoodLinks',
}

const SECTIONS: { heading: string; body: string[] }[] = [
    {
        heading: '1. 取得する情報',
        body: [
            'アカウント情報: メールアドレス、認証情報、LINEログイン時に提供されるプロフィール情報。',
            'プロフィール表示情報: 氏名・アバター画像・自己紹介・SNS/連絡先リンク（公開ページに掲載されます）。',
            '注文・配送情報: 氏名、郵便番号、住所、電話番号。',
            'アクセス解析情報: 閲覧イベント、端末種別・ブラウザ・OS。',
            'カード保存情報: どの利用者がどのカードを保存したか（card_connections）。',
        ],
    },
    {
        heading: '2. 利用目的',
        body: [
            'サービス（公開プロフィール・NFCカード）の提供。',
            'カードの製造・配送および注文管理。',
            'カード所有者へ、保存した相手（リード）の表示。',
            'アクセス解析による品質・体験の改善。',
        ],
    },
    {
        heading: '3. 第三者提供',
        body: [
            '決済処理のため Stripe に必要な情報を提供します。',
            '認証・データ基盤として Supabase を利用します。',
            'LINEログインを利用する場合、LINE 社の認証を介します。',
            '法令に基づく場合を除き、取得した個人情報を販売・第三者提供しません。',
        ],
    },
    {
        heading: '4. アクセス解析',
        body: [
            '自社の解析機能により、Cookie・端末情報等を用いて閲覧状況を計測します。',
        ],
    },
    {
        heading: '5. 公開範囲に関する注意',
        body: [
            'カードの表示名・アバター・掲載リンクは、公開プロフィールページ（/p/[slug]）で誰でも閲覧できます。公開したくない情報は登録しないでください。',
        ],
    },
    {
        heading: '6. 問い合わせ窓口',
        body: ['個人情報の開示・訂正・削除のご請求は【連絡先要記入】までご連絡ください。'],
    },
]

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#fdfbf7] text-[#3d3126] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-sm text-[#8c7b6c] hover:text-[#3d3126]">&larr; WoodLinks トップ</Link>
                <h1 className="mt-6 text-2xl font-serif font-bold">プライバシーポリシー</h1>
                <p className="mt-2 text-sm text-[#8c7b6c]">最終更新日: 2026-06-14</p>

                <div className="mt-8 space-y-8">
                    {SECTIONS.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-lg font-bold text-[#2c3e50]">{section.heading}</h2>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#5a4d41]">
                                {section.body.map((line, i) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                <p className="mt-10 text-xs text-[#8c7b6c]">
                    本ポリシーは限定検証用の最小版です。一般公開前に事業者情報・窓口を確定してください。
                </p>
            </div>
        </main>
    )
}
