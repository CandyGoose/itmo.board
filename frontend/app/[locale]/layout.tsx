import '../globals.css';
import React, { ReactNode, Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/ui/Sonner';
import { getMessages } from 'next-intl/server';
import { ModalProvider } from '@/providers/ModalProvider';
import YandexMetrika from '@/metrika/YandexMetrika';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Loading from './loading';
import { enUS, ruRU } from '@clerk/localizations';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: 'itmo.board | %s',
        default: 'itmo.board',
    },
};

const rollbarConfig = {
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
};

const clerkLocaleMap = {
    en: enUS,
    ru: ruRU,
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
                        {/*@ts-expect-error: Ignore clerk locale map error*/}
                        <ClerkProvider localization={clerkLocaleMap[locale]}>
                            <body>
                                <Suspense fallback={<Loading />}>
                                    <ThemeProvider>
                                        {children}
                                        <ModalProvider />
                                        <Toaster />
                                    </ThemeProvider>
                                </Suspense>
                            </body>
                        </ClerkProvider>
                    </ErrorBoundary>
                </NextIntlClientProvider>
            </RollbarProvider>
        </html>
    );
}
