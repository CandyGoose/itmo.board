import { expect, Page, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

async function drawLineWithSteps(
    page: Page,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    steps = 10,
    delay = 100,
) {
    const deltaX = (endX - startX) / steps;
    const deltaY = (endY - startY) / steps;

    for (let i = 0; i <= steps; i++) {
        const currentX = startX + deltaX * i;
        const currentY = startY + deltaY * i;
        await page.mouse.move(currentX, currentY);
        await page.waitForTimeout(delay);
    }
}

test.describe('Draw', () => {
    test('should draw a square', async ({ page }) => {
        await page.goto('/');

        await page.getByText('Untitle-0').click();
        await page.locator('svg.lucide-pencil').locator('..').click();

        const svg = page.locator('svg[data-testid="svg-element"]').nth(1);
        await svg.hover();

        const startX = 0;
        const startY = 100;
        const mid1X = 1000;
        const mid1Y = 100;
        const mid2X = 1000;
        const mid2Y = 1000;
        const endX = 0;
        const endY = 1000;

        await page.mouse.move(startX, startY);
        await page.mouse.down();

        await drawLineWithSteps(page, startX, startY, mid1X, mid1Y, 50, 50);
        await drawLineWithSteps(page, mid1X, mid1Y, mid2X, mid2Y, 50, 50);
        await drawLineWithSteps(page, mid2X, mid2Y, endX, endY, 50, 50);
        await drawLineWithSteps(page, endX, endY, startX, startY, 50, 50);

        await page.mouse.up();

        const path = svg.locator('path').first();
        await expect(path).toBeVisible();

        const d = await path.getAttribute('d');

        expect(d).toMatch(/^M 0 -0.5/);
        expect(d).toMatch(/Z$/);
    });

    test('should delete the drawn line', async ({ page }) => {
        await page.goto('/');

        await page.getByText('Untitle-0').click();

        const svg = page.locator('svg[data-testid="svg-element"]').nth(1);

        const path = svg.locator('path').first();
        await expect(path).toBeVisible();

        await page.mouse.dblclick(10, 100);

        await page.keyboard.press('Delete');

        await expect(path).not.toBeVisible();
    });
});
