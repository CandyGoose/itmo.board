import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Info, InfoSkeleton } from './Info';
import { useRenameModal } from '@/store/useRenameModal';
import { getBoardById } from '@/actions/Board';
import { useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

jest.mock('@/store/useRenameModal', () => ({
    useRenameModal: jest.fn(),
}));

jest.mock('@/actions/Board', () => ({
    getBoardById: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
    useOrganization: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('Info Component', () => {
    const mockOnOpen = jest.fn();
    const mockRouter = { back: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRenameModal as unknown as jest.Mock).mockReturnValue({
            onOpen: mockOnOpen,
        });

        (useRouter as jest.Mock).mockReturnValue(mockRouter);

        (useOrganization as jest.Mock).mockReturnValue({
            membership: true,
        });
    });

    test('рендерит InfoSkeleton при отсутствии данных о доске', async () => {
        (getBoardById as jest.Mock).mockResolvedValueOnce(null);

        render(<Info boardId="123" editable={false} setEditable={jest.fn()} />);

        expect(screen.getByRole('status')).toBeInTheDocument();

        await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    });

    test('вызывает onOpen при клике на кнопку Rename', async () => {
        (getBoardById as jest.Mock).mockResolvedValueOnce({
            _id: '123',
            title: 'Test Board',
        });
        (useOrganization as jest.Mock).mockReturnValue({ membership: true });

        render(<Info boardId="123" editable={true} setEditable={jest.fn()} />);

        const renameButton = await screen.findByText('Test Board');
        fireEvent.click(renameButton);

        expect(mockOnOpen).toHaveBeenCalledWith('123', 'Test Board');
    });

    test('рендерит скелет', () => {
        render(<InfoSkeleton />);
        const skeleton = screen.getByRole('status', { hidden: true });
        expect(skeleton).toBeInTheDocument();
    });
});
