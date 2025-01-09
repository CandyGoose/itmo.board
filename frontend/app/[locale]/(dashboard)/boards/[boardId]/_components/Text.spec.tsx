import { fireEvent, render, screen } from '@testing-library/react';
import { LayerType, TextAlign, TextFormat, TextLayer } from '@/types/canvas';
import '@testing-library/jest-dom';
import { useMutation } from '@/liveblocks.config';
import * as TextModule from './Text';

jest.mock('next/font/google', () => ({
    Kalam: () => ({
        className: 'kalam-font',
    }),
}));

jest.mock('@/liveblocks.config', () => ({
    useMutation: jest.fn(),
}));

beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn();
});

const mockLayer: TextLayer = {
    id: 'text-1',
    type: LayerType.Text,
    x: 10,
    y: 20,
    width: 200,
    height: 100,
    fill: { r: 255, g: 0, b: 0 },
    value: 'Initial note text',
    fontName: 'Kalam',
    fontSize: 24,
    textAlign: TextAlign.Center,
    textFormat: [TextFormat.Bold, TextFormat.Italic],
};

describe('Text component', () => {
    let onPointerDown: jest.Mock;
    const updateValueMock = jest.fn();

    beforeEach(() => {
        onPointerDown = jest.fn();

        jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
            200,
        );
        jest.spyOn(
            HTMLElement.prototype,
            'offsetHeight',
            'get',
        ).mockReturnValue(100);

        (useMutation as jest.Mock).mockReturnValue(updateValueMock);

        jest.clearAllMocks();
    });

    const renderComponent = (layer: TextLayer, selectionColor?: string) => {
        return render(
            <svg>
                <TextModule.Text
                    id={layer.id}
                    layer={layer}
                    onPointerDown={onPointerDown}
                    selectionColor={selectionColor}
                />
            </svg>,
        );
    };

    it('should apply the correct color based on fill', async () => {
        renderComponent(mockLayer);

        const foreignObjectElement = await screen.findByTestId(
            'text-foreign-object',
        );

        expect(foreignObjectElement).toHaveStyle('color: 255 0 0');
    });

    it('should have transparent background', async () => {
        renderComponent(mockLayer);

        const foreignObjectElement = await screen.findByTestId(
            'text-foreign-object',
        );

        expect(foreignObjectElement).toHaveStyle(
            'background-color: transparent',
        );
    });

    it('should apply the correct text color based on fill', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('should render initial text correctly', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv?.textContent).toBe(mockLayer.value);
    });

    it('should update the text when edited', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        // Simulate text input
        fireEvent.input(editableDiv!, {
            target: { textContent: 'Updated note text' },
        });

        expect(editableDiv?.textContent).toBe('Updated note text');
    });

    it('should call onPointerDown with correct arguments when clicked', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        fireEvent.pointerDown(foreignObjectElement, { pointerId: 1 });

        expect(onPointerDown).toHaveBeenCalledWith(
            expect.any(Object),
            'text-1',
        );
    });

    it('should apply selection color when provided', () => {
        renderComponent(mockLayer, '#FF00FF');

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        expect(foreignObjectElement).toHaveStyle('outline: 1px solid #FF00FF');
    });

    it('should not apply outline when selectionColor is not provided', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        expect(foreignObjectElement).toHaveStyle('outline: none');
    });

    it('should apply correct font family when fontName is specified', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveClass('kalam-font');
    });

    it('should not apply font class when fontName is not specified', () => {
        const layerWithoutFont: TextLayer = {
            ...mockLayer,
            fontName: '',
        };

        renderComponent(layerWithoutFont);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv = foreignObjectElement.querySelector('div');

        expect(editableDiv).not.toHaveClass('kalam-font');
    });

    it('should apply text alignment correctly for left alignment', () => {
        const leftAlignedLayer: TextLayer = {
            ...mockLayer,
            textAlign: TextAlign.Left,
        };

        renderComponent(leftAlignedLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('text-align: start');
    });

    it('should apply text alignment correctly for center alignment', () => {
        renderComponent(mockLayer); // Center alignment is default in mockLayer

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('text-align: center');
    });

    it('should apply text alignment correctly for right alignment', () => {
        const rightAlignedLayer: TextLayer = {
            ...mockLayer,
            textAlign: TextAlign.Right,
        };

        renderComponent(rightAlignedLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('text-align: end');
    });

    it('should apply bold and italic text formatting', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('font-weight: bold');
        expect(editableDiv).toHaveStyle('font-style: italic');
    });

    it('should apply strikethrough text formatting', () => {
        const strikeLayer: TextLayer = {
            ...mockLayer,
            textFormat: [TextFormat.Strike],
        };

        renderComponent(strikeLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('text-decoration: line-through');
    });

    it('should handle multiple text formats correctly', () => {
        const multiFormatLayer: TextLayer = {
            ...mockLayer,
            textFormat: [TextFormat.Bold, TextFormat.Italic, TextFormat.Strike],
        };

        renderComponent(multiFormatLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('font-weight: bold');
        expect(editableDiv).toHaveStyle('font-style: italic');
        expect(editableDiv).toHaveStyle('text-decoration: line-through');
    });

    it('should apply whiteSpace and wordBreak styles correctly', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).toHaveStyle('white-space: pre-wrap');
        expect(editableDiv).toHaveStyle('word-break: break-word');
    });

    it('should apply additional classes correctly', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(foreignObjectElement).toHaveClass('shadow-md', 'drop-shadow-xl');

        expect(editableDiv).toHaveClass('kalam-font');
    });

    it('should handle absence of text format gracefully', () => {
        const noFormatLayer: TextLayer = {
            ...mockLayer,
            textFormat: [],
        };

        renderComponent(noFormatLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        expect(editableDiv).not.toHaveStyle('font-weight: bold');
        expect(editableDiv).not.toHaveStyle('font-style: italic');
        expect(editableDiv).not.toHaveStyle('text-decoration: line-through');
    });

    it('should apply default text alignment when an invalid alignment is provided', () => {
        const invalidAlignLayer: TextLayer = {
            ...mockLayer,
            textAlign: 'justify' as unknown as TextAlign, // Invalid alignment
        };

        renderComponent(invalidAlignLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');

        // Default alignment is center
        expect(editableDiv).toHaveStyle('text-align: start');
    });

    it('should handle rapid text changes without errors', () => {
        renderComponent(mockLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        const editableDiv = foreignObjectElement.querySelector(
            'div[contenteditable=true]',
        );

        // Simulate rapid input changes
        fireEvent.input(editableDiv!, {
            target: { textContent: 'First change' },
        });
        fireEvent.input(editableDiv!, {
            target: { textContent: 'Second change' },
        });
        fireEvent.input(editableDiv!, {
            target: { textContent: 'Third change' },
        });

        expect(editableDiv?.textContent).toBe('Third change');
    });

    it('should not apply any outline when selectionColor is an empty string', () => {
        renderComponent(mockLayer, '');

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        expect(foreignObjectElement).toHaveStyle('outline: none');
    });

    it('should apply multiple styles correctly without conflicts', () => {
        const multiStyleLayer: TextLayer = {
            ...mockLayer,
            textAlign: TextAlign.Right,
            textFormat: [TextFormat.Bold],
            fontName: 'Kalam',
            fill: { r: 0, g: 255, b: 0 },
        };

        renderComponent(multiStyleLayer, '#00FF00');

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        expect(foreignObjectElement).toHaveStyle(
            'background-color: transparent;',
        );
        expect(foreignObjectElement).toHaveStyle('outline: 1px solid #00FF00');

        const editableDiv =
            foreignObjectElement.querySelector('div.kalam-font');
        expect(editableDiv).toHaveStyle('color: rgb(0, 255, 0);');
        expect(editableDiv).toHaveStyle('font-weight: bold');
        expect(editableDiv).toHaveStyle('text-align: end');
    });
});
