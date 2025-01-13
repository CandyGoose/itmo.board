import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hint from './Hint';
import '@testing-library/jest-dom';

describe('Hint Component', () => {
    it('renders children correctly', () => {
        render(
            <Hint label="Test tooltip">
                <button>Hover me</button>
            </Hint>
        );

        expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    });

    it('displays tooltip on hover', async () => {
        const user = userEvent.setup();

        render(
            <Hint label="Test tooltip">
                <button>Hover me</button>
            </Hint>
        );

        await user.hover(screen.getByRole('button', { name: 'Hover me' }));

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent('Test tooltip');
    });

    it('hides tooltip when mouse leaves', async () => {
        const user = userEvent.setup();

        render(
            <Hint label="Test tooltip">
                <button>Hover me</button>
            </Hint>
        );

        const trigger = screen.getByRole('button', { name: 'Hover me' });

        await user.hover(trigger);

        await user.unhover(trigger);

        expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
    });
});
