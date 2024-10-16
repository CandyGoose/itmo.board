import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { BoardTool } from '@/globalTypes';

export function BoardToolButton({ name, icon_path, handler, width, height }: BoardTool) {
    const t = useTranslations('BoardTool');

    return (
        <div>
            <Image src={icon_path} alt={t(name)} onClick={handler} fill={true} />
        </div>
    );
};
