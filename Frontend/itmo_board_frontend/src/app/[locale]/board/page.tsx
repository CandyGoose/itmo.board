import { useTranslations } from 'next-intl';

export default function Board() {
    const t = useTranslations('Board');
    return (
        <div>
            <h1>{t('test')}</h1>
        </div>
    );
}
