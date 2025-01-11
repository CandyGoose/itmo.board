import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Multi-User Collaboration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test('should allow two users to draw on the same board', async ({
        page,
    }) => {});

    test('should update objects in real time for all users', async ({
        page,
    }) => {});
});
