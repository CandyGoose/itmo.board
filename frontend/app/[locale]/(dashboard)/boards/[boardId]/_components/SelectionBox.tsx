import { memo, useMemo } from 'react';
import { Layer, Side, XYWH } from '@/types/canvas';
import { useSelectionBounds } from '@/hooks/useSelectionBounds';

interface SelectionBoxProps {
    onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
    isShowingHandles: boolean;
    selection: string[];
    layersMap: Map<string, Layer>;
}

const HANDLE_WIDTH = 8;

const handlesConfig = [
    {
        corner: Side.Top + Side.Left,
        cursor: 'nwse-resize',
        translateX: (b: XYWH) => b.x - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Top,
        cursor: 'ns-resize',
        translateX: (b: XYWH) => b.x + b.width / 2 - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Top + Side.Right,
        cursor: 'nesw-resize',
        translateX: (b: XYWH) => b.x + b.width - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Right,
        cursor: 'ew-resize',
        translateX: (b: XYWH) => b.x + b.width - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y + b.height / 2 - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Bottom + Side.Right,
        cursor: 'nwse-resize',
        translateX: (b: XYWH) => b.x + b.width - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y + b.height - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Bottom,
        cursor: 'ns-resize',
        translateX: (b: XYWH) => b.x + b.width / 2 - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y + b.height - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Bottom + Side.Left,
        cursor: 'nesw-resize',
        translateX: (b: XYWH) => b.x - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y + b.height - HANDLE_WIDTH / 2,
    },
    {
        corner: Side.Left,
        cursor: 'ew-resize',
        translateX: (b: XYWH) => b.x - HANDLE_WIDTH / 2,
        translateY: (b: XYWH) => b.y + b.height / 2 - HANDLE_WIDTH / 2,
    },
];

export const SelectionBox = memo(
    ({
        onResizeHandlePointerDown,
        isShowingHandles,
        selection,
        layersMap,
    }: SelectionBoxProps) => {
        const bounds = useSelectionBounds({
            selection,
            layers: layersMap,
        });

        const handleRects = useMemo(() => {
            if (!isShowingHandles || !bounds) return null;

            return handlesConfig.map(
                ({ corner, cursor, translateX, translateY }, index) => (
                    <rect
                        key={index}
                        data-testid={`handle-${index}`}
                        className="fill-white stroke-1 stroke-blue-500"
                        style={{
                            cursor,
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${translateX(
                                bounds,
                            )}px, ${translateY(bounds)}px)`,
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(corner, bounds);
                        }}
                    />
                ),
            );
        }, [isShowingHandles, bounds, onResizeHandlePointerDown]);

        if (!bounds) {
            return null;
        }

        return (
            <>
                {/* Контур выделения */}
                <rect
                    data-testid="selection-rectangle"
                    className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
                    style={{
                        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
                    }}
                    width={bounds.width}
                    height={bounds.height}
                />
                {handleRects}
            </>
        );
    },
);

SelectionBox.displayName = 'SelectionBox';
