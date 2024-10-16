'use client';

import useTheme from '@/stores/useTheme';

export default function ThemeToggleButton() {
    const theme = useTheme((state) => state.theme);
    const toggleTheme = useTheme((state) => state.toggleTheme);

    // TODO: The component will be implemented correctly later
    return (
        <button onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
        </button>
    );
}
