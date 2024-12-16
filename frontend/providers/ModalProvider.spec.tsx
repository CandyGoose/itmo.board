import { render, screen } from '@testing-library/react';
import { ModalProvider } from './ModalProvider';
import '@testing-library/jest-dom';

jest.mock('@/components/modals/RenameModal', () => ({
    RenameModal: () => <div data-testid="rename-modal">RenameModal</div>,
}));

describe('ModalProvider Component', () => {
    test('рендерит RenameModal после монтирования', async () => {
        render(<ModalProvider />);

        const modal = await screen.findByTestId('rename-modal');
        expect(modal).toBeInTheDocument();
    });

    test('рендерит RenameModal после монтирования', async () => {
        jest.useFakeTimers();

        render(<ModalProvider />);

        jest.runAllTimers();

        expect(await screen.findByTestId('rename-modal')).toBeInTheDocument();

        jest.useRealTimers();
    });
});
