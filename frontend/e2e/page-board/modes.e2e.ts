import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Modes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test('should restrict actions for read-only', async ({ page }) => {
        const toggleButton = page.locator('svg.lucide-pencil-ruler').locator('..');
        await toggleButton.click();
        await page.getByRole('menuitem', { name: 'View only' }).click();

        const squareTool = page.locator('svg.lucide-square').locator('..');
        const isSquareToolDisabled = await squareTool.isDisabled();
        expect(isSquareToolDisabled).toBe(true);
    });

    test('should allow editing', async ({ page }) => {
        const toggleButton = page.locator('svg.lucide-pencil-ruler').locator('..');
        await toggleButton.click();
        await page.getByRole('menuitem', { name: 'Edit mode' }).click();

        const squareTool = page.locator('svg.lucide-square').locator('..');
        const isSquareToolDisabled = await squareTool.isDisabled();
        expect(isSquareToolDisabled).toBe(false);
    });
});
