import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Для matcher'ов, таких как toHaveClass
import userEvent from '@testing-library/user-event';
import { Overlay } from './Overlay';

describe('Overlay component', () => {
    it('renders the overlay with correct initial classes', () => {
        render(<Overlay />);
        const overlayElement = screen.getByTestId('overlay');
        expect(overlayElement).toBeInTheDocument();
        expect(overlayElement).toHaveClass(
            'opacity-0 group-hover:opacity-30 transition-opacity h-full w-full bg-black',
        );
    });

    it('responds to hover', async () => {
        render(
            <div className="group">
                <Overlay />
            </div>,
        );
        const overlayElement = screen.getByTestId('overlay');

        // Simулируем наведение мыши на элемент
        await userEvent.hover(overlayElement);

        // Проверяем наличие класса
        expect(overlayElement).toHaveClass('group-hover:opacity-30');
    });
});
