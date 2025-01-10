import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Board Actions', () => {
    test.describe('Board Actions on board', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            await page.getByText('Untitle-0').click();
            const menuButton = page.locator('svg.lucide-menu').locator('..');
            await expect(menuButton).toBeVisible();
            await menuButton.click();
        });

        test('should copy the board link to clipboard on board', async ({ page }) => {
            const copyLinkButton = page.getByRole('menuitem', { name: 'Copy link' });
            await expect(copyLinkButton).toBeVisible();
            await copyLinkButton.click();

            const notification = page.getByRole('menuitem', { name: 'Copy link' });
            await expect(notification).toBeVisible();
        });

        test('should delete the board on board', async ({ page }) => {});
    });

    test.describe('Board Actions in org', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
        });

        test('should copy the board link to clipboard in org', async ({ page }) => {});

        test('should rename the board in org', async ({ page }) => {});

        test('should navigate to the main menu in org', async ({ page }) => {});

        test('should delete the board in org', async ({ page }) => {});
    });
});
