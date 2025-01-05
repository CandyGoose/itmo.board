import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Draw', () => {
    test('should draw a line on the board', async ({ page }) => {

    });

    test('should delete the drawn line', async ({ page }) => {

    });
});
