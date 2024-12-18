import { render, screen } from '@testing-library/react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useTheme } from '@/providers/ThemeProvider';
import '@testing-library/jest-dom';

jest.mock('@/providers/ThemeProvider', () => ({
    useTheme: jest.fn(),
}));

describe('ThemeToggleButton', () => {
    const setTheme = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('отображает Sun иконку при светлой теме', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme });

        render(<ThemeToggleButton />);

        const button = screen.getByRole('button', { name: /toggle theme/i });

        expect(button).toBeInTheDocument();
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    test('отображает Moon иконку при темной теме', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', setTheme });

        render(<ThemeToggleButton />);

        const button = screen.getByRole('button', { name: /toggle theme/i });

        expect(button).toBeInTheDocument();
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });
});
