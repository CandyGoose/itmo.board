import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SelectionTools } from './SelectionTools';
import '@testing-library/jest-dom';
import {
    Layer,
    LayerType,
    NoteLayer,
    PathLayer,
    TextAlign,
    TextFormat,
} from '@/types/canvas';

jest.mock('./ColorPicker', () => ({
    ColorPicker: jest.fn(({ onChangeAction }) => (
        <button
            data-testid="color-picker-button"
            onClick={() => onChangeAction({ r: 255, g: 0, b: 0 })}
        >
            MockColorPicker
        </button>
    )),
}));

jest.mock('./TransparentFillChecker', () => ({
    TransparentFillChecker: jest.fn(
        ({ transparentFill, onTransparentFillChange }) => (
            <button
                data-testid="transparent-fill-checker-button"
                onClick={() => onTransparentFillChange(!transparentFill)}
            >
                MockTransparentFillChecker
            </button>
        ),
    ),
}));

jest.mock('./LineWidthInput', () => ({
    LineWidthInput: jest.fn(({ lineWidth, onLineWidthChange }) => (
        <input
            data-testid="line-width-input"
            value={lineWidth}
            onChange={(e) => onLineWidthChange(Number(e.target.value))}
        />
    )),
}));

jest.mock('./TwoValueInput', () => ({
    TwoValueInput: jest.fn(
        ({ label1, label2, value1, value2, onChange1, onChange2 }) => (
            <div data-testid="two-value-input">
                <label>
                    {label1}
                    <input
                        data-testid={`two-value-input-${label1.toLowerCase()}`}
                        value={value1}
                        onChange={(e) => onChange1(Number(e.target.value))}
                    />
                </label>
                <label>
                    {label2}
                    <input
                        data-testid={`two-value-input-${label2.toLowerCase()}`}
                        value={value2}
                        onChange={(e) => onChange2(Number(e.target.value))}
                    />
                </label>
            </div>
        ),
    ),
}));

jest.mock('./FontPicker', () => ({
    FontPicker: jest.fn(
        ({ fontName, onFontChange, fontSize, onFontSizeChange }) => (
            <div data-testid="font-picker">
                <input
                    data-testid="font-picker-name"
                    value={fontName}
                    onChange={(e) => onFontChange(e.target.value)}
                />
                <input
                    data-testid="font-picker-size"
                    type="number"
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                />
            </div>
        ),
    ),
}));

jest.mock('./TextFormatPicker', () => ({
    TextFormatPicker: jest.fn(({ onFormatChange }) => (
        <div data-testid="text-format-picker">
            <button
                data-testid="text-format-button"
                onClick={() =>
                    onFormatChange({ textFormat: ['Bold'], textAlign: 'left' })
                }
            >
                MockTextFormatPicker
            </button>
        </div>
    )),
}));

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const messages: { [key: string]: string } = {
            width: 'Width',
            height: 'Height',
        };
        return messages[key];
    },
}));

describe('SelectionTools', () => {
    const defaultProps = {
        selectedLayers: [],
        onColorChange: jest.fn(),
        lineWidth: 2,
        onLineWidthChange: jest.fn(),
        fontName: 'Arial',
        onFontChange: jest.fn(),
        fontSize: 12,
        onFontSizeChange: jest.fn(),
        fontAlign: TextAlign.Left,
        onTextAlignChange: jest.fn(),
        fontFormat: [TextFormat.None],
        onTextFormatChange: jest.fn(),
        onPositionChange: jest.fn(),
        onSizeChange: jest.fn(),
        transparentFill: false,
        onTransparentFillChange: jest.fn(),
        className: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing with no selected layers', () => {
        render(<SelectionTools {...defaultProps} />);
        const container = screen.getByTestId('selection-tools-container');
        expect(container).toBeInTheDocument();
    });

    it('applies additional className if provided', () => {
        const additionalClass = 'custom-class';
        render(
            <SelectionTools {...defaultProps} className={additionalClass} />,
        );
        const container = screen.getByTestId('selection-tools-container');
        expect(container).toHaveClass(additionalClass);
    });

    it('renders color picker and handles color change', () => {
        const mockColorChange = jest.fn();
        render(
            <SelectionTools
                {...defaultProps}
                onColorChange={mockColorChange}
            />,
        );
        const colorPickerButton = screen.getByTestId('color-picker-button');
        fireEvent.click(colorPickerButton);
        expect(mockColorChange).toHaveBeenCalledWith({ r: 255, g: 0, b: 0 });
    });

    it('renders TransparentFillChecker and handles toggle', () => {
        const mockTransparentFillChange = jest.fn();
        render(
            <SelectionTools
                {...defaultProps}
                transparentFill={false}
                onTransparentFillChange={mockTransparentFillChange}
            />,
        );
        const fillCheckerButton = screen.getByTestId(
            'transparent-fill-checker-button',
        );
        fireEvent.click(fillCheckerButton);
        expect(mockTransparentFillChange).toHaveBeenCalledWith(true);
    });

    it('renders LineWidthInput and handles change', () => {
        const mockLineWidthChange = jest.fn();
        render(
            <SelectionTools
                {...defaultProps}
                lineWidth={5}
                onLineWidthChange={mockLineWidthChange}
            />,
        );
        const lineWidthInput = screen.getByTestId('line-width-input');
        fireEvent.change(lineWidthInput, { target: { value: '10' } });
        expect(mockLineWidthChange).toHaveBeenCalledWith(10);
    });

    it('renders TwoValueInput for position and handles changes', () => {
        const selectedLayer = {
            id: '1',
            type: LayerType.Note,
            x: 100,
            y: 200,
            width: 300,
            height: 400,
            fontName: 'Arial',
            fontSize: 14,
            textFormat: [TextFormat.None],
            textAlign: TextAlign.Center,
        } as NoteLayer;

        const mockOnPositionChange = jest.fn();
        const mockOnSizeChange = jest.fn();

        render(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayer]}
                onPositionChange={mockOnPositionChange}
                onSizeChange={mockOnSizeChange}
            />,
        );

        const xInput = screen.getByTestId('two-value-input-x');
        const yInput = screen.getByTestId('two-value-input-y');
        const widthInput = screen.getByTestId('two-value-input-width');
        const heightInput = screen.getByTestId('two-value-input-height');

        fireEvent.change(xInput, { target: { value: '150' } });
        fireEvent.change(yInput, { target: { value: '250' } });
        fireEvent.change(widthInput, { target: { value: '350' } });
        fireEvent.change(heightInput, { target: { value: '450' } });

        expect(mockOnPositionChange).toHaveBeenCalledWith(150, 200);
        expect(mockOnPositionChange).toHaveBeenCalledWith(100, 250);
        expect(mockOnSizeChange).toHaveBeenCalledWith(350, 400);
        expect(mockOnSizeChange).toHaveBeenCalledWith(300, 450);
    });

    it('renders FontPicker and handles font changes when single Note is selected', () => {
        const selectedLayer = {
            id: '1',
            type: LayerType.Note,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fontName: 'Times New Roman',
            fontSize: 16,
            textFormat: [TextFormat.Italic],
            textAlign: TextAlign.Right,
        } as NoteLayer;
        const mockFontChange = jest.fn();
        const mockFontSizeChange = jest.fn();

        render(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayer]}
                onFontChange={mockFontChange}
                onFontSizeChange={mockFontSizeChange}
            />,
        );

        const fontNameInput = screen.getByTestId('font-picker-name');
        const fontSizeInput = screen.getByTestId('font-picker-size');

        fireEvent.change(fontNameInput, { target: { value: 'Verdana' } });
        fireEvent.change(fontSizeInput, { target: { value: '18' } });

        expect(mockFontChange).toHaveBeenCalledWith('Verdana');
        expect(mockFontSizeChange).toHaveBeenCalledWith(18);
    });

    it('renders TextFormatPicker and handles format changes when single Note is selected', () => {
        const selectedLayer = {
            id: '1',
            type: LayerType.Note,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fontName: 'Arial',
            fontSize: 14,
            textFormat: [TextFormat.Strike],
            textAlign: TextAlign.Left,
        } as NoteLayer;
        const mockTextFormatChange = jest.fn();
        const mockTextAlignChange = jest.fn();

        render(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayer]}
                onTextFormatChange={mockTextFormatChange}
                onTextAlignChange={mockTextAlignChange}
            />,
        );

        const formatButton = screen.getByTestId('text-format-button');
        fireEvent.click(formatButton);

        expect(mockTextFormatChange).toHaveBeenCalledWith(['Bold']);
        expect(mockTextAlignChange).toHaveBeenCalledWith('left');
    });

    it('does not render Text formatting tools when multiple layers are selected', () => {
        const layers = [
            {
                id: '1',
                type: LayerType.Note,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            },
            {
                id: '2',
                type: LayerType.Path,
                x: 10,
                y: 10,
                width: 200,
                height: 200,
            },
        ] as NoteLayer[];
        render(<SelectionTools {...defaultProps} selectedLayers={layers} />);
        expect(screen.queryByTestId('font-picker')).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('text-format-picker'),
        ).not.toBeInTheDocument();
    });

    it('does not render TransparentFillChecker when selected layer is a Path', () => {
        const selectedLayer = {
            id: '1',
            type: LayerType.Path,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        } as PathLayer;
        render(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayer]}
                transparentFill={false}
                onTransparentFillChange={jest.fn()}
            />,
        );
        expect(
            screen.queryByTestId('transparent-fill-checker-button'),
        ).not.toBeInTheDocument();
    });

    it('renders TransparentFillChecker based on selected layer fill', () => {
        const selectedLayerWithFill = {
            id: '1',
            type: LayerType.Note,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fill: { r: 255, g: 255, b: 255 },
            fontName: 'Arial',
            fontSize: 12,
            textAlign: TextAlign.Left,
            textFormat: [TextFormat.None],
        } as NoteLayer;
        const selectedLayerWithoutFill = {
            id: '2',
            type: LayerType.Note,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        } as NoteLayer;

        const { rerender } = render(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayerWithFill]}
                onTransparentFillChange={jest.fn()}
            />,
        );
        expect(
            screen.getByTestId('transparent-fill-checker-button'),
        ).toBeInTheDocument();

        rerender(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayerWithoutFill]}
                onTransparentFillChange={jest.fn()}
            />,
        );
        expect(
            screen.getByTestId('transparent-fill-checker-button'),
        ).toBeInTheDocument();
    });

    it('renders null when multiple layers are selected', () => {
        const layers = [
            {
                id: '1',
                type: LayerType.Note,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
            },
            {
                id: '2',
                type: LayerType.Path,
                x: 10,
                y: 10,
                width: 200,
                height: 200,
            },
        ] as Layer[];
        const { container } = render(
            <SelectionTools {...defaultProps} selectedLayers={layers} />,
        );
        expect(container.firstChild).toBeNull();
    });

    it('handles position and size changes correctly', () => {
        const selectedLayer = {
            id: '1',
            type: LayerType.Note,
            x: 50,
            y: 60,
            width: 150,
            height: 160,
            fontName: 'Arial',
            fontSize: 12,
            textAlign: TextAlign.Left,
            textFormat: [TextFormat.None],
        } as NoteLayer;
        const mockPositionChange = jest.fn();
        const mockSizeChange = jest.fn();

        render(
            <SelectionTools
                {...defaultProps}
                selectedLayers={[selectedLayer]}
                onPositionChange={mockPositionChange}
                onSizeChange={mockSizeChange}
            />,
        );

        const xInput = screen.getByTestId('two-value-input-x');
        const yInput = screen.getByTestId('two-value-input-y');
        const widthInput = screen.getByTestId('two-value-input-width');
        const heightInput = screen.getByTestId('two-value-input-height');

        fireEvent.change(xInput, { target: { value: '70' } });
        fireEvent.change(yInput, { target: { value: '80' } });
        fireEvent.change(widthInput, { target: { value: '170' } });
        fireEvent.change(heightInput, { target: { value: '180' } });

        expect(mockPositionChange).toHaveBeenCalledWith(70, 60);
        expect(mockPositionChange).toHaveBeenCalledWith(50, 80);
        expect(mockSizeChange).toHaveBeenCalledWith(170, 160);
        expect(mockSizeChange).toHaveBeenCalledWith(150, 180);
    });
});
