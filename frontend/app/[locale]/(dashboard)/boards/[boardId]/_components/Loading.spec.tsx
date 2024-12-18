import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CanvasLoading } from './Loading';

// Mock external components
jest.mock('lucide-react', () => ({
    Loader: ({ className }: { className: string }) => (
        <div data-testid="loader" className={className}></div>
    ),
}));

jest.mock('./Info', () => ({
    InfoSkeleton: () => <div data-testid="info-skeleton"></div>,
}));

jest.mock('./Participants', () => ({
    ParticipantsSkeleton: () => <div data-testid="participants-skeleton"></div>,
}));

jest.mock('./Toolbar', () => ({
    ToolBarSkeleton: () => <div data-testid="toolbar-skeleton"></div>,
}));

describe('CanvasLoading Component', () => {
    it('renders the loader with correct className', () => {
        render(<CanvasLoading />);

        const loader = screen.getByTestId('loader');
        expect(loader).toHaveClass('h-6 w-6 text-muted-foreground animate-spin');
    });

    it('renders the InfoSkeleton', () => {
        render(<CanvasLoading />);

        const infoSkeleton = screen.getByTestId('info-skeleton');
        expect(infoSkeleton).toBeInTheDocument();
    });

    it('renders the ParticipantsSkeleton', () => {
        render(<CanvasLoading />);

        const participantsSkeleton = screen.getByTestId('participants-skeleton');
        expect(participantsSkeleton).toBeInTheDocument();
    });

    it('renders the ToolBarSkeleton', () => {
        render(<CanvasLoading />);

        const toolbarSkeleton = screen.getByTestId('toolbar-skeleton');
        expect(toolbarSkeleton).toBeInTheDocument();
    });

    it('renders the main container with correct styling', () => {
        render(<CanvasLoading />);

        const mainContainer = screen.getByRole('main');
        expect(mainContainer).toHaveClass(
            'w-full h-full relative bg-neutral-100 touch-none flex items-center justify-center'
        );
    });
});
