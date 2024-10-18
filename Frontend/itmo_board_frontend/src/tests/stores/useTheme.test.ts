import { renderHook, act } from '@testing-library/react';

describe('useTheme (persist)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should toggle theme between light and dark', () => {
        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());

        // Initial theme (based on system or default setup)
        const initialTheme = result.current.theme;

        // Toggle theme
        act(() => {
            result.current.toggleTheme();
        });

        // Ensure theme has toggled
        expect(result.current.theme).toBe(
            initialTheme === 'light' ? 'dark' : 'light',
        );
        expect(
            JSON.parse(<string>localStorage.getItem('theme-storage')).state
                .theme,
        ).toBe(result.current.theme);

        // Toggle back to initial state
        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe(initialTheme);
        expect(
            JSON.parse(<string>localStorage.getItem('theme-storage')).state
                .theme,
        ).toBe(initialTheme);
    });

    test('should set theme explicitly via setTheme', () => {
        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());

        // Set theme to 'light'
        act(() => {
            result.current.setTheme('light');
        });
        expect(result.current.theme).toBe('light');
        expect(
            JSON.parse(<string>localStorage.getItem('theme-storage')).state
                .theme,
        ).toBe('light');

        // Set theme to 'dark'
        act(() => {
            result.current.setTheme('dark');
        });
        expect(result.current.theme).toBe('dark');
        expect(
            JSON.parse(<string>localStorage.getItem('theme-storage')).state
                .theme,
        ).toBe('dark');
    });
});
