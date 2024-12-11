import { render, screen, fireEvent } from '@testing-library/react';
import { Note } from './Note';
import { LayerType, NoteLayer } from '@/types/canvas';
import '@testing-library/jest-dom';

jest.mock('@/lib/utils', () => ({
    calculateFontSize: jest.fn(() => 48),
    cn: jest.fn().mockReturnValue('mocked-class'),
    colorToCss: jest.fn(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`),
    getContrastingTextColor: jest.fn().mockReturnValue('#000000'),
}));

const mockLayer: NoteLayer = {
    id: 'note-1',
    type: LayerType.Note,
    x: 10,
    y: 20,
    width: 200,
    height: 100,
    fill: { r: 255, g: 0, b: 0 },
    value: 'Initial note text',
};

describe('Note component', () => {
    let onPointerDown: jest.Mock;

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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should apply the correct background color based on fill', async () => {
        render(
            <svg>
                <Note
                    id={mockLayer.id}
                    layer={mockLayer}
                    onPointerDown={onPointerDown}
                />
            </svg>
        );

        const foreignObjectElement = await screen.findByTestId(
            'note-foreign-object',
        );

        expect(foreignObjectElement).toHaveStyle(
            'background-color: rgb(255, 0, 0)',
        );
    });

    it('should update the text when edited', () => {
        render(
            <svg>
                <Note
                    id={mockLayer.id}
                    layer={mockLayer}
                    onPointerDown={onPointerDown}
                />
            </svg>
        );

        const foreignObjectElement = screen.getByTestId('note-foreign-object');
        const editableDiv = foreignObjectElement.querySelector('div.mocked-class');

        // Симулируем изменение текста
        fireEvent.input(editableDiv!, {
            target: { textContent: 'Updated note text' },
        });

        expect(editableDiv?.textContent).toBe('Updated note text');
    });

    it('should apply the correct text color based on fill', () => {
        render(
            <svg>
                <Note
                    id={mockLayer.id}
                    layer={mockLayer}
                    onPointerDown={onPointerDown}
                />
            </svg>
        );

        const foreignObjectElement = screen.getByTestId('note-foreign-object');
        const editableDiv = foreignObjectElement.querySelector('div.mocked-class');

        expect(editableDiv).toHaveStyle('color: #000000');
    });

    it('should call onPointerDown with correct arguments when clicked', () => {
        render(
            <svg>
                <Note
                    id={mockLayer.id}
                    layer={mockLayer}
                    onPointerDown={onPointerDown}
                />
            </svg>
        );

        const foreignObjectElement = screen.getByTestId('note-foreign-object');
        fireEvent.pointerDown(foreignObjectElement, { pointerId: 1 });

        expect(onPointerDown).toHaveBeenCalledWith(
            expect.any(Object),
            'note-1',
        );
    });

    it('should apply selection color when provided', () => {
        render(
            <svg>
                <Note
                    id={mockLayer.id}
                    layer={mockLayer}
                    onPointerDown={onPointerDown}
                    selectionColor="#FF00FF"
                />
            </svg>
        );

        const foreignObjectElement = screen.getByTestId('note-foreign-object');
        expect(foreignObjectElement).toHaveStyle('outline: 1px solid #FF00FF');
    });

    it('should handle absence of fill by applying default colors', () => {
        const layerWithoutFill: NoteLayer = {
            ...mockLayer,
            fill: undefined,
        };

        render(
            <svg>
                <Note
                    id={layerWithoutFill.id}
                    layer={layerWithoutFill}
                    onPointerDown={onPointerDown}
                />
            </svg>
        );

        const foreignObjectElement = screen.getByTestId('note-foreign-object');
        expect(foreignObjectElement).toHaveStyle('background-color: #000');

        const editableDiv = foreignObjectElement.querySelector('div.mocked-class');
        expect(editableDiv).toHaveStyle('color: #000');
    });
});
