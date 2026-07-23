import { MATERIAL_PRICES } from '@/constants/prices'

// checkout.ts は MATERIAL_PRICES に無い素材を 'Invalid material' で弾く。
// admin-bulk が価格の無い素材(例: maple)を生成できると、購入時に必ず失敗する。
// 「生成可能な素材 = 価格のある素材」という不変条件をここで固定する。

describe('MATERIAL_PRICES — 販売可能素材の不変条件', () => {
    it('価格表は sugi / hinoki / walnut のみを含む', () => {
        expect(Object.keys(MATERIAL_PRICES).sort()).toEqual(['hinoki', 'sugi', 'walnut'])
    })

    it('全素材が正の価格を持つ（checkout の Invalid price を防ぐ）', () => {
        for (const price of Object.values(MATERIAL_PRICES)) {
            expect(price).toBeGreaterThan(0)
        }
    })

    it('maple は価格表に存在しない（bulk生成・checkout 事故の防止）', () => {
        expect('maple' in MATERIAL_PRICES).toBe(false)
    })
})
