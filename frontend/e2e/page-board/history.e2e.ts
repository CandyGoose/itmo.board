import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('History (Undo/Redo)', () => {
    test('should undo the last action', async ({ page }) => {});

    test('should redo the last undone action', async ({ page }) => {});
});
