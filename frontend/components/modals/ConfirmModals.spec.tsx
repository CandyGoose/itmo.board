import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

describe('ConfirmModal Component', () => {
    const onConfirmMock = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('рендерит триггер модального окна', () => {
        render(
            <ConfirmModal
                onConfirm={onConfirmMock}
                header="Delete Item?"
                description="Are you sure you want to delete this item?"
            >
                <button data-testid="trigger">Open Confirm</button>
            </ConfirmModal>,
        );

        const trigger = screen.getByTestId('trigger');
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveTextContent('Open Confirm');
    });

    test('открывает и закрывает модальное окно', () => {
        render(
            <ConfirmModal
                onConfirm={onConfirmMock}
                header="Delete Item?"
                description="Are you sure you want to delete this item?"
            >
                <button data-testid="trigger">Open Confirm</button>
            </ConfirmModal>,
        );

        const trigger = screen.getByTestId('trigger');
        fireEvent.click(trigger);

        // Проверка на отображение заголовка и описания модального окна
        expect(screen.getByText('Delete Item?')).toBeInTheDocument();
        expect(
            screen.getByText('Are you sure you want to delete this item?'),
        ).toBeInTheDocument();

        // Закрытие через кнопку Cancel
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(screen.queryByText('Delete Item?')).not.toBeInTheDocument();
    });

    test('вызывает функцию onConfirm при нажатии Confirm', () => {
        render(
            <ConfirmModal
                onConfirm={onConfirmMock}
                header="Delete Item?"
                description="Are you sure you want to delete this item?"
            >
                <button data-testid="trigger">Open Confirm</button>
            </ConfirmModal>,
        );

        const trigger = screen.getByTestId('trigger');
        fireEvent.click(trigger);

        // Нажатие на Confirm
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    test('отключает кнопку Confirm при disabled=true', () => {
        render(
            <ConfirmModal
                onConfirm={onConfirmMock}
                header="Delete Item?"
                description="Are you sure you want to delete this item?"
                disabled={true}
            >
                <button data-testid="trigger">Open Confirm</button>
            </ConfirmModal>,
        );

        const trigger = screen.getByTestId('trigger');
        fireEvent.click(trigger);

        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        expect(confirmButton).toBeDisabled();

        fireEvent.click(confirmButton);
        expect(onConfirmMock).not.toHaveBeenCalled();
    });
});
