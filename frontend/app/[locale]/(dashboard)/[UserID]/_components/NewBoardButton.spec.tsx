import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewBoardButton } from './NewBoardButton';
import { toast } from 'sonner';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/hooks/useApiMutation', () => ({
    useApiMutation: jest.fn(),
}));

describe('NewBoardButton', () => {
    const orgId = 'ORG_ID';

    const { useRouter } = jest.requireMock('next/navigation');

    const { useApiMutation } = jest.requireMock('@/hooks/useApiMutation');
    const mockMutate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useRouter.mockReturnValue({
            push: jest.fn(),
            refresh: jest.fn(),
        });

        useApiMutation.mockReturnValue({
            mutate: mockMutate,
            pending: false,
        });
    });

    test('рендерит кнопку "New Board"', () => {
        render(<NewBoardButton orgId={orgId} />);

        expect(screen.getByText('New Board')).toBeInTheDocument();
    });

    test('показывает toast.success при успешном создании доски', async () => {
        mockMutate.mockResolvedValueOnce(undefined);

        render(<NewBoardButton orgId={orgId} />);

        const button = screen.getByRole('button', { name: /new board/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Board Created');
        });
    });

    test('показывает toast.error при ошибке создания доски', async () => {
        mockMutate.mockRejectedValueOnce(new Error('Failed'));

        render(<NewBoardButton orgId={orgId} />);

        const button = screen.getByRole('button', { name: /new board/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to create board');
        });
    });

    test('кнопка становится disabled, если передан проп disabled', () => {
        render(<NewBoardButton orgId={orgId} disabled />);

        const button = screen.getByRole('button', { name: /new board/i });
        expect(button).toBeDisabled();
    });
});
