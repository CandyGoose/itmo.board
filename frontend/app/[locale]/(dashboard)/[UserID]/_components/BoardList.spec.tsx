import { render, screen, waitFor, act } from '@testing-library/react';
import { BoardList } from './BoardList';
import { getAllBoards } from '@/actions/Board';
import { useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

jest.mock('@/actions/Board', () => ({
    getAllBoards: jest.fn().mockResolvedValue([
        {
            _id: '1',
            title: 'Board 1',
            authorId: 'user1',
            createdAt: '2024-01-01',
            orgId: 'org1',
        },
        {
            _id: '2',
            title: 'Board 2',
            authorId: 'user2',
            createdAt: '2024-02-01',
            orgId: 'org1',
        },
    ]),
}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn().mockReturnValue({ UserID: 'user1' }),
    useSearchParams: jest.fn(),
}));

const mockBoards = [
    {
        _id: '1',
        title: 'Board 1',
        authorId: 'user1',
        createdAt: '2024-01-01',
        orgId: 'org1',
    },
    {
        _id: '2',
        title: 'Board 2',
        authorId: 'user2',
        createdAt: '2024-02-01',
        orgId: 'org1',
    },
];

jest.mock('@/actions/Board', () => ({
    getAllBoards: jest.fn().mockResolvedValue([
        {
            _id: '1',
            title: 'Board 1',
            authorId: 'user1',
            createdAt: '2024-01-01',
            orgId: 'org1',
        },
        {
            _id: '2',
            title: 'Board 2',
            authorId: 'user2',
            createdAt: '2024-02-01',
            orgId: 'org1',
        },
    ]),
}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn().mockReturnValue({ UserID: 'user1' }),
    useSearchParams: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('NonExistentBoard'),
    }),
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        pathname: '/some-path',
        query: {},
    }),
}));

describe('BoardList', () => {
    const orgId = 'org1';

    beforeEach(() => {
        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);
    });

    it('should display boards after loading', async () => {
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(null),
        });

        render(<BoardList orgId={orgId} query={{ search: '' }} />);

        await waitFor(() => expect(getAllBoards).toHaveBeenCalled());

        expect(screen.getByText('Board 1')).toBeInTheDocument();
        expect(screen.getByText('Board 2')).toBeInTheDocument();
    });

    it('should show "No results found" when no boards match search', async () => {
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('NonExistentBoard'),
        });

        render(
            <BoardList orgId={orgId} query={{ search: 'NonExistentBoard' }} />,
        );

        await waitFor(() => expect(getAllBoards).toHaveBeenCalled());

        expect(
            screen.getByRole('heading', { name: /No results found/i }),
        ).toBeInTheDocument();
    });

    it('should show loading skeleton while fetching data again if boards are empty', async () => {
        (getAllBoards as jest.Mock).mockResolvedValue([]);

        const { container } = render(<BoardList orgId={orgId} query={{}} />);

        await act(async () => {
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });
    });
});
