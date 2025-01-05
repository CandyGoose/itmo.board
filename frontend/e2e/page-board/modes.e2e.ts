import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Modes', () => {
    test('should restrict actions for read-only', async ({ page }) => {

    });

    test('should allow editing', async ({ page }) => {

    });
});
