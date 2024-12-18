import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from './UserAvatar';
import React from 'react';

jest.mock('@/components/Hint', () => ({
    Hint: ({
        children,
        label,
    }: {
        children: React.ReactNode;
        label: string;
    }) => (
        <div data-testid="hint" aria-label={label}>
            {children}
        </div>
    ),
}));

jest.mock('@/components/ui/Avatar', () => ({
    Avatar: ({
        children,
        className,
        style,
    }: {
        children: React.ReactNode;
        className?: string;
        style?: React.CSSProperties;
    }) => (
        <div className={className} style={style} data-testid="avatar">
            {children}
        </div>
    ),
    AvatarImage: ({ src }: { src?: string }) => (
        // It just does not matter here
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="avatar" data-testid="avatar-image" />
    ),
    AvatarFallback: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="avatar-fallback">{children}</div>
    ),
}));

describe('UserAvatar Component', () => {
    it('renders the Avatar with the provided image source', () => {
        render(
            <UserAvatar
                src="https://example.com/avatar.png"
                name="John Doe"
                fallback="JD"
                borderColor="red"
            />,
        );

        const avatarImage = screen.getByTestId('avatar-image');
        expect(avatarImage).toHaveAttribute(
            'src',
            'https://example.com/avatar.png',
        );
    });

    it('displays the fallback text when no image source is provided', () => {
        render(<UserAvatar fallback="JD" name="John Doe" borderColor="blue" />);

        const fallback = screen.getByTestId('avatar-fallback');
        expect(fallback).toHaveTextContent('JD');
    });

    it('applies the correct border color', () => {
        render(
            <UserAvatar fallback="JD" name="John Doe" borderColor="green" />,
        );

        const avatar = screen.getByTestId('avatar');
        expect(avatar).toHaveStyle({ borderColor: 'green' });
    });

    it('uses the name as a hint label', () => {
        render(<UserAvatar fallback="JD" name="John Doe" borderColor="blue" />);

        const hint = screen.getByTestId('hint');
        expect(hint).toHaveAttribute('aria-label', 'John Doe');
    });

    it('falls back to "Teammate" hint label when name is not provided', () => {
        render(<UserAvatar fallback="JD" borderColor="blue" />);

        const hint = screen.getByTestId('hint');
        expect(hint).toHaveAttribute('aria-label', 'Teammate');
    });
});
