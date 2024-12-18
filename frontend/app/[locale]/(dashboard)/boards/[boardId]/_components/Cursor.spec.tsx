import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Cursor } from './Cursor';

jest.mock('lucide-react', () => ({
    MousePointer2: ({ className, style }: { className: string; style: React.CSSProperties }) => (
        <div data-testid="mouse-pointer" className={className} style={style}></div>
    ),
}));

jest.mock('@/liveblocks.config', () => ({
    useOther: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
    connectionIdToColor: jest.fn(() => 'blue'),
}));

import { useOther } from '@/liveblocks.config';

describe('Cursor Component', () => {
    const mockConnectionId = 1;

    it('renders null if cursor is not available', () => {
        (useOther as jest.Mock)
            .mockImplementationOnce(() => null) // info
            .mockImplementationOnce(() => null); // cursor

        const { container } = render(<Cursor connectionId={mockConnectionId} />);
        expect(container.firstChild).toBeNull();
    });

    it('displays the user name and pointer with correct styles', () => {
        (useOther as jest.Mock)
            .mockImplementationOnce(() => ({ name: 'Alice' })) // info
            .mockImplementationOnce(() => ({ x: 50, y: 50 })); // cursor

        render(<Cursor connectionId={mockConnectionId} />);

        const nameTag = screen.getByText('Alice');
        expect(nameTag).toBeInTheDocument();
        expect(nameTag).toHaveClass(
            'absolute left-5 px-1.5 py-0.5 rounded-md text-xs text-white font-semibold'
        );
        expect(nameTag).toHaveStyle({ backgroundColor: 'blue' });

        const mousePointer = screen.getByTestId('mouse-pointer');
        expect(mousePointer).toHaveClass('h-5 w-5');
        expect(mousePointer).toHaveStyle({
            fill: 'blue',
            color: 'blue',
        });
    });

    it('defaults the name to "Teammate" if no name is provided', () => {
        (useOther as jest.Mock)
            .mockImplementationOnce(() => ({})) // info without name
            .mockImplementationOnce(() => ({ x: 10, y: 20 })); // cursor

        render(<Cursor connectionId={mockConnectionId} />);

        const nameTag = screen.getByText('Teammate');
        expect(nameTag).toBeInTheDocument();
    });
});
