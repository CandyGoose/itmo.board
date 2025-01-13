'use client';

import { api } from '@/convex/_generated/api';
import { useApiMutation } from '@/hooks/useApiMutation';
import { cn } from '@/lib/utils';
import { Loader2Icon, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean;
}

export const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
    const { mutate, pending } = useApiMutation(api.Board.createBoard);

    const handleAdd = () => {
        mutate({ orgId, title: 'Untitled' })
            .then(() => {
                toast.success('Board Created');
            })
            .catch(() => {
                toast.error('Failed to create board');
            });
    };

    return (
        <button
            onClick={handleAdd}
            disabled={pending || disabled}
            className={cn(
                'bg-blue-600 group aspect-[100/120] border rounded-lg flex flex-col justify-center items-center gap-3',
                (pending || disabled) && 'opacity-70 cursor-not-allowed',
                'border-none',
            )}
        >
            {pending ? (
                <Loader2Icon
                    className={'text-white h-10 w-10 stroke-1 animate-spin'}
                />
            ) : (
                <Plus
                    className={cn(
                        'text-white h-10 w-10 stroke-1',
                        !disabled &&
                            'group-hover:rotate-90 group-hover:scale-150 duration-500',
                    )}
                />
            )}
            <p className="text-white text-sm font-light">New Board</p>
        </button>
    );
};
