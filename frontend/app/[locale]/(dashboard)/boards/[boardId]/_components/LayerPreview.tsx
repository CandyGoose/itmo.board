'use client';

import { memo } from 'react';
import { LayerType } from '@/types/canvas';
import { colorToCss } from '@/lib/utils';
import { Path } from './Path';
import { Rectangle } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Rectangle';
import { Ellipse } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Ellipse';
import { Note } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';
import { useStorage } from '@/liveblocks.config';

interface LayerPreviewProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    selectionColor?: string;
}

export const LayerPreview = memo(
    ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
        const layer = useStorage((root) => root.layers.get(id));

        if (!layer) {
            return null;
        }

        switch (layer.type) {
            case LayerType.Path:
                return (
                    <Path
                        key={id}
                        points={layer.points}
                        onPointerDown={(e) => onLayerPointerDown(e, id)}
                        x={layer.x}
                        y={layer.y}
                        width={layer.width}
                        height={layer.height}
                        fill={layer.fill ? colorToCss(layer.fill) : '#000'}
                        stroke={selectionColor}
                        lineWidth={layer.lineWidth}
                    />
                );
            case LayerType.Ellipse:
                return (
                    <Ellipse
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Rectangle:
                return (
                    <Rectangle
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Note:
                return (
                    <Note
                        id={id}
                        layer={layer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            default:
                console.warn('Unknown layer type');
                return null;
        }
    },
);

LayerPreview.displayName = 'LayerPreview';
