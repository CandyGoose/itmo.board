'use client';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Board, createBoard } from '@/actions/Board';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';

interface NewBoardButtonProps {
    orgId: string;
    onBoardCreated: (newBoard: Board) => void;
    disabled?: boolean;
}

export const NewBoardButton = ({
    orgId,
    onBoardCreated,
    disabled,
}: NewBoardButtonProps) => {
    const params = useParams();
    const onClick = async () => {
        try {
            const response = await createBoard(params.UserID as string, orgId);
            const newBoard: Board = response.data;

            toast.success('Created successfully.');

            // Call the callback to update the board list
            onBoardCreated(newBoard);
        } catch {
            toast.error('Failed to create.');
        }
    };

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6',
                disabled && 'opacity-75 hover:bg-blue-500 cursor-not-allowed',
            )}
        >
            <Plus className="h-12 w-12 text-white stroke-2" />
            <p className="text-sm text-white font-medium">New board</p>
        </button>
    );
};
