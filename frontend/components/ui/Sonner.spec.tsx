import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toaster } from './Sonner'
import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster } from 'sonner'

jest.mock('sonner', () => {
    return {
        Toaster: jest.fn(() => <div data-testid="sonner-toaster">Sonner Toaster</div>),
    }
})

jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}))

describe('Toaster Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders Toaster component', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'light' })

        render(<Toaster />)

        const sonnerToaster = screen.getByTestId('sonner-toaster')
        expect(sonnerToaster).toBeInTheDocument()
        expect(sonnerToaster).toHaveTextContent('Sonner Toaster')

        expect(SonnerToaster).toHaveBeenCalledWith(
            expect.objectContaining({
                theme: 'light',
                className: 'toaster group',
                toastOptions: {
                    classNames: {
                        toast:
                            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                        description: 'group-[.toast]:text-muted-foreground',
                        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                        cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    },
                },
            }),
            {}
        )
    })

    test('applies correct theme based on useTheme', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' })

        render(<Toaster />)

        expect(SonnerToaster).toHaveBeenCalledWith(
            expect.objectContaining({
                theme: 'dark',
            }),
            {}
        )
    })

    test('applies default theme when theme is not provided', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'system' })

        render(<Toaster />)

        expect(SonnerToaster).toHaveBeenCalledWith(
            expect.objectContaining({
                theme: 'system',
            }),
            {}
        )
    })

    test('passes additional props to Sonner Toaster', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'light' })

        render(<Toaster position="top-right" duration={5000} />)

        expect(SonnerToaster).toHaveBeenCalledWith(
            expect.objectContaining({
                position: 'top-right',
                duration: 5000,
            }),
            {}
        )
    })
})
