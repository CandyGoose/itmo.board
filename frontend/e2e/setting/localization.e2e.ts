import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Localization Switch', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should switch language to Russian', async ({ page }) => {});
});
