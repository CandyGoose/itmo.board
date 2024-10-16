import { BoardToolMenu } from '@/app/[locale]/components/BoardToolMenu';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardTool } from '@/globalTypes';

jest.mock('@/app/[locale]/components/buttons/BoardToolButton', () => ({
    BoardToolButton: jest.fn(({ name, handler }) => (
        <button onClick={handler}>
            {name}
        </button>
    )),
}));
const mockTools: BoardTool[] = [
    { name: 'cursor', icon_path: '', handler: jest.fn() },
    { name: 'pencil', icon_path: '', handler: jest.fn() },
];

describe('BoardToolMenu component', () => {

    it('renders a button for each tool', () => {
        render(<BoardToolMenu tools={mockTools} />);

        // Check if all tools are rendered
        const toolButtons = screen.getAllByRole('button');
        expect(toolButtons).toHaveLength(mockTools.length);

        const toolNames = mockTools.map(tool => tool.name);
        toolNames.forEach(name => {
            expect(screen.getByText(`${name}`)).toBeInTheDocument();
        });
    });

    it('calls the correct handler when a tool button is clicked', () => {

        render(<BoardToolMenu tools={mockTools} />);

        // Click the first tool (cursor)
        fireEvent.click(screen.getByText(mockTools[0].name));
        expect(mockTools[0].handler).toHaveBeenCalled();

        // Click the second tool (pencil)
        fireEvent.click(screen.getByText(mockTools[1].name));
        expect(mockTools[1].handler).toHaveBeenCalled();
    });
});

