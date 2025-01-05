import { test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Create Board', () => {
    test('should create a new board from the page-board page', async ({ page }) => {
        await page.goto('/');

        await page.getByLabel('Open organization switcher').click();
        await page.getByRole('menuitem', { name: 'org_name\'s logo org_name' }).click();

        await page.getByRole('button', { name: 'new board' }).click();
        page.getByText('Untitle-0')
    });

    test('should create a second board with a different name', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'new board' }).click();
        page.getByText('Untitle-0')
        page.getByText('Untitle-1')
    });
});
