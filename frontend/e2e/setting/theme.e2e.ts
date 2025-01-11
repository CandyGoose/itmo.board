import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Theme Switch', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should toggle between light and dark theme', async ({ page }) => {});
});
