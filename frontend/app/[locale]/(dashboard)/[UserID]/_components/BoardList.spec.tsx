import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { BoardList } from './BoardList';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useQuery } from 'convex/react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/navigation';

jest.mock('convex/react', () => {
    const actual = jest.requireActual('convex/react');
    return {
        ...actual,
        useQuery: jest.fn(),
    };
});

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const client = new ConvexReactClient('http://fake.server');

const messages = {
    search: {
        notFound: 'No results found',
        tryAnother: 'Try something else',
    },
};

function TestProviders({ children }: { children: React.ReactNode }) {
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <ConvexProvider client={client}>{children}</ConvexProvider>
        </NextIntlClientProvider>
    );
}

function renderBoardList(orgId: string, query?: { search?: string }) {
    return render(
        <TestProviders>
            <BoardList orgId={orgId} query={query || {}} />
        </TestProviders>,
    );
}

describe('BoardList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    });

    test('рендерит 5 скелетонов и NewBoardButton (disabled) при data === undefined', () => {
        (useQuery as jest.Mock).mockReturnValue(undefined);

        renderBoardList('my-org');

        const newBoardButton = screen.getByRole('button');
        expect(newBoardButton).toBeDisabled();

        const skeletons = screen.getAllByTestId('board-card-skeleton');
        expect(skeletons).toHaveLength(5);
    });

    test('рендерит EmptySearch при пустом data и наличии query.search', () => {
        (useQuery as jest.Mock).mockReturnValue([]);

        renderBoardList('my-org', { search: 'test' });

        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
});
