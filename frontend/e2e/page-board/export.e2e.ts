import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.use({ storageState: 'storageState.json' });

test.describe('Board Export', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();

        const menuButton = page.locator('svg.lucide-menu').locator('..');
        await menuButton.click();

        const downloadMenu = page.getByTestId('download-sub-menu');
        await expect(downloadMenu).toBeVisible();
        await downloadMenu.hover();
    });

    test('should export the board as a PNG', async ({ page }) => {
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('menuitem', { name: 'Download as PNG' }).click(),
        ]);

        const filePath = await download.path();
        const fileName = download.suggestedFilename();

        expect(fs.existsSync(filePath)).toBeTruthy();
        expect(fileName.endsWith('.png')).toBeTruthy();
    });

    test('should export the board as an SVG', async ({ page }) => {
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('menuitem', { name: 'Download as SVG' }).click(),
        ]);

        const filePath = await download.path();
        const fileName = download.suggestedFilename();

        expect(fs.existsSync(filePath)).toBeTruthy();
        expect(fileName.endsWith('.svg')).toBeTruthy();
    });
});
