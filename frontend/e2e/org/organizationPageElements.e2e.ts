import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Home Page Elements', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display the logo', async ({ page }) => {
        const logo = page.getByRole('link', { name: 'Logo itmo.board' });
        await expect(logo).toBeVisible();
    });

    test('should display the organization switcher', async ({ page }) => {
        const orgSwitcher = page.getByLabel('Open organization switcher');
        await expect(orgSwitcher).toBeVisible();
    });

    test('should display the search boards input', async ({ page }) => {
        const searchBoards = page.getByPlaceholder('search boards');
        await expect(searchBoards).toBeVisible();
    });

    test('should display the language switch button', async ({ page }) => {
        const langSwitch = page.getByRole('button', {
            name: 'Language Switch',
        });
        await expect(langSwitch).toBeVisible();
    });

    test('should display the theme toggle', async ({ page }) => {
        const themeToggle = page.getByLabel('Toggle theme');
        await expect(themeToggle).toBeVisible();
    });
});
