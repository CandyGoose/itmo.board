import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';

describe('Footer Component', () => {
    const defaultProps = {
        title: 'Sample Title',
        createdAtLabel: '2023-01-01',
        disabled: false,
    };

    test('renders title correctly', () => {
        render(<Footer {...defaultProps} />);

        const titleElement = screen.getByText(defaultProps.title);
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass('text-[13px]');
    });

    test('renders createdAtLabel correctly', () => {
        render(<Footer {...defaultProps} />);

        const createdAtElement = screen.getByText(defaultProps.createdAtLabel);
        expect(createdAtElement).toBeInTheDocument();
        expect(createdAtElement).toHaveClass('text-[11px]');
    });

    test('button has correct styles when disabled', () => {
        render(<Footer {...defaultProps} disabled={true} />);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('cursor-not-allowed opacity-75');
    });

    test('button has correct styles when enabled', () => {
        render(<Footer {...defaultProps} disabled={false} />);

        const button = screen.getByRole('button');
        expect(button).toBeEnabled();
        expect(button).toHaveClass('opacity-0 group-hover:opacity-100');
    });

    test('createdAtLabel has correct hover styles', () => {
        render(<Footer {...defaultProps} />);

        const createdAtElement = screen.getByText(defaultProps.createdAtLabel);
        expect(createdAtElement).toHaveClass(
            'opacity-0 group-hover:opacity-100 transition-opacity',
        );
    });

    test('title is truncated correctly', () => {
        render(<Footer {...defaultProps} />);

        const titleElement = screen.getByText(defaultProps.title);
        expect(titleElement).toHaveClass('truncate max-w-[calc(100%-20px)]');
    });

    test('createdAtLabel is truncated correctly', () => {
        render(<Footer {...defaultProps} />);

        const createdAtElement = screen.getByText(defaultProps.createdAtLabel);
        expect(createdAtElement).toHaveClass('truncate');
    });
});
