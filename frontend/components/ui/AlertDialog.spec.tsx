import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/AlertDialog';

describe('AlertDialog Component', () => {
    test('рендерит AlertDialogTrigger', () => {
        render(
            <AlertDialog>
                <AlertDialogTrigger>
                    <span data-testid="open-dialog">Open Dialog</span>
                </AlertDialogTrigger>
            </AlertDialog>,
        );

        const trigger = screen.getByTestId('open-dialog');
        expect(trigger).toBeInTheDocument();
    });

    test('открывает и закрывает диалог', () => {
        render(
            <AlertDialog>
                <AlertDialogTrigger>
                    <span data-testid="open-dialog">Open Dialog</span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Test Title</AlertDialogTitle>
                        <AlertDialogDescription>
                            Test Description
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>,
        );

        const trigger = screen.getByTestId('open-dialog');
        fireEvent.click(trigger);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();

        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument();

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });
});
