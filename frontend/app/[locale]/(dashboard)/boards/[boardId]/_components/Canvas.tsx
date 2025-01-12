import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayerPreview } from './LayerPreview';
import {
    Camera,
    CanvasMode,
    CanvasState,
    Color,
    EllipseLayer,
    ImageLayer,
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
    roundToTwoDecimals,
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
import { Path } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Path';
import { ImageUpload } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/ImageUpload';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 20;
const ZOOM_INTENSITY = 0.001;

interface CanvasProps {
    boardId: string;
}

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

    const selections = useOthersMapped((other) => other.presence.selection);
    const selection = useSelf((me) => me.presence.selection);

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

    const [showImageUpload, setShowImageUpload] = useState(false);
    const [pendingImagePosition, setPendingImagePosition] =
        useState<Point | null>(null);

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
                    canvasState.layerType === LayerType.Ellipse ||
                    canvasState.layerType === LayerType.Image)) ||
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
        (
            { storage, setMyPresence },
            layerType: LayerType,
            position: Point,
            imageData?: { url: string; width?: number; height?: number },
        ) => {
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
                case LayerType.Image:
                    layerData = {
                        ...baseProps,
                        type: LayerType.Image,
                        width: imageData?.width ?? 100,
                        height: imageData?.height ?? 100,
                        src: imageData?.url ?? '',
                    } as ImageLayer;
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
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Translating || !editable)
                return;

            const offset = {
                x: point.x - canvasState.current.x,
                y: point.y - canvasState.current.y,
            };

            const offsetSquared = offset.x * offset.x + offset.y * offset.y;

            if (offsetSquared >= 0.0001) {
                const liveLayers = storage.get('layers');

                for (const id of self.presence.selection) {
                    const layer = liveLayers.get(id);
                    if (layer) {
                        layer.update({
                            x: roundToTwoDecimals(layer.get('x') + offset.x),
                            y: roundToTwoDecimals(layer.get('y') + offset.y),
                        });
                    }
                }
            }
            setCanvasState({ mode: CanvasMode.Translating, current: point });
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

            const ids = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                origin,
                current,
            );
            setMyPresence({ selection: ids });
        },
        [editable, layerIds],
    );

    const continueDrawing = useMutation(
        ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;
            if (canvasState.mode !== CanvasMode.Pencil || !pencilDraft) return;

            const roundedPoint: [number, number, number] = [
                Math.round(point.x * 10000) / 10000,
                Math.round(point.y * 10000) / 10000,
                Number(e.pressure),
            ];

            if (pencilDraft.length > 0) {
                const lastPoint = pencilDraft[pencilDraft.length - 1];
                const dx = roundedPoint[0] - lastPoint[0];
                const dy = roundedPoint[1] - lastPoint[1];
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared > 0.0001) {
                    setMyPresence({
                        pencilDraft: [...pencilDraft, roundedPoint],
                    });
                }
            } else {
                setMyPresence({
                    pencilDraft: [roundedPoint],
                });
            }
        },
        [canvasState.mode],
    );

    const insertPath = useMutation(
        ({ storage, self, setMyPresence }) => {
            const { pencilDraft } = self.presence;
            if (pencilDraft && pencilDraft.length > 1) {
                const id = nanoid();
                const newLayer = {
                    id,
                    ...penPointsToPathLayer(pencilDraft),
                    fill: lastUsedColor,
                    lineWidth: lineWidth,
                } as PathLayer;
                const liveLayers = storage.get('layers');
                liveLayers.set(id, new LiveObject(newLayer));
                const liveLayerIds = storage.get('layerIds');
                liveLayerIds.push(id);
            }
            setMyPresence({ pencilDraft: null });
            setCanvasState({ mode: CanvasMode.Pencil });
        },
        [lastUsedColor, lineWidth],
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
        ({ storage, self }, currentPoint: Point) => {
            if (canvasState.mode !== CanvasMode.Resizing) return;
            const newBounds = resizeBounds(
                canvasState.initialBounds,
                canvasState.corner,
                currentPoint,
            );

            const liveLayers = storage.get('layers');
            const layer = liveLayers.get(self.presence.selection[0]);
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
            const newScale = Math.min(
                Math.max(scale - deltaY * ZOOM_INTENSITY, MIN_ZOOM),
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
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
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

            if (!self.presence.selection.includes(layerId)) {
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
            }

            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState.mode, history, editable, camera, scale, svgRect],
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (canvasState.mode === CanvasMode.Inserting) return;

            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);
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
                    setCanvasState({
                        mode: CanvasMode.Pressing,
                        origin: { x: e.clientX, y: e.clientY },
                    });
                }
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
            if (canvasState.mode === CanvasMode.None) return;
            e.stopPropagation();
            if (!editable) {
                setCanvasState({ mode: CanvasMode.None });
            }
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);

            switch (canvasState.mode) {
                case CanvasMode.Pressing:
                    const dx = e.clientX - canvasState.origin.x;
                    const dy = e.clientY - canvasState.origin.y;
                    setCamera((prev) => ({
                        x: prev.x + dx,
                        y: prev.y + dy,
                    }));
                    setCanvasState({
                        mode: CanvasMode.Pressing,
                        origin: { x: e.clientX, y: e.clientY },
                    });
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
                    continueDrawing(point, e);
                    break;
                default:
                    break;
            }
            setMyPresence({ cursor: point });
        },
        [
            editable,
            camera,
            scale,
            svgRect,
            canvasState,
            updateSelectionNet,
            translateSelectedLayers,
            resizeSelectedLayers,
            continueDrawing,
        ],
    );

    const onPointerUp = useMutation(
        ({}, e) => {
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);
            if (
                canvasState.mode === CanvasMode.None ||
                canvasState.mode === CanvasMode.Pressing
            ) {
                unselectLayers();
                setCanvasState({ mode: CanvasMode.None });
            } else if (canvasState.mode === CanvasMode.Pencil && editable) {
                insertPath();
            } else if (canvasState.mode === CanvasMode.Inserting && editable) {
                if (canvasState.layerType === LayerType.Image) {
                    setPendingImagePosition(point);
                    setShowImageUpload(true);
                } else {
                    insertLayer(canvasState.layerType!, point);
                }
            } else {
                setCanvasState({ mode: CanvasMode.None });
            }
            history.resume();
        },
        [
            camera,
            canvasState,
            editable,
            insertLayer,
            insertPath,
            scale,
            svgRect,
            unselectLayers,
        ],
    );

    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({ cursor: null });
    }, []);

    // Handler that the <ImageUpload/> calls after finishing upload
    const handleImageUploadComplete = useCallback(
        (url: string, width?: number, height?: number) => {
            setShowImageUpload(false);
            if (!pendingImagePosition) return;
            const imageData = { url, width, height };
            insertLayer(LayerType.Image, pendingImagePosition, imageData);
            setPendingImagePosition(null);
        },
        [pendingImagePosition, insertLayer],
    );

    const deleteLayers = useDeleteLayers();

    const [pasteCount, setPasteCount] = useState(0);

    const copyLayers = useMutation(({ storage, self, setMyPresence }) => {
        const liveLayers = storage.get('layers');
        const selection = self.presence.selection;
        const layersToCopy = selection
            .map((layerId) => {
                const layer = liveLayers.get(layerId);
                return layer ? { id: nanoid(), data: layer.toObject() } : null;
            })
            .filter(
                (layer): layer is { id: string; data: never } => layer !== null,
            );

        setMyPresence({ copiedLayers: layersToCopy });
        setPasteCount(0);
    }, []);

    const pasteLayers = useMutation(
        ({ storage, self, setMyPresence }) => {
            const liveLayers = storage.get('layers');
            const liveLayerIds = storage.get('layerIds');
            const copiedLayers = self.presence.copiedLayers;

            if (copiedLayers && copiedLayers.length > 0 && editable) {
                const offset = 10 * (pasteCount + 1);
                const newLayerIds = copiedLayers.map((copiedLayer) => {
                    const newLayer = new LiveObject({
                        ...copiedLayer.data,
                        x: copiedLayer.data.x + offset,
                        y: copiedLayer.data.y + offset,
                    });

                    const newLayerId = nanoid();
                    liveLayers.set(newLayerId, newLayer);
                    return newLayerId;
                });

                newLayerIds.map((id) => liveLayerIds.push(id));
                setMyPresence({ selection: newLayerIds });
                setPasteCount((prev) => prev + 1);
            }
        },
        [pasteCount, editable],
    );

    const selectAllLayers = useMutation(({ storage, setMyPresence }) => {
        const allLayerIds = [...storage.get('layerIds').toImmutable()];
        setMyPresence({ selection: allLayerIds });
    }, []);

    // Functions for SelectionTools
    const setLayerColor = useMutation(
        ({ storage }, color: Color) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ fill: color });
                }
            });
        },
        [selection],
    );
    const setLayerTransparent = useMutation(
        ({ storage }, checked: boolean) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ fill: checked ? null : lastUsedColor });
                }
            });
        },
        [selection, lastUsedColor],
    );
    const setLayerLineWidth = useMutation(
        ({ storage }, width: number) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ lineWidth: width });
                }
            });
        },
        [selection],
    );
    const setLayerFont = useMutation(
        ({ storage }, name: string) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ fontName: name });
                }
            });
        },
        [selection],
    );
    const setLayerFontSize = useMutation(
        ({ storage }, size: number) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ fontSize: size });
                }
            });
        },
        [selection],
    );
    const setLayerTextAlign = useMutation(
        ({ storage }, align: TextAlign) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ textAlign: align });
                }
            });
        },
        [selection],
    );
    const setLayerTextFormat = useMutation(
        ({ storage }, format: TextFormat[]) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ textFormat: format });
                }
            });
        },
        [selection],
    );

    const setLayerPosition = useMutation(
        ({ storage }, x: number, y: number) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ x, y });
                }
            });
        },
        [selection],
    );

    const setLayerSize = useMutation(
        ({ storage }, width: number, height: number) => {
            const liveLayers = storage.get('layers');
            selection.forEach((id) => {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({ width, height });
                }
            });
        },
        [selection],
    );

    const moveToFront = useMutation(
        ({ storage }) => {
            const liveLayerIds = storage.get('layerIds');
            const indices: number[] = [];
            const arr = liveLayerIds.toImmutable();

            for (let i = 0; i < arr.length; i++) {
                if (selection.includes(arr[i])) {
                    indices.push(i);
                }
            }

            for (let i = indices.length - 1; i >= 0; i--) {
                liveLayerIds.move(
                    indices[i],
                    arr.length - 1 - (indices.length - 1 - i),
                );
            }
        },
        [selection],
    );

    const moveToBack = useMutation(
        ({ storage }) => {
            const liveLayerIds = storage.get('layerIds');
            const indices: number[] = [];
            const arr = liveLayerIds.toImmutable();

            for (let i = 0; i < arr.length; i++) {
                if (selection.includes(arr[i])) {
                    indices.push(i);
                }
            }

            for (let i = 0; i < indices.length; i++) {
                liveLayerIds.move(indices[i], i);
            }
        },
        [selection],
    );

    const moveForward = useMutation(
        ({ storage }) => {
            const liveLayerIds = storage.get('layerIds');
            const arr = liveLayerIds.toImmutable();

            for (let i = arr.length - 1; i > 0; i--) {
                if (selection.includes(arr[i - 1])) {
                    liveLayerIds.move(i - 1, i);
                }
            }
        },
        [selection],
    );

    const moveBackward = useMutation(
        ({ storage }) => {
            const liveLayerIds = storage.get('layerIds');
            const arr = liveLayerIds.toImmutable();

            for (let i = 0; i < arr.length - 1; i++) {
                if (selection.includes(arr[i + 1])) {
                    liveLayerIds.move(i + 1, i);
                }
            }
        },
        [selection],
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

    const layersMap = new Map(Array.from(layers || new Map()));

    return (
        <main
            className={cn('h-full w-full relative touch-none')}
            data-testid="canvas-main"
        >
            {svgRect && (
                <Grid
                    camera={camera}
                    scale={scale}
                    width={svgRect.width}
                    height={svgRect.height}
                />
            )}
            {/* Container for aligning buttons in the top-right corner */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <Participants className="h-12 w-12" />
                <StylesButton
                    id="styles-button"
                    activeColor={lastUsedColor}
                    onClick={toggleSelectionTools}
                    className="h-12 w-30 rounded-md shadow-md flex items-center justify-center"
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
                moveToFront={moveToFront}
                moveToBack={moveToBack}
                moveForward={moveForward}
                moveBackward={moveBackward}
            />

            {showImageUpload && (
                <ImageUpload
                    onClose={() => setShowImageUpload(false)}
                    onUploadComplete={handleImageUploadComplete}
                />
            )}

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
                                setLayerPosition(x, y);
                            }
                        }}
                        onSizeChange={(width, height) => {
                            if (selection.length === 1) {
                                setLayerSize(width, height);
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
                    {pencilDraft &&
                        pencilDraft.length > 1 &&
                        (() => {
                            const partialProps =
                                penPointsToPathLayer(pencilDraft);
                            return (
                                <Path
                                    x={partialProps.x!}
                                    y={partialProps.y!}
                                    width={partialProps.width!}
                                    height={partialProps.height!}
                                    points={partialProps.points!}
                                    stroke={colorToCss(lastUsedColor)}
                                    fill="none"
                                    lineWidth={lineWidth}
                                />
                            );
                        })()}

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
