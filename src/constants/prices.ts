export const MATERIAL_PRICES = {
    sugi: 12000,
    hinoki: 15000,
    walnut: 18000,
} as const;

export type MaterialType = keyof typeof MATERIAL_PRICES;
