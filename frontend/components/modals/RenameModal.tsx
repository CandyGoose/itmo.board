'use client';

import { useRenameModal } from '@/store/useRenameModal';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { renameBoard } from '@/actions/Board';
import { useRouter } from 'next/navigation';

export const RenameModal = () => {
    const { isOpen, onClose, initialValues } = useRenameModal();
    const [title, setTitle] = useState(initialValues.title);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setTitle(initialValues.title);
    }, [initialValues.title]);

    const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        try {
            setLoading(true);
            e.preventDefault();
            await renameBoard(initialValues.id, title);
            toast.success('Board renamed.');

            const currentPath = window.location.pathname;

            if (currentPath.includes(`/boards/${initialValues.id}`)) {
                window.location.reload();
            } else {
                router.push('/');
            }

            onClose();
        } catch {
            toast.error('Failed to rename board.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit board title</DialogTitle>
                </DialogHeader>

                <DialogDescription>
                    Enter a new title for this board.
                </DialogDescription>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Input
                        disabled={loading}
                        required
                        maxLength={60}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                            initialValues.title
                                ? initialValues.title
                                : 'Board title'
                        }
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={loading} type="submit" className="alert-dialog-action">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
