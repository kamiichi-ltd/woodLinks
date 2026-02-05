import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Guest Activation Flow', () => {
    let cardId: string;
    let cardSlug: string;

    test.beforeAll(async () => {
        // Create a unique card for this test
        const uniqueSuffix = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
        // Using a completely random slug to avoid ANY collision
        const title = `Guest Activation Test ${uniqueSuffix}`;
        cardSlug = `guest-${uniqueSuffix}`;

        // Create card directly in DB with owner_id = null (Unclaimed)
        const { data: card, error } = await supabase
            .from('cards')
            .insert({
                slug: cardSlug,
                title: title,
                description: 'Test Description',
                user_id: '00000000-0000-0000-0000-000000000000', // Dummy user_id (required by some logic?) or use valid one
                // Actually user_id refers to creator usually. Let's use a dummy UUID if FK allows, or a real one.
                // Safest is to pick an existing user or create one.
                // Let's assume there is at least one user or constraints allow.
                // If FK constraint exists on user_id to profiles, we need a valid user_id.
                // We can fetch the first user.
            })
            .select() // Need to select to get ID if needed, though we might hit RLS if not careful? Admin client bypasses RLS.
            // Wait, card needs user_id.
            ;

        // Wait, if I cannot easily satisfy user_id FK, I will look for an existing user.
        const { data: user } = await supabase.from('profiles').select('id').limit(1).single();
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'; // Fallback

        const { data: newCard, error: createError } = await supabase
            .from('cards')
            .insert({
                slug: cardSlug,
                title: title,
                user_id: userId,
                owner_id: null, // Explicitly unclaimed
                is_published: true // Ensure it's published so it can be visited (if publication logic applies)
                // If it's unpublished, can guest see it? Usually yes if they have the link?
            })
            .select()
            .single();

        if (createError) throw new Error(`Failed to create test card: ${createError.message}`);
        cardId = newCard.id;
    });

    test.afterAll(async () => {
        // Cleanup
        if (cardId) {
            await supabase.from('cards').delete().eq('id', cardId);
        }
    });

    test('Guest sees activation screen and is redirected to login', async ({ page }) => {
        // 1. Visit as Guest
        await page.goto(`/p/${cardSlug}`);

        // 2. Verify Activation Screen UI
        await expect(page.getByText('Activate Your Card')).toBeVisible();
        await expect(page.getByText('お手元のカードをアカウントに連携し')).toBeVisible();

        // 3. Verify Button
        const loginLink = page.getByRole('link', { name: 'ログインして有効化' });
        await expect(loginLink).toBeVisible();

        // 4. Click and Verify Redirect
        await loginLink.click();
        await expect(page).toHaveURL(/\/login/);

        const url = new URL(page.url());
        expect(url.searchParams.get('next')).toBe(`/p/${cardSlug}`);
    });
});
