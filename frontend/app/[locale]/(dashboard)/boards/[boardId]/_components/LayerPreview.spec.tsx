import React from 'react';
import {
    render,
    screen,
    fireEvent,
    RenderResult,
} from '@testing-library/react';
import { LayerPreview } from './LayerPreview';
import { LayerType } from '@/types/canvas';
import '@testing-library/jest-dom';

jest.mock('./Path', () => ({
    Path: jest.fn(({ onPointerDown }) => (
        <svg data-testid="path-element" onPointerDown={onPointerDown} />
    )),
}));

jest.mock('@/liveblocks.config', () => ({
    useStorage: jest.fn(),
}));

import { useStorage } from '@/liveblocks.config';

describe('LayerPreview Component', () => {
    const mockGetLayer = jest.fn();
    const mockOnLayerPointerDown = jest.fn();

    const mockLayer = {
        id: 'layer1',
        type: LayerType.Path,
        points: [
            [0, 0],
            [10, 10],
        ],
        x: 100,
        y: 200,
        fill: { r: 255, g: 0, b: 0, a: 1 },
    };

    const defaultProps = {
        id: 'layer1',
        onLayerPointerDown: mockOnLayerPointerDown,
        selectionColor: '#00FF00',
    };

    const renderLayerPreview = (
        props?: Partial<typeof defaultProps>,
    ): RenderResult => {
        return render(<LayerPreview {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useStorage as jest.Mock).mockImplementation((selector) => {
            const root = {
                layers: {
                    get: (id: string) => {
                        switch (id) {
                            case 'layer1':
                                return mockLayer;
                            default:
                                return { ...mockLayer, type: 'UnknownType' };
                        }
                    },
                },
            };
            return selector(root);
        });
    });

    test('renders Path component when layer type is Path', () => {
        mockGetLayer.mockReturnValue(mockLayer);

        renderLayerPreview();

        const pathElement = screen.getByTestId('path-element');
        expect(pathElement).toBeInTheDocument();
    });

    test('passes correct props to Path component', () => {
        mockGetLayer.mockReturnValue(mockLayer);

        renderLayerPreview();

        const pathElement = screen.getByTestId('path-element');

        // Simulate pointer down event
        fireEvent.pointerDown(pathElement);

        // Check that onLayerPointerDown was called
        expect(mockOnLayerPointerDown).toHaveBeenCalledTimes(1);
        expect(mockOnLayerPointerDown).toHaveBeenCalledWith(
            expect.any(Object),
            defaultProps.id,
        );
    });

    test('renders null if layer is not found', () => {
        mockGetLayer.mockReturnValue(null);

        const { container } = renderLayerPreview({
            id: 'non-existent-layer',
        });

        expect(container.firstChild).toBeNull();
    });

    test('renders null and logs a warning for unknown layer type', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockGetLayer.mockReturnValue({
            ...mockLayer,
            type: 'UnknownType',
        });

        const { container } = renderLayerPreview({
            id: 'unknown-layer',
        });

        expect(container.firstChild).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown layer type');
        consoleWarnSpy.mockRestore();
    });

    test('renders null if no layer is given', () => {
        (useStorage as jest.Mock).mockImplementation((selector) => {
            const root = {
                layers: {
                    get: () => null,
                },
            };
            return selector(root);
        });

        const { container } = renderLayerPreview({
            id: 'non-existent-layer',
        });

        expect(container.firstChild).toBeNull();
    });
});
