import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

import { expect, test, BrowserContext, Page } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Styles', () => {
    let context: BrowserContext;
    let sharedPage: Page;

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext({ storageState: 'storageState.json' });
        sharedPage = await context.newPage();

        await sharedPage.goto('/');
        await sharedPage.getByText('Untitle-0').click();
        await sharedPage.locator('svg.lucide-sticky-note').locator('..').click();

        const board = sharedPage.locator('svg[data-testid="svg-element"]');
        const clickX = 100;
        const clickY = 400;

        await sharedPage.mouse.click(clickX, clickY);
        await sharedPage.waitForTimeout(500);

        const note = board.getByTestId('note-foreign-object').nth(1);
        await expect(note).toBeVisible();
    });

    test.afterAll(async () => {
        const note = sharedPage.getByText('New Note Content').nth(1);
        await note.dblclick();

        const deleteButton = sharedPage.locator('svg.lucide-trash2').locator('..');
        await expect(deleteButton).toBeVisible();
        await deleteButton.dblclick();

        await expect(note).not.toBeVisible();

        await context.close();
    });

    test.describe('Styles List', () => {
        test('should display styles menu', async ({ page }) => {});

        test('should display line width', async ({ page }) => {});

        test('should display coordinates', async ({ page }) => {});

        test('should display parameters', async ({ page }) => {});

        test('should display font', async ({ page }) => {});

        test('should display format', async ({ page }) => {});

        test('should display alignment', async ({ page }) => {});
    });

    test.describe('Object Styles', () => {
        test('should apply color to object', async ({ page }) => {});

        test('should change font size of text', async ({ page }) => {});

        test('should change font of text', async ({ page }) => {});
    });
});
