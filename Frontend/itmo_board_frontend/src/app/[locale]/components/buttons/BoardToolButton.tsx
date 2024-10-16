import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { BoardTool } from '@/globalTypes';

export const BoardToolButton = ({ name, icon_path, handler }: BoardTool) => {
    const t = useTranslations('BoardTool');

    return (
        <div>
            <Image src={icon_path} alt={t(name)} onClick={handler} />
        </div>
    );
};
