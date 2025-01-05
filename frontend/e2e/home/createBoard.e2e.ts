import { test } from '@playwright/test';

test.describe('Create Board', () => {
    test('should create a new board from the home page', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'new board' }).click();
        page.getByText('Untitle-0')
    });

    test('should create a second board with a different name', async ({ page }) => {
        await page.getByRole('button', { name: 'new board' }).click();
        page.getByText('Untitle-1')
    });
});
