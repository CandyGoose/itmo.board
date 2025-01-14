import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Create Board', () => {
    test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
        const screenshotPath = `screenshots/${testInfo.title}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved screenshot: ${screenshotPath}`);
    }
    });
    test('should create a new board from the page-board page', async ({
        page,
    }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'new board' }).dblclick();
        const firstBoard = page.getByText('Untitle-0');
        await expect(firstBoard).toBeVisible();
    });

    test('should create a second board with a different name', async ({
        page,
    }) => {
        await page.goto('/');

        const firstBoard = page.getByText('Untitle-0');
        await expect(firstBoard).toBeVisible();

        await page.getByRole('button', { name: 'new board' }).click();
        const secondBoard = page.getByText('Untitle-1');
        await expect(secondBoard).toBeVisible();
    });
});
