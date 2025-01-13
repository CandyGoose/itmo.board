'use client';

import { formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Skeleton } from '@/components/ui/Skeleton';
import { Overlay } from './Overlay';
import { Footer } from './Footer';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Actions } from '@/components/Action';
import { MoreHorizontal } from 'lucide-react';
import CanvasSaver from '@/actions/CanvasSaver';
import { enUS, ru } from 'date-fns/locale';

const dateFnsLocaleMap = {
    en: enUS,
    ru: ru,
} as const;

type LocaleKey = keyof typeof dateFnsLocaleMap;

interface BoardCardProps {
    id: string;
    title: string;
    authorId: string;
    createdAt: string;
    imageUrl: string;
    orgId: string;
}

export const BoardCard = ({
                              id,
                              title,
                              createdAt,
                              imageUrl,
                          }: BoardCardProps) => {
    const router = useRouter();
    const locale = useLocale() as LocaleKey;
    const [loading, setLoading] = useState(false);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = toZonedTime(new Date(createdAt), timezone);

    const createdAtLabel = formatDistanceToNow(zonedDate, {
        addSuffix: true,
        locale: dateFnsLocaleMap[locale],
    });

    const onClick = () => {
        try {
            setLoading(true);
            router.push(`boards/${id}`);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="group aspect-[100/127] border rounded-lg flex cursor-pointer
            flex-col justify-between overflow-hidden relative"
            data-testid={`board-card-${id}`}
            onClick={onClick}
        >
            <div className="relative flex-1">
                <Image src={imageUrl} alt="" fill className="object-fit" />
                <Overlay />
                <Actions id={id} title={title} side="right">
                    <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
                        <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
                    </button>
                </Actions>
                <div style={{ display: 'none' }}>
                    <CanvasSaver boardId={id} />
                </div>
            </div>
            <Footer
                title={title}
                createdAtLabel={createdAtLabel}
                disabled={loading}
            />
        </div>
    );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
    return (
        <div
            data-testid="board-card-skeleton"
            className="aspect-[100/127] rounded-lg overflow-hidden"
        >
            <Skeleton className="h-full w-full" />
        </div>
    );
};
