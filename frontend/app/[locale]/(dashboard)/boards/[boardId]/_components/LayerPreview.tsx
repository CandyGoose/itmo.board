'use client';

import { memo } from 'react';
import {
    EllipseLayer,
    ImageLayer,
    LayerType,
    NoteLayer,
    RectangleLayer,
    TextLayer,
} from '@/types/canvas';
import { colorToCss } from '@/lib/utils';
import { Path } from './Path';
import { Rectangle } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Rectangle';
import { Ellipse } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Ellipse';
import { Note } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Note';
import { ImageLayerComponent } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/ImageLayer';
import { Text } from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Text';
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
                        layer={layer as EllipseLayer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Rectangle:
                return (
                    <Rectangle
                        id={id}
                        layer={layer as RectangleLayer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Text:
                return (
                    <Text
                        id={id}
                        layer={layer as TextLayer}
                        onPointerDown={onLayerPointerDown}
                    />
                );
            case LayerType.Note:
                return (
                    <Note
                        id={id}
                        layer={layer as NoteLayer}
                        onPointerDown={onLayerPointerDown}
                        selectionColor={selectionColor}
                    />
                );
            case LayerType.Image:
                return (
                    <ImageLayerComponent
                        id={id}
                        layer={layer as ImageLayer}
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
