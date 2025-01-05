import { test } from '@playwright/test';

test.describe('Home Page Elements', () => {
    test('should display all main elements on the page', async ({ page }) => {
        await page.goto('/');

        page.getByRole('link', { name: 'Logo itmo.board' });
        page.getByLabel('Open organization switcher');
        page.getByPlaceholder('search boards');
        page.getByRole('button', { name: 'Language Switch' });
        page.getByLabel('Toggle theme');

        page.getByText('create an organization to get');
        page.getByRole('button', { name: 'create an organization' });
    });
});