import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();
    const unusedVariable = 'This is not used';

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
