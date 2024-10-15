'use client';

import useTheme from '@/stores/useTheme';

export const ThemeToggleButton = () => {
    const theme = useTheme((state) => state.theme);
    const toggleTheme = useTheme((state) => state.toggleTheme);

    return (
        <button onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
        </button>
    );
};
