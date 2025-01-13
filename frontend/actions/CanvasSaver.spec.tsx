import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
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

        render(<CanvasSaver boardId="test-board" />);

        const downloadEvent = new CustomEvent('canvas-download', {
            detail: { format: 'png' },
        });
        window.dispatchEvent(downloadEvent);

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(createElementSpy).toHaveBeenCalledWith('canvas');
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
        expect(groupElement).toHaveAttribute('transform', 'translate(0, 0)');
    });
});

describe('embedImagesInSVG function', () => {
    let mockWorkerInstance: Worker;

    beforeAll(() => {
        global.Worker = jest.fn(() => {
            const worker = {
                postMessage: jest.fn(),
                terminate: jest.fn(),
                onmessage: null as
                    | ((this: Worker, ev: MessageEvent) => never)
                    | null,

                onerror: null,
                onmessageerror: null,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(() => false),
            };

            mockWorkerInstance = worker as unknown as Worker;

            return mockWorkerInstance;
        }) as unknown as typeof Worker;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does nothing (does not instantiate worker) if there are no images to convert', async () => {
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

        await embedImagesInSVG(svgEl);

        expect(global.Worker).not.toHaveBeenCalled();
    });

    it('instantiates worker and posts message with correct images', async () => {
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

        const promise = embedImagesInSVG(svgEl);

        expect(global.Worker).toHaveBeenCalledWith(
            '/workers/embedImages.worker.js',
        );
        expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
            type: 'start',
            images: ['https://example.com/test.png'],
        });

        mockWorkerInstance.onmessage?.({
            data: {
                index: 0,
                base64DataURL: 'data:image/png;base64,MOCK_BASE64',
            },
        } as MessageEvent);

        expect(mockWorkerInstance.terminate).toHaveBeenCalled();

        await promise;

        expect(imageEl.getAttribute('href')).toBe(
            'data:image/png;base64,MOCK_BASE64',
        );
    });

    it('handles multiple images and updates all hrefs correctly', async () => {
        const svgEl = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );

        const imageEl1 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        imageEl1.setAttribute('href', 'https://example.com/test1.png');
        svgEl.appendChild(imageEl1);

        const imageEl2 = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        imageEl2.setAttribute('href', 'https://example.com/test2.png');
        svgEl.appendChild(imageEl2);

        const promise = embedImagesInSVG(svgEl);

        expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
            type: 'start',
            images: [
                'https://example.com/test1.png',
                'https://example.com/test2.png',
            ],
        });

        mockWorkerInstance.onmessage?.({
            data: {
                index: 0,
                base64DataURL: 'data:image/png;base64,BASE64_TEST1',
            },
        } as MessageEvent);

        expect(mockWorkerInstance.terminate).not.toHaveBeenCalled();
        expect(imageEl1.getAttribute('href')).toBe(
            'data:image/png;base64,BASE64_TEST1',
        );
        expect(imageEl2.getAttribute('href')).toBe(
            'https://example.com/test2.png',
        );

        mockWorkerInstance.onmessage?.({
            data: {
                index: 1,
                base64DataURL: 'data:image/png;base64,BASE64_TEST2',
            },
        } as MessageEvent);

        expect(mockWorkerInstance.terminate).toHaveBeenCalled();

        await promise;

        expect(imageEl2.getAttribute('href')).toBe(
            'data:image/png;base64,BASE64_TEST2',
        );
    });

    it('logs a specific error if the worker returns an error for a given image', async () => {
        const consoleErrorSpy = jest
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

        const promise = embedImagesInSVG(svgEl);

        mockWorkerInstance.onmessage?.({
            data: {
                index: 0,
                error: 'Mock conversion failure',
            },
        } as MessageEvent);

        expect(mockWorkerInstance.terminate).toHaveBeenCalled();

        await promise;

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error for image at index 0: Mock conversion failure',
        );
        expect(imageEl.getAttribute('href')).toBe(
            'https://example.com/test.png',
        );

        consoleErrorSpy.mockRestore();
    });

    it('rejects (throws) if the worker itself errors (onerror)', async () => {
        const consoleErrorSpy = jest
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

        const promise = embedImagesInSVG(svgEl);

        const mockErrorEvent = {
            message: 'Mock worker crash',
        } as unknown as ErrorEvent;
        mockWorkerInstance.onerror?.(mockErrorEvent);

        await expect(promise).rejects.toEqual(mockErrorEvent);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Worker error:',
            mockErrorEvent,
        );
        expect(mockWorkerInstance.terminate).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});
