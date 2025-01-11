import { test, expect, BrowserContext, Page } from '@playwright/test';

let context: BrowserContext;
let page: Page;

test.describe('Layers', () => {
    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext({
            storageState: 'storageState.json',
        });
        page = await context.newPage();
        await page.goto('/');
        await page.getByText('Untitle-0').click();

        await page.locator('svg.lucide-square').locator('..').click();
        await page.mouse.click(100, 100);
        await page.waitForTimeout(500);

        await page.locator('svg.lucide-circle').locator('..').dblclick();
        await page.mouse.click(100, 300);
        await page.waitForTimeout(500);
    });

    test.afterAll(async () => {
        const rectangle = page.locator('rect').nth(3);
        const circle = page.locator('ellipse').nth(1);
        const deleteButton = page.locator('svg.lucide-trash2').locator('..');

        await rectangle.dblclick();
        await deleteButton.dblclick();
        await circle.click();
        await deleteButton.dblclick();
    });

    test('should move an object to the front layer', async () => {
        const rectangle = page.locator('rect').nth(3);
        const circle = page.locator('ellipse').nth(1);

        await expect(rectangle).toBeVisible();
        await expect(circle).toBeVisible();

        await rectangle.click();

        const layersButton = page
            .locator('svg.lucide-ellipsis-vertical')
            .locator('..');
        await layersButton.click();

        const bringToFront = page
            .locator('svg.lucide-bring-to-front')
            .locator('..');
        await bringToFront.click();

        const group = page.getByTestId('svg-group').nth(1);

        const lastElement = group.locator('rect, ellipse').last();
        expect(
            await lastElement.evaluate((el) => el.tagName.toLowerCase()),
        ).toBe('rect');

        const firstElement = group.locator('rect, ellipse').first();
        expect(
            await firstElement.evaluate((el) => el.tagName.toLowerCase()),
        ).toBe('ellipse');
    });
});
