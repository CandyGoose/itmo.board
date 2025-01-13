import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Info } from './Info';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useQuery } from 'convex/react';
import { useRenameModal } from '@/store/useRenameModal';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/navigation';

jest.mock('convex/react', () => {
    const actual = jest.requireActual('convex/react');
    return {
        ...actual,
        useQuery: jest.fn(),
    };
});

jest.mock('@/store/useRenameModal', () => ({
    useRenameModal: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const client = new ConvexReactClient('http://fake.server');
const messages = {
    tools: {
        copyLink: 'Copy link',
        delete: 'Delete',
        rename: 'Rename',
        download: 'Download',
        downloadAsSVG: 'Download as SVG',
        downloadAsPNG: 'Download as PNG',
    },
};

function TestProviders({ children }: { children: React.ReactNode }) {
    return (
        <NextIntlClientProvider locale="en" messages={messages}>
            <ConvexProvider client={client}>{children}</ConvexProvider>
        </NextIntlClientProvider>
    );
}

describe('Info component', () => {
    const boardId = 'board-123';
    const mockUseQuery = useQuery as jest.Mock;
    const mockUseRenameModal = useRenameModal as jest.Mock;
    const mockUseRouter = useRouter as jest.Mock;

    function renderInfo(boardId: string) {
        return render(
            <TestProviders>
                <Info boardId={boardId} />
            </TestProviders>,
        );
    }

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    test('рендерит InfoSkeleton, если useQuery вернул undefined (данные не загрузились)', () => {
        mockUseQuery.mockReturnValue(undefined);
        mockUseRenameModal.mockReturnValue({
            onOpen: jest.fn(),
            isOpen: false,
            initialValues: { id: '', title: '' },
        });

        renderInfo(boardId);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('рендерит основной контент, если useQuery вернул данные', () => {
        mockUseQuery.mockReturnValue({
            _id: boardId,
            title: 'My Test Board',
        });
        mockUseRenameModal.mockReturnValue({
            onOpen: jest.fn(),
            isOpen: false,
            initialValues: { id: '', title: '' },
        });

        renderInfo(boardId);

        const linkEl = screen.getByRole('link', { name: /board/i });
        expect(linkEl).toHaveAttribute('href', '/');

        expect(
            screen.getByRole('button', { name: /my test board/i }),
        ).toBeInTheDocument();
    });

    test('при клике на rename вызывает onOpen(boardId, title)', () => {
        const mockOnOpen = jest.fn();

        mockUseQuery.mockReturnValue({
            _id: boardId,
            title: 'My Test Board',
        });
        mockUseRenameModal.mockReturnValue({
            onOpen: mockOnOpen,
            isOpen: false,
            initialValues: { id: '', title: '' },
        });

        renderInfo(boardId);

        const renameBtn = screen.getByRole('button', {
            name: /my test board/i,
        });
        fireEvent.click(renameBtn);

        expect(mockOnOpen).toHaveBeenCalledWith('board-123', 'My Test Board');
    });
});
