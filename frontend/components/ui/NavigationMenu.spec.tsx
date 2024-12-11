import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
    NavigationMenuIndicator,
    NavigationMenuViewport,
} from './NavigationMenu';

const MockMenu = () => (
    <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
                <NavigationMenuTrigger>Menu 1</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <NavigationMenuLink href="/option1">
                        Option 1
                    </NavigationMenuLink>
                    <NavigationMenuLink href="/option2">
                        Option 2
                    </NavigationMenuLink>
                </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuTrigger>Menu 2</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <NavigationMenuLink href="/option3">
                        Option 3
                    </NavigationMenuLink>
                    <NavigationMenuLink href="/option4">
                        Option 4
                    </NavigationMenuLink>
                </NavigationMenuContent>
            </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuIndicator />
        <NavigationMenuViewport />
    </NavigationMenu>
);

describe('NavigationMenu Component', () => {
    test('renders NavigationMenu correctly', () => {
        render(<MockMenu />);

        expect(screen.getByText('Menu 1')).toBeInTheDocument();
        expect(screen.getByText('Menu 2')).toBeInTheDocument();
    });

    test('renders without crashing', () => {
        render(<MockMenu />);
        expect(screen.getByText('Menu 1')).toBeInTheDocument();
    });
});
