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
    defaultOpen?: boolean;
}

export const Actions = ({
    children,
    side,
    sideOffset,
    id,
    title,
    disable,
    defaultOpen,
}: ActionsProps) => {
    const { onOpen } = useRenameModal();

    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                className="w-60"
            >
                <DropdownMenuItem
                    onClick={() => onOpen(id, title)}
                    data-testid="rename-item"
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
