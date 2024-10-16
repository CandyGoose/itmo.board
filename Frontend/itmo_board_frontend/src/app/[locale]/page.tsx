import { useTranslations } from 'next-intl';
import { BoardChooser } from '@/app/[locale]/components/BoardChooser';
import { ThemeToggleButton } from '@/app/[locale]/components/ThemeToggleButton';

export default function Main() {
    const t = useTranslations('Main');
    return (
        <div>
            <h1>{t('test')}</h1>
            <ThemeToggleButton />
            <BoardChooser recentBoards={recentBoards} />
        </div>
    );
}

// TODO get user's data
const recentBoards: { name: string; link: string }[] = [
    {
        name: 'МатАнализ лек 1',
        link: '',
    },
    {
        name: 'МатАнализ прак 1',
        link: '',
    },
];
