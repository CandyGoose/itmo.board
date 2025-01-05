import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test('should log in', async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
        throw new Error(
            'Environment variables TEST_USERNAME and TEST_PASSWORD must be set',
        );
    }

    await page.goto('/');

    await page.getByPlaceholder('Enter your email address').fill(username);

    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    
    await page.getByPlaceholder('Enter your password').fill(password);

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('heading', { name: 'welcome to itmo.board' }).click();

    await page.context().storageState({ path: 'storageState.json' });
});