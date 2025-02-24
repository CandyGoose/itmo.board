import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Rectangle } from './Rectangle';
import { LayerType, RectangleLayer } from '@/types/canvas';
import '@testing-library/jest-dom';
import { colorToCss } from '@/lib/utils';

const mockLayer: RectangleLayer = {
    id: '1',
    type: LayerType.Rectangle,
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    fill: { r: 255, g: 255, b: 255 },
};

const mockOnPointerDown = jest.fn();

describe('Rectangle', () => {
    it('renders rectangle with correct props', () => {
        const { container } = render(
            <Rectangle
                id="1"
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor="blue"
            />,
        );

        const rectElement = container.querySelector('rect');
        expect(rectElement).toHaveAttribute('width', '100');
        expect(rectElement).toHaveAttribute('height', '50');
        expect(rectElement).toHaveStyle('transform: translate(10px, 20px)');
        expect(rectElement).toHaveAttribute(
            'fill',
            colorToCss(mockLayer.fill!),
        );
        expect(rectElement).toHaveAttribute('stroke', 'blue');
    });

    it('sets transparent stroke color if selectionColor is not provided', () => {
        const { container } = render(
            <Rectangle
                id="1"
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
            />,
        );

        const rectElement = container.querySelector('rect');
        expect(rectElement).toHaveAttribute('stroke', 'transparent');
    });

    it('sets transparent fill color if layer does not have fill', () => {
        const { container } = render(
            <Rectangle
                id="1"
                layer={{ ...mockLayer, fill: null }}
                onPointerDown={mockOnPointerDown}
            />,
        );

        const rectElement = container.querySelector('rect');
        expect(rectElement).toHaveAttribute('fill', 'transparent');
    });

    it('calls onPointerDown when the rectangle is clicked', () => {
        const { container } = render(
            <Rectangle
                id="1"
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor="blue"
            />,
        );

        const rectElement = container.querySelector('rect');
        expect(rectElement).toBeInTheDocument();

        fireEvent.pointerDown(rectElement!);

        expect(mockOnPointerDown).toHaveBeenCalledTimes(1);
        expect(mockOnPointerDown).toHaveBeenCalledWith(expect.any(Object), '1');
    });
});
