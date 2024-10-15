import {useTranslations } from 'next-intl';
import {BoardChooser} from "@/app/[locale]/components/BoardChooser";
import {ThemeToggleButton} from "@/app/[locale]/components/ThemeToggleButton";

export default function Main() {
    const t = useTranslations('Main');
    return (
        <div>
            <h1>{t('test')}</h1>
            <BoardChooser />
            <ThemeToggleButton />
        </div>
    );
}