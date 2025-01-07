import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Shapes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test.describe('Note', () => {
        test('should add a note to the board', async ({ page }) => {
            await page.locator('svg.lucide-sticky-note').locator('..').click();

            const board = page.locator('svg[data-testid="svg-element"]');
            const clickX = 100;
            const clickY = 400;

            await page.mouse.click(clickX, clickY);
            await page.waitForTimeout(500);

            const note = board.getByTestId('note-foreign-object').nth(1);
            await expect(note).toBeVisible();
        });

        test('should edit the note content', async ({ page }) => {
            const note = page.getByTestId('note-foreign-object').nth(1);
            await expect(note).toBeVisible();

            const textDiv = page.getByText('Text').nth(1);
            await expect(textDiv).toBeVisible();

            await textDiv.fill('New Note Content');

            await expect(page.getByText('New Note Content').nth(1)).toBeVisible();
        });

        test('should delete the note', async ({ page }) => {
            const note = page.getByText('New Note Content').nth(1);

            await note.dblclick();

            const deleteButton = page.locator('svg.lucide-trash2').locator('..');
            await expect(deleteButton).toBeVisible();
            await deleteButton.dblclick();

            if (!await note.isVisible()) {
                await deleteButton.click();
            }
            await expect(note).not.toBeVisible();
        });
    });


    test.describe('Squares', () => {
        test('should add a square to the board', async ({ page }) => {
            await page.locator('svg.lucide-square').locator('..').click();

            const board = page.locator('svg[data-testid="svg-element"]');
            const clickX = 300;
            const clickY = 400;

            await page.mouse.click(clickX, clickY);
            await page.waitForTimeout(500);

            const square = board.locator('rect').nth(3);
            await expect(square).toBeVisible();
        });

        test('should resize the square', async ({ page }) => {
            const square = page.locator('rect').nth(3);
            await expect(square).toBeVisible();

            const boundingBox = await square.boundingBox();
            if (!boundingBox) {
                throw new Error('Bounding box not found for square');
            }

            const resizeHandleX = boundingBox.x + boundingBox.width;
            const resizeHandleY = boundingBox.y + boundingBox.height;

            await page.mouse.move(resizeHandleX, resizeHandleY);
            await page.mouse.down();
            await page.mouse.move(resizeHandleX + 50, resizeHandleY + 50);
            await page.mouse.up();

            const newWidth = await square.getAttribute('width');
            const newHeight = await square.getAttribute('height');

            expect(Number(newWidth)).toBeGreaterThanOrEqual(100);
            expect(Number(newHeight)).toBeGreaterThanOrEqual(100);
        });

        test('should delete the square', async ({ page }) => {
            const square = page.locator('rect').nth(3);

            await square.click();
            const deleteButton = page.locator('svg.lucide-trash2').locator('..');
            await expect(deleteButton).toBeVisible();
            await deleteButton.dblclick();

            if (!await square.isVisible()) {
                await deleteButton.click();
            }
            await expect(square).not.toBeVisible();
        });
    });

    test.describe('Circles', () => {
        test('should add a circle to the board', async ({ page }) => {
            await page.locator('svg.lucide-circle').locator('..').click();

            const board = page.locator('svg[data-testid="svg-element"]');
            const clickX = 500;
            const clickY = 400;

            await page.mouse.click(clickX, clickY);
            await page.waitForTimeout(500);

            const circle = board.locator('ellipse').nth(1);
            await expect(circle).toBeVisible();
        });

        test('should resize the circle', async ({ page }) => {
            const circle = page.locator('ellipse').nth(1);
            await expect(circle).toBeVisible();

            const boundingBox = await circle.boundingBox();
            if (!boundingBox) {
                throw new Error('Bounding box not found for circle');
            }

            const resizeHandleX = boundingBox.x + boundingBox.width;
            const resizeHandleY = boundingBox.y + boundingBox.height;

            await page.mouse.move(resizeHandleX, resizeHandleY);
            await page.mouse.down();
            await page.mouse.move(resizeHandleX + 50, resizeHandleY + 50);
            await page.mouse.up();

            const newXRadius = await circle.getAttribute('rx');
            const newYRadius = await circle.getAttribute('ry');
            expect(Number(newXRadius)).toBeGreaterThanOrEqual(50);
            expect(Number(newYRadius)).toBeGreaterThanOrEqual(50);
        });

        test('should delete the circle', async ({ page }) => {
            const circle = page.locator('ellipse').nth(1);

            await circle.click();
            const deleteButton = page.locator('svg.lucide-trash2').locator('..');
            await expect(deleteButton).toBeVisible();
            await deleteButton.dblclick();

            if (!await circle.isVisible()) {
                await deleteButton.click();
            }
            await expect(circle).not.toBeVisible();
        });
    });
});
