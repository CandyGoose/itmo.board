import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import BoardCard from './Index';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { NextIntlClientProvider } from 'next-intl';

jest.mock('@clerk/nextjs', () => ({
    useAuth: jest.fn(),
}));

jest.mock('next/client', () => ({
    router: {
        push: jest.fn(),
    },
}));

jest.mock('date-fns', () => {
    const actual = jest.requireActual('date-fns');
    return {
        ...actual,
        formatDistanceToNow: jest.fn().mockReturnValue('5 days ago'),
    };
});

const defaultProps = {
    id: 'board-123',
    title: 'My Test Board',
    imageUrl: '/test-image.png',
    authorId: 'author-111',
    authorName: 'AuthorName',
    createdAt: 1692027775000,
    orgId: 'org-999',
};

const convexClient = new ConvexReactClient('http://fake.server');
const messages = {
    tools: {
        you: 'You',
        delete: 'Delete',
        rename: 'Rename',
        copyLink: 'Copy link',
        download: 'Download',
        downloadAsSVG: 'Download as SVG',
        downloadAsPNG: 'Download as PNG',
    },
};

function TestProviders({ children }: { children: React.ReactNode }) {
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <ConvexProvider client={convexClient}>{children}</ConvexProvider>
        </NextIntlClientProvider>
    );
}

describe('BoardCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ userId: 'current-user-id' });
    });

    function renderBoardCard(extraProps = {}) {
        return render(
            <TestProviders>
                <BoardCard {...defaultProps} {...extraProps} />
            </TestProviders>
        );
    }

    test('рендерит ссылку с правильным href', () => {
        renderBoardCard();
        const linkElement = screen.getByRole('link', { name: /my test board/i });
        expect(linkElement).toHaveAttribute('href', '/boards/board-123');
    });

    test('рендерит изображение с правильным alt-текстом', () => {
        renderBoardCard();
        const image = screen.getByAltText(/my test board/i);
        expect(image).toBeInTheDocument();
    });

    test('рендерит дату, используя formatDistanceToNow', () => {
        renderBoardCard();
        expect(formatDistanceToNow).toHaveBeenCalled();
        expect(screen.getByText(/5 days ago/i)).toBeInTheDocument();
    });
});

describe('BoardCard.Skeleton', () => {
    test('рендерит скелетон', () => {
        render(
            <TestProviders>
                <BoardCard.Skeleton />
            </TestProviders>
        );
        expect(screen.getByTestId('board-card-skeleton')).toBeInTheDocument();
    });
});
