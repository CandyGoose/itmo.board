import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CanvasSaver, { embedImagesInSVG } from './CanvasSaver';
import { useStorage } from '@/liveblocks.config';
import 'jest-canvas-mock';

jest.mock('@/liveblocks.config', () => ({
    useStorage: jest.fn(),
}));

jest.mock(
    '@/app/[locale]/(dashboard)/boards/[boardId]/_components/LayerPreview',
    () => ({
        LayerPreview: ({ id }: { id: string }) => {
            return (
                <div data-testid={`mocked-layer-preview-${id}`}>Layer {id}</div>
            );
        },
    }),
);

jest.mock('@/components/Room', () => ({
    Room: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
    },
}));

describe('CanvasSaver component', () => {
    const originalCreateObjectURL = global.URL.createObjectURL;
    const originalRevokeObjectURL = global.URL.revokeObjectURL;
    const originalLocation = window.location;

    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
        global.URL.revokeObjectURL = jest.fn();

        window.location = { ...originalLocation, assign: jest.fn() };
    });

    afterAll(() => {
        global.URL.createObjectURL = originalCreateObjectURL;
        global.URL.revokeObjectURL = originalRevokeObjectURL;
        window.location = originalLocation;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (useStorage as jest.Mock).mockImplementation((fn) => {
            const mockLayerIds = ['layer1', 'layer2'];
            const mockLayers = new Map([
                [
                    'layer1',
                    { id: 'layer1', x: 10, y: 10, width: 100, height: 100 },
                ],
                [
                    'layer2',
                    { id: 'layer2', x: 200, y: 200, width: 50, height: 50 },
                ],
            ]);
            const root = {
                layerIds: mockLayerIds,
                layers: mockLayers,
            };
            return fn(root);
        });
    });

    it('renders without crashing and displays the SVG', () => {
        render(<CanvasSaver boardId="test-board" />);

        const svgElement = screen.getByTestId('svg-element');
        expect(svgElement).toBeInTheDocument();

        const gElement = screen.getByTestId('svg-group');
        expect(gElement).toBeInTheDocument();
    });

    it('renders all the layers returned from useStorage', () => {
        render(<CanvasSaver boardId="test-board" />);

        expect(
            screen.getByTestId('mocked-layer-preview-layer1'),
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('mocked-layer-preview-layer2'),
        ).toBeInTheDocument();
    });

    it('attaches and removes the resize event listener on mount/unmount', () => {
        const addEventSpy = jest.spyOn(window, 'addEventListener');
        const removeEventSpy = jest.spyOn(window, 'removeEventListener');

        const { unmount } = render(<CanvasSaver boardId="test-board" />);
        expect(addEventSpy).toHaveBeenCalledWith(
            'resize',
            expect.any(Function),
        );

        unmount();
        expect(removeEventSpy).toHaveBeenCalledWith(
            'resize',
            expect.any(Function),
        );
    });

    it('attaches and removes the "canvas-download" event listener on mount/unmount', () => {
        const addEventSpy = jest.spyOn(window, 'addEventListener');
        const removeEventSpy = jest.spyOn(window, 'removeEventListener');

        const { unmount } = render(<CanvasSaver boardId="test-board" />);
        expect(addEventSpy).toHaveBeenCalledWith(
            'canvas-download',
            expect.any(Function),
        );

        unmount();
        expect(removeEventSpy).toHaveBeenCalledWith(
            'canvas-download',
            expect.any(Function),
        );
    });

    it('updates width and height on window resize', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 800,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 600,
        });

        render(<CanvasSaver boardId="test-board" />);
        const svgElement = screen.getByTestId('svg-element');

        expect(svgElement).toHaveAttribute('width', '800');
        expect(svgElement).toHaveAttribute('height', '600');

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 1000,
        });

        fireEvent(window, new Event('resize'));

        expect(svgElement).toHaveAttribute('width', '1200');
        expect(svgElement).toHaveAttribute('height', '1000');
    });

    it('handles "canvas-download" event for SVG format', () => {
        const createObjectURLSpy = jest
            .spyOn(URL, 'createObjectURL')
            .mockReturnValue('mock-object-url');
        const revokeObjectURLSpy = jest
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => {});

        const createElementSpy = jest.spyOn(document, 'createElement');

        render(<CanvasSaver boardId="test-board" />);

        const downloadEvent = new CustomEvent('canvas-download', {
            detail: { format: 'svg' },
        });
        window.dispatchEvent(downloadEvent);

        expect(createElementSpy).toHaveBeenCalledWith('div');

        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
        createElementSpy.mockRestore();
    });

    it('handles "canvas-download" event for PNG format', () => {
        jest.spyOn(global.Image.prototype, 'src', 'set').mockImplementation(
            function (this: HTMLImageElement) {
                setTimeout(() => {
                    this.onload?.(new Event('load'));
                }, 0);
            },
        );

        const createElementSpy = jest.spyOn(document, 'createElement');
        const toDataURLSpy = jest
            .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
            .mockReturnValue('data:image/png;base64,iVBORw0KG...');

        render(<CanvasSaver boardId="test-board" />);

        const downloadEvent = new CustomEvent('canvas-download', {
            detail: { format: 'png' },
        });
        window.dispatchEvent(downloadEvent);

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(createElementSpy).toHaveBeenCalledWith('canvas');
                expect(toDataURLSpy).toHaveBeenCalled();
                resolve();
            }, 10);
        });
    });

    it('defaults scale to 1 if bounding box width or height is 0', () => {
        (useStorage as jest.Mock).mockImplementation((fn) => {
            const mockLayerIds = ['emptyLayer'];
            const mockLayers = new Map([
                [
                    'emptyLayer',
                    { id: 'emptyLayer', x: 0, y: 0, width: 0, height: 0 },
                ],
            ]);
            const root = { layerIds: mockLayerIds, layers: mockLayers };
            return fn(root);
        });

        render(<CanvasSaver boardId="test-board" />);
        const groupElement = screen.getByTestId('svg-group');
        expect(groupElement).toHaveAttribute(
            'transform',
            'translate(0, 0) scale(1)',
        );
    });
});

describe('embedImagesInSVG function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('replaces <image> href with base64 data if href is not already a data URL', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            blob: async () =>
                new Blob(['fake image content'], { type: 'image/png' }),
        });

        const svgEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const imageEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        imageEl.setAttribute('href', 'https://example.com/test.png');
        svgEl.appendChild(imageEl);

        await embedImagesInSVG(svgEl);

        const updatedHref = imageEl.getAttribute('href');
        expect(updatedHref).toMatch(/^data:/);
    });

    it('skips images if they already have a data: URL', async () => {
        const svgEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const imageEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        imageEl.setAttribute('href', 'data:image/png;base64,abc123');
        svgEl.appendChild(imageEl);

        global.fetch = jest.fn();

        await embedImagesInSVG(svgEl);

        expect(global.fetch).not.toHaveBeenCalled();
        expect(imageEl.getAttribute('href')).toBe(
            'data:image/png;base64,abc123',
        );
    });

    it('skips images with no href attribute', async () => {
        const svgEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const imageEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        // no href
        svgEl.appendChild(imageEl);

        global.fetch = jest.fn();

        await embedImagesInSVG(svgEl);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('logs an error if fetch fails', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false });
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const svgEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const imageEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        imageEl.setAttribute('href', 'https://example.com/test.png');
        svgEl.appendChild(imageEl);

        await embedImagesInSVG(svgEl);

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining(
                'Error converting https://example.com/test.png to base64',
            ),
            expect.any(Error),
        );
        consoleSpy.mockRestore();
    });
});
