import { getPublicCardById } from '@/services/card-service'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/database.types'

type CardContent = Database['public']['Tables']['card_contents']['Row']

// Helper guard
function isSnsContent(content: unknown): content is { platform: string; url: string } {
    return (
        typeof content === 'object' &&
        content !== null &&
        'platform' in content &&
        'url' in content
    )
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const card = await getPublicCardById(id)

    if (!card) {
        return new NextResponse('Card not found', { status: 404 })
    }

    // Construct vCard string
    // Basic vCard 3.0 format

    // Extract info
    // N:LastName;FirstName;;; - We only have Full Name usually in "Title" or "Description"?
    // Actually cards.title is the "Card Title" which might be "Yusuke Otani".
    // cards.description might be "Software Engineer at Kamiichi".

    const fn = card.title || 'Unknown'
    const n = fn.split(' ').reverse().join(';') + ';;;' // Crude approximation
    const org = card.description ? card.description.replace(/\n/g, '\\n') : ''

    // Phone, Email, Urls
    const tels: string[] = []
    const emails: string[] = []
    const urls: string[] = []

    card.contents.forEach((item: CardContent) => {
        if (item.type === 'sns_link' && isSnsContent(item.content)) {
            const { platform, url } = item.content
            if (platform === 'phone') {
                tels.push(url.replace('tel:', ''))
            } else if (platform === 'email') {
                emails.push(url.replace('mailto:', ''))
            } else {
                urls.push(url)
            }
        }
    })

    let vcardBody = 'BEGIN:VCARD\nVERSION:3.0\n'
    vcardBody += `FN:${fn}\n`
    vcardBody += `N:${n}\n`
    if (org) vcardBody += `ORG:${org}\n`
    // Note: TITLE is often job title, ORG is company. 
    // If description contains "at", maybe split? For simplicity, put description in NOTE or TITLE?
    // User request: "description（役職/会社名として流用）" -> Use description as Job Title / Company.
    // Let's allow it to be generic ORG for now or TITLE.
    // vcardBody += `TITLE:${org}\n`

    tels.forEach(tel => {
        vcardBody += `TEL;TYPE=CELL:${tel}\n`
    })

    emails.forEach(email => {
        vcardBody += `EMAIL;TYPE=WORK:${email}\n`
    })

    urls.forEach(url => {
        vcardBody += `URL:${url}\n`
    })

    // Also add the public link to this card
    // We need the base URL. For now, assume relative or construction?
    // request.nextUrl.origin puts valid origin
    const publicLink = `${request.nextUrl.origin}/p/${card.slug}`
    vcardBody += `URL;type=Digital Card:${publicLink}\n`

    vcardBody += 'END:VCARD'

    return new NextResponse(vcardBody, {
        headers: {
            'Content-Type': 'text/vcard; charset=utf-8',
            'Content-Disposition': `attachment; filename="contact.vcf"`,
        },
    })
}
