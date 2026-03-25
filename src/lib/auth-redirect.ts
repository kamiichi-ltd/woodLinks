export function buildSafeNextPath(
    nextParam?: string | null,
    extras: Record<string, string | null | undefined> = {}
) {
    if (!nextParam || !nextParam.startsWith('/') || nextParam.startsWith('//')) {
        return null
    }

    const redirectUrl = new URL(nextParam, 'http://localhost')

    Object.entries(extras).forEach(([key, value]) => {
        if (value) {
            redirectUrl.searchParams.set(key, value)
        }
    })

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
}
