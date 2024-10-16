import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { BoardToolButton } from '@/app/[locale]/components/buttons/BoardToolButton';

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('BoardToolButton component', () => {
    it('renders the button with translated alt text', () => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) =>
            key === 'toolName' ? 'Translated Tool Name' : key,
        );
        render(
            <BoardToolButton
                name="toolName"
                icon_path="/path/to/icon.png"
                handler={jest.fn()}
            />,
        );
        expect(screen.getByAltText('Translated Tool Name')).toBeInTheDocument();
    });

    it('calls the handler when the image is clicked', () => {
        const handler = jest.fn();
        (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
        render(
            <BoardToolButton
                name="toolName"
                icon_path="/path/to/icon.png"
                handler={handler}
            />,
        );
        fireEvent.click(screen.getByAltText('toolName'));
        expect(handler).toHaveBeenCalled();
    });

    it('renders the button with the correct icon path', () => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
        render(
            <BoardToolButton
                name="toolName"
                icon_path="/path/to/icon.png"
                handler={jest.fn()}
            />,
        );

        const image = screen.getByAltText('toolName');
        expect(image).toHaveAttribute(
            'src',
            expect.stringContaining(encodeURIComponent('/path/to/icon.png')),
        );
    });

    it('handles missing translation gracefully', () => {
        (useTranslations as jest.Mock).mockReturnValue((key: string) => key);
        render(
            <BoardToolButton
                name="missingTranslation"
                icon_path="/path/to/icon.png"
                handler={jest.fn()}
            />,
        );
        expect(screen.getByAltText('missingTranslation')).toBeInTheDocument();
    });
});
