import { render, screen } from '@testing-library/react';
import { BoardChooser } from '@/app/[locale]/components/BoardChooser';
import { useTranslations } from 'next-intl';

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('BoardChooser component', () => {
    beforeEach(() => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
    });

    it('renders create a board text', () => {
        render(<BoardChooser recentBoards={[]} />);
        expect(screen.getByText('create_a_board')).toBeInTheDocument();
    });

    it('renders input with placeholder', () => {
        render(<BoardChooser recentBoards={[]} />);
        expect(
            screen.getByPlaceholderText('enter_board_name'),
        ).toBeInTheDocument();
    });

    it('renders create button', () => {
        render(<BoardChooser recentBoards={[]} />);
        expect(screen.getByText('create')).toBeInTheDocument();
    });

    it('renders recent boards text', () => {
        render(<BoardChooser recentBoards={[]} />);
        expect(screen.getByText('recent_boards')).toBeInTheDocument();
    });

    it('renders recent boards links', () => {
        const boards = [
            { name: 'Board 1', link: '/board1' },
            { name: 'Board 2', link: '/board2' },
        ];
        render(<BoardChooser recentBoards={boards} />);
        boards.forEach((board) => {
            expect(screen.getByText(board.name)).toBeInTheDocument();
        });
    });

    it('renders no recent boards when list is empty', () => {
        render(<BoardChooser recentBoards={[]} />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders correct number of recent boards', () => {
        const boards = [
            { name: 'Board 1', link: '/board1' },
            { name: 'Board 2', link: '/board2' },
        ];
        render(<BoardChooser recentBoards={boards} />);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(boards.length);
    });

    it('this test fails', () => {
        render(<BoardChooser recentBoards={[]} />);
        expect(screen.getByText('create_a_board')).not.toBeInTheDocument();
    });
});
