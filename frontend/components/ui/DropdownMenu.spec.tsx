import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuShortcut,
} from './DropdownMenu';
import userEvent from "@testing-library/user-event";

jest.mock('@radix-ui/react-portal', () => ({
    __esModule: true,
    Portal: ({ children }: { children: React.ReactNode }) => {
        return <div data-testid="portal">{children}</div>;
    },
}));

describe('DropdownMenu Component', () => {
    test('открывается и отображает содержимое', async () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button data-testid="menu-trigger">Open Menu</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent data-testid="menu-content">
                    <DropdownMenuItem>Item 1</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Item 2</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        await waitFor(async () => {
            await userEvent.click(screen.getByTestId('menu-trigger'));
        });

        const menuContent = await screen.findByTestId('menu-content');

        expect(menuContent).toBeVisible();
        expect(screen.getByText('Item 1')).toBeVisible();
        expect(screen.getByText('Item 2')).toBeVisible();
    });

    test('вызывает действие при клике на DropdownMenuItem', async () => {
        const onClick = jest.fn();

        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <span data-testid="menu-trigger" role="button">
                        Open Menu
                    </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent data-testid="menu-content">
                    <DropdownMenuItem onClick={onClick} data-testid="menu-item">
                        Click Me
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        await waitFor(async () => {
            await userEvent.click(screen.getByTestId('menu-trigger'));
        });

        await waitFor(() => {
            expect(screen.getByTestId('menu-content')).toBeInTheDocument();
        });

        await waitFor(async () => {
            await userEvent.click(screen.getByTestId('menu-item'));
        });

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('управляет состоянием checked', async () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {/* Один элемент */}
                    <button data-testid="menu-trigger">Open Menu</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {/* Использование текста напрямую как единственный элемент */}
                    <DropdownMenuCheckboxItem checked data-testid="checkbox-item">
                        Checkbox
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        await userEvent.click(screen.getByTestId('menu-trigger'));

        const checkbox = await screen.findByTestId('checkbox-item');

        expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    test('отображает ярлык', async () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button data-testid="menu-trigger">Open Menu</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        Item with Shortcut
                        <DropdownMenuShortcut data-testid="shortcut">
                            Ctrl+K
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );

        await userEvent.click(screen.getByTestId('menu-trigger'));

        const shortcut = await screen.findByTestId('shortcut');

        expect(shortcut).toBeInTheDocument();
        expect(shortcut).toHaveTextContent('Ctrl+K');
    });
});
