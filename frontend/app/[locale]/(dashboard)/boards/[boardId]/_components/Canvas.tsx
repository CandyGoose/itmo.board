import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayerPreview } from './LayerPreview';
import {
    Camera,
    CanvasMode,
    CanvasState,
    Color,
    EllipseLayer,
    Layer,
    LayerType,
    NoteLayer,
    PathLayer,
    Point,
    RectangleLayer,
    Side,
    TextAlign,
    TextFormat,
    XYWH,
} from '@/types/canvas';
import {
    clickCloseToAnyPath,
    cn,
    colorToCss,
    connectionIdToColor,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from '@/lib/utils';
import { Info } from './Info';
import { ToolBar } from './Toolbar';
import { nanoid } from 'nanoid';
import { SelectionTools } from './SelectionTools';
import { StylesButton } from './StylesButton';
import { Grid } from './Grid';
import { SelectionBox } from './SelectionBox';
import { useOrganization } from '@clerk/nextjs';
import { Participants } from './Participants';
import { CursorsPresence } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/CursorsPresence';
import {
    useCanRedo,
    useCanUndo,
    useHistory,
    useMutation,
    useOthersMapped,
    useSelf,
    useStorage,
} from '@/liveblocks.config';
import { LiveObject } from '@liveblocks/client';
import { useDeleteLayers } from '@/hooks/useDeleteLayers';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 20;

interface CanvasProps {
    boardId: string;
}
// TODO: Transparent fill not working
// TODO: polyline pencildraft works incorrectly
const Canvas: FC<CanvasProps> = ({ boardId }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [svgRect, setSvgRect] = useState<DOMRect | null>(null);
    const layerIds = useStorage((root) => root.layerIds);
    const layers = useStorage((root) => root.layers);

    const [showSelectionTools, setShowSelectionTools] = useState(false);
    const { membership } = useOrganization();
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        if (membership) setEditable(true);
    }, [membership]);

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [moved, setMoved] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState({
        x: 0,
        y: 0,
    });

    const selections = useOthersMapped((other) => other.presence.selection);
    const selection = useSelf((me) => me.presence.selection);

    // Single-layer update mutation
    const updateLayer = useMutation(
        ({ storage }, id: string, updates: Partial<Layer>) => {
            const liveLayers = storage.get('layers');
            const layer = liveLayers.get(id);

            if (layer) {
                layer.update(updates);
            }
        },
        [selection],
    );

    // Multi-layer ordering mutations
    const moveLayersToFront = useMutation(
        ({ storage }, ids: string[]) => {
            const liveLayerIds = storage.get('layerIds');
            // For each selected layer, remove and re-push to end
            for (const id of ids) {
                const index = liveLayerIds.toImmutable().indexOf(id);
                if (index !== -1) {
                    liveLayerIds.delete(index);
                    liveLayerIds.push(id);
                }
            }
        },
        [selection],
    );

    const moveLayersToBack = useMutation(
        ({ storage }, ids: string[]) => {
            const liveLayerIds = storage.get('layerIds');
            // For each selected layer, remove and insert at the start in order
            for (let i = ids.length - 1; i >= 0; i--) {
                const id = ids[i];
                const index = liveLayerIds.toImmutable().indexOf(id);
                if (index !== -1) {
                    liveLayerIds.delete(index);
                    liveLayerIds.insert(id, 0);
                }
            }
        },
        [selection],
    );

    const moveLayersForward = useMutation(
        ({ storage }, ids: string[]) => {
            const liveLayerIds = storage.get('layerIds');
            const arr = liveLayerIds.toImmutable();
            const idsSet = new Set(ids);

            // Move each selected layer forward one position if possible
            for (let i = arr.length - 2; i >= 0; i--) {
                if (idsSet.has(arr[i]) && !idsSet.has(arr[i + 1])) {
                    liveLayerIds.move(i, i + 1);
                }
            }
        },
        [selection],
    );

    const moveLayersBackward = useMutation(
        ({ storage }, ids: string[]) => {
            const liveLayerIds = storage.get('layerIds');
            const arr = liveLayerIds.toImmutable();
            const idsSet = new Set(ids);

            // Move each selected layer backward one position if possible
            for (let i = 1; i < arr.length; i++) {
                if (idsSet.has(arr[i]) && !idsSet.has(arr[i - 1])) {
                    liveLayerIds.move(i, i - 1);
                }
            }
        },
        [selection],
    );

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });

    const pencilDraft = useSelf((me) => me.presence.pencilDraft);

    const history = useHistory();
    const canUndo = useCanUndo();
    const canRedo = useCanRedo();

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0,
    });
    const [transparentFill, setTransparentFill] = useState(false);
    const [lineWidth, setLineWidth] = useState<number>(2);
    const [fontName, setFontName] = useState<string>('Kalam');
    const [fontSize, setFontSize] = useState<number>(14);
    const [textAlign, setTextAlign] = useState<TextAlign>(TextAlign.Center);
    const [textFormat, setTextFormat] = useState<TextFormat[]>([
        TextFormat.None,
    ]);

    useEffect(() => {
        if (svgRef.current) {
            setSvgRect(svgRef.current.getBoundingClientRect());
        }

        const handleResize = () => {
            if (svgRef.current) {
                setSvgRect(svgRef.current.getBoundingClientRect());
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Determine if any tool is active
    const isAnyToolActive = useMemo(() => {
        return (
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing ||
            (canvasState.mode === CanvasMode.Inserting &&
                (canvasState.layerType === LayerType.Text ||
                    canvasState.layerType === LayerType.Note ||
                    canvasState.layerType === LayerType.Rectangle ||
                    canvasState.layerType === LayerType.Ellipse)) ||
            canvasState.mode === CanvasMode.Pencil
        );
    }, [canvasState]);

    const toggleSelectionTools = useCallback(() => {
        if (isAnyToolActive) {
            setShowSelectionTools((prev) => !prev);
        }
    }, [isAnyToolActive]);

    // Map of layer IDs to selection colors
    const layerIdsToColorSelection = useMemo(() => {
        const layerIdsToColorSelection: Record<string, string> = {};
        for (const user of selections) {
            const [connectionId, selection] = user;

            for (const layerId of selection) {
                layerIdsToColorSelection[layerId] =
                    connectionIdToColor(connectionId);
            }
        }
        return layerIdsToColorSelection;
    }, [selections]);

    const insertLayer = useMutation(
        ({ storage, setMyPresence }, layerType: LayerType, position: Point) => {
            const liveLayers = storage.get('layers');
            const liveLayerIds = storage.get('layerIds');
            const id = nanoid();
            let layerData: Layer;

            const baseProps = {
                id,
                x: position.x,
                y: position.y,
                width: 100,
                height: 100,
                fill: transparentFill ? undefined : lastUsedColor,
            };

            switch (layerType) {
                case LayerType.Rectangle:
                    layerData = {
                        ...baseProps,
                        type: LayerType.Rectangle,
                    } as RectangleLayer;
                    break;
                case LayerType.Ellipse:
                    layerData = {
                        ...baseProps,
                        type: LayerType.Ellipse,
                    } as EllipseLayer;
                    break;
                case LayerType.Note:
                    layerData = {
                        ...baseProps,
                        type: LayerType.Note,
                        value: '',
                        fontName,
                        fontSize,
                        textAlign,
                        textFormat,
                    } as NoteLayer;
                    break;
                default:
                    throw new Error(`Invalid layer type: ${layerType}`);
            }

            const layer = new LiveObject<Layer>(layerData);

            liveLayerIds.push(id);
            liveLayers.set(id, layer);

            setMyPresence({ selection: [id] }, { addToHistory: true });
            setCanvasState({ mode: CanvasMode.None });
        },
        [
            fontName,
            fontSize,
            lastUsedColor,
            textAlign,
            textFormat,
            transparentFill,
        ],
    );

    const translateSelectedLayers = useMutation(
        ({ storage }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Translating || !editable)
                return;

            const offset = {
                x: point.x - (canvasState.current?.x ?? 0),
                y: point.y - (canvasState.current?.y ?? 0),
            };

            const liveLayers = storage.get('layers');

            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({
                        x: layer.get('x') + offset.x,
                        y: layer.get('y') + offset.y,
                    });
                }
            });
            setCanvasState({
                mode: CanvasMode.Translating,
                current: point,
            });
        },
        [canvasState, editable],
    );

    const unselectLayers = useMutation(({ self, setMyPresence }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);

    const updateSelectionNet = useMutation(
        ({ storage, setMyPresence }, current: Point, origin: Point) => {
            if (!editable) return;
            const layers = storage.get('layers').toImmutable();

            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });

            const selectedLayerIds = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                origin,
                current,
            );
            setMyPresence({ selection: selectedLayerIds });
        },
        [editable, layerIds],
    );

    // Start multi-selection if pointer moved sufficiently
    const startMultiSelection = useCallback(
        (current: Point, origin: Point) => {
            if (!editable) return;
            if (
                Math.abs(current.x - origin.x) +
                    Math.abs(current.y - origin.y) >
                5
            ) {
                setCanvasState({
                    mode: CanvasMode.SelectionNet,
                    origin,
                    current,
                });
            }
        },
        [editable],
    );

    const continueDrawing = useMutation(
        ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;

            const roundedPoint: [number, number, number] = [
                Number(point.x.toFixed(4)),
                Number(point.y.toFixed(4)),
                Number(e.pressure),
            ];

            if (pencilDraft && pencilDraft.length > 0) {
                const lastPoint = pencilDraft[pencilDraft.length - 1];
                const dx = roundedPoint[0] - lastPoint[0];
                const dy = roundedPoint[1] - lastPoint[1];
                const distanceSquared = dx * dx + dy * dy;
                const threshold = 0.001;

                if (distanceSquared > threshold * threshold) {
                    setMyPresence({
                        pencilDraft: [...pencilDraft, roundedPoint],
                    });
                } else {
                    setMyPresence({
                        pencilDraft: [...pencilDraft],
                    });
                }
            } else {
                setMyPresence({
                    pencilDraft: [roundedPoint],
                });
            }
        },
        [],
    );

    const insertPath = useMutation(
        ({ storage, self, setMyPresence }) => {
            const liveLayers = storage.get('layers');
            const { pencilDraft } = self.presence;
            if (pencilDraft && pencilDraft.length > 1) {
                const id = nanoid();
                const newLayer: PathLayer = {
                    id,
                    type: LayerType.Path,
                    ...penPointsToPathLayer(pencilDraft),
                    fill: lastUsedColor,
                    lineWidth: lineWidth,
                } as PathLayer;
                liveLayers.set(id, new LiveObject(newLayer));
                const liveLayerIds = storage.get('layerIds');
                liveLayerIds.push(id);
            }
            setMyPresence({ pencilDraft: null });
        },
        [pencilDraft, lastUsedColor, lineWidth],
    );

    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number) => {
            setMyPresence({
                pencilDraft: [[point.x, point.y, pressure]],
                penColor: lastUsedColor,
            });
        },
        [lastUsedColor],
    );

    const resizeSelectedLayers = useMutation(
        ({ storage }, currentPoint: Point) => {
            if (canvasState.mode !== CanvasMode.Resizing) return;
            const { initialBounds, corner } = canvasState;
            const newBounds = resizeBounds(
                initialBounds!,
                corner!,
                currentPoint,
            );

            const liveLayers = storage.get('layers');
            const layer = liveLayers.get(selection[0]);
            if (layer) {
                layer.update(newBounds);
            }
        },
        [canvasState],
    );

    const onResizeHandlePointerDown = useCallback(
        (corner: Side, initialBounds: XYWH) => {
            if (!editable) return;
            history.pause();
            setCanvasState({
                mode: CanvasMode.Resizing,
                initialBounds,
                corner,
            });
        },
        [editable, history],
    );

    // Event handlers
    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            e.stopPropagation();
            const { clientX, clientY, deltaY } = e;
            const zoomIntensity = 0.001;
            const newScale = Math.min(
                Math.max(scale - deltaY * zoomIntensity, MIN_ZOOM),
                MAX_ZOOM,
            ); // Clamp scale

            // Calculate the mouse position relative to the SVG
            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // Calculate the new camera position to zoom towards the mouse
            const scaleFactor = newScale / scale;
            const newCameraX = offsetX - (offsetX - camera.x) * scaleFactor;
            const newCameraY = offsetY - (offsetY - camera.y) * scaleFactor;

            setScale(newScale);
            setCamera({ x: newCameraX, y: newCameraY });
        },
        [scale, camera],
    );

    const onLayerPointerDown = useMutation(
        ({ setMyPresence }, e: React.PointerEvent, layerId: string) => {
            if (
                canvasState.mode === CanvasMode.Pencil ||
                canvasState.mode === CanvasMode.Inserting ||
                !editable
            ) {
                return;
            }
            history.pause();
            e.stopPropagation();
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);

            if (!selection.includes(layerId)) {
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
            }

            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState, editable, camera, scale, svgRect],
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);
            if (canvasState.mode === CanvasMode.Inserting) {
                return;
            }
            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point, e.pressure);
                return;
            }
            if (e.button === 0) {
                if (e.shiftKey) {
                    setCanvasState({
                        mode: CanvasMode.SelectionNet,
                        origin: point,
                        current: point,
                    });
                } else {
                    const closePathId = clickCloseToAnyPath(
                        layerIds,
                        layers,
                        point,
                        10,
                    );
                    if (closePathId) {
                        onLayerPointerDown(e, closePathId);
                        return;
                    }
                    setIsPanning(true);
                    setLastPointerPosition({ x: e.clientX, y: e.clientY });
                }
            } else {
                setCanvasState({ mode: CanvasMode.Pressing, origin: point });
            }
        },
        [
            camera,
            canvasState.mode,
            layerIds,
            layers,
            onLayerPointerDown,
            scale,
            startDrawing,
            svgRect,
        ],
    );

    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            if (!editable) {
                setCanvasState({ mode: CanvasMode.None });
            }
            e.stopPropagation();
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);

            switch (canvasState.mode) {
                case CanvasMode.Pressing:
                    startMultiSelection(point, canvasState.origin!);
                    break;
                case CanvasMode.SelectionNet:
                    updateSelectionNet(point, canvasState.origin!);
                    break;
                case CanvasMode.Translating:
                    translateSelectedLayers(point);
                    break;
                case CanvasMode.Resizing:
                    resizeSelectedLayers(point);
                    break;
                case CanvasMode.Pencil:
                    if (pencilDraft) continueDrawing(point, e);
                    break;
                default:
                    if (isPanning) {
                        const dx = e.clientX - lastPointerPosition.x;
                        const dy = e.clientY - lastPointerPosition.y;
                        setCamera((prev) => ({
                            x: prev.x + dx,
                            y: prev.y + dy,
                        }));
                        setLastPointerPosition({ x: e.clientX, y: e.clientY });
                        setMoved(true);
                    }
            }
            setMyPresence({ cursor: point });
        },
        [
            editable,
            camera,
            scale,
            svgRect,
            canvasState,
            isPanning,
            startMultiSelection,
            updateSelectionNet,
            translateSelectedLayers,
            resizeSelectedLayers,
            pencilDraft,
            continueDrawing,
            lastPointerPosition,
        ],
    );

    const onPointerUp = useMutation(
        ({}, e) => {
            setIsPanning(false);
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);
            if (
                canvasState.mode === CanvasMode.None ||
                canvasState.mode === CanvasMode.Pressing
            ) {
                if (!moved) unselectLayers();
                setCanvasState({ mode: CanvasMode.None });
            } else if (canvasState.mode === CanvasMode.Pencil && editable) {
                if (pencilDraft) insertPath();
            } else if (canvasState.mode === CanvasMode.Inserting && editable) {
                insertLayer(canvasState.layerType!, point);
            } else {
                setCanvasState({ mode: CanvasMode.None });
            }
            setMoved(false);
            history.resume();
        },
        [
            camera,
            canvasState,
            editable,
            insertLayer,
            insertPath,
            moved,
            pencilDraft,
            scale,
            svgRect,
            unselectLayers,
        ],
    );

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
        setIsPanning(false);
    }, []);

    const deleteLayers = useDeleteLayers();

    const [copiedLayers, setCopiedLayers] = useState<Layer[]>([]);
    const [pasteCount, setPasteCount] = useState(0);

    const copyLayers = useMutation(({ storage, setMyPresence }) => {
        const liveLayers = storage.get('layers');
        const layersToCopy = selection
            .map((layerId) => {
                const layer = liveLayers.get(layerId);
                if (layer) {
                    return {
                        id: nanoid(),
                        data: layer.toObject(),
                    };
                }
                return null;
            })
            .filter(
                (layer): layer is { id: string; data: Layer } => layer !== null,
            );

        setMyPresence({ copiedLayers: layersToCopy });
        const copiedLayers = layersToCopy.map((layer) => layer.data);
        setCopiedLayers(copiedLayers);
        setPasteCount(0);
    }, []);

    const pasteLayers = useMutation(
        ({ storage, setMyPresence }) => {
            if (copiedLayers.length === 0) return;
            const liveLayers = storage.get('layers');
            const liveLayerIds = storage.get('layerIds');

            const offset = 10 * (pasteCount + 1);
            const newLayerIds = copiedLayers.map((copiedLayer) => {
                const newLayerId = nanoid();
                const newLayer = new LiveObject({
                    ...copiedLayer,
                    id: newLayerId,
                    x: copiedLayer.x + offset,
                    y: copiedLayer.y + offset,
                });

                liveLayers.set(newLayerId, newLayer);
                return newLayerId;
            });

            newLayerIds.map((id) => liveLayerIds.push(id));
            setMyPresence({ selection: newLayerIds });
            setPasteCount((prev) => prev + 1);
        },
        [copiedLayers, pasteCount],
    );

    const selectAllLayers = useMutation(({ storage, setMyPresence }) => {
        const allLayerIds = [...storage.get('layerIds').toImmutable()];
        setMyPresence({ selection: allLayerIds });
    }, []);

    // Functions for SelectionTools
    const setLayerColor = useCallback(
        (color: Color) => {
            selection.forEach((id) => {
                updateLayer(id, { fill: color });
            });
        },
        [selection, updateLayer],
    );
    const setLayerTransparent = useCallback(
        (checked: boolean) => {
            selection.forEach((id) => {
                updateLayer(id, { fill: checked ? undefined : lastUsedColor });
            });
        },
        [selection, updateLayer, lastUsedColor],
    );
    const setLayerLineWidth = useCallback(
        (width: number) => {
            selection.forEach((id) => {
                updateLayer(id, { lineWidth: width });
            });
        },
        [selection, updateLayer],
    );
    const setLayerFont = useCallback(
        (name: string) => {
            selection.forEach((id) => {
                updateLayer(id, { fontName: name });
            });
        },
        [selection, updateLayer],
    );
    const setLayerFontSize = useCallback(
        (size: number) => {
            selection.forEach((id) => {
                updateLayer(id, { fontSize: size });
            });
        },
        [selection, updateLayer],
    );
    const setLayerTextAlign = useCallback(
        (align: TextAlign) => {
            selection.forEach((id) => {
                updateLayer(id, { textAlign: align });
            });
        },
        [selection, updateLayer],
    );
    const setLayerTextFormat = useCallback(
        (format: TextFormat[]) => {
            selection.forEach((id) => {
                updateLayer(id, { textFormat: format });
            });
        },
        [selection, updateLayer],
    );

    // Keyboard Actions
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (!editable) {
                e.preventDefault();
                return;
            }

            switch (e.key) {
                case 'z': {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.shiftKey) {
                            history.redo();
                        } else {
                            history.undo();
                        }
                        break;
                    }
                    break;
                }
                case 'Delete':
                    if (
                        selection.some(
                            (id) => layers.get(id)?.type !== LayerType.Note,
                        )
                    ) {
                        deleteLayers();
                    }
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        copyLayers();
                    }
                    break;
                case 'v':
                    if (e.ctrlKey || e.metaKey) {
                        pasteLayers();
                    }
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        selectAllLayers();
                    }
                    break;
                default:
                    break;
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [
        copyLayers,
        pasteLayers,
        deleteLayers,
        selectAllLayers,
        editable,
        selection,
        history,
        layers,
    ]);

    const handleMoveToFront = useCallback(() => {
        moveLayersToFront(selection);
    }, [moveLayersToFront, selection]);

    const handleMoveToBack = useCallback(() => {
        moveLayersToBack(selection);
    }, [moveLayersToBack, selection]);

    const handleMoveForward = useCallback(() => {
        moveLayersForward(selection);
    }, [moveLayersForward, selection]);

    const handleMoveBackward = useCallback(() => {
        moveLayersBackward(selection);
    }, [moveLayersBackward, selection]);

    const layersMap = new Map(Array.from(layers || new Map()));

    return (
        <main
            className={cn('h-full w-full relative bg-neutral-100 touch-none')}
            data-testid="canvas-main"
        >
            {/* Container for aligning buttons in the top-right corner */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <Participants className="h-12 w-12" />
                <StylesButton
                    id="styles-button"
                    activeColor={lastUsedColor}
                    onClick={toggleSelectionTools}
                    className="h-12 w-30 bg-white rounded-md shadow-md flex items-center justify-center"
                />
            </div>

            <Info
                boardId={boardId}
                editable={editable}
                setEditable={setEditable}
            />
            <ToolBar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                undo={history.undo}
                redo={history.redo}
                canUndo={canUndo}
                canRedo={canRedo}
                editable={editable}
                deleteSelected={deleteLayers}
                moveToFront={handleMoveToFront}
                moveToBack={handleMoveToBack}
                moveForward={handleMoveForward}
                moveBackward={handleMoveBackward}
            />

            {editable &&
                showSelectionTools &&
                (selection.length === 0 || selection.length === 1) && (
                    <SelectionTools
                        selectedLayers={
                            selection
                                .map((id) => layersMap.get(id))
                                .filter(Boolean) as Layer[]
                        }
                        onColorChange={
                            selection.length === 1
                                ? setLayerColor
                                : setLastUsedColor
                        }
                        lineWidth={lineWidth}
                        onLineWidthChange={
                            selection.length === 1
                                ? setLayerLineWidth
                                : setLineWidth
                        }
                        fontName={fontName}
                        onFontChange={
                            selection.length === 1 ? setLayerFont : setFontName
                        }
                        fontSize={fontSize}
                        onFontSizeChange={
                            selection.length === 1
                                ? setLayerFontSize
                                : setFontSize
                        }
                        fontAlign={textAlign}
                        onTextAlignChange={
                            selection.length === 1
                                ? setLayerTextAlign
                                : setTextAlign
                        }
                        fontFormat={textFormat}
                        onTextFormatChange={
                            selection.length === 1
                                ? setLayerTextFormat
                                : setTextFormat
                        }
                        onPositionChange={(x, y) => {
                            if (selection.length === 1) {
                                updateLayer(selection[0], { x, y });
                            }
                        }}
                        onSizeChange={(width, height) => {
                            if (selection.length === 1) {
                                updateLayer(selection[0], {
                                    width,
                                    height,
                                });
                            }
                        }}
                        transparentFill={transparentFill}
                        onTransparentFillChange={
                            selection.length === 1
                                ? setLayerTransparent
                                : setTransparentFill
                        }
                        className="top-[65px]"
                        data-testid="selection-tools"
                    />
                )}

            <svg
                ref={svgRef}
                data-testid="svg-element"
                className="h-[100vh] w-[100vw]"
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                tabIndex={0}
            >
                {svgRect && (
                    <Grid
                        camera={camera}
                        scale={scale}
                        width={svgRect.width}
                        height={svgRect.height}
                    />
                )}
                <g
                    data-testid="svg-group"
                    transform={`translate(${camera.x}, ${camera.y}) scale(${scale})`}
                >
                    {layerIds?.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}
                    <CursorsPresence />
                    {pencilDraft && pencilDraft.length >= 1 && (
                        <polyline
                            points={pencilDraft
                                .map((point) => point.join(','))
                                .join(' ')}
                            stroke={colorToCss(lastUsedColor)}
                            fill="none"
                            strokeWidth={lineWidth}
                            strokeDasharray="4 2"
                        />
                    )}

                    <SelectionBox
                        onResizeHandlePointerDown={onResizeHandlePointerDown}
                        isShowingHandles={isAnyToolActive}
                        selection={selection}
                        layersMap={layersMap}
                    />

                    {canvasState.mode === CanvasMode.SelectionNet &&
                        canvasState.current &&
                        canvasState.origin && (
                            <rect
                                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                                x={Math.min(
                                    canvasState.origin.x,
                                    canvasState.current.x,
                                )}
                                y={Math.min(
                                    canvasState.origin.y,
                                    canvasState.current.y,
                                )}
                                width={Math.abs(
                                    canvasState.origin.x -
                                        canvasState.current.x,
                                )}
                                height={Math.abs(
                                    canvasState.origin.y -
                                        canvasState.current.y,
                                )}
                            />
                        )}
                </g>
            </svg>
        </main>
    );
};

export default Canvas;
