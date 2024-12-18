import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Grid, GRID_LEVELS, MIN_GRID_SPACING } from './Grid';
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { CanvasRenderingContext2DEvent } from 'jest-canvas-mock';

describe('Canvas Grid Component', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    const getCanvasEvents = (container: HTMLElement) => {
        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        return ctx ? ctx.__getEvents() : null;
    };

    const countLinesDrawn = (
        events: CanvasRenderingContext2DEvent[] | null,
    ) => {
        // Count how many times stroke is called, which equals to amount of lines drawn.
        return events ? events.filter((e) => e.type === 'stroke').length : null;
    };

    it('draws some grid lines at default scale', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 10,
            height: 10,
        };

        const { container } = render(<Grid {...props} />);
        const events = getCanvasEvents(container);
        const linesCount = countLinesDrawn(events);

        // On such small space only a single vertical + horizontal could be drawn
        expect(linesCount).toBeGreaterThan(2);
    });

    it('does not draw lines for grid levels that are too dense at small scale', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: MIN_GRID_SPACING / GRID_LEVELS[0] - 0.001, // No levels shown
            width: 100,
            height: 100,
        };

        const { container } = render(<Grid {...props} />);
        const events = getCanvasEvents(container);
        const linesCount = countLinesDrawn(events);

        expect(linesCount).toBe(0);
    });

    it('draws lines for all grid levels when scale is large enough', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: (MIN_GRID_SPACING / GRID_LEVELS[GRID_LEVELS.length - 1]) * 2, // All levels shown
            width: 20000,
            height: 20000,
        };

        const { container } = render(<Grid {...props} />);
        const events = getCanvasEvents(container);
        const linesCount = countLinesDrawn(events);

        expect(linesCount).toBeGreaterThan(1000);
    });

    it('does not crash when canvas.getContext returns null (!ctx)', () => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;

        HTMLCanvasElement.prototype.getContext = jest.fn(() => null);

        const props = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 100,
            height: 100,
        };

        expect(() => render(<Grid {...props} />)).not.toThrow();

        const { container } = render(<Grid {...props} />);
        expect(container.querySelector('canvas')).toBeInTheDocument();
        expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith(
            '2d',
        );

        HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
});
