'use client';

import { formatDistanceToNow } from 'date-fns';

import { Skeleton } from '@/components/ui/Skeleton';

import { Overlay } from './Overlay';
import { Footer } from './Footer';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import { Actions } from "@/components/Action";
import { MoreHorizontal } from "lucide-react";

interface BoardCardProps {
    id: string;
    title: string;
    authorId: string;
    createdAt: Date;
    imageUrl: string;
    orgId: string;
}

export const BoardCard = ({
    id,
    title,
    authorId,
    createdAt,
    imageUrl,
}: BoardCardProps) => {
    const t = useTranslations('utils');
    const router = useRouter();
    const params = useParams();
    const { user } = useClerk();
    const [authorLabel, setAuthorLabel] = useState(
        params.UserID === authorId ? t('you') : t('teammate'),
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getFirstName = async (userID: string) => {
            if (userID === authorId) {
                setAuthorLabel(t('you'));
            } else if (user) {
                setAuthorLabel(user.firstName || t('teammate'));
            } else {
                setAuthorLabel(t('teammate'));
            }
        };

        getFirstName(params.UserID as string);
    }, [params.UserID, authorId, t, user]);

    const createdAtLabel = formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
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
            data-testid={`board-card-${id}`} // Уникальный data-testid
            onClick={onClick}
        >
            <div className="relative flex-1 bg-white">
                <Image src={imageUrl} alt="" fill className="object-fit" />
                <Overlay />
                <Actions
                    id={id}
                    title={title}
                    side="right"
                >
                    <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
                        <MoreHorizontal
                            className="text-white opacity-75 hover:opacity-100 transition-opacity"
                        />
                    </button>
                </Actions>
            </div>
            <Footer
                title={title}
                authorLabel={authorLabel}
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
