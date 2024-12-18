import React, { memo, useEffect, useRef } from 'react';

const MIN_GRID_SPACING = 10;
const GRID_LEVELS = [1000, 500, 100, 50, 10, 5, 1];
const STROKE_STYLES = [
    { minSpacing: 100, stroke: '#999', strokeWidth: 1 },
    { minSpacing: 10, stroke: '#bbb', strokeWidth: 0.5 },
    { minSpacing: 0, stroke: '#ddd', strokeWidth: 0.25 },
];

const getStrokeStyle = (spacing: number) => {
    for (const style of STROKE_STYLES) {
        if (spacing >= style.minSpacing) {
            return {
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
            };
        }
    }
    // Fallback if none matched (shouldn't happen)
    return { stroke: '#ddd', strokeWidth: 0.25 };
};

export interface GridProps {
    camera: { x: number; y: number };
    scale: number;
    width: number;
    height: number;
}

export const Grid: React.FC<GridProps> = memo(
    ({ camera, scale, width, height }) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Device Pixel Ratio for crisp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

            ctx.clearRect(0, 0, width, height);

            // Convert screen space to world space
            const x0 = (0 - camera.x) / scale;
            const x1 = (width - camera.x) / scale;
            const y0 = (0 - camera.y) / scale;
            const y1 = (height - camera.y) / scale;

            const usedX = new Set<number>();
            const usedY = new Set<number>();

            const roundFactor = 10 ** 4;

            for (const gridSize of GRID_LEVELS) {
                const gridSpacingInPixels = gridSize * scale;
                if (gridSpacingInPixels < MIN_GRID_SPACING) {
                    return; // Skip grid levels that are too dense
                }

                const { stroke, strokeWidth } =
                    getStrokeStyle(gridSpacingInPixels)!;

                // Calculate starting points for grid lines
                const xStart = Math.floor(x0 / gridSize) * gridSize;
                const yStart = Math.floor(y0 / gridSize) * gridSize;

                // Set stroke style
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth;

                // Draw vertical lines
                for (let x = xStart; x <= x1; x += gridSize) {
                    if (usedX.has(x)) {
                        continue;
                    }
                    usedX.add(x);

                    const xScreen = x * scale + camera.x;
                    const xScreenRounded =
                        Math.round(xScreen * roundFactor) / roundFactor;

                    ctx.beginPath();
                    ctx.moveTo(xScreenRounded, 0);
                    ctx.lineTo(xScreenRounded, height);
                    ctx.stroke();
                }

                // Draw horizontal lines
                for (let y = yStart; y <= y1; y += gridSize) {
                    if (usedY.has(y)) {
                        continue;
                    }
                    usedY.add(y);

                    const yScreen = y * scale + camera.y;
                    const yScreenRounded =
                        Math.round(yScreen * roundFactor) / roundFactor;

                    ctx.beginPath();
                    ctx.moveTo(0, yScreenRounded);
                    ctx.lineTo(width, yScreenRounded);
                    ctx.stroke();
                }
            }
        }, [camera, scale, width, height]);

        return (
            <canvas
                id="gridCanvas"
                ref={canvasRef}
                className={'bg-[var(--background-color)]'}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
                data-testid={'grid'}
            />
        );
    },
);

Grid.displayName = 'Grid';
