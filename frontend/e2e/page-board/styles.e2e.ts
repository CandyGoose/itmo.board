import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Styles', () => {
    test('should display styles settings', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
        await page
            .locator('svg.lucide-sticky-note')
            .locator('..')
            .click();

        const clickX = 100;
        const clickY = 100;

        await page.mouse.click(clickX, clickY);
        await page.waitForTimeout(500);
        
        await page.getByRole('button', { name: 'styles' }).click();

        await expect(page.getByLabel('Line width')).toBeVisible();
    
        await expect(page.getByLabel('X', { exact: true })).toBeVisible();
        await expect(page.getByLabel('Y', { exact: true })).toBeVisible();
    
        await expect(page.getByTestId('selection-tools-container').locator('div').filter({ hasText: 'WidthHeight' }).locator('#input1')).toBeVisible();
        await expect(page.getByTestId('selection-tools-container').locator('div').filter({ hasText: 'WidthHeight' }).locator('#input2')).toBeVisible();
    
        await expect(page.getByLabel('Font', { exact: true })).toBeVisible();

        await expect(page.getByLabel('Bold')).toBeVisible();
        await expect(page.getByLabel('Italic')).toBeVisible();
        await expect(page.getByLabel('Strike Through')).toBeVisible();
        await expect(page.getByLabel('Left Aligned')).toBeVisible();
        await expect(page.getByLabel('Center Aligned')).toBeVisible();
        await expect(page.getByLabel('Right Aligned')).toBeVisible();

        const deleteButton = page
            .locator('svg.lucide-trash2')
            .locator('..');
        await expect(deleteButton).toBeVisible();
        await deleteButton.dblclick();
    });
});
