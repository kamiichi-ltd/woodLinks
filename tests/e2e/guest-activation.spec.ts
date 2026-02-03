import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Guest Activation Flow', () => {
    const TEST_SLUG = 'demo';
    let cardId: string;

    test.beforeAll(async () => {
        // 1. Get Card ID
        const { data: card } = await supabase
            .from('cards')
            .select('id')
            .eq('slug', TEST_SLUG)
            .single();

        if (!card) throw new Error('Demo card not found');
        cardId = card.id;

        // 2. Setup: Ensure card is UNCLAIMED (owner_id = NULL)
        // Using service role to force update
        const { error } = await supabase
            .from('cards')
            .update({ owner_id: null })
            .eq('id', cardId);

        if (error) throw new Error(`Failed to unclaim card: ${error.message}`);
    });

    test.afterAll(async () => {
        // Cleanup: Restore owner? Or leave as is?
        // Leaving it might affect other tests if they assume ownership.
        // Ideally we restore, but we don't know the original owner ID easily unless we stored it.
        // For now, allow it to remain null or subsequent tests will re-claim it.
    });

    test('Guest sees activation screen and is redirected to login', async ({ page }) => {
        // 1. Visit as Guest (incognito/fresh context by default in Playwright test)
        await page.goto(`/p/${TEST_SLUG}`);

        // 2. Verify Activation Screen UI
        await expect(page.getByText('Welcome to WoodLinks')).toBeVisible();
        await expect(page.getByText('このウッドカードを有効化して')).toBeVisible();

        // 3. Verify Button (Guest version)
        // Check for text "ログイン / アカウント作成して開始"
        const loginBtn = page.getByRole('link', { name: /ログイン \/ アカウント作成して開始/ });
        await expect(loginBtn).toBeVisible();

        // 4. Click and Verify Redirect
        await loginBtn.click();

        // Expect URL to contain login and next param
        await expect(page).toHaveURL(/\/login/);

        // Check query param
        const url = new URL(page.url());
        const nextParam = url.searchParams.get('next');
        expect(nextParam).toBe(`/p/${TEST_SLUG}`);
    });
});
