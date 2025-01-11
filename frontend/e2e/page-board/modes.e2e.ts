import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Modes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });
    
    test('should restrict actions for read-only', async ({ page }) => {});

    test('should allow editing', async ({ page }) => {});
});
