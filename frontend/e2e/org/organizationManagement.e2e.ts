import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Organization Management', () => {
    test('should delete an existing organization', async ({ page }) => {
        await page.goto('/');

        await page.getByLabel('Open organization switcher').click();
        await page.locator('button', { hasText: 'org_name' }).click();

        await page.getByLabel('Open organization switcher').click();
        await page.getByRole('menuitem', { name: 'Manage' }).click();

        await page.getByRole('button', { name: 'Delete organization' }).click();
        await page.getByPlaceholder('org_name').fill('org_name');
        await page.getByRole('button', { name: 'Delete organization' }).click();

        const noOrganizationText = page.getByText(
            'organization to get started',
        );
        await expect(noOrganizationText).toBeVisible();
    });

    test('should create a new organization', async ({ page }) => {
        await page.goto('/');

        await page
            .getByRole('button', { name: 'create an organization' })
            .click();
        await page.getByPlaceholder('Organization name').fill('org_name');
        await page.getByRole('button', { name: 'Create organization' }).click();

        const newBoardButton = page.getByRole('button', { name: 'new board' });
        await expect(newBoardButton).toBeVisible();
    });
});
