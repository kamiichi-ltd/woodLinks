import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: '利用規約 | WoodLinks',
}

const SECTIONS: { heading: string; body: string[] }[] = [
    {
        heading: '第1条（サービス概要）',
        body: [
            'WoodLinks は、木製NFCカード（物理デバイス）と、それに紐づく公開プロフィールページ・カード管理機能・アクセス解析を提供するサービスです。',
        ],
    },
    {
        heading: '第2条（アカウント）',
        body: [
            '利用者はメールアドレスまたはLINEログインによりアカウントを登録します。',
            '登録情報は正確かつ最新に保つものとし、認証情報の管理は利用者の責任とします。',
        ],
    },
    {
        heading: '第3条（禁止事項）',
        body: [
            '法令または公序良俗に違反する行為。',
            '他者へのなりすまし、他者の権利・プライバシーの侵害。',
            'サービスへの不正アクセス、解析の妨害、過度な負荷をかける行為。',
            '虚偽情報の登録、第三者の個人情報の無断掲載。',
        ],
    },
    {
        heading: '第4条（公開プロフィール）',
        body: [
            'カードに登録した表示名・画像・リンク等は公開ページで第三者に閲覧されます。掲載内容は利用者の責任とします。',
        ],
    },
    {
        heading: '第5条（NFCカード）',
        body: [
            'NFCカードは物理デバイスであり、受注生産・個別製作されます。',
            '紛失・破損時の再発行・無効化の取り扱いは、別途定める運用・特商法表記に従います。',
        ],
    },
    {
        heading: '第6条（免責）',
        body: [
            '当社は、法令で許容される範囲において、サービスの完全性・特定目的適合性を保証しません。',
            '利用者間または利用者と第三者の間で生じた紛争について、当社は責任を負いません。',
        ],
    },
    {
        heading: '第7条（利用停止・退会）',
        body: [
            '本規約に違反した場合、事前通知なくアカウントを停止することがあります。',
            '退会を希望する場合は【連絡先要記入】までお申し出ください。',
        ],
    },
    {
        heading: '第8条（規約の変更）',
        body: [
            '当社は本規約を変更することがあります。変更後の規約は本ページへの掲示をもって効力を生じます。',
        ],
    },
]

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#fdfbf7] text-[#3d3126] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-sm text-[#8c7b6c] hover:text-[#3d3126]">&larr; WoodLinks トップ</Link>
                <h1 className="mt-6 text-2xl font-serif font-bold">利用規約</h1>
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
                    本規約は限定検証用の最小版です。一般公開前に事業者情報・窓口を確定してください。
                </p>
            </div>
        </main>
    )
}
