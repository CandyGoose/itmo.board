import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Styles', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
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
