import { test, expect, BrowserContext } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Multi-User Collaboration', () => {
    let context1: BrowserContext;
    let context2: BrowserContext;

    test.beforeEach(async ({ browser }) => {
        context1 = await browser.newContext({ storageState: 'storageState.json' });
        context2 = await browser.newContext({ storageState: 'storageState.json' });

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        await page1.goto('/');
        await page2.goto('/');

        await page1.getByText('Untitle-0').click();
        await page2.getByText('Untitle-0').click();
    });

});
