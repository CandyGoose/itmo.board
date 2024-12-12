import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewBoardButton } from './NewBoardButton';
import { createBoard } from '@/actions/Board';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import '@testing-library/jest-dom';
import { useTranslations } from 'next-intl';

jest.mock('@/actions/Board');
jest.mock('sonner');
jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
}));
jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('NewBoardButton', () => {
    const orgId = 'org1';
    const onBoardCreated = jest.fn();
    const mockUseTranslations = useTranslations as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseTranslations.mockImplementation(() => () => 'New Board');
    });

    test('должна быть активной кнопкой по умолчанию', () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });

        render(
            <NewBoardButton orgId={orgId} onBoardCreated={onBoardCreated} />,
        );

        const button = screen.getByRole('button');
        expect(button).toBeEnabled();
    });

    test('должна быть неактивной кнопкой, если передан пропс disabled', () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });

        render(
            <NewBoardButton
                orgId={orgId}
                onBoardCreated={onBoardCreated}
                disabled
            />,
        );

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    test('должна показывать toast с успехом и вызвать onBoardCreated при успешном создании доски', async () => {
        const newBoard = {
            _id: '1',
            title: 'New Board',
            authorId: 'user1',
            orgId,
        };
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        (createBoard as jest.Mock).mockResolvedValue({ data: newBoard });

        render(
            <NewBoardButton orgId={orgId} onBoardCreated={onBoardCreated} />,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Created successfully.');
            expect(onBoardCreated).toHaveBeenCalledWith(newBoard);
        });
    });

    test('должна показывать toast с ошибкой при неудачном создании доски', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        (createBoard as jest.Mock).mockRejectedValue(
            new Error('Failed to create'),
        );

        render(
            <NewBoardButton orgId={orgId} onBoardCreated={onBoardCreated} />,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to create.');
        });
    });

    test('должна не вызывать onBoardCreated при неудачном создании доски', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: 'user1' });
        (createBoard as jest.Mock).mockRejectedValue(
            new Error('Failed to create'),
        );

        render(
            <NewBoardButton orgId={orgId} onBoardCreated={onBoardCreated} />,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(onBoardCreated).not.toHaveBeenCalled();
        });
    });
});
