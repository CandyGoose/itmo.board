import '../globals.css';
import React, { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ModalProvider } from '@/providers/ModalProvider';
import YandexMetrika from '@/metrika/YandexMetrika';
import { ThemeProvider } from '@/providers/ThemeProvider';

const rollbarConfig = {
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const messages = await getMessages(locale);

    return (
        <html lang={locale}>
            <RollbarProvider config={rollbarConfig}>
                <YandexMetrika />
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ErrorBoundary>
                        <ClerkProvider>
                            <body>
                                <ThemeProvider>
                                    {children}
                                    <ModalProvider />
                                </ThemeProvider>
                            </body>
                        </ClerkProvider>
                    </ErrorBoundary>
                </NextIntlClientProvider>
            </RollbarProvider>
        </html>
    );
}
