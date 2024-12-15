'use client';

import { toast } from "sonner";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { useRenameModal } from '@/store/useRenameModal';
import {useState} from "react";
import {useRouter} from "next/navigation";
import {deleteBoard} from "@/actions/Board";

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

    const onCopyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/boards/${id}`,
        )
            .then(() => toast.success("Link copied"))
            .catch(() => toast.error("Failed to copy link"))
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await deleteBoard(id);
            toast.success("Delete successfully.");
            router.push('/');
        } catch {
            toast.error("Failed to delete.")
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
                    Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onOpen(id, title)}
                    data-testid="rename-item"
                    className="p-3 cursor-pointer flex-1"
                    disabled={disable}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
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
                        Delete
                    </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
