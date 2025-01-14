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

module.exports = {
    setupFilesAfterEnv: ['./jest.setup.js'],
};


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

function FontPickerWrapper(props: {
    initialFontName?: string;
    initialFontSize?: number;
    onFontChange: jest.Mock<any, any, any>;
    onFontSizeChange: jest.Mock<any, any, any>;
}) {
    const {
        initialFontName = Fonts[0],
        initialFontSize = 12,
        onFontChange,
        onFontSizeChange,
    } = props;

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
            noteWidth={200}
            noteHeight={100}
            noteText="Sample text"
        />
    );
}

describe('FontPicker', () => {
    const mockOnFontChange = jest.fn();
    const mockOnFontSizeChange = jest.fn();

    beforeAll(() => {
        HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
            if (contextId === '2d') {
                return {
                    measureText: jest.fn(() => ({ width: 50 })),
                    fillText: jest.fn(),
                    strokeText: jest.fn(),
                    beginPath: jest.fn(),
                    closePath: jest.fn(),
                    clearRect: jest.fn(),
                    save: jest.fn(),
                    restore: jest.fn(),
                    moveTo: jest.fn(),
                    lineTo: jest.fn(),
                    rect: jest.fn(),
                    stroke: jest.fn(),
                    fill: jest.fn(),
                    arc: jest.fn(),
                    fillStyle: '',
                    strokeStyle: '',
                    font: '',
                    canvas: document.createElement('canvas'),
                } as unknown as CanvasRenderingContext2D;
            }
            return null;
        }) as unknown as jest.Mock;
    });

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
            expect(screen.getByRole('option', { name: font })).toBeInTheDocument();
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

    it('ensures the font size input has correct min and max attributes', () => {
        renderComponent({});
        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        expect(input).toHaveAttribute('min', MIN_FONT_SIZE.toString());
        expect(input).toHaveAttribute('max', MAX_FONT_SIZE.toString());
    });

    it('prevents setting font size below the minimum limit', async () => {
        renderComponent({});
        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        await userEvent.clear(input);
        await userEvent.type(input, '1');
        await userEvent.keyboard('{Enter}');
        expect(mockOnFontSizeChange).toHaveBeenCalledWith(MIN_FONT_SIZE);
    });

    it('calls onFontSizeChange when valid font size is entered and confirmed with Enter', async () => {
        renderComponent({});
        const input = screen.getByLabelText('Font Size') as HTMLInputElement;
        await userEvent.clear(input);
        await userEvent.type(input, '25');
        await userEvent.keyboard('{Enter}');
        expect(mockOnFontSizeChange).toHaveBeenCalledWith(25);
    });
});
