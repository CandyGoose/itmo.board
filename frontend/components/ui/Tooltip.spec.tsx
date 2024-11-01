import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import '@testing-library/jest-dom';
describe('Tooltip Component', () => {
    it('should not render content when Tooltip is closed', () => {
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span>Hover me</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>Tooltip content</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
        expect(screen.queryByText('Tooltip content')).toBeNull();
    });
});