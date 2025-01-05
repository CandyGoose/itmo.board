import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Board Export', () => {
    test('should export the board as an image', async ({ page }) => {

    });
});
