import React from 'react';
import {
    fireEvent,
    render,
    RenderResult,
    waitFor,
} from '@testing-library/react';
import Canvas from './Canvas';
import { useCanvasStore } from '@/store/useCanvasStore';
import '@testing-library/jest-dom';
import {
    CanvasMode,
    CanvasState,
    LayerType,
    TextAlign,
    TextFormat,
} from '@/types/canvas';
import { useTranslations } from 'next-intl';
import { SelectionToolsProps } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/SelectionTools';
import { StylesButtonProps } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/StylesButton';

jest.mock('@/store/useCanvasStore', () => ({
    useCanvasStore: jest.fn(),
}));

jest.mock('./LayerPreview', () => ({
    LayerPreview: jest.fn(({ onLayerPointerDown, selectionColor, id }) => (
        <div
            data-testid={`layer-preview-${id}`}
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            style={{ borderColor: selectionColor }}
        >
            LayerPreview {id}
        </div>
    )),
}));

jest.mock('@/lib/utils', () => ({
    cn: jest.fn((...args: string[]) => args.filter(Boolean).join(' ')),
    pointerEventToCanvasPoint: jest.fn((e, camera, scale) => ({
        x: (e.clientX - camera.x) / scale,
        y: (e.clientY - camera.y) / scale,
    })),
    findIntersectingLayersWithRectangle: jest.fn(() => ['layer1', 'layer2']),
    penPointsToPathLayer: jest.fn((draft) => ({
        path: draft.map(([x, y]: [number, number]) => ({ x, y })),
    })),
    resizeBounds: jest.fn((initialBounds) => ({
        x: initialBounds.x,
        y: initialBounds.y,
        width: 150,
        height: 150,
    })),
    colorToCss: jest.fn((color) => `#${color.r}${color.g}${color.b}`),
    clickCloseToAnyPath: jest.fn(() => null),
}));

jest.mock('nanoid', () => ({
    nanoid: () => 'nanoid',
}));

jest.mock(
    '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Toolbar',
    () => ({
        ToolBar: ({
            setCanvasState,
        }: {
            setCanvasState: (newState: CanvasState) => void;
        }) => (
            <div>
                <button
                    data-testid="insert-rectangle-button"
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Rectangle,
                        })
                    }
                >
                    Insert Rectangle
                </button>
                <button
                    data-testid="pencil-tool-button"
                    onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
                >
                    Pencil Tool
                </button>

                <button
                    data-testid="insert-ellipse-button"
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Ellipse,
                        })
                    }
                >
                    Insert Ellipse
                </button>

                <button
                    data-testid="insert-note-button"
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Inserting,
                            layerType: LayerType.Note,
                        })
                    }
                >
                    Insert Note
                </button>
            </div>
        ),
    }),
);

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

jest.mock(
    '@/app/[locale]/(dashboard)/boards/[boardId]/_components/SelectionBox',
    () => ({
        SelectionBox: ({ onResizeHandlePointerDown, isShowingHandles }) => {
            if (!isShowingHandles) return null;
            return (
                <div data-testid="selection-box">
                    <div
                        data-testid="resize-handle-corner"
                        onPointerDown={() =>
                            onResizeHandlePointerDown('bottom-right', {
                                x: 50,
                                y: 50,
                                width: 100,
                                height: 100,
                            })
                        }
                    />
                </div>
            );
        },
    }),
);

jest.mock('./SelectionTools', () => ({
    SelectionTools: ({
        onLineWidthChange,
        onColorChange,
        onTransparentFillChange,
        onFontChange,
        onFontSizeChange,
        onTextAlignChange,
        onTextFormatChange,
        onPositionChange,
        onSizeChange,
    }: SelectionToolsProps) => (
        <div data-testid="selection-tools">
            <button
                data-testid="line-width-button"
                onClick={() => onLineWidthChange(5)}
            >
                Set Line Width
            </button>
            <button
                data-testid="color-button"
                onClick={() => onColorChange({ r: 255, g: 0, b: 0 })}
            >
                Set Color Red
            </button>
            <button
                data-testid="transparent-fill-button"
                onClick={() => onTransparentFillChange(true)}
            >
                Set Transparent Fill
            </button>
            <button
                data-testid="font-change-button"
                onClick={() => onFontChange('Arial')}
            >
                Set Font Arial
            </button>
            <button
                data-testid="font-size-button"
                onClick={() => onFontSizeChange(20)}
            >
                Set Font Size 20
            </button>
            <button
                data-testid="text-align-button"
                onClick={() => onTextAlignChange(TextAlign.Left)}
            >
                Set Text Align Left
            </button>
            <button
                data-testid="text-format-button"
                onClick={() => onTextFormatChange([TextFormat.Bold])}
            >
                Set Text Format Bold
            </button>
            <button
                data-testid="position-button"
                onClick={() => onPositionChange(200, 200)}
            >
                Set Position
            </button>
            <button
                data-testid="size-button"
                onClick={() => onSizeChange(300, 300)}
            >
                Set Size
            </button>
        </div>
    ),
}));

jest.mock('./StylesButton', () => ({
    StylesButton: ({ onClick, ...props }: StylesButtonProps) => (
        <button data-testid="styles-button" onClick={onClick} {...props}>
            Styles
        </button>
    ),
}));

describe('Canvas Component', () => {
    const defaultStore = {
        layerIds: ['layer1', 'layer2'],
        addLayer: jest.fn(),
        updateLayer: jest.fn(),
        removeLayers: jest.fn(),
        getLayer: jest.fn((id) => ({
            id,
            x: 50,
            y: 50,
            width: 100,
            height: 100,
        })),
        getLayers: jest.fn(() => [
            { id: 'layer1', x: 0, y: 0 },
            { id: 'layer2', x: 50, y: 50 },
        ]),
        moveLayersToFront: jest.fn(),
        moveLayersToBack: jest.fn(),
        moveLayersForward: jest.fn(),
        moveLayersBackward: jest.fn(),
    };

    const mockUseTranslations = useTranslations as jest.Mock;
    mockUseTranslations.mockImplementation(() => () => 'a');

    const mockUseCanvasStoreHook = (overrides = {}) => {
        const store = { ...defaultStore, ...overrides };
        (useCanvasStore as unknown as jest.Mock).mockImplementation(
            () => store,
        );
        return store;
    };

    const renderCanvas = (props = {}, storeOverrides = {}): RenderResult => {
        mockUseCanvasStoreHook(storeOverrides);
        return render(<Canvas {...props} />);
    };

    const selectLayer = (
        layerId: string,
        getByTestId: (id: string) => HTMLElement,
    ) => {
        const layerElement = getByTestId(`layer-preview-${layerId}`);
        fireEvent.pointerDown(layerElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (
            window as unknown as { PointerEvent: typeof MouseEvent }
        ).PointerEvent = MouseEvent;
    });

    it('renders without crashing', () => {
        const { getByRole } = renderCanvas();
        expect(getByRole('main')).toBeInTheDocument();
    });

    it('actions are ignored when editable is false', () => {
        const store = mockUseCanvasStoreHook();
        const { getByTestId } = renderCanvas({ edit: false });

        const insertButton = getByTestId('insert-rectangle-button');
        const pencilButton = getByTestId('pencil-tool-button');
        const svgElement = getByTestId('svg-element');
        const layer1 = getByTestId('layer-preview-layer1');
        const layer2 = getByTestId('layer-preview-layer2');

        // Attempt to insert a new rectangle layer
        fireEvent.click(insertButton);
        fireEvent.pointerUp(svgElement, { clientX: 100, clientY: 100 });
        expect(store.addLayer).not.toHaveBeenCalled();

        // Attempt to use the pencil tool to start drawing
        fireEvent.click(pencilButton);
        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 150,
            clientY: 150,
        });
        fireEvent.pointerMove(svgElement, { clientX: 160, clientY: 160 });
        fireEvent.pointerUp(svgElement);
        expect(store.addLayer).not.toHaveBeenCalled();

        // Attempt to translate a selected layer
        fireEvent.pointerDown(layer1, {
            button: 0,
            clientX: 200,
            clientY: 200,
        });
        fireEvent.pointerMove(svgElement, { clientX: 210, clientY: 210 });
        fireEvent.pointerUp(svgElement);
        expect(store.updateLayer).not.toHaveBeenCalled();

        // Attempt to start multi-selection with shift key
        fireEvent.pointerDown(svgElement, {
            button: 0,
            shiftKey: true,
            clientX: 300,
            clientY: 300,
        });
        fireEvent.pointerMove(svgElement, { clientX: 400, clientY: 400 });
        fireEvent.pointerUp(svgElement);
        expect(store.getLayers).not.toHaveBeenCalled();

        // Attempt to resize a selected layer
        fireEvent.pointerDown(layer2, {
            button: 0,
            clientX: 250,
            clientY: 250,
        });
        fireEvent.pointerMove(svgElement, { clientX: 300, clientY: 300 });
        fireEvent.pointerUp(svgElement);
        expect(store.updateLayer).not.toHaveBeenCalled();

        // Attempt to delete layers via keyboard
        fireEvent.keyDown(window, { key: 'Delete' });
        expect(store.removeLayers).not.toHaveBeenCalled();

        // Copy/Paste
        fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
        expect(store.getLayers).not.toHaveBeenCalled();
        fireEvent.keyDown(window, { key: 'v', ctrlKey: true });
        expect(store.addLayer).not.toHaveBeenCalled();

        // Select all
        fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
        expect(layer1).not.toHaveStyle('border-color: blue');
        expect(layer2).not.toHaveStyle('border-color: blue');
    });

    it('renders the correct number of LayerPreview components', () => {
        const mockLayerIds = ['layer1', 'layer2', 'layer3'];
        const storeOverrides = {
            layerIds: mockLayerIds,
            getLayer: jest.fn((id) => ({ id })),
            getLayers: jest.fn(() => mockLayerIds.map((id) => ({ id }))),
        };
        const { getAllByTestId } = renderCanvas({}, storeOverrides);
        const layerPreviews = getAllByTestId(/layer-preview-/);
        expect(layerPreviews).toHaveLength(mockLayerIds.length);
    });

    describe('Panning', () => {
        it('should pan with pointer correctly', async () => {
            const { getByTestId } = renderCanvas();
            const svgElement = getByTestId('svg-element');
            const svgGroup = getByTestId('svg-group');

            // Verify initial camera position
            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(0, 0) scale(1)',
            );

            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerMove(svgElement, { clientX: 110, clientY: 120 });
            fireEvent.pointerUp(svgElement);

            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(10, 20) scale(1)',
            );
        });

        it('should accumulate multiple panning actions correctly', async () => {
            const { getByTestId } = renderCanvas();
            const svgElement = getByTestId('svg-element');
            const svgGroup = getByTestId('svg-group');

            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(0, 0) scale(1)',
            );

            // First panning action: move by (15, 25)
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 200,
                clientY: 200,
            });
            fireEvent.pointerMove(svgElement, { clientX: 215, clientY: 225 });
            fireEvent.pointerUp(svgElement);

            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(15, 25) scale(1)',
            );

            // Second panning action: move by (-5, -10)
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 215,
                clientY: 225,
            });
            fireEvent.pointerMove(svgElement, { clientX: 210, clientY: 215 });
            fireEvent.pointerUp(svgElement);

            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(10, 15) scale(1)',
            );
        });

        it('should stop panning when pointer leaves the canvas', () => {
            const { getByTestId } = renderCanvas();
            const svgElement = getByTestId('svg-element');

            // Simulate pointer down to start panning
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });

            // Simulate pointer leave
            fireEvent.pointerLeave(svgElement);

            // Simulate pointer move (should not pan since pointer has left)
            fireEvent.pointerMove(svgElement, {
                clientX: 110,
                clientY: 110,
            });

            const svgGroup = getByTestId('svg-group');
            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(0, 0) scale(1)',
            );
        });
    });

    describe('Layer Selection', () => {
        it('toggles layer selection on layer click', () => {
            const mockLayerIds = ['layer1', 'layer2'];
            const storeOverrides = {
                layerIds: mockLayerIds,
                getLayer: jest.fn((id) => ({ id })),
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            const firstLayer = getByTestId('layer-preview-layer1');
            fireEvent.pointerDown(firstLayer);
            expect(firstLayer).toHaveStyle('border-color: blue');

            const secondLayer = getByTestId('layer-preview-layer2');
            fireEvent.pointerDown(secondLayer);
            expect(secondLayer).toHaveStyle('border-color: blue');
        });
    });

    describe('Wheel Events', () => {
        it('handles wheel events to adjust camera position and scale', async () => {
            const { getByTestId } = renderCanvas();
            const svgElement = getByTestId('svg-element');
            const svgGroup = getByTestId('svg-group');

            expect(svgGroup.getAttribute('transform')).toBe(
                'translate(0, 0) scale(1)',
            );

            fireEvent.wheel(svgElement, {
                deltaX: 20,
                deltaY: 30,
                clientX: 50,
                clientY: 50,
            });

            const zoomIntensity = 0.001;
            const initialScale = 1;
            const deltaY = 30;
            const newScale = Math.min(
                Math.max(initialScale - deltaY * zoomIntensity, 0.1),
                20,
            );
            const scaleFactor = newScale / initialScale;
            const offsetX = 50;
            const offsetY = 50;
            const newCameraX = offsetX - offsetX * scaleFactor;
            const newCameraY = offsetY - offsetY * scaleFactor;

            await waitFor(() => {
                const transform = svgGroup.getAttribute('transform');
                expect(transform).toBe(
                    `translate(${newCameraX}, ${newCameraY}) scale(${newScale})`,
                );
            });
        });
    });

    describe('Layer Manipulation', () => {
        it('should insert a new layer on pointer up in inserting mode', () => {
            const addLayerMock = jest.fn();
            const storeOverrides = {
                addLayer: addLayerMock,
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);
            const insertRectangle = getByTestId('insert-rectangle-button');
            fireEvent.click(insertRectangle);

            const svgElement = getByTestId('svg-element');

            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            expect(addLayerMock).not.toHaveBeenCalled();
            fireEvent.pointerUp(svgElement, { clientX: 100, clientY: 100 });

            expect(addLayerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'nanoid',
                    type: LayerType.Rectangle,
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    fill: { r: 0, g: 0, b: 0 },
                }),
            );

            const insertEllipse = getByTestId('insert-ellipse-button');
            fireEvent.click(insertEllipse);

            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });

            expect(addLayerMock).toHaveBeenCalledTimes(1); // Only rectangle was added

            fireEvent.pointerUp(svgElement, {
                clientX: 100,
                clientY: 100,
            });

            expect(addLayerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'nanoid',
                    type: LayerType.Ellipse,
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    fill: { r: 0, g: 0, b: 0 },
                }),
            );

            const insertNote = getByTestId('insert-note-button');
            fireEvent.click(insertNote);

            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });

            expect(addLayerMock).toHaveBeenCalledTimes(2); // Only rectangle and ellipse were added

            fireEvent.pointerUp(svgElement, {
                clientX: 100,
                clientY: 100,
            });

            expect(addLayerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'nanoid',
                    type: LayerType.Note,
                    x: 100,
                    y: 100,
                    width: 100,
                    height: 100,
                    fill: { r: 0, g: 0, b: 0 },
                }),
            );
        });

        it('should translate selected layers when dragging', () => {
            const layerId = 'layer1';
            const initialLayer = { id: layerId, x: 50, y: 50 };
            const updateLayerMock = jest.fn();
            const getLayerMock = jest.fn(() => initialLayer);
            const storeOverrides = {
                layerIds: [layerId],
                getLayer: getLayerMock,
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            selectLayer(layerId, getByTestId);

            // Simulate dragging
            const svgElement = getByTestId('svg-element');
            fireEvent.pointerMove(svgElement, { clientX: 110, clientY: 110 });
            fireEvent.pointerUp(svgElement);

            expect(updateLayerMock).toHaveBeenCalledWith(layerId, {
                x: 60,
                y: 60,
            });
        });

        it('should update selection when drawing selection net', () => {
            const layerIds = ['layer1', 'layer2', 'layer3'];
            const storeOverrides = {
                layerIds,
                getLayers: jest.fn(() =>
                    layerIds.map((id) => ({ id, x: 0, y: 0 })),
                ),
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);
            const svgElement = getByTestId('svg-element');

            // Simulate shift+pointer down to start selection net
            fireEvent.pointerDown(svgElement, {
                button: 0,
                shiftKey: true,
                clientX: 100,
                clientY: 100,
            });

            fireEvent.pointerMove(svgElement, { clientX: 200, clientY: 200 });

            // The mocked findIntersectingLayersWithRectangle returns ['layer1', 'layer2']
            // Check that layer1 and layer2 are selected
            ['layer1', 'layer2'].forEach((id) => {
                const layerElement = getByTestId(`layer-preview-${id}`);
                expect(layerElement).toHaveStyle('border-color: blue');
            });

            // Ensure layer3 is not selected
            const layerElement = getByTestId('layer-preview-layer3');
            expect(layerElement).not.toHaveStyle('border-color: blue');
        });
    });

    describe('Resizing Layers', () => {
        it('should resize selected layer when dragging resize handle', () => {
            const layerId = 'layer1';
            const initialLayer = {
                id: layerId,
                x: 50,
                y: 50,
                width: 100,
                height: 100,
            };
            const updateLayerMock = jest.fn();
            const getLayerMock = jest.fn(() => initialLayer);
            const storeOverrides = {
                layerIds: [layerId],
                getLayer: getLayerMock,
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            selectLayer(layerId, getByTestId);

            const resizeHandle = getByTestId('resize-handle-corner');
            fireEvent.pointerDown(resizeHandle);

            const svgElement = getByTestId('svg-element');
            fireEvent.pointerMove(svgElement, { clientX: 200, clientY: 200 });
            fireEvent.pointerUp(svgElement);

            expect(updateLayerMock).toHaveBeenCalledWith(layerId, {
                x: 50,
                y: 50,
                width: 150,
                height: 150,
            });
        });
    });

    describe('Tool Usage', () => {
        it('should start and continue drawing with pencil tool', () => {
            const addLayerMock = jest.fn();
            const storeOverrides = { addLayer: addLayerMock };
            const { getByTestId } = renderCanvas({}, storeOverrides);
            const pencilButton = getByTestId('pencil-tool-button');
            fireEvent.click(pencilButton);

            const svgElement = getByTestId('svg-element');

            // Start drawing
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerMove(svgElement, { clientX: 110, clientY: 110 });
            fireEvent.pointerMove(svgElement, { clientX: 120, clientY: 120 });
            fireEvent.pointerUp(svgElement);

            expect(addLayerMock).toHaveBeenCalledWith(
                expect.objectContaining({ type: LayerType.Path }),
            );
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should delete selected layers when pressing Delete key', () => {
            const layerId = 'layer1';
            const removeLayersMock = jest.fn();
            const storeOverrides = {
                layerIds: [layerId],
                removeLayers: removeLayersMock,
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            selectLayer(layerId, getByTestId);
            fireEvent.keyDown(window, { key: 'Delete' });

            expect(removeLayersMock).toHaveBeenCalledWith([layerId]);
        });

        it('should copy and paste selected layers', () => {
            const layerId = 'layer1';
            const layerData = { id: layerId, x: 50, y: 50 };
            const addLayerMock = jest.fn();
            const getLayersMock = jest.fn(() => [layerData]);
            const storeOverrides = {
                layerIds: [layerId],
                getLayers: getLayersMock,
                addLayer: addLayerMock,
            };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            selectLayer(layerId, getByTestId);

            fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
            fireEvent.keyDown(window, { key: 'v', ctrlKey: true });

            expect(addLayerMock).toHaveBeenCalledWith(
                expect.objectContaining({ x: 60, y: 60 }),
            );

            // Meta+C and Meta+V
            fireEvent.keyDown(window, { key: 'c', metaKey: true });
            fireEvent.keyDown(window, { key: 'v', metaKey: true });

            expect(addLayerMock).toHaveBeenCalledWith(
                expect.objectContaining({ x: 60, y: 60 }),
            );
            expect(addLayerMock).toHaveBeenCalledTimes(2);
        });

        it('should select all layers when pressing Ctrl+A', () => {
            const layerIds = ['layer1', 'layer2', 'layer3'];
            const storeOverrides = { layerIds };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
            layerIds.forEach((id) => {
                const layerElement = getByTestId(`layer-preview-${id}`);
                expect(layerElement).toHaveStyle('border-color: blue');
            });
        });

        it('should select all layers when pressing Meta+A', () => {
            const layerIds = ['layer1', 'layer2', 'layer3', 'layer4'];
            const storeOverrides = { layerIds };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            fireEvent.keyDown(window, { key: 'a', metaKey: true });
            layerIds.forEach((id) => {
                const layerElement = getByTestId(`layer-preview-${id}`);
                expect(layerElement).toHaveStyle('border-color: blue');
            });
        });

        it('should not do anything on random key press', () => {
            const layerIds = ['layer1', 'layer2', 'layer3'];
            const storeOverrides = { layerIds };
            const { getByTestId } = renderCanvas({}, storeOverrides);

            fireEvent.keyDown(window, { key: 'k' });
            layerIds.forEach((id) => {
                const layerElement = getByTestId(`layer-preview-${id}`);
                expect(layerElement).not.toHaveStyle('border-color: blue');
            });
        });
    });

    describe('SelectionTools', () => {
        it('toggles SelectionTools by clicking the StylesButton', () => {
            const { getByTestId, queryByTestId } = renderCanvas({ edit: true });
            const stylesButton = getByTestId('styles-button');

            expect(queryByTestId('selection-tools')).toBeNull();

            fireEvent.click(stylesButton);
            expect(getByTestId('selection-tools')).toBeInTheDocument();

            // Click again to hide
            fireEvent.click(stylesButton);
            expect(queryByTestId('selection-tools')).toBeNull();
        });

        it('shows SelectionTools when a single layer is selected and styles button is clicked', () => {
            const { getByTestId } = renderCanvas({ edit: true });
            selectLayer('layer1', getByTestId);

            const stylesButton = getByTestId('styles-button');
            fireEvent.click(stylesButton);
            expect(getByTestId('selection-tools')).toBeInTheDocument();
        });

        it('applies line width changes via SelectionTools', () => {
            const updateLayerMock = jest.fn();
            const storeOverrides = {
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas(
                { edit: true },
                storeOverrides,
            );

            selectLayer('layer1', getByTestId);
            fireEvent.click(getByTestId('styles-button')); // show tools

            const lineWidthButton = getByTestId('line-width-button');
            fireEvent.click(lineWidthButton);

            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                lineWidth: 5,
            });
        });

        it('applies color changes via SelectionTools', () => {
            const updateLayerMock = jest.fn();
            const storeOverrides = {
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas(
                { edit: true },
                storeOverrides,
            );

            selectLayer('layer1', getByTestId);
            fireEvent.click(getByTestId('styles-button')); // show tools

            const colorButton = getByTestId('color-button');
            fireEvent.click(colorButton);

            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                fill: { r: 255, g: 0, b: 0 },
            });
        });

        it('applies transparent fill via SelectionTools', () => {
            const updateLayerMock = jest.fn();
            const storeOverrides = {
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas(
                { edit: true },
                storeOverrides,
            );

            selectLayer('layer1', getByTestId);
            fireEvent.click(getByTestId('styles-button'));

            const transparentButton = getByTestId('transparent-fill-button');
            fireEvent.click(transparentButton);

            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                fill: undefined,
            });
        });

        it('applies font changes via SelectionTools', () => {
            const updateLayerMock = jest.fn();
            const storeOverrides = {
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas(
                { edit: true },
                storeOverrides,
            );

            selectLayer('layer1', getByTestId);
            fireEvent.click(getByTestId('styles-button'));

            const fontButton = getByTestId('font-change-button');
            fireEvent.click(fontButton);
            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                fontName: 'Arial',
            });

            const fontSizeButton = getByTestId('font-size-button');
            fireEvent.click(fontSizeButton);
            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                fontSize: 20,
            });
        });

        it('applies text align and format changes via SelectionTools', () => {
            const updateLayerMock = jest.fn();
            const storeOverrides = {
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas(
                { edit: true },
                storeOverrides,
            );

            selectLayer('layer1', getByTestId);
            fireEvent.click(getByTestId('styles-button'));

            const textAlignButton = getByTestId('text-align-button');
            fireEvent.click(textAlignButton);
            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                textAlign: TextAlign.Left,
            });

            const textFormatButton = getByTestId('text-format-button');
            fireEvent.click(textFormatButton);
            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                textFormat: [TextFormat.Bold],
            });
        });

        it('applies position and size changes via SelectionTools', () => {
            const updateLayerMock = jest.fn();
            const storeOverrides = {
                updateLayer: updateLayerMock,
            };
            const { getByTestId } = renderCanvas(
                { edit: true },
                storeOverrides,
            );

            selectLayer('layer1', getByTestId);
            fireEvent.click(getByTestId('styles-button'));

            const positionButton = getByTestId('position-button');
            fireEvent.click(positionButton);
            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                x: 200,
                y: 200,
            });

            const sizeButton = getByTestId('size-button');
            fireEvent.click(sizeButton);
            expect(updateLayerMock).toHaveBeenCalledWith('layer1', {
                width: 300,
                height: 300,
            });
        });
    });
});
