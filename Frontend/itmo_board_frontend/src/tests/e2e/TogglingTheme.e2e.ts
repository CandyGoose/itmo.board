import { test, expect } from '@playwright/test';

test('Clicking on ThemeToggleButton component changes background', async ({
    page,
}) => {
    await page.goto('http://localhost:3000/ru');

    // Получаем только rgb из строки
    const extractRGB = (color: string) => {
        const match = color.match(/\d+, \d+, \d+/);
        return match ? match[0] : '';
    };

    // Начальный цвет фона
    const initialBackgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    // Кнопка из компонента ThemeToggleButton
    await page.click('button:has-text("Switch to dark mode")'); // Текст может быть другим

    // Ожидание из-за transition в CSS
    await page.waitForTimeout(1000);

    // Цвет фона после смены темы
    const newBackgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(extractRGB(newBackgroundColor)).not.toBe(
        extractRGB(initialBackgroundColor),
    );

    await page.click('button:has-text("Switch to light mode")'); // Текст может быть другим

    await page.waitForTimeout(1000);

    const finalBackgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(extractRGB(finalBackgroundColor)).toBe(
        extractRGB(initialBackgroundColor),
    );
});
