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

const TEST_EMAIL = `activation_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_CARD_SLUG = 'wood-test';
const TEST_CARD_ID = '00000000-0000-0000-0000-000000000000'; // Placeholder, will fetch dynamically if needed or rely on slug.

test.describe('Full Activation Flow', () => {
    let cardId: string;

    test.beforeAll(async () => {
        // 1. Setup: Create fresh test user FIRST (needed for user_id FK)
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true
        });
        if (userError) console.log('User creation warning:', userError.message);
        const userId = userData.user?.id;
        if (!userId) throw new Error('Failed to create test user');

        // 2. Setup: Ensure 'wood-test' card exists and is unclaimed (owner_id: NULL)
        // We'll search by slug. If not exists, insert it.

        const { data: existingCard } = await supabase
            .from('cards')
            .select('id')
            .eq('slug', TEST_CARD_SLUG)
            .single();

        if (existingCard) {
            cardId = existingCard.id;
            // Reset owner
            await supabase
                .from('cards')
                .update({ owner_id: null })
                .eq('id', cardId);
        } else {
            // Create test card if missing
            // Force type cast to any to handle schema mismatch (is_published vs is_public)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cardPayload: any = {
                slug: TEST_CARD_SLUG,
                title: 'Test Wood',
                description: 'For E2E Testing',
                user_id: userId, // Required FK
                is_published: true, // Correct column name in DB
                owner_id: null
            };

            const { data: newCard, error } = await supabase.from('cards').insert(cardPayload).select().single();

            if (error) throw error;
            cardId = newCard.id;
        }
    });

    test.afterAll(async () => {
        // Cleanup: Delete user and reset card
        // Reset card
        if (cardId) {
            await supabase.from('cards').update({ owner_id: null }).eq('id', cardId);
        }

        // Delete user
        const { data: userData } = await supabase.auth.admin.listUsers();
        const user = userData.users.find(u => u.email === TEST_EMAIL);
        if (user) {
            await supabase.auth.admin.deleteUser(user.id);
        }
    });

    test('Guest visits card, logins, and activates it', async ({ page }) => {
        // 1. Visit Card Page (Guest)
        await page.goto(`/p/${TEST_CARD_SLUG}`);

        // Verify we see "Card Activation" component or "Start Setup" button
        // Since owner_id is null, it should show activation screen (guest view)
        // Looking for "ログインして有効化" link
        const loginLink = page.getByRole('link', { name: 'ログインして有効化' });
        await expect(loginLink).toBeVisible();

        // 2. Click Login Link
        await loginLink.click();

        // Verify redirected to Login with next param
        await page.waitForURL(/\/login/);
        const url = new URL(page.url());
        expect(url.searchParams.get('next')).toBe(`/p/${TEST_CARD_SLUG}`);

        // 3. Login
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');

        // 4. Verify Redirect back to Card Page (with Activation Screen for Auth User)
        await page.waitForURL((url) => url.pathname === `/p/${TEST_CARD_SLUG}`);

        // Now authenticated, user should see "有効化して開始" (Activate) button
        // Assuming the component renders "Start Setup" for authenticated user
        const activateButton = page.getByRole('button', { name: '有効化して開始' }); // Adjust text if needed based on code
        // Wait, checking code for button text...
        // Component code: "有効化して開始" is for logged in user.
        await expect(activateButton).toBeVisible();

        // 5. Activate Card
        await activateButton.click();

        // 6. Verify Redirect to Admin Edit Page
        // Endpoint: /admin/cards/[id]
        // Wait for URL to contain /admin/cards/
        await page.waitForURL((url) => url.pathname.includes(`/admin/cards/${cardId}`), { timeout: 10000 });

        // Verify we are NOT on LP
        expect(page.url()).not.toBe(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/`);
    });
});
