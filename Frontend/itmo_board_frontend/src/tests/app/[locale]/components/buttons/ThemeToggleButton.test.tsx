import { render, screen, fireEvent } from '@testing-library/react';
import useTheme from '@/stores/useTheme';
import ThemeToggleButton from '@/app/[locale]/components/buttons/ThemeToggleButton';

describe('ThemeToggleButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders button with correct initial theme text', () => {
        useTheme.setState({ theme: 'light', toggleTheme: jest.fn() });
        render(<ThemeToggleButton />);
        expect(screen.getByRole('button')).toHaveTextContent(
            'Switch to dark mode',
        );
    });

    it('toggles theme on button click', () => {
        const toggleThemeMock = jest.fn();
        useTheme.setState({ theme: 'light', toggleTheme: toggleThemeMock });
        render(<ThemeToggleButton />);
        fireEvent.click(screen.getByRole('button'));
        expect(toggleThemeMock).toHaveBeenCalled();
    });

    it('renders button with dark theme text when theme is dark', () => {
        useTheme.setState({ theme: 'dark', toggleTheme: jest.fn() });
        render(<ThemeToggleButton />);
        expect(screen.getByRole('button')).toHaveTextContent(
            'Switch to light mode',
        );
    });
});
