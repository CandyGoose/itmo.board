import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const imageURL =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Lava_Lake_Nyiragongo_2.jpg/1200px-Lava_Lake_Nyiragongo_2.jpg?20110725120304';
const downloadPath = path.resolve(__dirname, './temp/test.jpg');

test.use({ storageState: 'storageState.json' });

test.describe('Images', () => {
    test.beforeAll(async () => {
        if (!fs.existsSync(path.dirname(downloadPath))) {
            fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
        }

        const response = await axios({
            url: imageURL,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(downloadPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    });

    test.afterAll(() => {
        if (fs.existsSync(downloadPath)) {
            fs.unlinkSync(downloadPath);
        }
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test('should upload an image to the board from local', async ({ page }) => {
        const uploadButton = page.locator('svg.lucide-image').locator('..');
        await uploadButton.click();

        await page.getByTestId('svg-element').nth(1).click();
        await page
            .locator('label')
            .filter({ hasText: 'Select from computer' })
            .click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(downloadPath);

        const image = page.locator('image').nth(1);
        await expect(image).toBeVisible();

        await image.click();
        const deleteButton = page.locator('svg.lucide-trash2').locator('..');
        await deleteButton.click();
    });

    test('should upload an image to the board from link', async ({ page }) => {
        const uploadButton = page.locator('svg.lucide-image').locator('..');
        await uploadButton.click();

        await page.getByTestId('svg-element').nth(1).click();
        await page
            .getByPlaceholder('https://example.com/image.png')
            .fill(imageURL);
        await page.getByRole('button', { name: 'Load' }).click();

        const image = page.locator('image').nth(1);
        await expect(image).toBeVisible();
    });

    test('should delete the image from the board', async ({ page }) => {
        const image = page.locator('image').nth(1);
        await expect(image).toBeVisible();

        await image.click();

        const deleteButton = page.locator('svg.lucide-trash2').locator('..');
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        await expect(image).not.toBeVisible();
    });
});
