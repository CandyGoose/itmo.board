import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BoardList } from './BoardList';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { Board, getAllBoards } from '@/actions/Board';
import { NextIntlClientProvider } from 'next-intl';
import { within } from '@testing-library/react';

jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
    useSearchParams: jest.fn(),
    useRouter: jest.fn(),
}));

jest.mock('@/actions/Board', () => ({
    getAllBoards: jest.fn(),
    createBoard: jest.fn(),
}));

jest.mock(
    '@/app/[locale]/(dashboard)/[UserID]/_components/NewBoardButton',
    () => ({
        NewBoardButton: ({
            onBoardCreated,
        }: {
            onBoardCreated: (board: Board) => void;
        }) => (
            <button
                data-testid="new-board-button"
                onClick={() => onBoardCreated(mockNewBoard)}
            >
                New Board
            </button>
        ),
    }),
);

jest.mock('@clerk/nextjs', () => ({
    useClerk: () => ({
        user: {
            firstName: 'TestUser',
        },
    }),
}));

const mockBoards: Board[] = [
    {
        _id: '1',
        title: 'Board One',
        orgId: 'org1',
        authorId: 'user1',
        imageUrl: '/image1.png',
        createdAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
        _id: '2',
        title: 'Board Two',
        orgId: 'org1',
        authorId: 'user2',
        imageUrl: '/image2.png',
        createdAt: new Date('2024-02-01T00:00:00Z'),
    },
];

const mockNewBoard: Board = {
    _id: '3',
    title: 'New Board',
    orgId: 'org1',
    authorId: 'user1',
    imageUrl: '/image3.png',
    createdAt: new Date('2024-03-01T00:00:00Z'),
};

const mockMessages = {
    utils: {
        you: 'You',
        teammate: 'Teammate',
    },
    search: {
        notFound: 'No boards found.',
        tryAnother: 'Please try another search term.',
    },
};

describe('BoardList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
        });
    });

    it('отображает скелетоны при загрузке', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

        (getAllBoards as jest.Mock).mockReturnValue(new Promise(() => {}));

        render(
            <NextIntlClientProvider locale="en" messages={mockMessages}>
                <BoardList orgId="org1" query={{}} />
            </NextIntlClientProvider>,
        );

        const skeletons = screen.getAllByTestId('board-card-skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('отображает список досок после загрузки', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        render(
            <NextIntlClientProvider locale="en" messages={mockMessages}>
                <BoardList orgId="org1" query={{}} />
            </NextIntlClientProvider>,
        );

        await waitFor(() => {
            expect(getAllBoards).toHaveBeenCalledWith('user1', 'org1');
        });

        mockBoards.forEach((board) => {
            expect(screen.getByText(board.title)).toBeInTheDocument();
        });
    });

    it('фильтрует доски по поисковому запросу', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        const searchParams = new URLSearchParams();
        searchParams.set('search', 'One');
        (useSearchParams as jest.Mock).mockReturnValue(searchParams);
        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        render(
            <NextIntlClientProvider locale="en" messages={mockMessages}>
                <BoardList orgId="org1" query={{ search: 'One' }} />
            </NextIntlClientProvider>,
        );

        await waitFor(() => {
            expect(getAllBoards).toHaveBeenCalledWith('user1', 'org1');
        });

        expect(screen.getByText('Board One')).toBeInTheDocument();
        expect(screen.queryByText('Board Two')).not.toBeInTheDocument();
    });

    it('отображает EmptySearch, если нет результатов поиска', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        const searchParams = new URLSearchParams();
        searchParams.set('search', 'Nonexistent');
        (useSearchParams as jest.Mock).mockReturnValue(searchParams);

        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        render(
            <NextIntlClientProvider locale="en" messages={mockMessages}>
                <BoardList orgId="org1" query={{ search: 'Nonexistent' }} />
            </NextIntlClientProvider>,
        );

        await waitFor(() => {
            expect(getAllBoards).toHaveBeenCalledWith('user1', 'org1');
        });

        expect(screen.getByText('No boards found.')).toBeInTheDocument();
        expect(
            screen.getByText('Please try another search term.'),
        ).toBeInTheDocument();
    });

    it('обновляет список при создании новой доски', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        render(
            <NextIntlClientProvider locale="en" messages={mockMessages}>
                <BoardList orgId="org1" query={{}} />
            </NextIntlClientProvider>,
        );

        await waitFor(() => {
            expect(getAllBoards).toHaveBeenCalledWith('user1', 'org1');
        });

        mockBoards.forEach((board) => {
            expect(screen.getByText(board.title)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('new-board-button'));

        const boardCard = screen.getByTestId('board-card-3');
        expect(within(boardCard).getByText('New Board')).toBeInTheDocument();
    });
});
