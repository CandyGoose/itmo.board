import React from 'react';
import {
    fireEvent,
    render,
    RenderResult,
    waitFor,
} from '@testing-library/react';
import Canvas from './Canvas';
import '@testing-library/jest-dom';
import { CanvasMode, LayerType, TextAlign, TextFormat } from '@/types/canvas';
import { SelectionToolsProps } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/SelectionTools';
import { StylesButtonProps } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/StylesButton';

const mockUseStorage = jest.fn();
const mockUseMutation = jest.fn();
const mockUseCanRedo = jest.fn();
const mockUseCanUndo = jest.fn();
const mockUseHistory = jest.fn();
const mockUseOthersMapped = jest.fn();
const mockUseSelf = jest.fn();

let insertLayerFn: jest.Mock;
let translateSelectedLayersFn: jest.Mock;
let unselectLayersFn: jest.Mock;
let updateSelectionNetFn: jest.Mock;
let continueDrawingFn: jest.Mock;
let insertPathFn: jest.Mock;
let startDrawingFn: jest.Mock;
let resizeSelectedLayersFn: jest.Mock;
let deleteLayersFn: jest.Mock;
let copyLayersFn: jest.Mock;
let pasteLayersFn: jest.Mock;
let selectAllLayersFn: jest.Mock;
let setLayerColorFn: jest.Mock;
let setLayerTransparentFn: jest.Mock;
let setLayerLineWidthFn: jest.Mock;
let setLayerFontFn: jest.Mock;
let setLayerFontSizeFn: jest.Mock;
let setLayerTextAlignFn: jest.Mock;
let setLayerTextFormatFn: jest.Mock;
let setLayerPositionFn: jest.Mock;
let setLayerSizeFn: jest.Mock;
let moveToFrontFn: jest.Mock;
let moveToBackFn: jest.Mock;
let moveForwardFn: jest.Mock;
let moveBackwardFn: jest.Mock;

jest.mock('@/liveblocks.config', () => ({
    useStorage: (selector: any) => {
        return mockUseStorage(selector);
    },
    useMutation: (callback: any) => {
        // Each call to useMutation returns a unique mock function.
        const fn = jest.fn(callback);
        mockUseMutation.mockReturnValue(fn);
        return fn;
    },
    useCanRedo: () => mockUseCanRedo(),
    useCanUndo: () => mockUseCanUndo(),
    useHistory: () => mockUseHistory(),
    useOthersMapped: (cb: any) => mockUseOthersMapped(cb),
    useSelf: (cb: any) => mockUseSelf(cb),
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

jest.mock('./Participants', () => ({
    Participants: () => <div>Participants</div>,
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
    connectionIdToColor: jest.fn(() => 'blue'),
}));

jest.mock('nanoid', () => ({
    nanoid: () => 'nanoid',
}));

jest.mock(
    '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Toolbar',
    () => ({
        ToolBar: ({
            setCanvasState,
            deleteSelected,
            moveToFront,
            moveToBack,
            moveForward,
            moveBackward,
        }: any) => (
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
                <button
                    data-testid="delete-selected-button"
                    onClick={deleteSelected}
                >
                    Delete Selected
                </button>
                <button data-testid="move-front-button" onClick={moveToFront}>
                    Move Front
                </button>
                <button data-testid="move-back-button" onClick={moveToBack}>
                    Move Back
                </button>
                <button data-testid="move-forward-button" onClick={moveForward}>
                    Move Forward
                </button>
                <button
                    data-testid="move-backward-button"
                    onClick={moveBackward}
                >
                    Move Backward
                </button>
            </div>
        ),
    }),
);

jest.mock('next-intl', () => ({
    useTranslations: jest.fn().mockImplementation(() => () => 'a'),
}));

jest.mock(
    '@/app/[locale]/(dashboard)/boards/[boardId]/_components/SelectionBox',
    () => {
        interface SelectionBoxProps {
            onResizeHandlePointerDown: (
                corner: string,
                bounds: { x: number; y: number; width: number; height: number },
            ) => void;
            isShowingHandles: boolean;
        }

        return {
            SelectionBox: ({
                onResizeHandlePointerDown,
                isShowingHandles,
            }: SelectionBoxProps) => {
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
        };
    },
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
    StylesButton: ({ onClick, activeColor, ...props }: StylesButtonProps) => {
        // Преобразование цвета в строку
        const backgroundColor =
            typeof activeColor === 'string'
                ? activeColor // 'transparent'
                : `rgb(${activeColor.r}, ${activeColor.g}, ${activeColor.b})`;

        return (
            <button
                data-testid="styles-button"
                onClick={onClick}
                style={{ backgroundColor }}
                {...props}
            >
                Styles
            </button>
        );
    },
}));

jest.mock('./CursorsPresence', () => ({
    CursorsPresence: () => <div>CursorsPresence</div>,
}));

jest.mock('@clerk/nextjs', () => ({
    useOrganization: jest.fn(() => ({ membership: true })),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    })),
    useParams: jest.fn(() => ({ boardId: 'test-board-id' })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        toString: jest.fn(),
    })),
}));

describe('Canvas Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset mutation mocks each time
        insertLayerFn = jest.fn();
        translateSelectedLayersFn = jest.fn();
        unselectLayersFn = jest.fn();
        updateSelectionNetFn = jest.fn();
        continueDrawingFn = jest.fn();
        insertPathFn = jest.fn();
        startDrawingFn = jest.fn();
        resizeSelectedLayersFn = jest.fn();
        deleteLayersFn = jest.fn();
        copyLayersFn = jest.fn();
        pasteLayersFn = jest.fn();
        selectAllLayersFn = jest.fn();
        setLayerColorFn = jest.fn();
        setLayerTransparentFn = jest.fn();
        setLayerLineWidthFn = jest.fn();
        setLayerFontFn = jest.fn();
        setLayerFontSizeFn = jest.fn();
        setLayerTextAlignFn = jest.fn();
        setLayerTextFormatFn = jest.fn();
        setLayerPositionFn = jest.fn();
        setLayerSizeFn = jest.fn();
        moveToFrontFn = jest.fn();
        moveToBackFn = jest.fn();
        moveForwardFn = jest.fn();
        moveBackwardFn = jest.fn();

        mockUseCanUndo.mockReturnValue(false);
        mockUseCanRedo.mockReturnValue(false);
        mockUseHistory.mockReturnValue({
            undo: jest.fn(),
            redo: jest.fn(),
            pause: jest.fn(),
            resume: jest.fn(),
        });
        mockUseOthersMapped.mockReturnValue(new Map());
        mockUseSelf.mockReturnValue({
            presence: { selection: [], pencilDraft: null },
        });

        // Setup default storage return
        mockUseStorage.mockImplementation((selector) => {
            const root = {
                layerIds: ['layer1', 'layer2'],
                layers: new Map([
                    [
                        'layer1',
                        {
                            id: 'layer1',
                            x: 50,
                            y: 50,
                            width: 100,
                            height: 100,
                            type: LayerType.Rectangle,
                        },
                    ],
                    [
                        'layer2',
                        {
                            id: 'layer2',
                            x: 50,
                            y: 50,
                            width: 100,
                            height: 100,
                            type: LayerType.Rectangle,
                        },
                    ],
                ]),
            };
            return selector(root);
        });

        // Mock useMutation: we know which mutations are defined in Canvas
        // We'll return mocks in order. The order must match the order of mutation definitions in the Canvas file.
        mockUseMutation
            .mockReturnValueOnce(insertLayerFn)
            .mockReturnValueOnce(translateSelectedLayersFn)
            .mockReturnValueOnce(unselectLayersFn)
            .mockReturnValueOnce(updateSelectionNetFn)
            .mockReturnValueOnce(continueDrawingFn)
            .mockReturnValueOnce(insertPathFn)
            .mockReturnValueOnce(startDrawingFn)
            .mockReturnValueOnce(resizeSelectedLayersFn)
            .mockReturnValueOnce(deleteLayersFn)
            .mockReturnValueOnce(copyLayersFn)
            .mockReturnValueOnce(pasteLayersFn)
            .mockReturnValueOnce(selectAllLayersFn)
            .mockReturnValueOnce(setLayerColorFn)
            .mockReturnValueOnce(setLayerTransparentFn)
            .mockReturnValueOnce(setLayerLineWidthFn)
            .mockReturnValueOnce(setLayerFontFn)
            .mockReturnValueOnce(setLayerFontSizeFn)
            .mockReturnValueOnce(setLayerTextAlignFn)
            .mockReturnValueOnce(setLayerTextFormatFn)
            .mockReturnValueOnce(setLayerPositionFn)
            .mockReturnValueOnce(setLayerSizeFn)
            .mockReturnValueOnce(moveToFrontFn)
            .mockReturnValueOnce(moveToBackFn)
            .mockReturnValueOnce(moveForwardFn)
            .mockReturnValueOnce(moveBackwardFn);
    });

    const renderCanvas = (props = {}): RenderResult => {
        return render(<Canvas boardId="test-board-id" {...props} />);
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
        jest.mock('@clerk/nextjs', () => ({
            useOrganization: jest.fn(() => ({ membership: null })),
        }));

        const { getByTestId } = renderCanvas();
        const insertButton = getByTestId('insert-rectangle-button');
        const svgElement = getByTestId('svg-element');

        fireEvent.click(insertButton);
        fireEvent.pointerUp(svgElement, { clientX: 100, clientY: 100 });

        expect(insertLayerFn).not.toHaveBeenCalled();
    });

    it('renders the correct number of LayerPreview components', () => {
        mockUseStorage.mockImplementation((selector) => {
            const root = {
                layerIds: ['layer1', 'layer2', 'layer3'],
                layers: new Map([
                    [
                        'layer1',
                        {
                            id: 'layer1',
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100,
                            type: LayerType.Rectangle,
                        },
                    ],
                    [
                        'layer2',
                        {
                            id: 'layer2',
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100,
                            type: LayerType.Rectangle,
                        },
                    ],
                    [
                        'layer3',
                        {
                            id: 'layer3',
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100,
                            type: LayerType.Rectangle,
                        },
                    ],
                ]),
            };
            return selector(root);
        });

        const { getAllByTestId } = renderCanvas();
        const layerPreviews = getAllByTestId(/layer-preview-/);
        expect(layerPreviews).toHaveLength(3);
    });

    describe('Panning', () => {
        it('should pan with pointer correctly', async () => {
            const { getByTestId } = renderCanvas();
            const svgElement = getByTestId('svg-element');
            const svgGroup = getByTestId('svg-group');

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
            // Selection is mainly handled via presence, but we can at least check style changes if selection occurs.
            // Since actual selection is implemented via mutations (unselect, etc.), we can at least ensure no errors:
            const { getByTestId } = renderCanvas();

            const firstLayer = getByTestId('layer-preview-layer1');
            fireEvent.pointerDown(firstLayer);

            // On pointer down on a layer, we translate. If this sets selection presence, it might trigger unselectLayers or no.
            // Without a direct state check, we trust the logic. For demonstration, just ensure no mutation errors:
            expect(translateSelectedLayersFn).not.toHaveBeenCalled();
            // The presence is updated internally, cannot be easily tested without presence mocking.
            // We rely on style checks from code above. At least ensure border-color changed:
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
            const { getByTestId } = renderCanvas();
            const insertRectangle = getByTestId('insert-rectangle-button');
            fireEvent.click(insertRectangle);

            const svgElement = getByTestId('svg-element');
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerUp(svgElement, { clientX: 100, clientY: 100 });

            expect(insertLayerFn).toHaveBeenCalledWith(
                expect.anything(),
                LayerType.Rectangle,
                expect.objectContaining({ x: 100, y: 100 }),
            );

            const insertEllipse = getByTestId('insert-ellipse-button');
            fireEvent.click(insertEllipse);
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerUp(svgElement, { clientX: 100, clientY: 100 });

            expect(insertLayerFn).toHaveBeenCalledWith(
                expect.anything(),
                LayerType.Ellipse,
                expect.objectContaining({ x: 100, y: 100 }),
            );

            const insertNote = getByTestId('insert-note-button');
            fireEvent.click(insertNote);
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerUp(svgElement, { clientX: 100, clientY: 100 });

            expect(insertLayerFn).toHaveBeenCalledWith(
                expect.anything(),
                LayerType.Note,
                expect.objectContaining({ x: 100, y: 100 }),
            );
        });

        it('should translate selected layers when dragging', () => {
            const { getByTestId } = renderCanvas();
            selectLayer('layer1', getByTestId);

            const svgElement = getByTestId('svg-element');
            fireEvent.pointerMove(svgElement, { clientX: 110, clientY: 110 });
            fireEvent.pointerUp(svgElement);

            expect(translateSelectedLayersFn).toHaveBeenCalled();
        });

        it('should update selection when drawing selection net', () => {
            const { getByTestId } = renderCanvas();
            const svgElement = getByTestId('svg-element');

            fireEvent.pointerDown(svgElement, {
                button: 0,
                shiftKey: true,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerMove(svgElement, { clientX: 200, clientY: 200 });

            expect(updateSelectionNetFn).toHaveBeenCalled();
        });
    });

    describe('Resizing Layers', () => {
        it('should resize selected layer when dragging resize handle', () => {
            const { getByTestId } = renderCanvas();
            selectLayer('layer1', getByTestId);

            const resizeHandle = getByTestId('resize-handle-corner');
            fireEvent.pointerDown(resizeHandle);

            const svgElement = getByTestId('svg-element');
            fireEvent.pointerMove(svgElement, { clientX: 200, clientY: 200 });
            fireEvent.pointerUp(svgElement);

            expect(resizeSelectedLayersFn).toHaveBeenCalled();
        });
    });

    describe('Tool Usage', () => {
        it('should start and continue drawing with pencil tool', () => {
            const { getByTestId } = renderCanvas();
            const pencilButton = getByTestId('pencil-tool-button');
            fireEvent.click(pencilButton);

            const svgElement = getByTestId('svg-element');
            fireEvent.pointerDown(svgElement, {
                button: 0,
                clientX: 100,
                clientY: 100,
            });
            fireEvent.pointerMove(svgElement, { clientX: 110, clientY: 110 });
            fireEvent.pointerMove(svgElement, { clientX: 120, clientY: 120 });
            fireEvent.pointerUp(svgElement);

            expect(startDrawingFn).toHaveBeenCalled();
            expect(continueDrawingFn).toHaveBeenCalled();
            expect(insertPathFn).toHaveBeenCalled();
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should delete selected layers when pressing Delete key', () => {
            // Simulate selection
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            renderCanvas();

            fireEvent.keyDown(window, { key: 'Delete' });

            expect(deleteLayersFn).toHaveBeenCalled();
        });

        it('should copy and paste selected layers', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            renderCanvas();

            fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
            expect(copyLayersFn).toHaveBeenCalled();

            fireEvent.keyDown(window, { key: 'v', ctrlKey: true });
            expect(pasteLayersFn).toHaveBeenCalled();
        });

        it('should select all layers when pressing Ctrl+A', () => {
            renderCanvas();

            fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
            expect(selectAllLayersFn).toHaveBeenCalled();
        });
    });

    describe('SelectionTools', () => {
        it('toggles SelectionTools by clicking the StylesButton', () => {
            const { getByTestId, queryByTestId } = renderCanvas();
            const stylesButton = getByTestId('styles-button');

            expect(queryByTestId('selection-tools')).toBeNull();

            fireEvent.click(stylesButton);
            expect(getByTestId('selection-tools')).toBeInTheDocument();

            // Click again to hide
            fireEvent.click(stylesButton);
            expect(queryByTestId('selection-tools')).toBeNull();
        });

        it('shows SelectionTools when a single layer is selected and styles button is clicked', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            const stylesButton = getByTestId('styles-button');
            fireEvent.click(stylesButton);
            expect(getByTestId('selection-tools')).toBeInTheDocument();
        });

        it('applies line width changes via SelectionTools', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            fireEvent.click(getByTestId('styles-button'));

            const lineWidthButton = getByTestId('line-width-button');
            fireEvent.click(lineWidthButton);
            expect(setLayerLineWidthFn).toHaveBeenCalledWith(
                expect.anything(),
                5,
            );
        });

        it('applies color changes via SelectionTools', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            fireEvent.click(getByTestId('styles-button'));

            const colorButton = getByTestId('color-button');
            fireEvent.click(colorButton);
            expect(setLayerColorFn).toHaveBeenCalledWith(expect.anything(), {
                r: 255,
                g: 0,
                b: 0,
            });
        });

        it('applies transparent fill via SelectionTools', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            fireEvent.click(getByTestId('styles-button'));

            const transparentButton = getByTestId('transparent-fill-button');
            fireEvent.click(transparentButton);
            expect(setLayerTransparentFn).toHaveBeenCalledWith(
                expect.anything(),
                true,
            );
        });

        it('applies font changes via SelectionTools', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            fireEvent.click(getByTestId('styles-button'));

            const fontButton = getByTestId('font-change-button');
            fireEvent.click(fontButton);
            expect(setLayerFontFn).toHaveBeenCalledWith(
                expect.anything(),
                'Arial',
            );

            const fontSizeButton = getByTestId('font-size-button');
            fireEvent.click(fontSizeButton);
            expect(setLayerFontSizeFn).toHaveBeenCalledWith(
                expect.anything(),
                20,
            );
        });

        it('applies text align and format changes via SelectionTools', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            fireEvent.click(getByTestId('styles-button'));

            const textAlignButton = getByTestId('text-align-button');
            fireEvent.click(textAlignButton);
            expect(setLayerTextAlignFn).toHaveBeenCalledWith(
                expect.anything(),
                TextAlign.Left,
            );

            const textFormatButton = getByTestId('text-format-button');
            fireEvent.click(textFormatButton);
            expect(setLayerTextFormatFn).toHaveBeenCalledWith(
                expect.anything(),
                [TextFormat.Bold],
            );
        });

        it('applies position and size changes via SelectionTools', () => {
            mockUseSelf.mockReturnValue({
                presence: { selection: ['layer1'] },
            });
            const { getByTestId } = renderCanvas();
            fireEvent.click(getByTestId('styles-button'));

            const positionButton = getByTestId('position-button');
            fireEvent.click(positionButton);
            expect(setLayerPositionFn).toHaveBeenCalledWith(
                expect.anything(),
                200,
                200,
            );

            const sizeButton = getByTestId('size-button');
            fireEvent.click(sizeButton);
            expect(setLayerSizeFn).toHaveBeenCalledWith(
                expect.anything(),
                300,
                300,
            );
        });
    });
});
