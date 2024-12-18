import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Ellipse } from './Ellipse';
import { EllipseLayer, LayerType } from '@/types/canvas';
import '@testing-library/jest-dom';
import { colorToCss } from '@/lib/utils';

const mockLayer: EllipseLayer = {
    id: '1',
    type: LayerType.Ellipse,
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    fill: { r: 255, g: 255, b: 255 },
};

const mockOnPointerDown = jest.fn();

describe('Ellipse', () => {
    it('renders ellipse with correct props', () => {
        const { container } = render(
            <Ellipse
                id="1"
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor="blue"
            />,
        );

        const ellipseElement = container.querySelector('ellipse');
        expect(ellipseElement).toBeInTheDocument();
        expect(ellipseElement).toHaveAttribute('cx', '50');
        expect(ellipseElement).toHaveAttribute('cy', '25');
        expect(ellipseElement).toHaveAttribute('rx', '50');
        expect(ellipseElement).toHaveAttribute('ry', '25');
        expect(ellipseElement).toHaveAttribute(
            'fill',
            colorToCss(mockLayer.fill!),
        );
        expect(ellipseElement).toHaveAttribute('stroke', 'blue');
    });

    it('sets transparent stroke color if selectionColor is not provided', () => {
        const { container } = render(
            <Ellipse
                id="1"
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
            />,
        );

        const ellipseElement = container.querySelector('ellipse');
        expect(ellipseElement).toHaveAttribute('stroke', 'transparent');
    });

    it('sets transparent fill color if layer does not have fill', () => {
        const { container } = render(
            <Ellipse
                id="1"
                layer={{ ...mockLayer, fill: null }}
                onPointerDown={mockOnPointerDown}
            />,
        );

        const ellipseElement = container.querySelector('ellipse');
        expect(ellipseElement).toHaveAttribute('fill', 'transparent');
    });

    it('calls onPointerDown when the ellipse is clicked', () => {
        const { container } = render(
            <Ellipse
                id="1"
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor="blue"
            />,
        );

        const ellipseElement = container.querySelector('ellipse');
        expect(ellipseElement).toBeInTheDocument();

        fireEvent.pointerDown(ellipseElement!);

        expect(mockOnPointerDown).toHaveBeenCalledTimes(1);
        expect(mockOnPointerDown).toHaveBeenCalledWith(expect.any(Object), '1');
    });
});
