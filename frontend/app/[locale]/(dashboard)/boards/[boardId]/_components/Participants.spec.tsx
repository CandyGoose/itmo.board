import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Participants, ParticipantsSkeleton } from './Participants';

jest.mock('@/components/ui/Skeleton', () => ({
    Skeleton: ({ className }: { className: string }) => (
        <div className={className} data-testid="skeleton"></div>
    ),
}));

jest.mock('./UserAvatar', () => ({
    UserAvatar: ({ name, fallback }: { name?: string; fallback?: string }) => (
        <div data-testid="user-avatar">
            <span>{name}</span>
            <span>{fallback}</span>
        </div>
    ),
}));

jest.mock('@/liveblocks.config', () => ({
    useOthers: jest.fn(),
    useSelf: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
    connectionIdToColor: jest.fn(() => 'red'),
}));

import { useOthers, useSelf } from '@/liveblocks.config';

describe('Participants Component', () => {
    it('renders up to MAX_SHOWN_USERS participants', () => {
        const mockUsers = Array(6)
            .fill(0)
            .map((_, idx) => ({
                connectionId: `user-${idx + 1}`,
                info: { name: `User ${idx + 1}`, picture: null },
            }));
        (useOthers as jest.Mock).mockReturnValue(mockUsers);
        (useSelf as jest.Mock).mockReturnValue(null);

        render(<Participants />);

        const userAvatars = screen.getAllByTestId('user-avatar');
        expect(userAvatars).toHaveLength(5); // MAX_SHOWN_USERS + "X more"
        expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('renders the current user with "(You)" appended to the name', () => {
        (useOthers as jest.Mock).mockReturnValue([]);
        (useSelf as jest.Mock).mockReturnValue({
            connectionId: 'current-user',
            info: { name: 'Current User', picture: null },
        });

        render(<Participants />);

        expect(screen.getByText('Current User (You)')).toBeInTheDocument();
    });

    it('does not render "X more" if users count is within the limit', () => {
        const mockUsers = Array(3)
            .fill(0)
            .map((_, idx) => ({
                connectionId: `user-${idx + 1}`,
                info: { name: `User ${idx + 1}`, picture: null },
            }));
        (useOthers as jest.Mock).mockReturnValue(mockUsers);
        (useSelf as jest.Mock).mockReturnValue(null);

        render(<Participants />);

        expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
    });
});

describe('ParticipantsSkeleton Component', () => {
    it('renders the Skeleton with correct className', () => {
        render(<ParticipantsSkeleton />);

        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveClass('h-full w-full bg-muted-400');
    });
});
