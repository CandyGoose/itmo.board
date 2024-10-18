import { notFound } from 'next/navigation';
import { loadLocale } from '@/i18n';

jest.mock('next/navigation', () => ({
    notFound: jest.fn(),
}));

describe('loadLocale function', () => {
    it('returns messages for a valid locale', async () => {
        const locale = 'en';
        const config = await loadLocale({ locale });
        expect(config.messages).toBeDefined();
    });
});
