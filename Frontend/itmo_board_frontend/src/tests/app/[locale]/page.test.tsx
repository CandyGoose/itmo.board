import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import Main from '@/app/[locale]/page';

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

jest.mock('@/app/[locale]/components/BoardChooser', () => ({
    BoardChooser: jest.fn(() => <div>BoardChooser Component</div>),
}));

describe('Main component', () => {
    it('renders the main heading with translated text', () => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) =>
            key === 'test' ? 'Test Translation' : key,
        );
        render(<Main />);
        expect(screen.getByText('Test Translation')).toBeInTheDocument();
    });

    it('renders the BoardChooser component', () => {
        render(<Main />);
        expect(screen.getByText('BoardChooser Component')).toBeInTheDocument();
    });

    it('renders the main heading with fallback text if translation is missing', () => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
        render(<Main />);
        expect(screen.getByText('test')).toBeInTheDocument();
    });
});
