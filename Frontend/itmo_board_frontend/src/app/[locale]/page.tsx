import {useTranslations } from 'next-intl';

export default function Main() {
    const t = useTranslations('Main');
    return (
        <div>
            <h1>{t('test')}</h1>
        </div>
    );
}