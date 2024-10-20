import { renderHook } from '@testing-library/react';

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('uses light theme when stored in localStorage', () => {
        localStorage.setItem('theme-storage', 'light');

        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());

        expect(result.current.theme).toBe('light');
    });

    it('respects the system light preference when no theme is stored', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: query === '(prefers-color-scheme: light)',
                addListener: jest.fn(),
                removeListener: jest.fn(),
            })),
        });

        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('light');
    });
});
