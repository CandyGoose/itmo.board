import { test, expect, BrowserContext } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Multi-User Collaboration', () => {
    let context1: BrowserContext;
    let context2: BrowserContext;

    test.beforeEach(async ({ browser }) => {
        context1 = await browser.newContext({ storageState: 'storageState.json' });
        context2 = await browser.newContext({ storageState: 'storageState.json' });

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        await page1.goto('/');
        await page2.goto('/');

        await page1.getByText('Untitle-0').click();
        await page2.getByText('Untitle-0').click();
    });

    test('should update objects in real time for all users', async () => {
        const page1 = context1.pages()[0];
        const page2 = context2.pages()[0];

        const svg1 = page1.locator('svg[data-testid="svg-element"]');
        const svg2 = page2.locator('svg[data-testid="svg-element"]');

        await page1.locator('svg.lucide-square').locator('..').click();
        await page1.mouse.click(100, 100);
        await page1.waitForTimeout(500);
        const square1 = svg1.locator('rect').nth(3);

        const square2 = svg2.locator('g').filter({ hasText: 'Teammate' }).locator('rect');

        const boundingBox = await square2.boundingBox();
        if (!boundingBox) {
            throw new Error('Bounding box not found for square');
        }

        const resizeHandleX = boundingBox.x + boundingBox.width;
        const resizeHandleY = boundingBox.y + boundingBox.height;

        await page2.mouse.click(resizeHandleX, resizeHandleY);

        await page2.mouse.move(resizeHandleX, resizeHandleY);
        await page2.mouse.down();
        await page2.mouse.move(resizeHandleX + 50, resizeHandleY + 50);
        await page2.mouse.up();

        await square1.click();
        const deleteButton = page1
            .locator('svg.lucide-trash2')
            .locator('..');
        await expect(deleteButton).toBeVisible();
        await deleteButton.dblclick();

        if (!(await square1.isVisible())) {
            await deleteButton.click();
        }

        await page2.waitForTimeout(500);
        await expect(square2).not.toBeVisible();
    });

    test.afterEach(async () => {
        await context1.close();
        await context2.close();
    });
});
