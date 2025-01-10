import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Images', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test('should upload an image to the board from local', async ({ page }) => {
        const uploadButton = page.locator('svg.lucide-image').locator('..');
        await uploadButton.click();

        await page.getByTestId('svg-element').nth(1).click();
        await page.locator('label').filter({ hasText: 'Select from computer' }).click();

        const filePath = './e2e/img/test.jpg';
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(filePath);

        const image = page.locator('image').nth(1);
        await expect(image).toBeVisible();
    });

    test('should upload an image to the board from link', async ({ page }) => {});

    test('should move the image on the board', async ({ page }) => {
        const image = page.locator('image').nth(1);
        await expect(image).toBeVisible();

        const boundingBox = await image.boundingBox();
        if (!boundingBox) {
            throw new Error('Bounding box not found for image');
        }

        const startX = boundingBox.x + boundingBox.width / 2;
        const startY = boundingBox.y + boundingBox.height / 2;
        const endX = startX + 100;
        const endY = startY + 100;

        await page.mouse.click(startX, startY);

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY);
        await page.mouse.up();

        const newBoundingBox = await image.boundingBox();
        expect(newBoundingBox?.x).toBeCloseTo(endX - boundingBox.width / 2, 1);
        expect(newBoundingBox?.y).toBeCloseTo(endY - boundingBox.height / 2, 1);
    });

    test('should delete the image from the board', async ({ page }) => {
        const image = page.locator('image').nth(1);
        expect(image).toBeVisible();

        await image.click();

        const deleteButton = page.locator('svg.lucide-trash2').locator('..');
        expect(deleteButton).toBeVisible();
        await deleteButton.click();

        expect(image).not.toBeVisible();
    });
});
