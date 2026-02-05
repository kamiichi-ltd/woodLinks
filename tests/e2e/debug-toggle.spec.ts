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

// Admin client to bypass RLS for setup
const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Debug Toggle Functionality', () => {
    const TEST_EMAIL = `debug_toggle_${Date.now()}@example.com`;
    const TEST_PASSWORD = 'password123';
    let userId: string;
    let cardId: string;

    test.beforeAll(async () => {
        console.log('--- SETUP START ---');
        // 1. Create Test User
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
                slug: `debug-${Date.now()}`,
                title: 'Debug Toggle Card',
                user_id: userId, // Required legacy column
                owner_id: userId, // Assign to test user
                is_published: false, // Start as draft
                status: 'draft', // Explicitly set initial status
                // is_public: true // apparently column missing in DB
            })
            .select()
            .single();

        if (cardError) throw cardError;
        cardId = cardData.id;
        console.log('Created Test Card:', cardId);
        console.log('--- SETUP END ---');
    });

    test.afterAll(async () => {
        // Cleanup
        if (cardId) await supabase.from('cards').delete().eq('id', cardId);
        if (userId) await supabase.auth.admin.deleteUser(userId);
    });

    test('Analyze Toggle Click and Network', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard', { timeout: 15000 });

        // 2. Go to Card Edit Page
        const editUrl = `/dashboard/cards/${cardId}`;
        console.log(`Navigating to: ${editUrl}`);
        await page.goto(editUrl);

        // 3. Inspect DOM
        // In CardSettingsForm (User Dashboard), the label is linked via 'for'
        const switchLabel = page.locator('label[for="status"]');
        await expect(switchLabel).toBeVisible();

        const html = await switchLabel.innerHTML();
        console.log('--- DOM SNAPSHOT ---');
        console.log(html);
        console.log('--------------------');

        // 4. Setup Network Listener
        page.on('request', request => {
            if (request.method() === 'POST') console.log('>> Request:', request.url());
        });
        page.on('response', async response => {
            if (response.request().method() === 'POST' && response.url().includes('card-status')) { // Filter if possible, otherwise log all POSTs
                console.log('<< Response Status:', response.status());
                try {
                    const body = await response.json();
                    console.log('<< Response Body:', JSON.stringify(body, null, 2));
                } catch (e) {
                    console.log('<< Response Body: (Not JSON)');
                }
            }
            // Supabase calls / actions often go to specific endpoints
        });

        // Listen for console logs
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        // 5. Click the Switch
        console.log('Attempting to click switch...');
        // We click the input directly if visible, or the label
        // The HTML snapshot shows: <label ...><input ... />...</label>
        // Clicking label should trigger input.
        await switchLabel.click();

        // Wait a bit for action
        await page.waitForTimeout(3000);

        // 6. Verify DB State directly
        const { data: dbCard } = await supabase
            .from('cards')
            // Now expecting status column to be present in types if I ran generation, 
            // but relying on runtime query here.
            .select('is_published, status')
            .eq('id', cardId)
            .single();

        console.log('--- DB STATE ---');
        console.log('is_published:', dbCard?.is_published);
        console.log('status:', dbCard?.status);
        console.log('----------------');

        expect(dbCard?.is_published).toBe(true);
        expect(dbCard?.status).toBe('published');
    });
});
