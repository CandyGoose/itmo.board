'use client';

import { toast } from 'sonner';
import { Download, FileAxis3D, FileImage, Link2, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import { useRenameModal } from '@/store/useRenameModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBoard } from '@/actions/Board';
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
    const { onOpen } = useRenameModal();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const t = useTranslations('tools');

    const onCopyLink = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/boards/${id}`)
            .then(() => toast.success('Link copied'))
            .catch(() => toast.error('Failed to copy link'));
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await deleteBoard(id);
            toast.success('Delete successfully.');
            router.push('/');
        } catch {
            toast.error('Failed to delete.');
        } finally {
            setLoading(false);
        }
    };

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
                <DropdownMenuItem
                    onClick={(e) => e.stopPropagation()}
                    data-testid="download"
                    className="p-3 cursor-pointer flex-1 relative"
                >
                    <Download className="h-4 w-4 mr-2" />
                    {t('download')}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                                {/* Icon or indicator for nested menu */}
                                &gt;
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="right"
                            sideOffset={4}
                            className="w-48"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenuItem
                                onClick={() => console.log('Download as SVG')}
                                className="p-3 cursor-pointer"
                            >
                                <FileAxis3D className="h-4 w-4 mr-2" />
                                {t('downloadAsSVG')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => console.log('Download as PNG')}
                                className="p-3 cursor-pointer"
                            >
                                <FileImage className="h-4 w-4 mr-2" />
                                {t('downloadAsPNG')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DropdownMenuItem>
                <ConfirmModal
                    header="Delete board?"
                    description="This will delete the board and all of its contents."
                    disabled={loading}
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
