import { expect, test, BrowserContext, Page } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Styles', () => {
    let context: BrowserContext;
    let sharedPage: Page;

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext({
            storageState: 'storageState.json',
        });
        sharedPage = await context.newPage();

        await sharedPage.goto('/');
        await sharedPage.getByText('Untitle-0').click();
        await sharedPage
            .locator('svg.lucide-sticky-note')
            .locator('..')
            .click();

        const clickX = 100;
        const clickY = 400;

        await sharedPage.mouse.click(clickX, clickY);
        await sharedPage.waitForTimeout(500);
    });

    test.afterAll(async () => {
        const note = sharedPage.getByTestId('note-content-editable').nth(1)
        await note.dblclick();

        const deleteButton = sharedPage
            .locator('svg.lucide-trash2')
            .locator('..');
        await expect(deleteButton).toBeVisible();
        await deleteButton.dblclick();

        await expect(note).not.toBeVisible();

        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();

        const note = page.getByTestId('note-foreign-object').nth(1);
        await expect(note).toBeVisible();

        await note.click();

        await page.getByRole('button', { name: 'styles' }).click();
    });

    test.describe('Styles List', () => {
        test('should display line width', async ({ page }) => {
            await expect(page.getByLabel('Line width')).toBeVisible();
        });

        test('should display coordinates', async ({ page }) => {
            await expect(page.getByLabel('X', { exact: true })).toBeVisible();
            await expect(page.getByLabel('Y', { exact: true })).toBeVisible();
        });

        test('should display parameters', async ({ page }) => {
            await expect(page.getByTestId('selection-tools-container').locator('div').filter({ hasText: 'WidthHeight' }).locator('#input1')).toBeVisible();
            await expect(page.getByTestId('selection-tools-container').locator('div').filter({ hasText: 'WidthHeight' }).locator('#input2')).toBeVisible();
        });

        test('should display font', async ({ page }) => {
            await expect(page.getByLabel('Font', { exact: true })).toBeVisible();
        });

        test('should display format', async ({ page }) => {
            await expect(page.getByLabel('Bold')).toBeVisible();
            await expect(page.getByLabel('Italic')).toBeVisible();
            await expect(page.getByLabel('Strike Through')).toBeVisible();
        });

        test('should display alignment', async ({ page }) => {
            await expect(page.getByLabel('Left Aligned')).toBeVisible();
            await expect(page.getByLabel('Center Aligned')).toBeVisible();
            await expect(page.getByLabel('Right Aligned')).toBeVisible();
        });
    });

    test.describe('Object Styles', () => {
        test('should apply color to object', async ({ page }) => {});

        test('should change font size of text', async ({ page }) => {});

        test('should change font of text', async ({ page }) => {});
    });
});
