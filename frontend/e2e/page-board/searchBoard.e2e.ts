import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Create Board', () => {
    test('should found board', async ({ page }) => {});

    test('should show message if nothing found', async ({ page }) => {});
});
