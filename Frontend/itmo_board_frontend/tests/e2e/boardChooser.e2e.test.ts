import { test, expect } from '@playwright/test';

test('Проверка отображения текста "тест"', async ({ page }) => {
    await page.goto('http://localhost:3000/ru');

    const heading = page.locator('h1');
    await expect(heading).toHaveText('тест');
});
