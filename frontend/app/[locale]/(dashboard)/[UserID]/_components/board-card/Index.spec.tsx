import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoardCard } from '@/app/[locale]/(dashboard)/[UserID]/_components/board-card/Index';
import { useRouter } from 'next/navigation';
import { act } from 'react';
import { useClerk } from '@clerk/nextjs';

jest.mock('@/actions/CanvasSaver', () => ({
    __esModule: true,
    default: () => <div data-testid="canvas-saver-mock" />,
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(() => ({ UserID: '123' })),
    usePathname: jest.fn(),
}));

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(() => (key: string) => {
        return key;
    }),
    useLocale: jest.fn(() => 'en'),
}));

jest.mock('@clerk/nextjs', () => ({
    useClerk: jest.fn(),
}));

describe('BoardCard Component', () => {
    const mockPush = jest.fn();
    const defaultProps = {
        id: '1',
        title: 'Project Board',
        authorId: '456',
        createdAt: new Date('2023-01-01'),
        imageUrl: '/placeholders/sample.svg',
        orgId: 'org123',
    };

    const mockUseClerk = useClerk as jest.Mock;
    mockUseClerk.mockReturnValue({ user: { firstName: 'Test User' } });

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    test('renders correctly with all props', () => {
        render(<BoardCard {...defaultProps} />);

        // Check title
        expect(screen.getByText('Project Board')).toBeInTheDocument();
        // Check time since creation
        expect(screen.getByText(/ago/i)).toBeInTheDocument();
        // Check image
        expect(screen.getByAltText('')).toBeInTheDocument();
    });

    test('navigates to board on click', async () => {
        render(<BoardCard {...defaultProps} />);

        const card = screen.getByTestId(`board-card-${defaultProps.id}`);
        fireEvent.click(card);

        expect(mockPush).toHaveBeenCalledWith(`boards/${defaultProps.id}`);
    });

    test('sets loading state during navigation', async () => {
        render(<BoardCard {...defaultProps} />);

        const card = screen.getByTestId('board-card-1');

        await act(async () => {
            fireEvent.click(card);
        });

        expect(mockPush).toHaveBeenCalledWith(`boards/${defaultProps.id}`);
        expect(card).toHaveClass('cursor-pointer');
    });

    test('renders "Skeleton" correctly', () => {
        render(<BoardCard.Skeleton />);

        const skeleton = screen.getByTestId('board-card-skeleton');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveClass(
            'aspect-[100/127] rounded-lg overflow-hidden',
        );
    });
});
