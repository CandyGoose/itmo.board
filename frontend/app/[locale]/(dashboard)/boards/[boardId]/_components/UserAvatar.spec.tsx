import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { UserAvatar } from './UserAvatar';

describe('UserAvatar Component', () => {
    const defaultProps = {
        src: 'https://example.com/avatar.jpg',
        name: 'John Doe',
        fallback: 'JD',
        borderColor: '#FF0000',
        style: { backgroundColor: '#000000' },
    };

    test('renders fallback text when image is not provided', () => {
        render(<UserAvatar fallback="AB" name="Alice Brown" />);

        const fallbackText = screen.getByText('AB');
        expect(fallbackText).toBeInTheDocument();
    });

    test('displays tooltip on hover', async () => {
        const user = userEvent.setup();
        render(<UserAvatar {...defaultProps} />);

        const avatar = screen.getByText('JD');
        await user.hover(avatar);

        const tooltip = await screen.findAllByText(defaultProps.name);
        expect(tooltip[0]).toBeInTheDocument();
    });

    test('uses default tooltip label when name is not provided', async () => {
        const user = userEvent.setup();
        render(<UserAvatar fallback="AB" />);

        const avatar = screen.getByText('AB');
        await user.hover(avatar);

        const tooltip = await screen.findAllByText('Teammate');
        expect(tooltip[0]).toBeInTheDocument();
    });
});
