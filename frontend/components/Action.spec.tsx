import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Actions } from './Action';
import { useRenameModal } from '@/store/useRenameModal';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

jest.mock('@/store/useRenameModal', () => ({
    useRenameModal: jest.fn(),
}));

jest.mock('@/actions/Board', () => ({
    deleteBoard: jest.fn(),
}));

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('lucide-react', () => ({
    Link2: () => <svg data-testid="link2-icon" />,
    Pencil: () => <svg data-testid="pencil-icon" />,
    Trash2: () => <svg data-testid="trash2-icon" />,
    ChevronRight: () => <svg data-testid="chevron-right-icon" />,
    Download: () => <svg data-testid="download-icon" />,
    FileAxis3D: () => <svg data-testid="file-axis3d-icon" />,
    FileImage: () => <svg data-testid="file-image-icon" />,
}));

describe('Actions Component', () => {
    const onOpenMock = jest.fn();
    const mockPush = jest.fn();

    const originalClipboard = { ...global.navigator.clipboard };
    const originalDispatchEvent = window.dispatchEvent;

    beforeAll(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });
        window.dispatchEvent = jest.fn();
    });

    afterAll(() => {
        Object.assign(global.navigator, { clipboard: originalClipboard });
        window.dispatchEvent = originalDispatchEvent;
    });

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
            </Actions>,
        );

        const trigger = screen.getByTestId('trigger');
        await userEvent.click(trigger);

        const menuContent = await screen.findByRole('menu');
        expect(menuContent).toBeInTheDocument();

        const menuItem = within(menuContent).getByRole('menuitem', {
            name: 'copyLink',
        });
        expect(menuItem).toBeInTheDocument();

        const icon = within(menuItem).getByTestId('link2-icon');
        expect(icon).toBeInTheDocument();
    });

    test('пункт Rename отключен при disable=true', async () => {
        render(
            <Actions id="123" title="Test Title" disable={true} defaultOpen>
                <button data-testid="trigger">Open Actions</button>
            </Actions>,
        );

        const menuItem = screen.getByTestId('rename-item');

        expect(menuItem).toHaveAttribute('aria-disabled', 'true');
    });

    test('клик на содержимое не вызывает событие родителя', () => {
        const parentClick = jest.fn();

        render(
            <div onClick={parentClick}>
                <Actions id="123" title="Test Title" defaultOpen>
                    <button data-testid="trigger">Open Actions</button>
                </Actions>
            </div>,
        );

        const menuItem = screen.getByTestId('rename-item');
        fireEvent.click(menuItem);

        expect(parentClick).not.toHaveBeenCalled();
    });

    test('при клике на пункт rename вызывает useRenameModal.onOpen', () => {
        render(
            <Actions id="123" title="Test Title" defaultOpen>
                <button data-testid="trigger">Open Actions</button>
            </Actions>,
        );

        const renameItem = screen.getByTestId('rename-item');
        expect(renameItem).toBeEnabled();

        fireEvent.click(renameItem);

        expect(onOpenMock).toHaveBeenCalledTimes(1);
        expect(onOpenMock).toHaveBeenCalledWith('123', 'Test Title');
    });

    test('клик по Download -> субменю содержит пункты для SVG и PNG', () => {
        render(
            <Actions id="123" title="Test Title" defaultOpen>
                <button data-testid="trigger">Open Actions</button>
            </Actions>,
        );

        const downloadItem = screen.getByTestId('download-sub-menu');
        expect(downloadItem).toBeInTheDocument();

        fireEvent.click(downloadItem);

        const fileAxis3DItem = screen.getByText('downloadAsSVG');
        const fileImageItem = screen.getByText('downloadAsPNG');

        expect(fileAxis3DItem).toBeInTheDocument();
        expect(fileImageItem).toBeInTheDocument();
    });

    test('клик по downloadAsSVG отправляет кастомное событие', () => {
        render(
            <Actions id="123" title="Test Title" defaultOpen>
                <button data-testid="trigger">Open Actions</button>
            </Actions>,
        );

        const downloadItem = screen.getByTestId('download-sub-menu');
        fireEvent.click(downloadItem);

        const fileAxis3DItem = screen.getByText('downloadAsSVG');
        fireEvent.click(fileAxis3DItem);

        expect(window.dispatchEvent).toHaveBeenCalledWith(
            new CustomEvent('canvas-download', { detail: { format: 'svg' } }),
        );
    });

    test('клик по downloadAsPNG отправляет кастомное событие', () => {
        render(
            <Actions id="123" title="Test Title" defaultOpen>
                <button data-testid="trigger">Open Actions</button>
            </Actions>,
        );

        const downloadItem = screen.getByTestId('download-sub-menu');
        fireEvent.click(downloadItem);

        const fileImageItem = screen.getByText('downloadAsPNG');
        fireEvent.click(fileImageItem);

        expect(window.dispatchEvent).toHaveBeenCalledWith(
            new CustomEvent('canvas-download', { detail: { format: 'png' } }),
        );
    });
});
