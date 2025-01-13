'use client';

import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Hint from '@/components/Hint';
import { useRenameModal } from '@/store/useRenameModal';
import { Actions } from '@/components/Action';
import { Menu } from 'lucide-react';

const font = Poppins({
    subsets: ['latin'],
    weight: ['600'],
});

interface InfoProps {
    boardId: string;
}

const TabSeparator = () => {
    return <div className="text-gray-300 px-1 text-2xl">|</div>;
};

export const Info = ({ boardId }: InfoProps) => {
    const { onOpen } = useRenameModal();
    const data = useQuery(api.Board.get, { id: boardId as Id<'boards'> });

    if (!data) {
        return <InfoSkeleton />;
    }

    return (
        <div className="absolute top-2 left-2 flex items-center py-2 px-2 bg-[var(--background-color)] rounded-lg shadow-md">
            <Hint
                label="Go to boards"
                side="bottom"
                sideOffset={15}
                tooltipArrow={false}
            >
                <Button asChild className="px-2 " variant="board">
                    <Link href="/">
                        <Image
                            src="/logo.svg"
                            alt="board logo"
                            width={40}
                            height={40}
                        />
                        <span
                            className={cn(
                                'font-semibold text-xl ml-2',
                                font.className,
                            )}
                        >
                            Board
                        </span>
                    </Link>
                </Button>
            </Hint>
            <TabSeparator />
            <Hint
                label="Click to rename"
                side="bottom"
                sideOffset={15}
                tooltipArrow={false}
                deleyDuration={300}
            >
                <Button
                    variant="board"
                    className="text-base font-medium px-2"
                    onClick={() => onOpen(data._id, data.title)}
                >
                    {data.title}
                </Button>
            </Hint>
            <TabSeparator />
            <Actions
                id={data._id}
                title={data.title}
                side="bottom"
                sideOffset={15}
            >
                <div>
                    <Hint
                        label="Main menu"
                        side="bottom"
                        sideOffset={15}
                        tooltipArrow={false}
                    >
                        <Button size="icon" variant="board">
                            <Menu />
                        </Button>
                    </Hint>
                </div>
            </Actions>
        </div>
    );
};

export const InfoSkeleton = () => {
    return (
        <div
            role="status"
            className="absolute top-2 left-2 bg-[var(--background-color)] rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]"
        />
    );
};
