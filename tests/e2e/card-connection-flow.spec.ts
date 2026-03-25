import { test, expect, Page } from '@playwright/test';
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

test.describe.configure({ mode: 'serial' });

test.describe('Card connection flow', () => {
    const OWNER_EMAIL = `connection_owner_${Date.now()}@example.com`;
    const LEAD_EMAIL = `connection_lead_${Date.now()}@example.com`;
    const TEST_PASSWORD = 'password123';

    let ownerUserId: string;
    let leadUserId: string;
    let cardId: string;
    let cardSlug: string;

    async function loginWithLeadUser(page: Page) {
        await page.fill('input[name="email"]', LEAD_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
    }

    async function getConnectionCount() {
        const { count, error } = await supabase
            .from('card_connections')
            .select('*', { count: 'exact', head: true })
            .eq('card_id', cardId)
            .eq('user_id', leadUserId);

        if (error) {
            throw new Error(`Failed to count card connections: ${error.message}`);
        }

        return count || 0;
    }

    async function clearConnections() {
        const { error } = await supabase
            .from('card_connections')
            .delete()
            .eq('card_id', cardId)
            .eq('user_id', leadUserId);

        if (error) {
            throw new Error(`Failed to clear card connections: ${error.message}`);
        }
    }

    test.beforeAll(async () => {
        const { data: ownerData, error: ownerError } = await supabase.auth.admin.createUser({
            email: OWNER_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true,
        });

        if (ownerError || !ownerData.user) {
            throw new Error(`Owner user creation failed: ${ownerError?.message}`);
        }

        ownerUserId = ownerData.user.id;

        const { data: leadData, error: leadError } = await supabase.auth.admin.createUser({
            email: LEAD_EMAIL,
            password: TEST_PASSWORD,
            email_confirm: true,
        });

        if (leadError || !leadData.user) {
            throw new Error(`Lead user creation failed: ${leadError?.message}`);
        }

        leadUserId = leadData.user.id;
        cardSlug = `connection-${Math.random().toString(36).slice(2, 12)}`;

        const { data: cardData, error: cardError } = await supabase
            .from('cards')
            .insert({
                slug: cardSlug,
                title: 'Card Connection Test Card',
                description: 'Lead capture verification card',
                user_id: ownerUserId,
                owner_id: ownerUserId,
                is_published: true,
                status: 'published',
            })
            .select()
            .single();

        if (cardError || !cardData) {
            throw new Error(`Card creation failed: ${cardError?.message}`);
        }

        cardId = cardData.id;
    });

    test.beforeEach(async () => {
        await clearConnections();
    });

    test.afterAll(async () => {
        if (cardId) {
            await supabase.from('card_connections').delete().eq('card_id', cardId);
            await supabase.from('cards').delete().eq('id', cardId);
        }

        if (leadUserId) {
            await supabase.auth.admin.deleteUser(leadUserId);
        }

        if (ownerUserId) {
            await supabase.auth.admin.deleteUser(ownerUserId);
        }
    });

    test('Guest clicking save is redirected to login with persisted parameters', async ({ page }) => {
        await page.goto(`/p/${cardSlug}`);

        const saveLink = page.getByRole('link', { name: 'LINEでこのカードを保存' });
        await expect(saveLink).toBeVisible();

        await saveLink.click();
        await page.waitForURL(/\/login/);

        const currentUrl = new URL(page.url());
        expect(currentUrl.pathname).toBe('/login');
        expect(currentUrl.searchParams.get('next')).toBe(`/p/${cardSlug}`);
        expect(currentUrl.searchParams.get('action')).toBe('save');
    });

    test('Login with save parameters redirects back and inserts a card connection', async ({ page }) => {
        await page.goto(`/login?next=${encodeURIComponent(`/p/${cardSlug}`)}&action=save`);

        await loginWithLeadUser(page);

        await page.waitForURL(
            (url) => url.pathname === `/p/${cardSlug}` && url.searchParams.get('saved') === '1',
            { timeout: 15000 }
        );

        await expect(page.getByRole('button', { name: 'LINEで保存済み' })).toBeVisible({ timeout: 10000 });

        expect(await getConnectionCount()).toBe(1);
    });

    test('Running the save flow twice does not crash and does not duplicate the connection', async ({ page }) => {
        await page.goto(`/login?next=${encodeURIComponent(`/p/${cardSlug}`)}&action=save`);

        await loginWithLeadUser(page);

        await page.waitForURL(
            (url) => url.pathname === `/p/${cardSlug}` && url.searchParams.get('saved') === '1',
            { timeout: 15000 }
        );
        await expect(page.getByRole('button', { name: 'LINEで保存済み' })).toBeVisible({ timeout: 10000 });
        expect(await getConnectionCount()).toBe(1);

        await page.goto(`/login?next=${encodeURIComponent(`/p/${cardSlug}`)}&action=save`);

        await page.waitForURL(
            (url) => url.pathname === `/p/${cardSlug}` && url.searchParams.get('saved') === '1',
            { timeout: 15000 }
        );

        await expect(page.getByRole('button', { name: 'LINEで保存済み' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('h1').getByText('Card Connection Test Card')).toBeVisible();
        expect(await getConnectionCount()).toBe(1);
    });
});
