import { getSvgPathFromStroke, optimizeStroke } from '@/lib/utils';
import { getStroke } from 'perfect-freehand';
import { memo, useMemo } from 'react';

export interface PathProps {
    x: number;
    y: number;
    width: number;
    height: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
    lineWidth?: number;
}

export const getStrokeOptions = {
    size: 4,
    thinning: 0.5,
    smoothing: 1,
    streamline: 0.5,
};

export const Path = memo(
    ({
        x,
        y,
        width,
        height,
        points,
        fill,
        onPointerDown,
        stroke,
        lineWidth,
    }: PathProps) => {
        const strokePath = useMemo(() => {
            const stroke = getStroke(points, {
                ...getStrokeOptions,
                size: lineWidth ?? getStrokeOptions.size,
            });
            const optimizedStroke = optimizeStroke(stroke);
            return getSvgPathFromStroke(optimizedStroke);
        }, [lineWidth, points]);

        const originalBoundingBox = useMemo(() => {
            const xs = points.map((p) => p[0]);
            const ys = points.map((p) => p[1]);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            return {
                width: maxX - minX || 1, // Avoid division by zero
                height: maxY - minY || 1,
            };
        }, [points]);

        const scale = {
            x: width / originalBoundingBox.width,
            y: height / originalBoundingBox.height,
        };

        return (
            <path
                className="drop-shadow-md"
                onPointerDown={onPointerDown}
                d={strokePath}
                style={{
                    transform: `translate(${x}px, ${y}px) scale(${scale.x}, ${scale.y})`,
                }}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.5}
            />
        );
    },
);

Path.displayName = 'Path';
