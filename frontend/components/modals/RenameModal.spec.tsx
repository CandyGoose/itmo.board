import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RenameModal } from './RenameModal';
import { useRenameModal } from '@/store/useRenameModal';
import { renameBoard } from '@/actions/Board';
import { useRouter } from 'next/navigation';

jest.mock('@/store/useRenameModal', () => ({
    useRenameModal: jest.fn(),
}));

jest.mock('@/actions/Board', () => ({
    renameBoard: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('RenameModal', () => {
    const mockOnClose = jest.fn();
    const mockRefresh = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            refresh: mockRefresh,
        });

        (useRenameModal as unknown as jest.Mock).mockReturnValue({
            isOpen: true,
            onClose: mockOnClose,
            initialValues: { id: '1', title: 'Initial Title' },
        });
    });

    test('рендерит модалку с правильным заголовком и значением ввода', () => {
        render(<RenameModal />);

        expect(
            screen.getByRole('heading', { name: /edit board title/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/enter a new title for this board/i),
        ).toBeInTheDocument();

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('Initial Title');
    });

    test('обновляет состояние ввода при изменении текста', () => {
        render(<RenameModal />);

        const input = screen.getByRole('textbox');

        fireEvent.change(input, { target: { value: 'New Board Title' } });
        expect(input).toHaveValue('New Board Title');
    });

    test('вызывает renameBoard и закрывает модалку при успешной отправке', async () => {
        (renameBoard as jest.Mock).mockResolvedValueOnce(undefined);

        render(<RenameModal />);

        const input = screen.getByRole('textbox');
        const saveButton = screen.getByRole('button', { name: /save/i });

        fireEvent.change(input, { target: { value: 'New Board Title' } });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(renameBoard).toHaveBeenCalledWith('1', 'New Board Title');
            expect(mockRefresh).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        expect(screen.queryByText(/board renamed\./i)).not.toBeInTheDocument();
    });

    test('обрабатывает ошибку при вызове renameBoard', async () => {
        (renameBoard as jest.Mock).mockRejectedValueOnce(new Error('Error'));

        render(<RenameModal />);

        const input = screen.getByRole('textbox');
        const saveButton = screen.getByRole('button', { name: /save/i });

        fireEvent.change(input, { target: { value: 'New Board Title' } });

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(renameBoard).toHaveBeenCalledWith('1', 'New Board Title');
        });

        expect(
            screen.queryByText(/failed to renamed board\./i),
        ).not.toBeInTheDocument();
    });
});
