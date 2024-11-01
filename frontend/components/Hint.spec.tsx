import { render, screen } from '@testing-library/react';
import { Hint } from '@/components/Hint';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
describe('Hint component', () => {
    it('renders with the correct label', async () => {
        render(
            <Hint label="Tooltip Label">
                <button>Hover me</button>
            </Hint>,
        );
        await userEvent.hover(screen.getByText('Hover me'));
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent('Tooltip Label');
    });
});
