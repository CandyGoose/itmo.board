'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Overlay } from './Overlay';

import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@clerk/nextjs';
import { Footer } from './Footer';
import { Skeleton } from '@/components/ui/Skeleton';
import { Actions } from '@/components/Action';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { router } from 'next/client';

interface BoardCardProps {
    id: string;
    title: string;
    imageUrl: string;
    authorId: string;
    authorName: string;
    createdAt: number;
    orgId: string;
}

const BoardCard = ({
    id,
    title,
    imageUrl,
    authorId,
    authorName,
    createdAt,
}: BoardCardProps) => {
    const { userId } = useAuth();
    const authorLabel = userId === authorId ? 'You' : authorName;
    const createdLabel = formatDistanceToNow(createdAt, { addSuffix: true });

    const [loading, setLoading] = useState(false);

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
        <Link href={`/boards/${id}`}>
            <div
                className="group aspect-[98/120] border rounded-lg flex cursor-pointer
            flex-col justify-between overflow-hidden relative"
                onClick={onClick}
            >
                <div className="relative bg-amber-50 flex-1">
                    <Image
                        src={imageUrl}
                        fill
                        alt={title}
                        className="object-fit"
                        sizes="100vw"
                    />
                    <Overlay />
                    <Actions id={id} title={title} side="right">
                        <button className="absolute z-50 top-1 right-2 ">
                            <MoreHorizontal className="text-black group-hover:text-white" />
                        </button>
                    </Actions>
                </div>
                <Footer
                    title={title}
                    authorLabel={authorLabel}
                    createdLabel={createdLabel}
                    disabled={loading}
                />
            </div>
        </Link>
    );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
    return (
        <div
            data-testid="board-card-skeleton"
            className="aspect-[98/120] rounded-lg overflow-hidden"
        >
            <Skeleton className="h-full w-full" />
        </div>
    );
};

export default BoardCard;
