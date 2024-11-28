import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoardCard } from '@/app/[locale]/(dashboard)/[UserID]/_components/board-card/Index';
import { useRouter } from 'next/navigation';
import { act } from 'react';
import { useTranslations } from 'next-intl';
import { useClerk } from '@clerk/nextjs';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(() => ({ UserID: '123' })),
    usePathname: jest.fn(),
}));

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(() => (key: string) => {
        if (key === 'you') return 'You';
        if (key === 'teammate') return 'Teammate';
        return key;
    }),
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

    const mockUseTranslations = useTranslations as jest.Mock;
    mockUseTranslations.mockImplementation(() => (key: string) => {
        if (key === 'you') return 'You';
        if (key === 'teammate') return 'Teammate';
        return key;
    });

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

    test('displays "You" when authorId matches UserID', async () => {
        render(<BoardCard {...defaultProps} authorId="123" />);

        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes('You')),
            ).toBeInTheDocument();
        });
    });

    test('displays the author\'s first name when authorId does not match UserID', async () => {
        render(<BoardCard {...defaultProps} authorId="456" />);

        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('Test User'))).toBeInTheDocument();
        });
    });


    test('navigates to board on click', async () => {
        render(<BoardCard {...defaultProps} />);

        const card = screen.getByRole('button');
        fireEvent.click(card);

        expect(mockPush).toHaveBeenCalledWith(`boards/${defaultProps.id}`);
    });

    test('sets loading state during navigation', async () => {
        render(<BoardCard {...defaultProps} />);

        // Update the test ID to match the element in your component
        const card = screen.getByTestId('board-card-1');

        await act(async () => {
            fireEvent.click(card);
        });

        expect(mockPush).toHaveBeenCalledWith(`boards/${defaultProps.id}`);
        expect(card).toHaveClass('cursor-pointer');
    });
});
