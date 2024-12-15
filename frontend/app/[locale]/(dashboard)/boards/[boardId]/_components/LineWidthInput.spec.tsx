import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineWidthInput } from './LineWidthInput';

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: { [key: string]: string } = {
            lineWidth: 'Line Width',
        };
        return messages[key];
    },
}));

describe('LineWidthInput', () => {
    const mockOnLineWidthChange = jest.fn();

    const renderComponent = (
        lineWidth: number = 1,
        onLineWidthChange = mockOnLineWidthChange,
    ) => {
        render(
            <LineWidthInput
                lineWidth={lineWidth}
                onLineWidthChange={onLineWidthChange}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the label with translated text', () => {
        renderComponent();

        const label = screen.getByLabelText('Line Width');
        expect(label).toBeInTheDocument();
    });

    it('renders the input with the correct initial value', () => {
        renderComponent(5);

        const input = screen.getByLabelText('Line Width') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.value).toBe('5');
    });

    it('renders the preview div with correct height', () => {
        const lineWidth = 10;
        renderComponent(lineWidth);

        const previewDiv = screen.getByRole('presentation', { hidden: true });
        expect(previewDiv).toBeInTheDocument();
        expect(previewDiv).toHaveStyle(`height: ${lineWidth}px`);
    });

    it('calls onLineWidthChange with the new value when input changes to a valid number', () => {
        renderComponent(2);

        const input = screen.getByLabelText('Line Width') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '4' } });

        expect(mockOnLineWidthChange).toHaveBeenCalledTimes(1);
        expect(mockOnLineWidthChange).toHaveBeenCalledWith(4);
    });

    it('does not call onLineWidthChange when input changes to an invalid number', () => {
        renderComponent(3);

        const input = screen.getByLabelText('Line Width') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'abc' } });

        expect(mockOnLineWidthChange).not.toHaveBeenCalled();
    });

    it('does not call onLineWidthChange when input is cleared (empty)', () => {
        renderComponent(3);

        const input = screen.getByLabelText('Line Width') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        expect(mockOnLineWidthChange).not.toHaveBeenCalled();
    });

    it('ensures the input has a minimum value of 1', () => {
        renderComponent();

        const input = screen.getByLabelText('Line Width') as HTMLInputElement;
        expect(input).toHaveAttribute('min', '1');
    });

    it('updates the preview div height when lineWidth prop changes', () => {
        const { rerender } = render(
            <LineWidthInput
                lineWidth={2}
                onLineWidthChange={mockOnLineWidthChange}
            />,
        );

        const previewDiv = screen.getByRole('presentation', { hidden: true });
        expect(previewDiv).toHaveStyle('height: 2px');

        rerender(
            <LineWidthInput
                lineWidth={8}
                onLineWidthChange={mockOnLineWidthChange}
            />,
        );
        expect(previewDiv).toHaveStyle('height: 8px');
    });
});
