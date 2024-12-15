import {render, screen, fireEvent, within} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Actions } from './Action';
import { useRenameModal } from '@/store/useRenameModal';
import userEvent from "@testing-library/user-event";
import {useRouter} from "next/navigation";

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/store/useRenameModal', () => ({
    useRenameModal: jest.fn(),
}));

jest.mock('lucide-react', () => ({
    Link2: () => <svg data-testid="link2-icon" />,
    Pencil: () => <svg data-testid="pencil-icon" />,
    Trash2: () => <svg data-testid="trash2-icon" />,
}));

describe('Actions Component', () => {
    const onOpenMock = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRenameModal as unknown as jest.Mock).mockReturnValue({
            onOpen: onOpenMock,
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    test('отображает содержимое меню при клике на триггер', async () => {
        render(
            <Actions id="123" title="Test Title">
                <button data-testid="trigger">Open Actions</button>
            </Actions>
        );

        const trigger = screen.getByTestId('trigger');
        userEvent.click(trigger);

        const menuContent = await screen.findByRole('menu');
        expect(menuContent).toBeInTheDocument();

        const menuItem = within(menuContent).getByRole('menuitem', { name: 'Copy link' });
        expect(menuItem).toBeInTheDocument();

        const icon = within(menuItem).getByTestId('link2-icon');
        expect(icon).toBeInTheDocument();
    });

    test('пункт Rename отключен при disable=true', async () => {
        render(
            <Actions id="123" title="Test Title" disable={true} defaultOpen>
                <button data-testid="trigger">Open Actions</button>
            </Actions>
        );

        const menuItem = screen.getByTestId('rename-item');

        expect(menuItem).toHaveAttribute('aria-disabled', 'true');
    });

    test('клик на содержимое не вызывает событие родителя', async () => {
        const parentClick = jest.fn();

        render(
            <div onClick={parentClick}>
                <Actions id="123" title="Test Title" defaultOpen>
                    <button data-testid="trigger">Open Actions</button>
                </Actions>
            </div>
        );

        const menuItem = screen.getByTestId('rename-item');

        fireEvent.click(menuItem);

        expect(parentClick).not.toHaveBeenCalled();
    });
});
