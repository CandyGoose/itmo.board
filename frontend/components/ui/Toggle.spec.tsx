import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toggle } from './Toggle';

describe('Toggle Component', () => {
    test('renders Toggle with default props', () => {
        render(<Toggle data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toBeInTheDocument();
        expect(toggleButton).toHaveClass(
            'inline-flex',
            'bg-transparent',
            'h-10',
            'px-3',
        );
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('renders Toggle with variant="outline"', () => {
        render(<Toggle variant="outline" data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toHaveClass(
            'border',
            'border-input',
            'bg-transparent',
        );
    });

    test('renders Toggle with size="sm"', () => {
        render(<Toggle size="sm" data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toHaveClass('h-9', 'px-2.5');
    });

    test('renders Toggle with size="lg"', () => {
        render(<Toggle size="lg" data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toHaveClass('h-11', 'px-5');
    });

    test('toggles state on click', () => {
        render(<Toggle data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');

        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(toggleButton);
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(toggleButton);
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
        expect(toggleButton).toHaveClass('bg-transparent');
    });

    test('applies additional className', () => {
        render(<Toggle className="custom-class" data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toHaveClass('custom-class');
    });

    test('is disabled when disabled prop is true', () => {
        render(<Toggle disabled data-testid="toggle" />);

        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toBeDisabled();
        expect(toggleButton).toHaveClass(
            'disabled:pointer-events-none',
            'disabled:opacity-50',
        );
    });
});
