import { test, expect } from '@playwright/test';

test('Clicking on ThemeToggleButton component changes background', async ({
    page,
}) => {
    await page.goto('http://localhost:3000/ru');

    // Начальный цвет фона
    const initialBackgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    // Кнопка из компонента ThemeToggleButton
    await page.click('[data-testid="theme-toggle-button"]');

    // Ожидание завершения всех анимаций
    await page.evaluate(() =>
        Promise.all(
            document.body
                .getAnimations({ subtree: true })
                .map((animation) => animation.finished),
        ),
    );

    // Цвет фона после смены темы
    const newBackgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(newBackgroundColor).not.toBe(initialBackgroundColor);

    await page.click('[data-testid="theme-toggle-button"]');

    // Ожидание завершения всех анимаций
    await page.evaluate(() =>
        Promise.all(
            document.body
                .getAnimations({ subtree: true })
                .map((animation) => animation.finished),
        ),
    );

    const finalBackgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(finalBackgroundColor).not.toBe(newBackgroundColor);
});
