import { renderHook, waitFor } from '@testing-library/react';

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('uses dark theme when stored in localStorage', async () => {
        localStorage.setItem('theme-storage', 'dark');

        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());

        await waitFor(() => {
            expect(result.current.theme).toBe('dark');
        });
    });

    it('respects the system preference when no theme is stored', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: query === '(prefers-color-scheme: dark)',
                addListener: jest.fn(),
                removeListener: jest.fn(),
            })),
        });

        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');
    });

});