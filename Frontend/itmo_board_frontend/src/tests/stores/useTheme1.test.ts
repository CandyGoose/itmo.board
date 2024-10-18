import { renderHook } from '@testing-library/react';
// This file and useTheme2.test.ts are separated because when together they cause a conflict
// Neither, jest.resetModules() nor jest.isolateModules() helped
// I couldn't find a way to fix it, so I just separated them
describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('respects the system dark preference when no theme is stored', () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: query === '(prefers-color-scheme: dark)',
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }));

        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');
    });

    it('uses dark theme when stored in localStorage', () => {
        localStorage.setItem('theme-storage', 'dark');

        const useTheme = require('@/stores/useTheme').default;
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');
    });
});
