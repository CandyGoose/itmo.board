import React from 'react';
import { ImageLayer } from '@/types/canvas';

interface ImageLayerComponentProps {
    id: string;
    layer: ImageLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const ImageLayerComponent: React.FC<ImageLayerComponentProps> = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}) => {
    const { x, y, width, height, src } = layer;
    const strokeColor = selectionColor || 'transparent';

    return (
        <image
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            href={src}
            x={x}
            y={y}
            width={width}
            height={height}
            stroke={strokeColor}
            preserveAspectRatio="none"
        />
    );
};
