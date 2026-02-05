import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

test.describe('Full Activation Flow', () => {
    let cardId: string;
    let cardSlug: string;
    let userId: string;
    const TEST_EMAIL = `activation_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
    const TEST_PASSWORD = 'password123';

    test.beforeAll(async () => {
        // 1. Create unique test user
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true
        });
        if (userError) throw new Error(`User creation failed: ${userError.message}`);
        userId = userData.user!.id;

        // 2. Create unique test card (Unclaimed)
        cardSlug = `activate-test-${Math.random().toString(36).substring(7)}`;

        // We need a creator ID for the card (user_id), but owner_id should be NULL.
        // We can use the test user as creator, but owner is null.
        const { data: newCard, error: cardError } = await supabase
            .from('cards')
            .insert({
                slug: cardSlug,
                title: 'Activation Test Card',
                description: 'E2E Test',
                user_id: userId, // Created by this user
                owner_id: null,  // But not claimed yet
                is_published: true
            })
            .select()
            .single();

        if (cardError) throw new Error(`Card creation failed: ${cardError.message}`);
        cardId = newCard.id;
    });

    test.afterAll(async () => {
        // Cleanup
        if (userId) await supabase.auth.admin.deleteUser(userId);
        if (cardId) await supabase.from('cards').delete().eq('id', cardId);
    });

    test('Guest visits card, logins, and activates it', async ({ page }) => {
        // 1. Visit Card Page (Guest)
        await page.goto(`/p/${cardSlug}`);

        // 2. Verify Activation Screen
        await expect(page.getByText('Activate Your Card')).toBeVisible();

        const loginLink = page.getByRole('link', { name: 'ログインして有効化' });
        await expect(loginLink).toBeVisible();

        // 3. Click Login
        await loginLink.click();

        // 4. Login
        await page.waitForURL(/\/login/);
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');

        // 5. Verify Redirect back to Card Page
        await page.waitForURL((url) => url.pathname === `/p/${cardSlug}`);

        // 6. Verify "Activate" button for logged-in user
        // Text in card-activation.tsx: 'カードを有効化して開始'
        const activateButton = page.getByRole('button', { name: 'カードを有効化して開始' });
        await expect(activateButton).toBeVisible();

        // 7. Click Activate
        await activateButton.click();

        // 8. Verify Redirect to Admin Dashboard
        await page.waitForURL((url) => url.pathname.includes(`/admin/cards/${cardId}`), { timeout: 15000 });

        // Verify owner_id was updated in DB
        const { data: updatedCard } = await supabase.from('cards').select('owner_id').eq('id', cardId).single();
        expect(updatedCard?.owner_id).toBe(userId);
    });
});
