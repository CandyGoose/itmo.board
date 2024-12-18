import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
    };
})();
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('ThemeProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
    });

    const TestComponent = () => {
        const { theme, setTheme } = useTheme();

        return (
            <div>
                <div data-testid="current-theme">Current theme: {theme}</div>
                <button onClick={() => setTheme('light')}>Light</button>
                <button onClick={() => setTheme('dark')}>Dark</button>
                <button onClick={() => setTheme('system')}>System</button>
            </div>
        );
    };

    test('устанавливает начальную тему из localStorage', () => {
        localStorage.setItem('theme', 'dark');

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        );

        expect(screen.getByTestId('current-theme')).toHaveTextContent(
            'Current theme: dark',
        );
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.getAttribute('data-theme')).toBe(
            'dark',
        );
    });

    test('изменяет тему на system', async () => {
        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        );

        userEvent.click(screen.getByText('System'));

        expect(screen.getByTestId('current-theme')).toHaveTextContent(
            'Current theme: system',
        );
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(document.documentElement.getAttribute('data-theme')).toBe(
            'system',
        );
        expect(localStorage.getItem('theme')).toBe('system');
    });

    test('выбрасывает ошибку, если useTheme используется вне ThemeProvider', () => {
        const consoleError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        expect(() => render(<TestComponent />)).toThrowError(
            'useTheme must be used within a ThemeProvider',
        );

        consoleError.mockRestore();
    });
});
