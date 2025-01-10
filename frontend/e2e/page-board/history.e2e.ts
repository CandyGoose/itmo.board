import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('History (Undo/Redo)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test('should undo the last action', async ({ page }) => {
        await page.locator('svg.lucide-square').locator('..').click();
        const board = page.locator('svg[data-testid="svg-element"]');
        const clickX = 300;
        const clickY = 300;
        await page.mouse.click(clickX, clickY);

        const square = board.locator('rect').nth(3);
        await expect(square).toBeVisible();

        const undoButton = page.locator('svg.lucide-undo2').locator('..');
        await expect(undoButton).toBeVisible();
        await undoButton.dblclick();

        await expect(square).not.toBeAttached();
    });

    test('should redo the last undone action', async ({ page }) => {
        await page.locator('svg.lucide-square').locator('..').click();
        const board = page.locator('svg[data-testid="svg-element"]');
        const clickX = 300;
        const clickY = 300;
        await page.mouse.click(clickX, clickY);

        const square = board.locator('rect').nth(3);
        await expect(square).toBeVisible();

        const undoButton = page.locator('svg.lucide-undo2').locator('..');
        await expect(undoButton).toBeVisible();
        await undoButton.dblclick();

        await expect(square).not.toBeAttached();

        const redoButton = page.locator('svg.lucide-redo2').locator('..');
        await expect(redoButton).toBeVisible();
        await redoButton.click();

        await expect(square).toBeVisible();

        await undoButton.click();
    });
});
