import { chromium } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
        throw new Error(
            'Переменные окружения TEST_USERNAME и TEST_PASSWORD должны быть установлены',
        );
    }

    await page.goto(process.env.BASE_URL || 'http://localhost:3000');

    await page.getByPlaceholder('Enter your email address').fill(username);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Continue' }).click();

    const logoLink = page.getByRole('link', { name: 'Logo itmo.board' });
    await logoLink.waitFor({ state: 'visible', timeout: 10000 });

    await page.context().storageState({ path: 'storageState.json' });

    await browser.close();
}

export default globalSetup;
