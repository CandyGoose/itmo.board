import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { RenameModal } from './RenameModal';
import { useRenameModal } from '@/store/useRenameModal';
import { useApiMutation } from '@/hooks/useApiMutation';
import { toast } from 'sonner';

jest.mock('@/store/useRenameModal', () => ({
    useRenameModal: jest.fn(),
}));

jest.mock('@/hooks/useApiMutation', () => ({
    useApiMutation: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('RenameModal', () => {
    const mockUseRenameModal = useRenameModal as jest.Mock;
    const mockUseApiMutation = useApiMutation as jest.Mock;

    const mockOnClose = jest.fn();
    const mockMutate = jest.fn();
    const pending = false;

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseRenameModal.mockReturnValue({
            isOpen: true,
            onClose: mockOnClose,
            initialValues: { id: 'board-123', title: 'Initial Title' },
        });

        mockUseApiMutation.mockReturnValue({
            mutate: mockMutate,
            pending,
        });
    });

    test('рендерит модалку и отображает текущее название', () => {
        render(<RenameModal />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('Initial Title');
    });

    test('обновляет поле ввода при вводе текста', () => {
        render(<RenameModal />);

        const input = screen.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'New Title' } });
        expect(input.value).toBe('New Title');
    });

    test('отправляет форму, вызывает mutate и при успехе закрывает модалку', async () => {
        mockMutate.mockResolvedValueOnce(undefined);

        render(<RenameModal />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Title' } });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith({
                id: 'board-123',
                title: 'New Title',
            });

            expect(toast.success).toHaveBeenCalledWith('Board renamed');
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    test('отправляет форму и обрабатывает ошибку (toast.error), не закрывая модалку', async () => {
        mockMutate.mockRejectedValueOnce(new Error('Server Error'));

        render(<RenameModal />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Title' } });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith({
                id: 'board-123',
                title: 'New Title',
            });
            expect(toast.error).toHaveBeenCalledWith('Failed to rename board');
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    test('кнопка Save становится disabled при pending=true', () => {
        mockUseApiMutation.mockReturnValue({
            mutate: mockMutate,
            pending: true,
        });

        render(<RenameModal />);

        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeDisabled();
    });

    test('нажатие на Cancel вызывает onClose', () => {
        render(<RenameModal />);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});
