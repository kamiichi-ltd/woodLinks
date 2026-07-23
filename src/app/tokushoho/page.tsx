import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: '特定商取引法に基づく表記 | WoodLinks',
}

const ROWS: { label: string; value: string }[] = [
    { label: '販売業者', value: '上一木材【正式名称・法人格は要記入】' },
    { label: '運営統括責任者', value: '【要記入】' },
    { label: '所在地', value: '大阪府吹田市【番地・建物名は要記入】' },
    { label: '連絡先', value: '電話【要記入】 / メール【要記入】（受付時間【要記入】）' },
    { label: '販売価格', value: '杉 12,000円 / 桧 15,000円 / 胡桃 18,000円（各税込）' },
    { label: '商品代金以外の必要料金', value: '送料は販売価格に含む（税込・送料込）。クレジット決済手数料の利用者負担なし。' },
    { label: '支払方法', value: 'クレジットカード（Stripe）。法人ロットは請求書・銀行振込。' },
    { label: '支払時期', value: 'クレジットカードは注文確定時。請求書の場合は請求書記載の期日まで。' },
    { label: '引渡時期', value: '受注・入金確認後、約2〜4週間【日数は要確定】。受注生産・個別製作のため前後する場合あり。' },
    { label: '返品・交換', value: '受注生産・個別製作品のため、お客様都合による返品・交換はお受けできません【方針は要確定】。' },
    { label: '不良品対応', value: 'NFCチップの不良は、商品到着後1年間【期間は要確定】に限り無料で交換します。まず連絡先までご連絡ください。' },
]

export default function TokushohoPage() {
    return (
        <main className="min-h-screen bg-[#fdfbf7] text-[#3d3126] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-sm text-[#8c7b6c] hover:text-[#3d3126]">&larr; WoodLinks トップ</Link>
                <h1 className="mt-6 text-2xl font-serif font-bold">特定商取引法に基づく表記</h1>
                <p className="mt-2 text-sm text-[#8c7b6c]">最終更新日: 2026-06-14</p>

                <dl className="mt-8 divide-y divide-[#e6e2d3] border-y border-[#e6e2d3]">
                    {ROWS.map((row) => (
                        <div key={row.label} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-bold text-[#5a4d41]">{row.label}</dt>
                            <dd className="mt-1 text-sm text-[#3d3126] sm:col-span-2 sm:mt-0">{row.value}</dd>
                        </div>
                    ))}
                </dl>

                <p className="mt-8 text-xs text-[#8c7b6c]">
                    本表記は限定検証用の最小版です。一般公開前に【要記入】項目を確定してください。
                </p>
            </div>
        </main>
    )
}
