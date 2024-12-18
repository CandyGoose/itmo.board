import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CursorsPresence } from './CursorsPresence';
import { useOthersConnectionIds, useOthersMapped } from '@/liveblocks.config';

jest.mock('@/liveblocks.config', () => ({
    useOthersConnectionIds: jest.fn(),
    useOthersMapped: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
    colorToCss: jest
        .fn()
        .mockImplementation((color) => `rgb(${color.r},${color.g},${color.b})`),
}));

jest.mock('./Cursor', () => ({
    Cursor: ({ connectionId }: { connectionId: number }) => (
        <div data-testid="cursor">{connectionId}</div>
    ),
}));

jest.mock('./Path', () => ({
    Path: ({ points, fill, stroke, lineWidth }) => (
        <div
            data-testid="path"
            data-points={points}
            data-fill={fill}
            data-stroke={stroke}
            data-line-width={lineWidth}
        />
    ),
}));

describe('CursorsPresence Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Cursors with connection IDs', () => {
        (useOthersConnectionIds as jest.Mock).mockReturnValue([1, 2, 3]);
        (useOthersMapped as jest.Mock).mockReturnValue([]);

        render(<CursorsPresence />);

        const cursors = screen.getAllByTestId('cursor');
        expect(cursors).toHaveLength(3);
        expect(cursors[0]).toHaveTextContent('1');
        expect(cursors[1]).toHaveTextContent('2');
        expect(cursors[2]).toHaveTextContent('3');
    });

    it('renders Drafts with pencil drafts and colors', () => {
        (useOthersMapped as jest.Mock).mockReturnValue([
            [
                1,
                {
                    pencilDraft: [
                        [0, 0],
                        [1, 1],
                    ],
                    penColor: { r: 255, g: 0, b: 0 },
                },
            ],
            [
                2,
                {
                    pencilDraft: [
                        [2, 2],
                        [3, 3],
                    ],
                    penColor: { r: 0, g: 255, b: 0 },
                },
            ],
        ]);

        render(<CursorsPresence />);

        const paths = screen.getAllByTestId('path');
        expect(paths).toHaveLength(2);

        expect(paths[0]).toHaveAttribute('data-points', '0,0,1,1');
        expect(paths[0]).toHaveAttribute('data-fill', 'rgb(255,0,0)');
        expect(paths[0]).toHaveAttribute('data-stroke', 'rgb(255,0,0)');

        expect(paths[1]).toHaveAttribute('data-points', '2,2,3,3');
        expect(paths[1]).toHaveAttribute('data-fill', 'rgb(0,255,0)');
        expect(paths[1]).toHaveAttribute('data-stroke', 'rgb(0,255,0)');
    });

    it('renders Drafts with null penColor using default stroke and fill', () => {
        (useOthersMapped as jest.Mock).mockReturnValue([
            [
                1,
                {
                    pencilDraft: [
                        [0, 0],
                        [1, 1],
                    ],
                    penColor: null,
                },
            ],
        ]);

        render(<CursorsPresence />);

        const paths = screen.getAllByTestId('path');
        expect(paths).toHaveLength(1);

        expect(paths[0]).toHaveAttribute('data-points', '0,0,1,1');
        expect(paths[0]).toHaveAttribute('data-fill', '#000'); // Default fill color
        expect(paths[0]).toHaveAttribute('data-stroke', 'rgb(0,0,0)'); // Default stroke color
    });

    it('does not render Drafts if there are no pencil drafts', () => {
        (useOthersMapped as jest.Mock).mockReturnValue([]);

        render(<CursorsPresence />);

        const paths = screen.queryByTestId('path');
        expect(paths).not.toBeInTheDocument();
    });
});
