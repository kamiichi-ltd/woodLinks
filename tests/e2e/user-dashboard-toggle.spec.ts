import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('User Dashboard Toggle Functionality', () => {
    const TEST_EMAIL = `user_toggle_${Date.now()}@example.com`;
    const TEST_PASSWORD = 'password123';
    let userId: string;
    let cardId: string;

    test.beforeAll(async () => {
        console.log('--- SETUP START ---');
        // 1. Create Normal User
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true
        });
        if (userError) throw userError;
        userId = userData.user.id;
        console.log('Created Test User:', userId);

        // 2. Create Test Card
        const { data: cardData, error: cardError } = await supabase
            .from('cards')
            .insert({
                slug: `user-dash-${Date.now()}`,
                title: 'User Dashboard Card',
                user_id: userId,
                owner_id: userId,
                is_published: false,
            })
            .select()
            .single();

        if (cardError) throw cardError;
        cardId = cardData.id;
        console.log('Created Test Card:', cardId);
        console.log('--- SETUP END ---');
    });

    test.afterAll(async () => {
        if (cardId) await supabase.from('cards').delete().eq('id', cardId);
        if (userId) await supabase.auth.admin.deleteUser(userId);
    });

    test('User can toggle status on Dashboard', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // 2. Go to User Dashboard Edit Page
        const editUrl = `/dashboard/cards/${cardId}`;
        console.log(`Navigating to: ${editUrl}`);
        await page.goto(editUrl);

        // 3. Inspect DOM
        let switchLabel;
        try {
            // Target the label linked to the input
            switchLabel = page.locator('label[for="status"]');

            await expect(switchLabel).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('!!! ELEMENT NOT FOUND !!! URL:', page.url());
            throw e;
        }

        // 4. Click the Switch (Label)
        console.log('Attempting to click switch...');
        await switchLabel.click();

        await page.waitForTimeout(3000);

        // 5. Verify DB State
        const { data: dbCard } = await supabase
            .from('cards')
            .select('is_published')
            .eq('id', cardId)
            .single();

        console.log('--- DB STATE ---');
        console.log('is_published:', dbCard?.is_published);

        expect(dbCard?.is_published).toBe(true);
    });
});
