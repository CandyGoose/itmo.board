import {LocalePrefix, Pathnames} from "next-intl/routing";

export const defaultLocale = 'en' as const;
export const locales = ['en', 'ru'] as const;

export const pathnames: Pathnames<typeof locales> = {
    '/': '/',
};
export const localePrefix: LocalePrefix<typeof locales> = 'always';