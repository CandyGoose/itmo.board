'use client';

import { useEffect } from 'react';
import useTheme from '@/stores/useTheme';

const ThemeProvider = () => {
    const theme = useTheme((state) => state.theme);

    useEffect(() => {
        if (theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    return null;
};

export default ThemeProvider;
