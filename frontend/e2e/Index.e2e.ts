import { test, expect } from '@playwright/test';

test('should log in and access page', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    console.log('Initial page content:', await page.content());

    test.setTimeout(60000);

    await page.goto('http://localhost:3000/');

    console.log('Initial page content:', await page.content());
    test.setTimeout(60000);
    console.log('Initial page content:', await page.content());

    await page.fill('input[name="identifier"]', 'testuser08642testuser@gmail.com');
    await page.fill('input[name="password"]', '1es1password');
    await page.click('button[data-localization-key="formButtonPrimary"]');

    await expect(page.locator('h2')).toContainText('Welcome to itmo.board');

    await expect(page.locator('h2')).toContainText('Welcome to itmo.board');
});
