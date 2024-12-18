import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarFallback } from './Avatar';

describe('Avatar Components', () => {
    const TestWrapper: React.FC<{
        avatarProps?: React.ComponentProps<typeof Avatar>;
        children?: React.ReactNode;
    }> = ({ avatarProps = {}, children }) => (
        <Avatar data-testid="avatar-root" {...avatarProps}>
            {children}
        </Avatar>
    );

    describe('Avatar', () => {
        it('renders correctly with default class names', () => {
            render(<TestWrapper />);

            const avatar = screen.getByTestId('avatar-root');

            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveClass(
                'relative',
                'flex',
                'h-10',
                'w-10',
                'shrink-0',
                'overflow-hidden',
                'rounded-full',
            );
        });

        it('merges additional class names', () => {
            const additionalClass = 'bg-blue-500 h-8 w-8 border-2';

            render(
                <TestWrapper avatarProps={{ className: additionalClass }} />,
            );

            const avatar = screen.getByTestId('avatar-root');

            expect(avatar).toHaveClass(additionalClass);
        });

        it('renders children correctly', () => {
            render(
                <TestWrapper>
                    <span data-testid="avatar-child">User</span>
                </TestWrapper>,
            );

            const child = screen.getByTestId('avatar-child');
            expect(child).toBeInTheDocument();
            expect(child).toHaveTextContent('User');
        });
    });

    describe('AvatarFallback', () => {
        const renderAvatarWithFallback = (
            fallbackContent: React.ReactNode,
            props?: React.ComponentProps<typeof AvatarFallback>,
        ) => {
            render(
                <TestWrapper>
                    <AvatarFallback data-testid="avatar-fallback" {...props}>
                        {fallbackContent}
                    </AvatarFallback>
                </TestWrapper>,
            );
        };

        it('renders fallback content correctly', () => {
            renderAvatarWithFallback(
                <span data-testid="fallback-content">UA</span>,
            );

            const fallback = screen.getByTestId('avatar-fallback');
            const content = screen.getByTestId('fallback-content');

            expect(fallback).toBeInTheDocument();
            expect(fallback).toHaveClass(
                'flex',
                'h-full',
                'w-full',
                'items-center',
                'justify-center',
                'rounded-full',
                'bg-muted',
            );
            expect(content).toBeInTheDocument();
            expect(content).toHaveTextContent('UA');
        });

        it('merges additional class names', () => {
            const additionalClass = 'bg-green-500 text-xs font-semibold';

            renderAvatarWithFallback(<span>UA</span>, {
                className: additionalClass,
            });

            const fallback = screen.getByTestId('avatar-fallback');

            expect(fallback).toHaveClass(additionalClass);
        });

        it('renders without children', () => {
            renderAvatarWithFallback(null);

            const fallback = screen.getByTestId('avatar-fallback');
            expect(fallback).toBeInTheDocument();
            expect(fallback).toBeEmptyDOMElement();
        });
    });
});
