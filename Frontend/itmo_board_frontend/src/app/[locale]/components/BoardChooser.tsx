import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function BoardChooser({
    recentBoards,
}: {
    recentBoards: { name: string; link: string }[];
}) {
    const t = useTranslations('BoardChooser');

    return (
        <div>
            <div>{t('create_a_board')}</div>

            <form>
                <input placeholder={t('enter_board_name')} />
                <button type={'submit'}>{t('create')}</button>
            </form>
            <div>{t('recent_boards')}</div>
            <div>
                {recentBoards.map((board: { name: string; link: string }) => (
                    <Link key={board.link} href={board.link}>
                        {board.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
