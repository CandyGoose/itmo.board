import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Create Board', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should found one board', async ({ page }) => {
        await page.getByPlaceholder('search boards').fill('untitle-0');
        const board = page.getByText('Untitle-0');
        await expect(board).toBeVisible();
    });

    test('should found one board', async ({ page }) => {
        await page.getByPlaceholder('search boards').fill('untitle-');
        const board1 = page.getByText('Untitle-0');
        const board2 = page.getByText('Untitle-1');
        await expect(board1).toBeVisible();
        await expect(board2).toBeVisible();
    });

    test('should show message if nothing found', async ({ page }) => {});
});
