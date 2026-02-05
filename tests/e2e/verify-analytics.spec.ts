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

test.describe('Analytics PV Verification', () => {
    let cardId: string;
    let cardSlug: string;
    let userId: string;
    const TEST_EMAIL = `analytics_${Date.now()}@example.com`;
    const TEST_PASSWORD = 'password123';

    test.beforeAll(async () => {
        // 1. Create a User (Owner)
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true
        });
        if (userError) throw new Error(`User creation failed: ${userError.message}`);
        userId = userData.user!.id;

        // 2. Create a Card (Published)
        cardSlug = `analytics-${Math.random().toString(36).substring(2, 12)}`;
        const { data: newCard, error: cardError } = await supabase
            .from('cards')
            .insert({
                slug: cardSlug,
                title: 'Analytics Test Card',
                description: 'For PV Verification',
                user_id: userId,
                owner_id: userId, // Owned by the user
                is_published: true,
                status: 'published'
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

    test('Page View is correctly counted', async ({ page, browser }) => {
        // 1. Login as Owner to check initial count
        await page.goto('/login');
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard'); // or redirect default

        // 2. Go to User Dashboard Card Details (where Analytics is now shown)
        // Since we exposed analytics in the user dashboard, we can test it there.
        await page.goto(`/dashboard/cards/${cardId}`);

        // Wait for Analytics component to load
        await expect(page.getByText('アクセス解析')).toBeVisible({ timeout: 10000 });

        // Get Initial Count
        // Locating the number below "総閲覧数"
        // Structure: div > span("総閲覧数") ... div(count)
        // Using locator chaining
        // Check visibility of headers
        try {
            await expect(page.getByText('アクセス解析')).toBeVisible({ timeout: 5000 });
            await expect(page.getByText('総閲覧数')).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('Main headers not found. Dumping body text:');
            console.log(await page.locator('body').innerText());
            throw e;
        }

        // Get Initial Count
        // Fix selector specificity: Use .bg-white
        const initialCountElement = page.locator('.bg-white').filter({ hasText: '総閲覧数' }).locator('.text-2xl').first();
        await expect(initialCountElement).toBeVisible();
        const initialCountText = await initialCountElement.innerText();

        console.log(`Debug: Initial Text found: "${initialCountText}"`);
        const initialCount = parseInt(initialCountText.replace(/,/g, ''), 10);
        console.log(`Initial View Count: ${initialCount}`);

        // 3. Visit Public Page as Guest (New Context)
        const guestContext = await browser.newContext();
        const guestPage = await guestContext.newPage();

        await guestPage.goto(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/p/${cardSlug}`);

        // Wait for page to verify it loaded
        // Wait for page to verify it loaded (Target h1 to avoid title tag conflict)
        await expect(guestPage.locator('h1').getByText('Analytics Test Card')).toBeVisible();

        // Wait for analytics DB write (Server Action is fire-and-forget but usually fast)
        await guestPage.waitForTimeout(3000);

        // Close guest page
        await guestPage.close();

        // 4. Refresh Admin Page and Verify Increment
        await page.reload();
        await expect(page.getByText('アクセス解析')).toBeVisible();

        // Fix selector specificity: Use .bg-white to target the card, not the page container
        const finalCountElement = page.locator('.bg-white').filter({ hasText: '総閲覧数' }).locator('.text-2xl').first();
        await expect(finalCountElement).toBeVisible();
        const finalCountText = await finalCountElement.innerText();
        const finalCount = parseInt(finalCountText.replace(/,/g, ''), 10);
        console.log(`Final View Count: ${finalCount}`);

        expect(finalCount).toBeGreaterThan(initialCount);
        // Ideally exactly +1, but concurrency might affect it. 
        // Since we created a fresh card and fresh user, it should be exactly +1 (unless self-visit counted?)
        // Assuming self-visit in step 2 might have counted?
        // If step 2 counted, initial is 1?
        // Step 1: Login. Step 2: Admin view. Admin view usually filters out admin visits? 
        // Our logic in `logEvent`: if (user) -> check logic.
        // Let's just assert GreaterThan.
        expect(finalCount).toBe(initialCount + 1);
    });
});
