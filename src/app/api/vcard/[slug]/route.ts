import { getCardBySlug } from '@/services/card-service'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const card = await getCardBySlug(slug)

    if (!card) {
        return new NextResponse('Card not found', { status: 404 })
    }

    // Determine Name
    const fn = card.title || 'WoodLinks User'
    const n = fn.split(' ').reverse().join(';') // Simple split for N field (Last;First;;;)

    // Determine Org & Title
    const org = '株式会社上一木材'
    // Extract first line of description as title/role if possible
    const title = card.description ? card.description.split('\n')[0] : 'Member'

    // Build Note with Wood Story
    const notesParts = []
    if (card.material_type) notesParts.push(`Material: ${card.material_type}`)
    if (card.wood_origin) notesParts.push(`Origin: ${card.wood_origin}`)
    if (card.wood_age) notesParts.push(`Age: ${card.wood_age}`)
    if (card.wood_story) notesParts.push(`\nStory:\n${card.wood_story}`)
    if (card.description) notesParts.push(`\nBio:\n${card.description}`)

    // Format Note (Replace newlines with literal \n sequence for vCard)
    const note = notesParts.join('\n').replace(/\n/g, '\\n')

    // Build URLs
    const urls: string[] = []
    const socialLinks = card.contents?.filter((c: any) => c.type === 'sns_link') || []
    socialLinks.forEach((link: any) => {
        if (link.content && link.content.url) {
            // vCard 3.0: URL;TYPE=Instagram:https://...
            urls.push(`URL;type=${link.content.platform}:${link.content.url}`)
        }
    })

    // Construct vCard
    const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${fn}`,
        `N:${n}`,
        `ORG:${org}`,
        `TITLE:${title}`,
        ...urls,
        `NOTE:${note}`,
        `URL:${process.env.NEXT_PUBLIC_BASE_URL || 'https://wood-links.vercel.app'}/p/${slug}`,
        'END:VCARD'
    ].join('\n')

    return new NextResponse(vcard, {
        headers: {
            'Content-Type': 'text/vcard; charset=utf-8',
            'Content-Disposition': `attachment; filename="${slug}.vcf"`,
        },
    })
}
