import { fireEvent, render, screen } from '@testing-library/react';
import { LayerType, TextAlign, TextFormat, TextLayer } from '@/types/canvas';
import '@testing-library/jest-dom';
import { useMutation } from '@/liveblocks.config';
import * as TextModule from './Text';
import { Fonts } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Fonts';
import { PLACEHOLDER_TEXT } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';

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
    fontName: Fonts[0],
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

    const renderComponent = (layer: TextLayer) => {
        return render(
            <svg>
                <TextModule.Text
                    id={layer.id}
                    layer={layer}
                    onPointerDown={onPointerDown}
                />
            </svg>,
        );
    };

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

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('should render initial text correctly', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv?.textContent).toBe(mockLayer.value);
    });

    it('should update the text when edited', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

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

    it('should apply correct font family when fontName is specified', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle(`font-family: ${Fonts[0]}`);
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

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('text-align: start');
    });

    it('should apply text alignment correctly for center alignment', () => {
        renderComponent(mockLayer); // Center alignment is default in mockLayer

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('text-align: center');
    });

    it('should apply text alignment correctly for right alignment', () => {
        const rightAlignedLayer: TextLayer = {
            ...mockLayer,
            textAlign: TextAlign.Right,
        };

        renderComponent(rightAlignedLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('text-align: end');
    });

    it('should apply bold and italic text formatting', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('font-weight: bold');
        expect(editableDiv).toHaveStyle('font-style: italic');
    });

    it('should apply strikethrough text formatting', () => {
        const strikeLayer: TextLayer = {
            ...mockLayer,
            textFormat: [TextFormat.Strike],
        };

        renderComponent(strikeLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('text-decoration: line-through');
    });

    it('should handle multiple text formats correctly', () => {
        const multiFormatLayer: TextLayer = {
            ...mockLayer,
            textFormat: [TextFormat.Bold, TextFormat.Italic, TextFormat.Strike],
        };

        renderComponent(multiFormatLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('font-weight: bold');
        expect(editableDiv).toHaveStyle('font-style: italic');
        expect(editableDiv).toHaveStyle('text-decoration: line-through');
    });

    it('should apply whiteSpace and wordBreak styles correctly', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle('white-space: pre-wrap');
        expect(editableDiv).toHaveStyle('word-break: keep-all');
    });

    it('should apply additional classes correctly', () => {
        renderComponent(mockLayer);
        const editableDiv = screen.getByTestId('text-content-editable');

        expect(editableDiv).toHaveStyle(`font-family: ${Fonts[0]}`);
    });

    it('should handle absence of text format gracefully', () => {
        const noFormatLayer: TextLayer = {
            ...mockLayer,
            textFormat: [],
        };

        renderComponent(noFormatLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

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

        const editableDiv = screen.getByTestId('text-content-editable');

        // Default alignment is center
        expect(editableDiv).toHaveStyle('text-align: start');
    });

    it('should handle rapid text changes without errors', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');

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

    it('should apply multiple styles correctly without conflicts', () => {
        const multiStyleLayer: TextLayer = {
            ...mockLayer,
            textAlign: TextAlign.Right,
            textFormat: [TextFormat.Bold],
            fontName: 'Kalam',
            fill: { r: 0, g: 255, b: 0 },
        };

        renderComponent(multiStyleLayer);

        const foreignObjectElement = screen.getByTestId('text-foreign-object');
        expect(foreignObjectElement).toHaveStyle(
            'background-color: transparent;',
        );

        const editableDiv = screen.getByTestId('text-content-editable');
        expect(editableDiv).toHaveStyle('color: rgb(0, 255, 0);');
        expect(editableDiv).toHaveStyle('font-weight: bold');
        expect(editableDiv).toHaveStyle('text-align: end');
    });

    it('should reset text area to its original value on blur if text changes are invalid', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId(
            'text-content-editable',
        ) as HTMLTextAreaElement;

        fireEvent.input(editableDiv, { target: { value: '' } });
        fireEvent.blur(editableDiv);

        expect(editableDiv.value).toBe(mockLayer.value);
    });

    it('should set isInUse state to true on focus', () => {
        renderComponent(mockLayer);

        const editableDiv = screen.getByTestId('text-content-editable');
        fireEvent.focus(editableDiv);

        expect(editableDiv).not.toHaveAttribute('readonly');
    });

    it('should render placeholder text if value is empty', () => {
        const emptyLayer: TextLayer = {
            ...mockLayer,
            value: '',
        };

        renderComponent(emptyLayer);

        const editableDiv = screen.getByTestId('text-content-editable');
        expect(editableDiv?.textContent).toBe(PLACEHOLDER_TEXT);
    });
});
