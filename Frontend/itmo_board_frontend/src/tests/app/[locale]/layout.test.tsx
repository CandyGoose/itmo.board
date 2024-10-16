import { render, screen } from '@testing-library/react';
import LocaleLayout from '@/app/[locale]/layout';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

jest.mock('next-intl/server', () => ({
    getMessages: jest.fn(),
}));

jest.mock('next-intl', () => ({
    NextIntlClientProvider: jest.fn(({ children }) => <div>{children}</div>),
}));

describe('LocaleLayout component', () => {
    it('renders children correctly', async () => {
        (getMessages as jest.Mock).mockResolvedValue({});

        const children = <div>Test Children</div>;
        const params = { locale: 'en' };

        render(await LocaleLayout({ children, params }));

        expect(screen.getByText('Test Children')).toBeInTheDocument();
    });

    it('sets the correct lang attribute on html element', async () => {
        (getMessages as jest.Mock).mockResolvedValue({});

        const children = <div />;
        const params = { locale: 'en' };

        const { container } = render(await LocaleLayout({ children, params }));

        // Check the lang attribute on the rendered html element
        const htmlElement = container.querySelector('html');
        expect(htmlElement?.getAttribute('lang')).toBe('en');
    });

    it('provides messages to NextIntlClientProvider', async () => {
        const messages = { hello: 'world' };
        (getMessages as jest.Mock).mockResolvedValue(messages);

        const children = <div />;
        const params = { locale: 'en' };

        render(await LocaleLayout({ children, params }));

        expect(NextIntlClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({ messages }),
            expect.anything()
        );
    });

    it('handles missing messages gracefully', async () => {
        (getMessages as jest.Mock).mockResolvedValue(null);

        const children = <div />;
        const params = { locale: 'en' };

        render(await LocaleLayout({ children, params }));

        expect(NextIntlClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({ messages: null }),
            expect.anything()
        );
    });
});