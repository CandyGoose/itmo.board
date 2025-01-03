import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ImageLayerComponent } from './ImageLayer';
import { ImageLayer, LayerType } from '@/types/canvas';
import '@testing-library/jest-dom';

const mockLayer: ImageLayer = {
    id: 'image-1',
    type: LayerType.Image,
    x: 50,
    y: 100,
    width: 200,
    height: 150,
    src: 'https://example.com/image.png',
    fill: null
};

const mockOnPointerDown = jest.fn();

describe('ImageLayerComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders image with correct attributes', () => {
        const { container } = render(
            <ImageLayerComponent
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor="red"
            />,
        );

        const imageElement = container.querySelector('image');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('href', mockLayer.src);
        expect(imageElement).toHaveAttribute('x', mockLayer.x.toString());
        expect(imageElement).toHaveAttribute('y', mockLayer.y.toString());
        expect(imageElement).toHaveAttribute('width', mockLayer.width.toString());
        expect(imageElement).toHaveAttribute('height', mockLayer.height.toString());
        expect(imageElement).toHaveAttribute('stroke', 'red');
        expect(imageElement).toHaveAttribute('preserveAspectRatio', 'none');
        expect(imageElement).toHaveClass('drop-shadow-md');
    });

    it('calls onPointerDown when the image is clicked', () => {
        const { container } = render(
            <ImageLayerComponent
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor="green"
            />,
        );

        const imageElement = container.querySelector('image');
        expect(imageElement).toBeInTheDocument();

        fireEvent.pointerDown(imageElement!);

        expect(mockOnPointerDown).toHaveBeenCalledTimes(1);
        expect(mockOnPointerDown).toHaveBeenCalledWith(expect.any(Object), mockLayer.id);
    });

    it('renders with default selectionColor when selectionColor prop is undefined', () => {
        const { container } = render(
            <ImageLayerComponent
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                // selectionColor is not provided
            />,
        );

        const imageElement = container.querySelector('image');
        expect(imageElement).toHaveAttribute('stroke', 'transparent');
    });

    it('applies the correct selectionColor when provided', () => {
        const selectionColor = '#00FF00';
        const { container } = render(
            <ImageLayerComponent
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={mockOnPointerDown}
                selectionColor={selectionColor}
            />,
        );

        const imageElement = container.querySelector('image');
        expect(imageElement).toHaveAttribute('stroke', selectionColor);
    });

    it('handles missing src gracefully', () => {
        const layerWithoutSrc: ImageLayer = {
            ...mockLayer,
            src: '',
        };

        const { container } = render(
            <ImageLayerComponent
                id={layerWithoutSrc.id}
                layer={layerWithoutSrc}
                onPointerDown={mockOnPointerDown}
            />,
        );

        const imageElement = container.querySelector('image');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('href', '');
    });
});
