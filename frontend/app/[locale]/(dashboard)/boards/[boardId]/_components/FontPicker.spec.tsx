import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FontPicker } from './FontPicker';
import {
    MAX_FONT_SIZE,
    MIN_FONT_SIZE,
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';
import { Fonts } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Fonts';

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: { [key: string]: string } = {
            font: 'Font',
            fontSize: 'Font Size',
        };
        return messages[key];
    },
}));

jest.mock('@/liveblocks.config', () => ({
    useMutation: jest.fn(),
}));

const FontPickerWrapper: React.FC<{
    initialFontName?: string;
    initialFontSize?: number;
    onFontChange?: jest.Mock;
    onFontSizeChange?: jest.Mock;
}> = ({
    initialFontName = Fonts[0],
    initialFontSize = 12,
    onFontChange = jest.fn(),
    onFontSizeChange = jest.fn(),
}) => {
    const [fontName, setFontName] = useState(initialFontName);
    const [fontSize, setFontSize] = useState(initialFontSize);

    const handleFontChange = (newFontName: string) => {
        setFontName(newFontName);
        onFontChange(newFontName);
    };

    const handleFontSizeChange = (newFontSize: number) => {
        setFontSize(newFontSize);
        onFontSizeChange(newFontSize);
    };

    return (
        <FontPicker
            fontName={fontName}
            onFontChange={handleFontChange}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
        />
    );
};

describe('FontPicker', () => {
    const mockOnFontChange = jest.fn();
    const mockOnFontSizeChange = jest.fn();

    const renderComponent = (props: {
        fontName?: string;
        fontSize?: number;
    }) => {
        return render(
            <FontPickerWrapper
                initialFontName={props.fontName}
                initialFontSize={props.fontSize}
                onFontChange={mockOnFontChange}
                onFontSizeChange={mockOnFontSizeChange}
                {...props}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the font label with translated text', () => {
        renderComponent({});

        const label = screen.getByText('Font');
        expect(label).toBeInTheDocument();
    });

    it('renders the font select with all font options', () => {
        renderComponent({});

        const select = screen.getByLabelText('Font');
        expect(select).toBeInTheDocument();

        Fonts.forEach((font) => {
            expect(
                screen.getByRole('option', { name: font }),
            ).toBeInTheDocument();
        });
    });

    it('select shows the correct initial font', () => {
        renderComponent({ fontName: Fonts[0] });

        const select = screen.getByLabelText('Font') as HTMLSelectElement;
        expect(select.value).toBe(Fonts[0]);
    });

    it('calls onFontChange when a different font is selected', async () => {
        renderComponent({});

        const select = screen.getByLabelText('Font') as HTMLSelectElement;
        await userEvent.selectOptions(select, Fonts[1]);

        expect(mockOnFontChange).toHaveBeenCalledTimes(1);
        expect(mockOnFontChange).toHaveBeenCalledWith(Fonts[1]);

        expect(select.value).toBe(Fonts[1]);
    });

    it('renders the font size label with translated text', () => {
        renderComponent({});

        const label = screen.getByText('Font Size');
        expect(label).toBeInTheDocument();
    });

    it('renders the font size input with correct initial value', () => {
        renderComponent({ fontSize: 20 });

        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.value).toBe('20');
    });

    it('calls onFontSizeChange when font size input changes to a valid number', async () => {
        renderComponent({ fontSize: 15 });

        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        await userEvent.clear(input);
        await userEvent.type(input, '25');
        await userEvent.tab();

        expect(mockOnFontSizeChange).toHaveBeenCalledTimes(4); // clear -> type x2 -> blur
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(1, NaN); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(2, 2); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(3, 25); // From onChange
        // Assuming onBlur clamps the value, but since 25 is within range, it should remain
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(4, 25); // From onBlur
    });

    it('calls onFontSizeChange with clamped MIN_FONT_SIZE when font size input is below MIN_FONT_SIZE on blur', async () => {
        renderComponent({ fontSize: 15 });

        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        await userEvent.clear(input);
        await userEvent.type(input, '5'); // Below MIN_FONT_SIZE
        await userEvent.tab();

        expect(mockOnFontSizeChange).toHaveBeenCalledTimes(3);
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(1, NaN); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(2, 5); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(3, MIN_FONT_SIZE); // From onBlur

        // Verify that the input value is clamped
        expect(input.value).toBe(MIN_FONT_SIZE.toString());
    });

    it('calls onFontSizeChange with clamped MAX_FONT_SIZE when font size input is above MAX_FONT_SIZE on blur', async () => {
        renderComponent({ fontSize: 15 });

        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        await userEvent.clear(input);
        await userEvent.type(input, '150'); // Above MAX_FONT_SIZE
        await userEvent.tab();

        expect(mockOnFontSizeChange).toHaveBeenCalledTimes(5);
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(1, NaN); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(2, 1); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(3, 15); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(4, 150); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(5, MAX_FONT_SIZE); // From onBlur

        // Verify that the input value is clamped
        expect(input.value).toBe(MAX_FONT_SIZE.toString());
    });

    it('calls onFontSizeChange with MIN_FONT_SIZE when font size input is invalid on blur', async () => {
        renderComponent({ fontSize: 15 });

        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        await userEvent.clear(input);
        await userEvent.type(input, 'abc'); // Invalid input
        await userEvent.tab(); // Triggers blur

        expect(mockOnFontSizeChange).toHaveBeenCalledTimes(2);
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(1, NaN); // From onChange
        expect(mockOnFontSizeChange).toHaveBeenNthCalledWith(2, MIN_FONT_SIZE); // From onBlur

        // Verify that the input value is clamped to MIN_FONT_SIZE
        expect(input.value).toBe(MIN_FONT_SIZE.toString());
    });

    it('ensures the font size input has correct min and max attributes', () => {
        renderComponent({});

        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        expect(input).toHaveAttribute('min', MIN_FONT_SIZE.toString());
        expect(input).toHaveAttribute('max', MAX_FONT_SIZE.toString());
    });
});
