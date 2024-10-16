import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import Board from '@/app/[locale]/board/page';

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('Board component', () => {
    beforeEach(() => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
    });

    it('renders the translated test message', () => {
        render(<Board />);
        expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('renders the heading element', () => {
        render(<Board />);
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
});
