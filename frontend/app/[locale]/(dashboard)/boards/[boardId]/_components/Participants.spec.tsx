import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Participants, ParticipantsSkeleton } from './Participants';
import { useOthers, useSelf } from '@/liveblocks.config';
import { UserAvatar } from './UserAvatar';

// Mocking dependencies
jest.mock('@/liveblocks.config', () => ({
    useOthers: jest.fn(),
    useSelf: jest.fn(),
}));

jest.mock('./UserAvatar', () => ({
    UserAvatar: ({ name, fallback }: { name?: string; fallback?: string }) => (
        <div data-testid="user-avatar">{name || fallback}</div>
    ),
}));

jest.mock('next-intl', () => ({
    useTranslations: () => jest.fn().mockImplementation((key: string) => key),
}));

describe('Participants', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders current user and other participants correctly', () => {
        (useOthers as jest.Mock).mockReturnValue([
            { connectionId: 1, info: { name: 'Alice', picture: '/alice.png' } },
            { connectionId: 2, info: { name: 'Bob', picture: '/bob.png' } },
        ]);
        (useSelf as jest.Mock).mockReturnValue({
            connectionId: 3,
            info: { name: 'Charlie', picture: '/charlie.png' },
        });

        render(<Participants />);

        expect(screen.getAllByTestId('user-avatar')).toHaveLength(3);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie (you)')).toBeInTheDocument();
    });

    it('renders "more users" avatar when participants exceed MAX_SHOWN_USERS', () => {
        const mockUsers = Array.from({ length: 12 }, (_, i) => ({
            connectionId: i,
            info: { name: `User${i}`, picture: `/user${i}.png` },
        }));
        (useOthers as jest.Mock).mockReturnValue(mockUsers);
        (useSelf as jest.Mock).mockReturnValue(null);

        render(<Participants />);

        expect(screen.getAllByTestId('user-avatar')).toHaveLength(11);
        // Используем функцию вместо точного текста
        expect(
            screen.getByText((content, element) => {
                const hasText = (node: Element) =>
                    node.textContent === '2 further';
                const nodeHasText = hasText(element!);
                const childrenDontHaveText = Array.from(
                    element!.children,
                ).every((child) => !hasText(child));
                return nodeHasText && childrenDontHaveText;
            }),
        ).toBeInTheDocument();
    });

    it('handles no participants gracefully', () => {
        (useOthers as jest.Mock).mockReturnValue([]);
        (useSelf as jest.Mock).mockReturnValue(null);

        render(<Participants />);

        expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument();
    });

    it('calculates container width correctly based on participants', () => {
        const mockUsers = [
            { connectionId: 1, info: { name: 'Alice', picture: '/alice.png' } },
        ];
        const currentUser = {
            connectionId: 2,
            info: { name: 'Charlie', picture: '/charlie.png' },
        };
        (useOthers as jest.Mock).mockReturnValue(mockUsers);
        (useSelf as jest.Mock).mockReturnValue(currentUser);

        const totalParticipants = mockUsers.length + 1; // 1 для currentUser
        const PADDING = 8;
        const AVATAR_SIZE = 35;
        const expectedWidth =
            totalParticipants <= 10
                ? PADDING * 2 + totalParticipants * (AVATAR_SIZE + PADDING)
                : PADDING * 2 + (10 + 1) * (AVATAR_SIZE + PADDING);

        render(<Participants className="custom-class" />);

        const container = document.querySelector('.custom-class');

        expect(container).toHaveStyle({
            width: `${expectedWidth}px`,
        });
    });

    it('applies custom class names', () => {
        (useOthers as jest.Mock).mockReturnValue([]);
        (useSelf as jest.Mock).mockReturnValue(null);

        render(<Participants className="custom-class" />);

        const container = document.querySelector('.custom-class');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass('custom-class');
    });
});
