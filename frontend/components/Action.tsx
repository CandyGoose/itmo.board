'use client';

import { Pencil } from 'lucide-react';
import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { useRenameModal } from '@/store/useRenameModal';

interface ActionsProps {
    children: React.ReactNode;
    side?: DropdownMenuContentProps['side'];
    sideOffset?: DropdownMenuContentProps['sideOffset'];
    id: string;
    title: string;
    disable?: boolean | false;
}

export const Actions = ({
    children,
    side,
    sideOffset,
    id,
    title,
    disable,
}: ActionsProps) => {
    const { onOpen } = useRenameModal();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                className="w-60"
            >
                <DropdownMenuItem
                    onClick={() => onOpen(id, title)}
                    className="p-3 cursor-pointer flex-1"
                    disabled={disable}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
