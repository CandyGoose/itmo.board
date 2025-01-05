import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Multi-User Collaboration', () => {
    test('should allow two users to draw on the same board', async ({ page }) => {

    });

    test('should update objects in real time for all users', async ({ page }) => {

    });
});
