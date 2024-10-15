import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

const loadLocale = async ({ locale }: { locale: string }) => {
    if (!locales.includes(locale)) return notFound();

    return {
        messages: (await import(`../messages/${locale}.json`)).default,
    };
};

export default getRequestConfig(loadLocale);
export { loadLocale }; // Export the callback for testing
