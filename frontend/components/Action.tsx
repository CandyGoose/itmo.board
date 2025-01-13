'use client';

import { toast } from 'sonner';
import {
    Download,
    FileAxis3D,
    FileImage,
    Link2,
    Pencil,
    Trash2,
} from 'lucide-react';
import {
    DropdownMenuContentProps,
    DropdownMenuSub,
} from '@radix-ui/react-dropdown-menu';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import { useRenameModal } from '@/store/useRenameModal';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation } from '@/hooks/useApiMutation';
import { api } from '@/convex/_generated/api';
import { useTranslations } from 'next-intl';

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
    const { mutate, pending } = useApiMutation(api.Board.deleteById);
    const { onOpen } = useRenameModal();
    const t = useTranslations('tools');

    const onCopyLink = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/boards/${id}`)
            .then(() => toast.success('Link copied'))
            .catch(() => toast.error('Failed to copy link'));
    };

    const onDelete = () => {
        mutate({ id })
            .then(() => {
                toast.success('Board deleted');
            })
            .catch(() => {
                toast.error('Failed to delete board');
            });
    };

    const handleDownloadSVG = useCallback(() => {
        window.dispatchEvent(
            new CustomEvent('canvas-download', { detail: { format: 'svg' } }),
        );
    }, []);

    const handleDownloadPNG = useCallback(() => {
        window.dispatchEvent(
            new CustomEvent('canvas-download', { detail: { format: 'png' } }),
        );
    }, []);

    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger asChild title={title}>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                side={side}
                sideOffset={sideOffset}
                className="w-60"
            >
                <DropdownMenuItem
                    onClick={onCopyLink}
                    className="p-3 cursor-pointer"
                >
                    <Link2 className="h-4 w-4 mr-2" />
                    {t('copyLink')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onOpen(id, title)}
                    data-testid="rename-item"
                    className="p-3 cursor-pointer flex-1"
                    disabled={disable}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('rename')}
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                        className="p-3 cursor-pointer flex items-center"
                        data-testid="download-sub-menu"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {t('download')}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                        sideOffset={4}
                        className="w-48"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DropdownMenuItem
                            onClick={handleDownloadSVG}
                            className="p-3 cursor-pointer"
                        >
                            <FileAxis3D className="h-4 w-4 mr-2" />
                            {t('downloadAsSVG')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDownloadPNG}
                            className="p-3 cursor-pointer"
                        >
                            <FileImage className="h-4 w-4 mr-2" />
                            {t('downloadAsPNG')}
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <ConfirmModal
                    header="Delete board?"
                    description="This will delete the board and all of its contents."
                    disabled={pending}
                    onConfirm={onDelete}
                >
                    <Button
                        variant="ghost"
                        className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
                        disabled={disable}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('delete')}
                    </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
