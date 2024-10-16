import { render } from '@testing-library/react';
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

        // This insane workaround is needed to render the layout within a html
        // element instead of a div as the render function does by default
        const htmlContainer = document.createElement('html');
        const { props } = await LocaleLayout({ children, params });
        const { container } = render(props.children, {
            container: htmlContainer,
        });

        expect(container).toHaveTextContent('Test Children');
    });

    it('provides messages to NextIntlClientProvider', async () => {
        const messages = { hello: 'world' };
        (getMessages as jest.Mock).mockResolvedValue(messages);

        const children = <div />;
        const params = { locale: 'en' };

        const htmlContainer = document.createElement('html');
        const { props } = await LocaleLayout({ children, params });
        render(props.children, { container: htmlContainer });

        expect(NextIntlClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({ messages }),
            expect.anything(),
        );
    });

    it('handles missing messages gracefully', async () => {
        (getMessages as jest.Mock).mockResolvedValue(null);

        const children = <div />;
        const params = { locale: 'en' };

        const htmlContainer = document.createElement('html');
        const { props } = await LocaleLayout({ children, params });
        render(props.children, {
            container: htmlContainer,
        });

        expect(NextIntlClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({ messages: null }),
            expect.anything(),
        );
    });
});