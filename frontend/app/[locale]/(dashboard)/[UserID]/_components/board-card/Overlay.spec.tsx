import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
        await userEvent.hover(overlayElement);
        expect(overlayElement).toHaveClass('group-hover:opacity-30');
    });
});
