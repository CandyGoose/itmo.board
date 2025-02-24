'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { Hint } from '@/components/Hint';
import { useRenameModal } from '@/store/useRenameModal';
import { Actions } from '@/components/Action';
import { Eye, Menu, PencilRuler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Board, getBoardById } from '@/actions/Board';
import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useOrganization } from '@clerk/nextjs';
import CanvasSaver from '@/actions/CanvasSaver';
import { useTranslations } from 'next-intl';

const font = Poppins({
    subsets: ['latin'],
    weight: ['600'],
});

const TabSeparator = () => {
    return <div className="text-neutral-300 px-1.5">|</div>;
};

export const Info = ({
    boardId,
    editable,
    setEditable,
}: {
    boardId: string;
    editable: boolean;
    setEditable: (value: boolean) => void;
}) => {
    const { onOpen } = useRenameModal();
    const [board, setBoard] = useState<Board>();
    const router = useRouter();
    const t = useTranslations('tools');

    const { membership } = useOrganization();

    useEffect(() => {
        const request = async () => {
            const response = await getBoardById(boardId);
            if (response) {
                setBoard(response);
            } else {
                router.back();
            }
        };
        request();
    }, [boardId, router]);

    if (!board) return <InfoSkeleton />;

    return (
        <div className="flex flex-row gap-x-2 absolute top-2 left-2 items-center">
            <div className="rounded-md px-1.5 h-12 flex items-center shadow-md bg-[var(--background-color)]">
                <Hint label={t('boards')} side="bottom" sideOffset={10}>
                    <Button asChild className="px-2" variant="board">
                        <Link href="/">
                            <Image
                                alt="logo"
                                src={'/logo.svg'}
                                width={30}
                                height={30}
                            />
                            <span
                                className={cn(
                                    'font-semibold text-xl ml-2 text-[var(--text-color)]',
                                    font.className,
                                )}
                            >
                                Board
                            </span>
                        </Link>
                    </Button>
                </Hint>
                <TabSeparator />
                <Hint label={t('rename')} side="bottom" sideOffset={10}>
                    <Button
                        variant="board"
                        className="text-base font-normal px-2"
                        onClick={() => onOpen(board._id, board.title)}
                        disabled={!membership}
                    >
                        {board.title}
                    </Button>
                </Hint>
                <TabSeparator />
                <Actions
                    disable={!membership}
                    id={board._id}
                    title={board.title}
                    side="bottom"
                    sideOffset={10}
                >
                    <div>
                        <Hint label={t('menu')} side="bottom" sideOffset={10}>
                            <Button size="icon" variant="board">
                                <Menu />
                            </Button>
                        </Hint>
                    </div>
                </Actions>
                <div style={{ display: 'none' }}>
                    <CanvasSaver boardId={boardId} />
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="shadow-md h-12 w-12 p-0 rounded-md"
                    >
                        <Eye
                            className={cn(
                                'h-[1.4rem] w-[1.4rem] rotate-0 opacity-0 scale-0 transition-all',
                                !editable &&
                                    '-rotate-180 scale-100 opacity-100',
                            )}
                        />
                        <PencilRuler
                            className={cn(
                                'absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 opacity-0 transition-all',
                                editable && '-rotate-0 scale-100 opacity-100',
                            )}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setEditable(false)}>
                        {t('viewOnly')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setEditable(true)}
                        disabled={!membership}
                    >
                        {t('editMode')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
