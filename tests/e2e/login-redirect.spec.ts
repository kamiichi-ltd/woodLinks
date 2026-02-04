import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL!;
const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password'; // Assuming we have a way to know password or create user

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Login Redirect Flow', () => {
    const TEST_REDIRECT_PATH = '/p/redirect-test-card';
    const TEST_EMAIL = `redirect_test_${Date.now()}@example.com`;
    const TEST_PASSWORD = 'password123';

    test.beforeAll(async () => {
        // 1. Create a Test User
        // We use signUp to create a new user to ensure we know the password
        const { data, error } = await supabase.auth.signUp({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });

        // If user exists or other error, ensure we handle it
        if (error) {
            // If "User already registered", that's fine, we might proceed if we know password.
            // But better to use generated email.
            console.log('User setup error (might trigger email confirm):', error.message);
        }

        // Auto-confirm if needed (Supabase local usually disables confirm, but if enabled:)
        // We can update the user to confirmed using admin api
        if (data.user && !data.user.email_confirmed_at) {
            await supabase.auth.admin.updateUserById(data.user.id, { email_confirm: true });
        }
    });

    test.afterAll(async () => {
        // Cleanup: Delete the test user
        // First get ID
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users.find(u => u.email === TEST_EMAIL);
        if (user) {
            await supabase.auth.admin.deleteUser(user.id);
        }
    });

    test('Login with ?next= param redirects correctly', async ({ page }) => {
        // 1. Visit Login Page with Next Param
        // We expect to be redirected to TEST_REDIRECT_PATH after login
        // Note: The path implies it's a card page. It might 404 if card doesn't exist, but URL should be correct.
        const loginUrl = `/login?next=${encodeURIComponent(TEST_REDIRECT_PATH)}`;
        await page.goto(loginUrl);

        // 2. Fill Login Form
        // Ensure we are in "Login" mode (default)
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);

        // 3. Submit
        // Wait for navigation
        await page.click('button[type="submit"]');

        // 4. Verification
        // Expect URL to be TEST_REDIRECT_PATH
        // We use waitForURL becase of potential intermediate redirects
        await page.waitForURL((url) => url.pathname === TEST_REDIRECT_PATH, { timeout: 10000 });

        // Verify current URL
        const url = new URL(page.url());
        expect(url.pathname).toBe(TEST_REDIRECT_PATH);
    });
});
