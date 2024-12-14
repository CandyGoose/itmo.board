import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransparentFillChecker } from './TransparentFillChecker';

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: { [key: string]: string } = {
            transparentFill: 'Transparent Fill',
        };
        return messages[key];
    },
}));

describe('TransparentFillChecker Component', () => {
    const defaultProps = {
        transparentFill: false,
        onTransparentFillChange: jest.fn(),
    };

    const setup = (props = {}) => {
        const finalProps = { ...defaultProps, ...props };
        const { container } = render(<TransparentFillChecker {...finalProps} />);
        const checkbox = screen.getByRole('checkbox', { name: /transparent fill/i });
        const label = screen.getByText('Transparent Fill');
        return { container, checkbox, label, props: finalProps };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        const { checkbox, label } = setup();
        expect(checkbox).toBeInTheDocument();
        expect(label).toBeInTheDocument();
    });

    test('checkbox reflects the transparentFill prop (checked)', () => {
        const { checkbox } = setup({ transparentFill: true });
        expect(checkbox).toBeChecked();
    });

    test('checkbox reflects the transparentFill prop (unchecked)', () => {
        const { checkbox } = setup({ transparentFill: false });
        expect(checkbox).not.toBeChecked();
    });

    test('calls onTransparentFillChange with true when checkbox is checked', () => {
        const { checkbox } = setup({ transparentFill: false });
        fireEvent.click(checkbox);
        expect(defaultProps.onTransparentFillChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onTransparentFillChange).toHaveBeenCalledWith(true);
    });

    test('calls onTransparentFillChange with false when checkbox is unchecked', () => {
        const { checkbox } = setup({ transparentFill: true });
        fireEvent.click(checkbox);
        expect(defaultProps.onTransparentFillChange).toHaveBeenCalledTimes(1);
        expect(defaultProps.onTransparentFillChange).toHaveBeenCalledWith(false);
    });

    test('displays the correct translated label', () => {
        const { label } = setup();
        expect(label).toBeInTheDocument();
    });

    test('applies the correct class names', () => {
        const { container, checkbox, label } = setup();
        const wrapperDiv = container.firstChild;

        expect(wrapperDiv).toHaveClass('flex');
        expect(wrapperDiv).toHaveClass('items-center');
        expect(wrapperDiv).toHaveClass('justify-center');
        expect(wrapperDiv).toHaveClass('mt-1');

        expect(checkbox).toHaveClass('mr-2');
        expect(label).toHaveClass('text-sm');
    });
});
