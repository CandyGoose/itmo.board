'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggleButton() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Moon
                    data-testid="moon-icon"
                    className="h-[1.2rem] w-[1.2rem] transition-all"
                />
            ) : (
                <Sun
                    data-testid="sun-icon"
                    className="h-[1.2rem] w-[1.2rem] transition-all"
                />
            )}
        </Button>
    );
}
