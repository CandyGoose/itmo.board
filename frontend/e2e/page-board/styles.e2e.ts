import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Object Styles', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test('should apply color to an object', async ({ page }) => {});

    test('should change font size of text', async ({ page }) => {});
});
